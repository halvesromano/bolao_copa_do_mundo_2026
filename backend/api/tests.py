from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from api.models import Time, Fase, Jogo, Palpite
import time

class PalpiteTimestampTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test_user', password='password123')
        
        self.time_casa = Time.objects.create(nome='Time Casa', sigla='TCA')
        self.time_fora = Time.objects.create(nome='Time Fora', sigla='TFO')
        
        self.fase = Fase.objects.create(nome='Fase de Grupos', is_mata_mata=False, ordem=1)
        
        # Jogo acontecendo amanhã para que possamos palpitar
        self.jogo = Jogo.objects.create(
            time_casa=self.time_casa,
            time_fora=self.time_fora,
            data_hora=timezone.now() + timezone.timedelta(days=1),
            fase=self.fase
        )

    def test_palpite_save_points_does_not_update_timestamp(self):
        # 1. Criar o palpite inicial
        palpite = Palpite.objects.create(
            usuario=self.user,
            jogo=self.jogo,
            gol_casa=2,
            gol_fora=1
        )
        
        # Guardar o atualizado_em inicial
        orig_atualizado_em = palpite.atualizado_em
        
        # Aguardar um pouquinho para garantir que a hora mude se for atualizada
        time.sleep(0.1)
        
        # 2. Atualizar o palpite simulando o usuário editando o palpite
        palpite.gol_casa = 3
        palpite.save()
        
        # Deve ter atualizado
        updated_atualizado_em = palpite.atualizado_em
        self.assertNotEqual(orig_atualizado_em, updated_atualizado_em)
        
        # 3. Agora o Admin encerra o jogo e calcula os pontos
        self.jogo.gol_casa = 3
        self.jogo.gol_fora = 1
        self.jogo.encerrado = True
        self.jogo.save() # Isso chama Jogo.save() que atualiza palpite.pontos e salva com update_fields
        
        # Buscar o palpite do banco de novo
        palpite.refresh_from_db()
        
        # Os pontos devem ser calculados (3x1 vs 3x1 -> placar exato -> pontos = 10 ou similar)
        self.assertGreater(palpite.pontos, 0)
        
        # O timestamp atualizado_em NÃO deve ter mudado desde o último save do usuário
        self.assertEqual(palpite.atualizado_em, updated_atualizado_em)
