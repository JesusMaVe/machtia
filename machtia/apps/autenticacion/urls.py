"""
URLs de autenticación
"""
from django.urls import path
from . import views

app_name = 'autenticacion'

urlpatterns = [
    # Endpoints de testing
    path('test-connection/', views.test_connection, name='test_connection'),
    path('create-test-user/', views.create_test_user, name='create_test_user'),

    # Endpoints de autenticación
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('refresh/', views.refresh_token, name='refresh_token'),  # NUEVO: Renovar access token

    # Endpoints de usuario
    path('me/', views.me, name='me'),
    path('me/update/', views.update_profile, name='update_profile'),
]
