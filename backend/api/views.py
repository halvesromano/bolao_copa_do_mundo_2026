from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q, F
from .models import Time, Fase, Jogo, Palpite, GrupoPrivado, PalpiteCampeao, ConfigCampeao
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
        from django.db.models.functions import Coalesce
        ranking = User.objects.annotate(
            pontos_palpites=Coalesce(Sum('palpite__pontos'), 0),
            pontos_campeao=Coalesce(F('palpite_campeao__pontos'), 0),
            total_pontos=F('pontos_palpites') + F('pontos_campeao')
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
        
        from django.db.models.functions import Coalesce
        ranking = membros.annotate(
            pontos_palpites=Coalesce(Sum('palpite__pontos'), 0),
            pontos_campeao=Coalesce(F('palpite_campeao__pontos'), 0),
            total_pontos=F('pontos_palpites') + F('pontos_campeao')
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


    @action(detail=True, methods=['get'])
    def palpites_galera(self, request, pk=None):
        """Retorna os palpites de um grupo, filtrando por membro ou por jogo, apenas para jogos encerrados."""
        grupo = self.get_object()
        usuario_id = request.query_params.get('usuario_id')
        jogo_id = request.query_params.get('jogo_id')
        
        # Filtrar palpites de jogos cujo prazo de palpite expirou (1 minuto antes do jogo) ou já encerrados
        from django.utils import timezone as tz
        limite_deadline = tz.now() + tz.timedelta(minutes=1)
        palpites = Palpite.objects.filter(
            Q(jogo__encerrado=True) | Q(jogo__data_hora__lt=limite_deadline),
            usuario__in=grupo.membros.all()
        )
        
        if usuario_id:
            palpites = palpites.filter(usuario_id=usuario_id)
        elif jogo_id:
            palpites = palpites.filter(jogo_id=jogo_id)
        else:
            return Response({'error': 'Forneça usuario_id ou jogo_id.'}, status=status.HTTP_400_BAD_REQUEST)
            
        palpites = palpites.select_related('jogo', 'jogo__time_casa', 'jogo__time_fora', 'jogo__fase', 'usuario')
        
        # Serialize usando PalpiteSerializer para retornar tudo que precisamos
        from .serializers import PalpiteSerializer
        serializer = PalpiteSerializer(palpites, many=True)
        return Response(serializer.data)


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


class TabelaGruposViewSet(viewsets.ViewSet):
    """Calcula a tabela de classificação de um grupo da fase de grupos."""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request):
        import functools
        grupo_letra = request.query_params.get('grupo', '').upper()
        if not grupo_letra:
            return Response({'error': 'Forneça o parâmetro ?grupo=A'}, status=status.HTTP_400_BAD_REQUEST)

        fase_nome = f"Grupo {grupo_letra}"

        jogos = Jogo.objects.filter(
            fase__nome=fase_nome,
            fase__is_mata_mata=False
        ).select_related('time_casa', 'time_fora', 'fase')

        tabela = {}

        def get_time(time):
            if time.id not in tabela:
                tabela[time.id] = {
                    'id': time.id,
                    'nome': time.nome,
                    'sigla': time.sigla,
                    'bandeira_svg': time.bandeira_svg or '',
                    'pj': 0, 'v': 0, 'e': 0, 'd': 0,
                    'gm': 0, 'gs': 0, 'sg': 0, 'pts': 0,
                }
            return tabela[time.id]

        for jogo in jogos:
            get_time(jogo.time_casa)
            get_time(jogo.time_fora)

        jogos_encerrados = [j for j in jogos if j.encerrado and j.gol_casa is not None]

        for jogo in jogos_encerrados:
            tc = get_time(jogo.time_casa)
            tf = get_time(jogo.time_fora)
            gc, gf = jogo.gol_casa, jogo.gol_fora

            tc['pj'] += 1; tf['pj'] += 1
            tc['gm'] += gc; tc['gs'] += gf
            tf['gm'] += gf; tf['gs'] += gc
            tc['sg'] = tc['gm'] - tc['gs']
            tf['sg'] = tf['gm'] - tf['gs']

            if gc > gf:
                tc['v'] += 1; tf['d'] += 1
                tc['pts'] += 3
            elif gc < gf:
                tf['v'] += 1; tc['d'] += 1
                tf['pts'] += 3
            else:
                tc['e'] += 1; tf['e'] += 1
                tc['pts'] += 1; tf['pts'] += 1

        times_lista = list(tabela.values())

        def confronto_direto(t1_id, t2_id):
            for j in jogos_encerrados:
                if j.time_casa.id == t1_id and j.time_fora.id == t2_id:
                    if j.gol_casa > j.gol_fora: return 1
                    if j.gol_casa < j.gol_fora: return -1
                    return 0
                if j.time_casa.id == t2_id and j.time_fora.id == t1_id:
                    if j.gol_fora > j.gol_casa: return 1
                    if j.gol_fora < j.gol_casa: return -1
                    return 0
            return 0

        def cmp(a, b):
            if a['pts'] != b['pts']: return b['pts'] - a['pts']
            if a['sg'] != b['sg']: return b['sg'] - a['sg']
            if a['gm'] != b['gm']: return b['gm'] - a['gm']
            cd = confronto_direto(a['id'], b['id'])
            if cd == 1: return -1
            if cd == -1: return 1
            return 0

        times_lista.sort(key=functools.cmp_to_key(cmp))
        for i, t in enumerate(times_lista):
            t['pos'] = i + 1

        return Response({'grupo': grupo_letra, 'times': times_lista})


class PalpiteCampeaoViewSet(viewsets.ViewSet):
    """Palpite Bônus — o usuário aposta no campeão da Copa."""

    def _get_deadline(self):
        """Retorna o prazo: 1 minuto antes do primeiro jogo cadastrado."""
        from django.utils import timezone as tz
        primeiro_jogo = Jogo.objects.order_by('data_hora').first()
        if not primeiro_jogo:
            return None
        return primeiro_jogo.data_hora - tz.timedelta(minutes=1)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def deadline(self, request):
        """Retorna a data/hora limite para o palpite bônus."""
        dl = self._get_deadline()
        return Response({'deadline': dl.isoformat() if dl else None})

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def resultado(self, request):
        """Retorna o campeão definido pelo admin (se já definido)."""
        config = ConfigCampeao.objects.first()
        if config and config.campeao:
            from .serializers import TimeSerializer
            return Response({
                'definido': True,
                'time_campeao': TimeSerializer(config.campeao).data,
            })
        return Response({'definido': False, 'time_campeao': None})

    def list(self, request):
        """Retorna o palpite atual do usuário logado."""
        if not request.user.is_authenticated:
            return Response({'palpite': None})
        try:
            pb = PalpiteCampeao.objects.select_related('time').get(usuario=request.user)
            from .serializers import TimeSerializer
            return Response({
                'palpite': {
                    'time': TimeSerializer(pb.time).data,
                    'pontos_bonus': pb.pontos,
                }
            })
        except PalpiteCampeao.DoesNotExist:
            return Response({'palpite': None})

    def create(self, request):
        """Cria ou atualiza o palpite bônus do usuário."""
        if not request.user.is_authenticated:
            return Response({'error': 'Login necessário.'}, status=status.HTTP_401_UNAUTHORIZED)

        from django.utils import timezone as tz
        dl = self._get_deadline()
        if dl and tz.now() > dl:
            return Response(
                {'error': 'O prazo para o palpite bônus expirou.'},
                status=status.HTTP_403_FORBIDDEN
            )

        time_id = request.data.get('time_id')
        if not time_id:
            return Response({'error': 'Informe o time_id.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            time = Time.objects.get(id=time_id)
        except Time.DoesNotExist:
            return Response({'error': 'Time não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        pb, _ = PalpiteCampeao.objects.update_or_create(
            usuario=request.user,
            defaults={'time': time}
        )
        from .serializers import TimeSerializer
        return Response({
            'success': True,
            'palpite': {
                'time': TimeSerializer(pb.time).data,
                'pontos_bonus': pb.pontos,
            }
        }, status=status.HTTP_200_OK)


class PlayoffViewSet(viewsets.ViewSet):
    """Retorna o chaveamento completo do mata-mata, fase a fase."""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request):
        # Número esperado de jogos por fase (usado pelo frontend para preencher placeholders)
        total_esperado_map = {
            '16 avos de final': 16,
            'Oitavas de final': 8,
            'Quartas de final': 4,
            'Semifinal': 2,
            'Terceiro Lugar': 1,
            'Final': 1,
        }

        fases = Fase.objects.filter(is_mata_mata=True).order_by('ordem')
        resultado = []

        for fase in fases:
            jogos = (
                Jogo.objects
                .filter(fase=fase)
                .select_related('time_casa', 'time_fora', 'fase')
                .order_by('data_hora', 'id')
            )
            resultado.append({
                'id': fase.id,
                'nome': fase.nome,
                'ordem': fase.ordem,
                'total_esperado': total_esperado_map.get(fase.nome, 0),
                'jogos': JogoSerializer(jogos, many=True).data,
            })

        return Response(resultado)
