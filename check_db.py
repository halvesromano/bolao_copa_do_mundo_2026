import os
import sys

sys.path.insert(0, '/home/halvesromano/code/bolao_copa_do_mundo/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from api.models import Time, Fase, Jogo, Palpite, GrupoPrivado
from django.contrib.auth.models import User
import os

db_path = '/home/halvesromano/code/bolao_copa_do_mundo/backend/db.sqlite3'
db_size = os.path.getsize(db_path) / 1024

print(f"=== BANCO DE DADOS ===")
print(f"Arquivo: {db_path}")
print(f"Tamanho: {db_size:.1f} KB")
print()
print(f"=== REGISTROS ===")
print(f"Usuários:  {User.objects.count()}")
print(f"Times:     {Time.objects.count()}")
print(f"Fases:     {Fase.objects.count()}")
print(f"Jogos:     {Jogo.objects.count()}")
print(f"Palpites:  {Palpite.objects.count()}")
print(f"Grupos:    {GrupoPrivado.objects.count()}")
print()

# Mostra os times cadastrados e se têm bandeira
if Time.objects.count() > 0:
    print("=== TIMES CADASTRADOS ===")
    for time in Time.objects.all():
        tem_bandeira = "✅ tem bandeira" if time.bandeira_svg else "❌ sem bandeira"
        print(f"  {time.sigla} - {time.nome}: {tem_bandeira}")
else:
    print("Nenhum time cadastrado ainda.")

print()
if Fase.objects.count() > 0:
    print("=== FASES CADASTRADAS ===")
    for fase in Fase.objects.all().order_by('ordem'):
        print(f"  [{fase.ordem}] {fase.nome} - Mata-mata: {fase.is_mata_mata}")
