"""
URLs para el módulo de vidas
"""
from django.urls import path
from . import views

urlpatterns = [
    path('estado/', views.obtener_vidas, name='obtener_vidas'),
    path('comprar/una/', views.comprar_vida, name='comprar_vida'),
    path('comprar/restaurar/', views.restaurar_vidas, name='restaurar_vidas'),
]
