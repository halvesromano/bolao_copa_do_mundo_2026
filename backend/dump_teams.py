import os, sys, django
sys.path.insert(0, '/home/halvesromano/code/bolao_copa_do_mundo/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from api.models import Time
for t in Time.objects.all():
    print(f"{t.sigla} - {t.nome}")
