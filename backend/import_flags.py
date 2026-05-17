import os
import sys
import django

sys.path.insert(0, '/home/halvesromano/code/bolao_copa_do_mundo/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Time

flags_dir = '/home/halvesromano/code/bolao_copa_do_mundo/backend/flags'

# Mapeamento de nomes de arquivos para siglas no banco (caso sejam diferentes)
mapa_siglas = {
    'AFS': 'RSA', # África do Sul
    'ALE': 'GER', # Alemanha
    'ARA': 'KSA', # Arábia Saudita
    'CMA': 'CMR', # Camarões
    'EGI': 'EGY', # Egito
    'EUA': 'USA', # Estados Unidos
    'GAN': 'GHA', # Gana
    'HOL': 'NED', # Holanda
    'ING': 'ENG', # Inglaterra
    'IRA': 'IRN', # Irã
    'JAP': 'JPN', # Japão
    'SUE': 'SWE', # Suécia
}

atualizados = 0
nao_encontrados = []

for filename in os.listdir(flags_dir):
    if filename.endswith('.svg'):
        filepath = os.path.join(flags_dir, filename)
        sigla_arquivo = filename.replace('.svg', '').upper()
        
        # Resolve a sigla usando o mapa ou a própria sigla do arquivo
        sigla_busca = mapa_siglas.get(sigla_arquivo, sigla_arquivo)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                svg_content = f.read()
                
            time = Time.objects.filter(sigla=sigla_busca).first()
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
