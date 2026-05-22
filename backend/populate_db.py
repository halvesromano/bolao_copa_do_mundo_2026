import os
import sys
import django
from datetime import datetime, timedelta

# Configura o ambiente Django
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Time, Fase, Jogo, Palpite, GrupoPrivado
from django.utils.timezone import make_aware

print("Limpando banco de dados...")
Jogo.objects.all().delete()
Time.objects.all().delete()
Fase.objects.all().delete()

print("Criando Fases...")
fases_data = [
    {"nome": "Grupo A", "is_mata_mata": False, "ordem": 1},
    {"nome": "Grupo B", "is_mata_mata": False, "ordem": 2},
    {"nome": "Grupo C", "is_mata_mata": False, "ordem": 3},
    {"nome": "Grupo D", "is_mata_mata": False, "ordem": 4},
    {"nome": "Grupo E", "is_mata_mata": False, "ordem": 5},
    {"nome": "Grupo F", "is_mata_mata": False, "ordem": 6},
    {"nome": "Grupo G", "is_mata_mata": False, "ordem": 7},
    {"nome": "Grupo H", "is_mata_mata": False, "ordem": 8},
    {"nome": "Grupo I", "is_mata_mata": False, "ordem": 9},
    {"nome": "Grupo J", "is_mata_mata": False, "ordem": 10},
    {"nome": "Grupo K", "is_mata_mata": False, "ordem": 11},
    {"nome": "Grupo L", "is_mata_mata": False, "ordem": 12},
    {"nome": "16 avos de final", "is_mata_mata": True, "ordem": 13},
    {"nome": "Oitavas de final", "is_mata_mata": True, "ordem": 14},
    {"nome": "Quartas de final", "is_mata_mata": True, "ordem": 15},
    {"nome": "Semifinal", "is_mata_mata": True, "ordem": 16},
    {"nome": "Terceiro Lugar", "is_mata_mata": True, "ordem": 17},
    {"nome": "Final", "is_mata_mata": True, "ordem": 18},
]

fases_dict = {}
for data in fases_data:
    fase = Fase.objects.create(**data)
    fases_dict[data['nome']] = fase

print("Criando Times (com SVGs compactos baseados em Emojis)...")
def gerar_svg(emoji):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">{emoji}</text></svg>'

