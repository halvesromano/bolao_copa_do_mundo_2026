import os
import sys
import django

sys.path.insert(0, '/home/halvesromano/code/bolao_copa_do_mundo/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Time

flags_dir = '/home/halvesromano/code/bolao_copa_do_mundo/backend/flags'

atualizados = 0
nao_encontrados = []

for filename in os.listdir(flags_dir):
    if filename.endswith('.svg'):
        filepath = os.path.join(flags_dir, filename)
        sigla_arquivo = filename.replace('.svg', '').upper()
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                svg_content = f.read()
                
            time = Time.objects.filter(sigla=sigla_arquivo).first()
            if time:
                time.bandeira_svg = svg_content
                time.save()
                atualizados += 1
                print(f"✅ Bandeira atualizada para: {time.nome} ({time.sigla})")
            else:
                nao_encontrados.append(sigla_arquivo)
                print(f"❌ Time não encontrado para o arquivo: {filename}")
        except Exception as e:
            print(f"Erro ao processar {filename}: {e}")

print(f"\nResumo: {atualizados} bandeiras importadas com sucesso.")
if nao_encontrados:
    print(f"Atenção: Não foram encontrados times no banco para as seguintes siglas de arquivos: {', '.join(nao_encontrados)}")
