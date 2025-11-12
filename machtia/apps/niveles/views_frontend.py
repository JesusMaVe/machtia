"""
Vistas (endpoints) para el módulo de niveles
Compatible con frontend TypeScript
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from mongoengine.connection import get_db
from apps.autenticacion.utils import require_auth
from .models import Nivel
from .serializers import (
    serializar_nivel_frontend,
)


@api_view(['GET'])
@require_auth
def listar_niveles(request):
    """
    GET /api/niveles/
    
    Retorna todos los niveles con información de estado del usuario.
    Frontend espera array directo de niveles.
    """
    try:
        usuario = request.user
        db = get_db()
        
        # Construir filtro
        filtro = {}
        
        dificultad = request.GET.get('dificultad')
        if dificultad and dificultad in ['principiante', 'intermedio', 'avanzado']:
            filtro['dificultad'] = dificultad
        
        tema = request.GET.get('tema')
        if tema:
            filtro['tema'] = tema
        
        # Buscar niveles ordenados por ID
        niveles_cursor = db.niveles.find(filtro).sort('_id', 1)
        niveles = []
        
        for nivel_data in niveles_cursor:
            niveles.append(serializar_nivel_frontend(nivel_data, usuario))
        
        # Frontend espera array directo
        return Response(niveles)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al obtener niveles: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_auth
def obtener_nivel(request, nivel_id):
    """
    GET /api/niveles/:id/
    
    Retorna un nivel específico con su información completa.
    """
    try:
        usuario = request.user
        db = get_db()
        
        # Convertir nivel_id a int
        try:
            nivel_id = int(nivel_id)
        except ValueError:
            return Response({
                'status': 'error',
                'message': 'ID de nivel inválido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar nivel
        nivel_data = db.niveles.find_one({'_id': nivel_id})
        
        if not nivel_data:
            return Response({
                'status': 'error',
                'message': 'Nivel no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Frontend espera objeto de nivel directamente
        return Response(serializar_nivel_frontend(nivel_data, usuario))
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al obtener nivel: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_auth
def obtener_siguiente_nivel(request):
    """
    GET /api/niveles/siguiente/
    
    Retorna el siguiente nivel disponible para el usuario.
    """
    try:
        usuario = request.user
        db = get_db()
        
        # Buscar el nivel actual del usuario
        nivel_data = db.niveles.find_one({'_id': usuario.nivelActual})
        
        if not nivel_data:
            return Response({
                'status': 'error',
                'message': 'No hay más niveles disponibles'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Frontend espera objeto de nivel directamente
        return Response(serializar_nivel_frontend(nivel_data, usuario))
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al obtener siguiente nivel: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
