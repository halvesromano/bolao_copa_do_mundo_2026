from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, TimeViewSet, FaseViewSet, JogoViewSet, PalpiteViewSet, RankingViewSet, GrupoPrivadoViewSet, AlterarSenhaView, EstatisticasViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'times', TimeViewSet)
router.register(r'fases', FaseViewSet)
router.register(r'jogos', JogoViewSet)
router.register(r'palpites', PalpiteViewSet, basename='palpite')
router.register(r'ranking', RankingViewSet, basename='ranking')
router.register(r'grupos', GrupoPrivadoViewSet, basename='grupo')
router.register(r'estatisticas', EstatisticasViewSet, basename='estatisticas')

urlpatterns = [
    path('', include(router.urls)),
    path('conta/alterar-senha/', AlterarSenhaView.as_view(), name='alterar-senha'),
]
