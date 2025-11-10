"""
Vistas (endpoints) para el módulo de progreso
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from mongoengine.connection import get_db
from apps.autenticacion.utils import require_auth
from .models import Racha, ActividadDiaria, Logro
from .serializers import (
    serializar_racha_frontend,
    serializar_estadisticas_frontend,
    serializar_logros_disponibles_frontend
)
from datetime import datetime, timedelta


def serializar_actividad(actividad) -> dict:
    """
    Serializa un objeto ActividadDiaria embebido a diccionario.

    Args:
        actividad (ActividadDiaria): Instancia de ActividadDiaria (EmbeddedDocument)

    Returns:
        dict: Actividad serializada
    """
    return {
        'fecha': actividad.fecha.strftime('%Y-%m-%d'),
        'leccionesCompletadas': actividad.leccionesCompletadas,
        'tominsGanados': actividad.tominsGanados,
        'tiempoEstudio': actividad.tiempoEstudio
    }


def serializar_logro(logro) -> dict:
    """
    Serializa un objeto Logro embebido a diccionario.

    Args:
        logro (Logro): Instancia de Logro (EmbeddedDocument)

    Returns:
        dict: Logro serializado
    """
    return {
        'id': logro.id,
        'nombre': logro.nombre,
        'descripcion': logro.descripcion,
        'icono': logro.icono,
        'fechaDesbloqueo': logro.fechaDesbloqueo.strftime('%Y-%m-%d %H:%M:%S')
    }


def obtener_o_crear_racha(usuario_id: str):
    """
    Obtiene la racha del usuario o la crea si no existe.

    Args:
        usuario_id (str): ID del usuario

    Returns:
        Racha: Objeto Racha del usuario
    """
    db = get_db()
    racha_data = db.rachas.find_one({'usuario_id': usuario_id})

    if not racha_data:
        # Crear nueva racha
        racha = Racha(usuario_id=usuario_id)
        racha.save()
    else:
        # Reconstruir objeto Racha
        racha_dict = {k: v for k, v in racha_data.items() if k != '_id'}
        racha = Racha(**racha_dict)
        racha.id = racha_data['_id']

    return racha


@api_view(['GET'])
@require_auth
def obtener_estadisticas(request):
    """
    GET /api/progreso/estadisticas/

    Retorna estadísticas del usuario en formato compatible con frontend.

    Returns:
        Estadisticas: {leccionesCompletadas, totalLecciones, tominsAcumulados, tominsGastados, horasEstudio, palabrasAprendidas, nivel, progreso}

    Requiere autenticación.
    """
    try:
        usuario = request.user
        racha = obtener_o_crear_racha(str(usuario.id))

        return Response(serializar_estadisticas_frontend(racha, usuario))

    except Exception as e:
        return Response({
            'error': f'Error al obtener estadísticas: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_auth
def obtener_racha(request):
    """
    GET /api/progreso/racha/

    Retorna información de la racha del usuario en formato compatible con frontend.

    Returns:
        Racha: {diasActuales, diasMaximos, estado, ultimaActividad, proximaExpiracion?}

    Requiere autenticación.
    """
    try:
        usuario = request.user
        racha = obtener_o_crear_racha(str(usuario.id))

        return Response(serializar_racha_frontend(racha))

    except Exception as e:
        return Response({
            'error': f'Error al obtener racha: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_auth
def obtener_logros(request):
    """
    GET /api/progreso/logros/

    Retorna todos los logros (desbloqueados y bloqueados) en formato compatible con frontend.

    Returns:
        Logro[]: Lista de logros con estado desbloqueado/bloqueado

    Requiere autenticación.
    """
    try:
        usuario = request.user
        racha = obtener_o_crear_racha(str(usuario.id))

        return Response(serializar_logros_disponibles_frontend(racha))

    except Exception as e:
        return Response({
            'error': f'Error al obtener logros: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_auth
def obtener_actividad(request):
    """
    GET /api/progreso/actividad/

    Retorna el historial de actividad diaria del usuario autenticado.

    Query params:
        - dias: Cantidad de días hacia atrás (default: 30, max: 365)

    Requiere autenticación.
    """
    try:
        usuario = request.user
        racha = obtener_o_crear_racha(str(usuario.id))

        # Obtener parámetro de días
        try:
            dias = int(request.GET.get('dias', 30))
            if dias > 365:
                dias = 365
            elif dias < 1:
                dias = 30
        except ValueError:
            dias = 30

        # Calcular fecha límite
        hoy = datetime.utcnow().date()
        fecha_limite = hoy - timedelta(days=dias)

        # Filtrar actividades
        actividades_filtradas = []
        total_lecciones = 0
        total_tomins = 0
        total_tiempo = 0

        for actividad in racha.diasActivos:
            if actividad.fecha.date() >= fecha_limite:
                actividades_filtradas.append(serializar_actividad(actividad))
                total_lecciones += actividad.leccionesCompletadas
                total_tomins += actividad.tominsGanados
                total_tiempo += actividad.tiempoEstudio

        # Ordenar por fecha descendente (más reciente primero)
        actividades_filtradas.sort(key=lambda x: x['fecha'], reverse=True)

        # Calcular resumen
        dias_con_actividad = len(actividades_filtradas)
        promedio_lecciones = (total_lecciones / dias_con_actividad) if dias_con_actividad > 0 else 0
        promedio_tomins = (total_tomins / dias_con_actividad) if dias_con_actividad > 0 else 0
        promedio_tiempo = (total_tiempo / dias_con_actividad) if dias_con_actividad > 0 else 0

        return Response({
            'status': 'success',
            'actividad': {
                'diasMostrados': dias,
                'diasConActividad': dias_con_actividad,
                'historial': actividades_filtradas,
                'resumen': {
                    'totalLecciones': total_lecciones,
                    'totalTomins': total_tomins,
                    'totalTiempoMinutos': total_tiempo,
                    'totalTiempoHoras': round(total_tiempo / 60, 2),
                    'promedioLeccionesPorDia': round(promedio_lecciones, 2),
                    'promedioTominsPorDia': round(promedio_tomins, 2),
                    'promedioTiempoPorDia': round(promedio_tiempo, 2)
                }
            }
        })

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al obtener actividad: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
