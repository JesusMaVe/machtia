"""
Vistas (endpoints) para el módulo de vidas
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from mongoengine.connection import get_db
from bson import ObjectId
from apps.autenticacion.utils import require_auth
from apps.autenticacion.rate_limit_decorators import rate_limit_api, rate_limit_compra
from .serializers import serializar_estado_vidas_frontend, serializar_compra_vida_frontend


@api_view(['GET'])
@require_auth
@rate_limit_api  # SEGURIDAD: 100 peticiones por minuto por IP
def obtener_vidas(request):
    """
    GET /api/vidas/estado/

    Retorna el estado actual de vidas del usuario en formato compatible con frontend.

    Returns:
        EstadoVidas: {vidasActuales, vidasMaximas, proximaVidaEn?, regeneracionActiva}

    Requiere autenticación.
    """
    try:
        usuario = request.user

        return Response(serializar_estado_vidas_frontend(usuario))

    except Exception as e:
        return Response({
            'error': f'Error al obtener vidas: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_auth
@rate_limit_compra  # SEGURIDAD: 10 compras por minuto (prevenir exploits)
def comprar_vida(request):
    """
    POST /api/vidas/comprar/una/

    Compra una vida usando tomins (cuesta 10 tomins).

    Validaciones:
    - Usuario debe tener suficientes tomins (10)
    - No puede tener ya 5 vidas

    Body: {} (vacío)

    Returns:
        CompraVida: {exito, mensaje, vidasNuevas, tominsRestantes}

    Requiere autenticación.
    """
    try:
        usuario = request.user
        COSTO_VIDA = 10

        # Regenerar vidas primero
        usuario.regenerar_vidas()

        # Verificar que no tenga el máximo
        if usuario.vidas >= 5:
            return Response({
                'error': 'Ya tienes el máximo de vidas (5)'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que tenga suficientes tomins
        if usuario.tomin < COSTO_VIDA:
            return Response({
                'error': f'No tienes suficientes tomins. Necesitas {COSTO_VIDA}, tienes {usuario.tomin}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Usar tomins y agregar vida
        usuario.usar_tomin(COSTO_VIDA)
        usuario.agregar_vida(1)

        return Response(serializar_compra_vida_frontend(usuario, COSTO_VIDA))

    except Exception as e:
        return Response({
            'error': f'Error al comprar vida: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_auth
@rate_limit_compra  # SEGURIDAD: 10 compras por minuto (prevenir exploits)
def restaurar_vidas(request):
    """
    POST /api/vidas/comprar/restaurar/

    Restaura todas las vidas al máximo (5) usando tomins (cuesta 50 tomins).

    Útil cuando el usuario se quedó sin vidas y quiere seguir estudiando
    sin esperar la regeneración automática.

    Validaciones:
    - Usuario debe tener suficientes tomins (50)
    - Solo útil si tiene menos de 5 vidas

    Body: {} (vacío)

    Returns:
        CompraVida: {exito, mensaje, vidasNuevas, tominsRestantes}

    Requiere autenticación.
    """
    try:
        usuario = request.user
        COSTO_RESTAURACION = 50

        # Regenerar vidas primero
        usuario.regenerar_vidas()

        # Verificar que no tenga ya el máximo
        if usuario.vidas >= 5:
            return Response({
                'error': 'Ya tienes el máximo de vidas (5)'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que tenga suficientes tomins
        if usuario.tomin < COSTO_RESTAURACION:
            return Response({
                'error': f'No tienes suficientes tomins. Necesitas {COSTO_RESTAURACION}, tienes {usuario.tomin}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Usar tomins y restaurar vidas
        usuario.usar_tomin(COSTO_RESTAURACION)
        usuario.vidas = 5
        usuario.save()

        return Response(serializar_compra_vida_frontend(usuario, COSTO_RESTAURACION))

    except Exception as e:
        return Response({
            'error': f'Error al restaurar vidas: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