# Lista de 48 seleções plausíveis/confirmadas para 2026
times_data = [
    # Grupo A
    {"nome": "México", "sigla": "MEX", "emoji": "🇲🇽", "grupo": "Grupo A"},
    {"nome": "Camarões", "sigla": "CMR", "emoji": "🇨🇲", "grupo": "Grupo A"},
    {"nome": "Coreia do Sul", "sigla": "KOR", "emoji": "🇰🇷", "grupo": "Grupo A"},
    {"nome": "País de Gales", "sigla": "WAL", "emoji": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "grupo": "Grupo A"},
    # Grupo B
    {"nome": "Canadá", "sigla": "CAN", "emoji": "🇨🇦", "grupo": "Grupo B"},
    {"nome": "Marrocos", "sigla": "MAR", "emoji": "🇲🇦", "grupo": "Grupo B"},
    {"nome": "Japão", "sigla": "JPN", "emoji": "🇯🇵", "grupo": "Grupo B"},
    {"nome": "Sérvia", "sigla": "SRB", "emoji": "🇷🇸", "grupo": "Grupo B"},
    # Grupo C
    {"nome": "Estados Unidos", "sigla": "USA", "emoji": "🇺🇸", "grupo": "Grupo C"},
    {"nome": "Senegal", "sigla": "SEN", "emoji": "🇸🇳", "grupo": "Grupo C"},
    {"nome": "Irã", "sigla": "IRN", "emoji": "🇮🇷", "grupo": "Grupo C"},
    {"nome": "Polônia", "sigla": "POL", "emoji": "🇵🇱", "grupo": "Grupo C"},
    # Grupo D
    {"nome": "Argentina", "sigla": "ARG", "emoji": "🇦🇷", "grupo": "Grupo D"},
    {"nome": "Nigéria", "sigla": "NGA", "emoji": "🇳🇬", "grupo": "Grupo D"},
    {"nome": "Austrália", "sigla": "AUS", "emoji": "🇦🇺", "grupo": "Grupo D"},
    {"nome": "Dinamarca", "sigla": "DEN", "emoji": "🇩🇰", "grupo": "Grupo D"},
    # Grupo E
    {"nome": "Brasil", "sigla": "BRA", "emoji": "🇧🇷", "grupo": "Grupo E"},
    {"nome": "Costa do Marfim", "sigla": "CIV", "emoji": "🇨🇮", "grupo": "Grupo E"},
    {"nome": "Arábia Saudita", "sigla": "KSA", "emoji": "🇸🇦", "grupo": "Grupo E"},
    {"nome": "Croácia", "sigla": "CRO", "emoji": "🇭🇷", "grupo": "Grupo E"},
    # Grupo F
    {"nome": "França", "sigla": "FRA", "emoji": "🇫🇷", "grupo": "Grupo F"},
    {"nome": "Egito", "sigla": "EGY", "emoji": "🇪🇬", "grupo": "Grupo F"},
    {"nome": "Catar", "sigla": "QAT", "emoji": "🇶🇦", "grupo": "Grupo F"},
    {"nome": "Suíça", "sigla": "SUI", "emoji": "🇨🇭", "grupo": "Grupo F"},
    # Grupo G
    {"nome": "Inglaterra", "sigla": "ENG", "emoji": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "grupo": "Grupo G"},
    {"nome": "Gana", "sigla": "GHA", "emoji": "🇬🇭", "grupo": "Grupo G"},
    {"nome": "Iraque", "sigla": "IRQ", "emoji": "🇮🇶", "grupo": "Grupo G"},
    {"nome": "Suécia", "sigla": "SWE", "emoji": "🇸🇪", "grupo": "Grupo G"},
    # Grupo H
    {"nome": "Espanha", "sigla": "ESP", "emoji": "🇪🇸", "grupo": "Grupo H"},
    {"nome": "Argélia", "sigla": "ALG", "emoji": "🇩🇿", "grupo": "Grupo H"},
    {"nome": "Emirados Árabes", "sigla": "UAE", "emoji": "🇦🇪", "grupo": "Grupo H"},
    {"nome": "Holanda", "sigla": "NED", "emoji": "🇳🇱", "grupo": "Grupo H"},
    # Grupo I
    {"nome": "Portugal", "sigla": "POR", "emoji": "🇵🇹", "grupo": "Grupo I"},
    {"nome": "Mali", "sigla": "MLI", "emoji": "🇲🇱", "grupo": "Grupo I"},
    {"nome": "Uzbequistão", "sigla": "UZB", "emoji": "🇺🇿", "grupo": "Grupo I"},
    {"nome": "Bélgica", "sigla": "BEL", "emoji": "🇧🇪", "grupo": "Grupo I"},
    # Grupo J
    {"nome": "Alemanha", "sigla": "GER", "emoji": "🇩🇪", "grupo": "Grupo J"},
    {"nome": "Tunísia", "sigla": "TUN", "emoji": "🇹🇳", "grupo": "Grupo J"},
    {"nome": "China", "sigla": "CHN", "emoji": "🇨🇳", "grupo": "Grupo J"},
    {"nome": "Uruguai", "sigla": "URU", "emoji": "🇺🇾", "grupo": "Grupo J"},
    # Grupo K
    {"nome": "Itália", "sigla": "ITA", "emoji": "🇮🇹", "grupo": "Grupo K"},
    {"nome": "África do Sul", "sigla": "RSA", "emoji": "🇿🇦", "grupo": "Grupo K"},
    {"nome": "Nova Zelândia", "sigla": "NZL", "emoji": "🇳🇿", "grupo": "Grupo K"},
    {"nome": "Colômbia", "sigla": "COL", "emoji": "🇨🇴", "grupo": "Grupo K"},
    # Grupo L
    {"nome": "Equador", "sigla": "ECU", "emoji": "🇪🇨", "grupo": "Grupo L"},
    {"nome": "Chile", "sigla": "CHI", "emoji": "🇨🇱", "grupo": "Grupo L"},
    {"nome": "Peru", "sigla": "PER", "emoji": "🇵🇪", "grupo": "Grupo L"},
    {"nome": "Venezuela", "sigla": "VEN", "emoji": "🇻🇪", "grupo": "Grupo L"},
]

times_dict = {}
for data in times_data:
    time = Time.objects.create(
        nome=data["nome"],
        sigla=data["sigla"],
        bandeira_svg=gerar_svg(data["emoji"])
    )
    times_dict[data["nome"]] = time

print("Criando Jogos da Fase de Grupos...")
data_base = datetime(2026, 6, 11, 16, 0) # Data de início fictícia
jogo_count = 0

grupos = ["Grupo A", "Grupo B", "Grupo C", "Grupo D", "Grupo E", "Grupo F", "Grupo G", "Grupo H", "Grupo I", "Grupo J", "Grupo K", "Grupo L"]

for grupo_nome in grupos:
    # Pegar os 4 times desse grupo
    times_do_grupo = [data["nome"] for data in times_data if data["grupo"] == grupo_nome]
    fase = fases_dict[grupo_nome]
    
    # Rodada 1
    Jogo.objects.create(
        time_casa=times_dict[times_do_grupo[0]],
        time_fora=times_dict[times_do_grupo[1]],
        data_hora=make_aware(data_base + timedelta(days=jogo_count*0.5)),
        fase=fase
    )
    jogo_count += 1
    Jogo.objects.create(
        time_casa=times_dict[times_do_grupo[2]],
        time_fora=times_dict[times_do_grupo[3]],
        data_hora=make_aware(data_base + timedelta(days=jogo_count*0.5)),
        fase=fase
    )
    jogo_count += 1

print(f"População concluída com sucesso!")
print(f"Total de Times: {Time.objects.count()}")
print(f"Total de Fases: {Fase.objects.count()}")
print(f"Total de Jogos: {Jogo.objects.count()}")
