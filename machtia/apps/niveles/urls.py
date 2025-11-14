"""
URLs para el módulo de niveles
"""
from django.urls import path
from . import views

urlpatterns = [
    # Endpoints públicos
    path('', views.listar_niveles, name='listar_niveles'),
    path('<int:nivel_id>/', views.obtener_nivel, name='obtener_nivel'),
    path('<int:nivel_id>/lecciones/', views.obtener_lecciones_de_nivel, name='obtener_lecciones_de_nivel'),

    # Endpoints de administración (requieren autenticación)
    path('crear/', views.crear_nivel, name='crear_nivel'),
    path('<int:nivel_id>/actualizar/', views.actualizar_nivel, name='actualizar_nivel'),
    path('<int:nivel_id>/eliminar/', views.eliminar_nivel, name='eliminar_nivel'),
]
