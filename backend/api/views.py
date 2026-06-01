from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q, F
from .models import Time, Fase, Jogo, Palpite, GrupoPrivado
from .serializers import (
    UserSerializer, TimeSerializer, FaseSerializer,
    JogoSerializer, PalpiteSerializer, GrupoPrivadoSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        # Apenas o admin pode ver todos. Usuário comum só vê a si mesmo.
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class TimeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Time.objects.all()
    serializer_class = TimeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class FaseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Fase.objects.all().order_by('ordem')
    serializer_class = FaseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class JogoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Jogo.objects.all().order_by('data_hora')
    serializer_class = JogoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class PalpiteViewSet(viewsets.ModelViewSet):
    serializer_class = PalpiteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Palpite.objects.filter(usuario=self.request.user)

class RankingViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request):
        ranking = User.objects.annotate(
            total_pontos=Sum('palpite__pontos')
        ).order_by('-total_pontos')
        
        data = []
        for index, user in enumerate(ranking):
            data.append({
                'posicao': index + 1,
                'usuario_id': user.id,
                'username': user.username,
                'pontos': user.total_pontos or 0
            })
            
        return Response(data)


class GrupoPrivadoViewSet(viewsets.ModelViewSet):
    serializer_class = GrupoPrivadoSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']  # Sem DELETE nem PUT

    def get_queryset(self):
        # Retorna apenas os grupos que o usuário participa
        return GrupoPrivado.objects.filter(membros=self.request.user)

    @action(detail=False, methods=['post'])
    def entrar(self, request):
        """Entra em um grupo usando o código de convite."""
        codigo = request.data.get('codigo', '').strip().upper()
        if not codigo:
            return Response({'error': 'Código obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            grupo = GrupoPrivado.objects.get(codigo=codigo)
        except GrupoPrivado.DoesNotExist:
            return Response({'error': 'Código inválido. Grupo não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user in grupo.membros.all():
            return Response({'error': 'Você já é membro deste grupo.'}, status=status.HTTP_400_BAD_REQUEST)
        
        grupo.membros.add(request.user)
        serializer = self.get_serializer(grupo)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def sair(self, request, pk=None):
        """Sai de um grupo (criadores não podem sair)."""
        grupo = self.get_object()
        if grupo.criador == request.user:
            return Response({'error': 'O criador não pode sair do grupo.'}, status=status.HTTP_400_BAD_REQUEST)
        grupo.membros.remove(request.user)
        return Response({'success': 'Você saiu do grupo.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def ranking(self, request, pk=None):
        """Retorna o ranking dos membros de um grupo específico."""
        grupo = self.get_object()
        membros = grupo.membros.all()
        
        ranking = membros.annotate(
            total_pontos=Sum('palpite__pontos')
        ).order_by('-total_pontos')

        data = []
        for index, user in enumerate(ranking):
            data.append({
                'posicao': index + 1,
                'usuario_id': user.id,
                'username': user.username,
                'pontos': user.total_pontos or 0,
                'is_criador': user == grupo.criador,
            })
        return Response(data)


class AlterarSenhaView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        senha_atual = request.data.get('senha_atual')
        nova_senha = request.data.get('nova_senha')

        if not senha_atual or not nova_senha:
            return Response(
                {'error': 'Informe a senha atual e a nova senha.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(nova_senha) < 6:
            return Response(
                {'error': 'A nova senha deve ter pelo menos 6 caracteres.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        if not user.check_password(senha_atual):
            return Response(
                {'error': 'Senha atual incorreta.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(nova_senha)
        user.save()
        return Response({'success': 'Senha alterada com sucesso.'}, status=status.HTTP_200_OK)


class EstatisticasViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request):
        grupo_id = request.query_params.get('grupo_id')
        
        users_qs = User.objects.all()
        if grupo_id:
            try:
                grupo = GrupoPrivado.objects.get(id=grupo_id)
                users_qs = grupo.membros.all()
            except GrupoPrivado.DoesNotExist:
                return Response({'error': 'Grupo não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        stats = users_qs.annotate(
            acertos_exatos=Count('palpite', filter=Q(
                palpite__jogo__encerrado=True,
                palpite__gol_casa=F('palpite__jogo__gol_casa'),
                palpite__gol_fora=F('palpite__jogo__gol_fora')
            )),
            erros_zerados=Count('palpite', filter=Q(
                palpite__jogo__encerrado=True,
                palpite__pontos=0
            ))
        )
        
        top_exatos = stats.filter(acertos_exatos__gt=0).order_by('-acertos_exatos')[:10]
        top_zerados = stats.filter(erros_zerados__gt=0).order_by('-erros_zerados')[:10]
        
        return Response({
            'top_exatos': [
                {'usuario_id': u.id, 'username': u.username, 'quantidade': u.acertos_exatos}
                for u in top_exatos
            ],
            'top_zerados': [
                {'usuario_id': u.id, 'username': u.username, 'quantidade': u.erros_zerados}
                for u in top_zerados
            ]
        })

