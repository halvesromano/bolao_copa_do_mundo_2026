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

# Lista exata dos 47 times fornecidos pelo usuário, siglas batendo com os arquivos na pasta flags
times_data = [
    # Grupo A (4 times)
    {"nome": "México", "sigla": "MEX", "emoji": "🇲🇽", "grupo": "Grupo A"},
    {"nome": "Costa do Marfim", "sigla": "CMA", "emoji": "🇨🇮", "grupo": "Grupo A"},
    {"nome": "Coreia do Sul", "sigla": "KOR", "emoji": "🇰🇷", "grupo": "Grupo A"},
    {"nome": "Escócia", "sigla": "ESC", "emoji": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "grupo": "Grupo A"},
    
    # Grupo B (4 times)
    {"nome": "Canadá", "sigla": "CAN", "emoji": "🇨🇦", "grupo": "Grupo B"},
    {"nome": "Marrocos", "sigla": "MAR", "emoji": "🇲🇦", "grupo": "Grupo B"},
    {"nome": "Japão", "sigla": "JAP", "emoji": "🇯🇵", "grupo": "Grupo B"},
    {"nome": "Alemanha", "sigla": "ALE", "emoji": "🇩🇪", "grupo": "Grupo B"},
    
    # Grupo C (4 times)
    {"nome": "Estados Unidos", "sigla": "EUA", "emoji": "🇺🇸", "grupo": "Grupo C"},
    {"nome": "Senegal", "sigla": "SEN", "emoji": "🇸🇳", "grupo": "Grupo C"},
    {"nome": "Irã", "sigla": "IRA", "emoji": "🇮🇷", "grupo": "Grupo C"},
    {"nome": "Áustria", "sigla": "AUT", "emoji": "🇦🇹", "grupo": "Grupo C"},
    
    # Grupo D (4 times)
    {"nome": "Argentina", "sigla": "ARG", "emoji": "🇦🇷", "grupo": "Grupo D"},
    {"nome": "Cabo Verde", "sigla": "CBV", "emoji": "🇨🇻", "grupo": "Grupo D"},
    {"nome": "Austrália", "sigla": "AUS", "emoji": "🇦🇺", "grupo": "Grupo D"},
    {"nome": "Bósnia e Herzegovina", "sigla": "BOS", "emoji": "🇧🇦", "grupo": "Grupo D"},
    
    # Grupo E (4 times)
    {"nome": "Brasil", "sigla": "BRA", "emoji": "🇧🇷", "grupo": "Grupo E"},
    {"nome": "Arábia Saudita", "sigla": "ARA", "emoji": "🇸🇦", "grupo": "Grupo E"},
    {"nome": "Croácia", "sigla": "CRO", "emoji": "🇭🇷", "grupo": "Grupo E"},
    {"nome": "Argélia", "sigla": "ALG", "emoji": "🇩🇿", "grupo": "Grupo E"},
    
    # Grupo F (4 times)
    {"nome": "França", "sigla": "FRA", "emoji": "🇫🇷", "grupo": "Grupo F"},
    {"nome": "Egito", "sigla": "EGI", "emoji": "🇪🇬", "grupo": "Grupo F"},
    {"nome": "Catar", "sigla": "QAT", "emoji": "🇶🇦", "grupo": "Grupo F"},
    {"nome": "Suíça", "sigla": "SUI", "emoji": "🇨🇭", "grupo": "Grupo F"},
    
    # Grupo G (4 times)
    {"nome": "Inglaterra", "sigla": "ING", "emoji": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "grupo": "Grupo G"},
    {"nome": "Gana", "sigla": "GAN", "emoji": "🇬🇭", "grupo": "Grupo G"},
    {"nome": "Iraque", "sigla": "IRQ", "emoji": "🇮🇶", "grupo": "Grupo G"},
    {"nome": "Suécia", "sigla": "SUE", "emoji": "🇸🇪", "grupo": "Grupo G"},
    
    # Grupo H (4 times)
    {"nome": "Espanha", "sigla": "ESP", "emoji": "🇪🇸", "grupo": "Grupo H"},
    {"nome": "Haiti", "sigla": "HAI", "emoji": "🇭🇹", "grupo": "Grupo H"},
    {"nome": "Jordânia", "sigla": "JOR", "emoji": "🇯🇴", "grupo": "Grupo H"},
    {"nome": "Holanda", "sigla": "HOL", "emoji": "🇳🇱", "grupo": "Grupo H"},
    
    # Grupo I (4 times)
    {"nome": "Portugal", "sigla": "POR", "emoji": "🇵🇹", "grupo": "Grupo I"},
    {"nome": "Bélgica", "sigla": "BEL", "emoji": "🇧🇪", "grupo": "Grupo I"},
    {"nome": "Equador", "sigla": "ECU", "emoji": "🇪🇨", "grupo": "Grupo I"},
    {"nome": "Noruega", "sigla": "NOR", "emoji": "🇳🇴", "grupo": "Grupo I"},
    
    # Grupo J (4 times)
    {"nome": "Uruguai", "sigla": "URU", "emoji": "🇺🇾", "grupo": "Grupo J"},
    {"nome": "Tunísia", "sigla": "TUN", "emoji": "🇹🇳", "grupo": "Grupo J"},
    {"nome": "Nova Zelândia", "sigla": "NZL", "emoji": "🇳🇿", "grupo": "Grupo J"},
    {"nome": "Colômbia", "sigla": "COL", "emoji": "🇨🇴", "grupo": "Grupo J"},
    
    # Grupo K (4 times)
    {"nome": "África do Sul", "sigla": "AFS", "emoji": "🇿🇦", "grupo": "Grupo K"},
    {"nome": "Panamá", "sigla": "PAN", "emoji": "🇵🇦", "grupo": "Grupo K"},
    {"nome": "Paraguai", "sigla": "PAR", "emoji": "🇵🇾", "grupo": "Grupo K"},
    {"nome": "RD do Congo", "sigla": "RDC", "emoji": "🇨🇩", "grupo": "Grupo K"},
    
    # Grupo L (4 times)
    {"nome": "República Tcheca", "sigla": "RTC", "emoji": "🇨🇿", "grupo": "Grupo L"},
    {"nome": "Curaçao", "sigla": "CUR", "emoji": "🇨🇼", "grupo": "Grupo L"},
    {"nome": "Turquia", "sigla": "TUR", "emoji": "🇹🇷", "grupo": "Grupo L"},
    {"nome": "Uzbequistão", "sigla": "UZB", "emoji": "🇺🇿", "grupo": "Grupo L"},
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
    times_do_grupo = [data["nome"] for data in times_data if data["grupo"] == grupo_nome]
    fase = fases_dict[grupo_nome]
    
    # Jogo 1 (se houver pelo menos 2 times)
    if len(times_do_grupo) >= 2:
        Jogo.objects.create(
            time_casa=times_dict[times_do_grupo[0]],
            time_fora=times_dict[times_do_grupo[1]],
            data_hora=make_aware(data_base + timedelta(days=jogo_count*0.5)),
            fase=fase
        )
        jogo_count += 1
        
    # Jogo 2 (se houver pelo menos 4 times)
    if len(times_do_grupo) >= 4:
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
