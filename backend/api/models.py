from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
import random
import string
from .utils import calcular_pontuacao_palpite

class Time(models.Model):
    nome = models.CharField(max_length=100)
    sigla = models.CharField(max_length=3)
    bandeira_svg = models.TextField(help_text="Código SVG da bandeira", blank=True, null=True)

    def __str__(self):
        return self.nome

class Fase(models.Model):
    nome = models.CharField(max_length=50) # Ex: Fase de Grupos, Oitavas de Final
    is_mata_mata = models.BooleanField(default=False)
    ordem = models.IntegerField(default=1)

    def __str__(self):
        return self.nome

class Jogo(models.Model):
    time_casa = models.ForeignKey(Time, on_delete=models.CASCADE, related_name='jogos_casa')
    time_fora = models.ForeignKey(Time, on_delete=models.CASCADE, related_name='jogos_fora')
    data_hora = models.DateTimeField()
    fase = models.ForeignKey(Fase, on_delete=models.CASCADE)
    gol_casa = models.IntegerField(null=True, blank=True)
    gol_fora = models.IntegerField(null=True, blank=True)
    encerrado = models.BooleanField(default=False)
    posicao = models.IntegerField(
        null=True, blank=True,
        help_text="Posição no chaveamento (ex: 1..16 nos 16 avos). Usado para ordenar o bracket."
    )

    def clean(self):
        if self.time_casa == self.time_fora:
            raise ValidationError("Um time não pode jogar contra si mesmo.")
        if self.encerrado and (self.gol_casa is None or self.gol_fora is None):
            raise ValidationError("Jogos encerrados precisam ter o placar definido.")

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Se o jogo foi encerrado e os placares não são nulos, calcula a pontuação dos palpites
        if self.encerrado and self.gol_casa is not None and self.gol_fora is not None:
            palpites = self.palpite_set.all()
            for palpite in palpites:
                pontos = calcular_pontuacao_palpite(
                    palpite.gol_casa, palpite.gol_fora,
                    self.gol_casa, self.gol_fora,
                    self.fase.is_mata_mata
                )
                if palpite.pontos != pontos:
                    palpite.pontos = pontos
                    palpite.save(update_fields=['pontos'])

    def __str__(self):
        return f"{self.time_casa} x {self.time_fora} - {self.data_hora.strftime('%d/%m/%Y %H:%M')}"

class Palpite(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    jogo = models.ForeignKey(Jogo, on_delete=models.CASCADE)
    gol_casa = models.IntegerField()
    gol_fora = models.IntegerField()
    pontos = models.IntegerField(default=0)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('usuario', 'jogo')

    def clean(self):
        # Bloquear palpites 1 minuto antes do jogo
        if self.jogo.data_hora:
            um_minuto_antes = self.jogo.data_hora - timezone.timedelta(minutes=1)
            if timezone.now() > um_minuto_antes:
                raise ValidationError("Os palpites devem ser feitos até 1 minuto antes do início do jogo.")

    def __str__(self):
        return f"{self.usuario.username} - {self.jogo} ({self.gol_casa}x{self.gol_fora})"


def gerar_codigo_unico():
    """Gera um código de convite único de 8 caracteres."""
    while True:
        codigo = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        if not GrupoPrivado.objects.filter(codigo=codigo).exists():
            return codigo


class GrupoPrivado(models.Model):
    nome = models.CharField(max_length=100)
    codigo = models.CharField(max_length=8, unique=True, blank=True)
    criador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='grupos_criados')
    membros = models.ManyToManyField(User, related_name='grupos_participantes', blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.codigo:
            self.codigo = gerar_codigo_unico()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.codigo})"


class PalpiteCampeao(models.Model):
    """Palpite Bônus: cada usuário palpita o campeão da Copa."""
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='palpite_campeao')
    time = models.ForeignKey(Time, on_delete=models.CASCADE, related_name='palpites_campeao')
    pontos = models.IntegerField(default=0)  # 25 se acertou, 0 caso contrário
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.usuario.username} → {self.time.nome} ({self.pontos} pts)"


class ConfigCampeao(models.Model):
    """Configuração singleton: o admin define aqui o time campeão da Copa."""
    campeao = models.ForeignKey(
        Time, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='config_campeao', verbose_name='Time Campeão'
    )
    definido_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Configuração do Campeão'
        verbose_name_plural = 'Configuração do Campeão'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Ao salvar, distribui/recalcula os 25 pontos para quem acertou
        if self.campeao:
            for pb in PalpiteCampeao.objects.all():
                pts = 25 if pb.time_id == self.campeao_id else 0
                if pb.pontos != pts:
                    pb.pontos = pts
                    pb.save(update_fields=['pontos'])

    def __str__(self):
        return f"Campeão: {self.campeao.nome if self.campeao else 'Não definido'}"

