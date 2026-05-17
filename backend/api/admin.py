from django.contrib import admin
from .models import Time, Fase, Jogo, Palpite, GrupoPrivado

@admin.register(Time)
class TimeAdmin(admin.ModelAdmin):
    list_display = ('nome', 'sigla')
    search_fields = ('nome', 'sigla')

@admin.register(Fase)
class FaseAdmin(admin.ModelAdmin):
    list_display = ('nome', 'is_mata_mata', 'ordem')
    ordering = ('ordem',)

@admin.register(Jogo)
class JogoAdmin(admin.ModelAdmin):
    list_display = ('time_casa', 'time_fora', 'data_hora', 'fase', 'gol_casa', 'gol_fora', 'encerrado')
    list_filter = ('fase', 'encerrado', 'data_hora')
    search_fields = ('time_casa__nome', 'time_fora__nome')

@admin.register(Palpite)
class PalpiteAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'jogo', 'gol_casa', 'gol_fora', 'pontos', 'criado_em')
    list_filter = ('jogo__fase', 'usuario')
    search_fields = ('usuario__username', 'jogo__time_casa__nome', 'jogo__time_fora__nome')

@admin.register(GrupoPrivado)
class GrupoPrivadoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'codigo', 'criador', 'total_membros', 'criado_em')
    search_fields = ('nome', 'codigo', 'criador__username')
    filter_horizontal = ('membros',)

    def total_membros(self, obj):
        return obj.membros.count()
    total_membros.short_description = 'Membros'
