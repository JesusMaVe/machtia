"""
Vistas (endpoints) para el módulo de lecciones
Compatible con frontend TypeScript
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from mongoengine.connection import get_db
from apps.autenticacion.utils import require_auth
from apps.progreso.models import Racha
from .models import Leccion
from .serializers import (
    serializar_leccion_frontend,
    serializar_resultado_completar,
    serializar_resultado_fallar
)


@api_view(['GET'])
@require_auth
def listar_lecciones(request):
    """
    GET /api/lecciones/
    
    Retorna todas las lecciones con información de estado del usuario.
    Frontend espera array directo de lecciones.
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
        
        # Buscar lecciones ordenadas por ID
        lecciones_cursor = db.lecciones.find(filtro).sort('_id', 1)
        lecciones = []
        
        for leccion_data in lecciones_cursor:
            lecciones.append(serializar_leccion_frontend(leccion_data, usuario))
        
        # Frontend espera array directo
        return Response(lecciones)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al obtener lecciones: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_auth
def obtener_leccion(request, leccion_id):
    """
    GET /api/lecciones/:id/
    
    Retorna una lección específica con todas sus palabras.
    """
    try:
        usuario = request.user
        db = get_db()
        
        # Convertir leccion_id a int
        try:
            leccion_id = int(leccion_id)
        except ValueError:
            return Response({
                'status': 'error',
                'message': 'ID de lección inválido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar lección
        leccion_data = db.lecciones.find_one({'_id': leccion_id})
        
        if not leccion_data:
            return Response({
                'status': 'error',
                'message': 'Lección no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Frontend espera objeto de lección directamente
        return Response(serializar_leccion_frontend(leccion_data, usuario))
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al obtener lección: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_auth
def obtener_siguiente_leccion(request):
    """
    GET /api/lecciones/siguiente/
    
    Retorna la siguiente lección disponible para el usuario.
    """
    try:
        usuario = request.user
        db = get_db()
        
        # Buscar la lección actual del usuario
        leccion_data = db.lecciones.find_one({'_id': usuario.leccionActual})
        
        if not leccion_data:
            return Response({
                'status': 'error',
                'message': 'No hay más lecciones disponibles'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Frontend espera objeto de lección directamente
        return Response(serializar_leccion_frontend(leccion_data, usuario))
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al obtener siguiente lección: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_auth
def completar_leccion(request, leccion_id):
    """
    POST /api/lecciones/:id/completar/
    
    Marca una lección como completada y otorga recompensa.
    """
    try:
        usuario = request.user
        db = get_db()
        
        # Convertir leccion_id a int
        try:
            leccion_id = int(leccion_id)
        except ValueError:
            return Response({
                'status': 'error',
                'message': 'ID de lección inválido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que la lección existe
        leccion_data = db.lecciones.find_one({'_id': leccion_id})
        
        if not leccion_data:
            return Response({
                'status': 'error',
                'message': 'Lección no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar si ya completó esta lección
        if leccion_id in usuario.leccionesCompletadas:
            return Response({
                'status': 'error',
                'message': 'Ya completaste esta lección'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener recompensa
        tomins_recompensa = leccion_data.get('tominsAlCompletar', 5)
        
        # Actualizar usuario
        usuario.completar_leccion(leccion_id)
        usuario.agregar_tomin(tomins_recompensa)
        
        # Avanzar a siguiente lección
        usuario.leccionActual = leccion_id + 1
        usuario.save()
        
        # === SISTEMA DE PROGRESO ===
        # Buscar o crear racha del usuario
        racha_data = db.rachas.find_one({'usuario_id': str(usuario.id)})
        
        if not racha_data:
            # Crear nueva racha
            racha = Racha(usuario_id=str(usuario.id))
            racha.save()
        else:
            # Reconstruir objeto Racha
            racha_dict = {k: v for k, v in racha_data.items() if k != '_id'}
            racha = Racha(**racha_dict)
            racha.id = racha_data['_id']
        
        # Actualizar racha
        racha.actualizar_racha()
        
        # Registrar actividad del día
        racha.registrar_actividad(
            lecciones_completadas=1,
            tomins_ganados=tomins_recompensa,
            tiempo_estudio=10  # Estimado: 10 minutos por lección
        )
        
        # Verificar logros automáticos
        logros_nuevos = racha.verificar_logros_automaticos()
        
        # Retornar formato esperado por frontend
        return Response(serializar_resultado_completar(
            usuario=usuario,
            racha_actual=racha.rachaActual,
            racha_maxima=racha.rachaMaxima,
            logros_nuevos=logros_nuevos,
            tomins_ganados=tomins_recompensa
        ))
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al completar lección: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_auth
def fallar_leccion(request, leccion_id):
    """
    POST /api/lecciones/:id/fallar/
    
    Registra fallo en lección, consume una vida.
    """
    try:
        usuario = request.user
        db = get_db()
        
        # Convertir leccion_id a int
        try:
            leccion_id = int(leccion_id)
        except ValueError:
            return Response({
                'status': 'error',
                'message': 'ID de lección inválido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que la lección existe
        leccion_data = db.lecciones.find_one({'_id': leccion_id})
        
        if not leccion_data:
            return Response({
                'status': 'error',
                'message': 'Lección no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar si tiene vidas disponibles (regenera automáticamente)
        if not usuario.tiene_vidas_disponibles():
            return Response({
                'status': 'error',
                'message': 'No tienes vidas disponibles'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Usar una vida
        usuario.usar_vida()
        
        # Retornar formato esperado por frontend
        return Response(serializar_resultado_fallar(usuario.vidas))
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al registrar fallo: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
