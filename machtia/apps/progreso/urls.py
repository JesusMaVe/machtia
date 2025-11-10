"""
URLs para el módulo de progreso
"""
from django.urls import path
from . import views

urlpatterns = [
    path('estadisticas/', views.obtener_estadisticas, name='obtener_estadisticas'),
    path('racha/', views.obtener_racha, name='obtener_racha'),
    path('logros/', views.obtener_logros, name='obtener_logros'),
    path('actividad/', views.obtener_actividad, name='obtener_actividad'),
]
