"""
URLs para el módulo de lecciones
"""
from django.urls import path
from . import views

urlpatterns = [
    # Endpoints públicos
    path('', views.listar_lecciones, name='listar_lecciones'),
    path('<int:leccion_id>/', views.obtener_leccion, name='obtener_leccion'),

    # Endpoints protegidos (requieren autenticación)
    path('siguiente/', views.obtener_siguiente_leccion, name='obtener_siguiente_leccion'),
    path('<int:leccion_id>/completar/', views.completar_leccion, name='completar_leccion'),
    path('<int:leccion_id>/fallar/', views.fallar_leccion, name='fallar_leccion'),

    # Endpoints de administración (requieren autenticación)
    path('crear/', views.crear_leccion, name='crear_leccion'),
    path('<int:leccion_id>/actualizar/', views.actualizar_leccion, name='actualizar_leccion'),
    path('<int:leccion_id>/eliminar/', views.eliminar_leccion, name='eliminar_leccion'),
]
