from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Time, Fase, Jogo, Palpite, GrupoPrivado

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_active=False # Requer aprovação manual
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class TimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Time
        fields = '__all__'

class FaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fase
        fields = '__all__'

class JogoSerializer(serializers.ModelSerializer):
    time_casa = TimeSerializer(read_only=True)
    time_fora = TimeSerializer(read_only=True)
    fase = FaseSerializer(read_only=True)

    class Meta:
        model = Jogo
        fields = '__all__'

class PalpiteSerializer(serializers.ModelSerializer):
    jogo = JogoSerializer(read_only=True)
    jogo_id = serializers.PrimaryKeyRelatedField(
        queryset=Jogo.objects.all(), source='jogo', write_only=True
    )
    usuario = UserSerializer(read_only=True)

    class Meta:
        model = Palpite
        fields = ['id', 'usuario', 'jogo', 'jogo_id', 'gol_casa', 'gol_fora', 'pontos', 'criado_em', 'atualizado_em']
        read_only_fields = ['pontos', 'usuario']

    def validate(self, data):
        from django.utils import timezone
        jogo = data.get('jogo')
        if jogo and jogo.data_hora:
            um_minuto_antes = jogo.data_hora - timezone.timedelta(minutes=1)
            if timezone.now() > um_minuto_antes:
                raise serializers.ValidationError("Os palpites devem ser feitos até 1 minuto antes do início do jogo.")
        return data

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)


class GrupoPrivadoSerializer(serializers.ModelSerializer):
    criador = serializers.StringRelatedField(read_only=True)
    total_membros = serializers.SerializerMethodField()
    is_criador = serializers.SerializerMethodField()

    class Meta:
        model = GrupoPrivado
        fields = ['id', 'nome', 'codigo', 'criador', 'total_membros', 'is_criador', 'criado_em']
        read_only_fields = ['codigo', 'criador', 'criado_em']

    def get_total_membros(self, obj):
        return obj.membros.count()

    def get_is_criador(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.criador == request.user
        return False

    def create(self, validated_data):
        user = self.context['request'].user
        grupo = GrupoPrivado.objects.create(
            nome=validated_data['nome'],
            criador=user
        )
        grupo.membros.add(user)
        return grupo
