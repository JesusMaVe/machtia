"""
Decoradores de Rate Limiting para endpoints de la API.

Este módulo proporciona decoradores configurados para diferentes tipos de endpoints
y protege contra ataques de fuerza bruta, DoS, y abuso de la API.

Uso:
    from apps.autenticacion.rate_limit_decorators import rate_limit_login

    @api_view(['POST'])
    @rate_limit_login
    def login(request):
        # ... código ...

Tipos de rate limits:
    - rate_limit_login: 5 intentos por minuto por IP (login/register)
    - rate_limit_leccion: 20 lecciones por hora por usuario (completar/fallar)
    - rate_limit_compra: 10 compras por minuto por usuario (vidas/tomins)
    - rate_limit_api: 100 peticiones por minuto por IP (general)
"""
from functools import wraps
from django_ratelimit.decorators import ratelimit
from rest_framework.response import Response
from rest_framework import status
from .error_handler import log_security_event, obtener_ip_cliente


def crear_respuesta_rate_limit(request):
    """
    Crea una respuesta estandarizada cuando se excede el rate limit.

    Args:
        request: Request de Django

    Returns:
        Response: Respuesta HTTP 429 con mensaje informativo
    """
    ip_cliente = obtener_ip_cliente(request)

    # Log de evento de seguridad
    log_security_event(
        'RATE_LIMIT_EXCEEDED',
        user_id=getattr(request, 'user', None),
        ip_address=ip_cliente,
        details=f'Rate limit excedido para {request.path}',
        severity='WARNING'
    )

    return Response({
        'status': 'error',
        'message': 'Demasiadas peticiones. Por favor espera un momento antes de intentar nuevamente.',
        'tipo_error': 'rate_limit_exceeded',
        'ayuda': 'Si continúas teniendo problemas, contacta al soporte.'
    }, status=status.HTTP_429_TOO_MANY_REQUESTS)


def verificar_rate_limit(request):
    """
    Verifica si la petición ha sido rate limited y retorna respuesta apropiada.

    Args:
        request: Request de Django

    Returns:
        Response or None: Response de rate limit si fue limitado, None si está OK
    """
    if getattr(request, 'limited', False):
        return crear_respuesta_rate_limit(request)
    return None


def rate_limit_login(func):
    """
    Decorador de rate limit para endpoints de autenticación (login/register).

    Límite: 5 intentos por minuto por IP
    Razón: Prevenir ataques de fuerza bruta en login

    Ejemplo:
        @api_view(['POST'])
        @rate_limit_login
        def login(request):
            # ... código ...
    """
    @wraps(func)
    @ratelimit(key='ip', rate='5/m', method='POST')
    def wrapper(request, *args, **kwargs):
        # Verificar si fue rate limited
        respuesta_limit = verificar_rate_limit(request)
        if respuesta_limit:
            return respuesta_limit

        # Continuar con la función original
        return func(request, *args, **kwargs)

    return wrapper


def rate_limit_leccion(func):
    """
    Decorador de rate limit para endpoints de lecciones (completar/fallar).

    Límite: 20 lecciones por hora por usuario autenticado
    Razón: Prevenir abuso del sistema de progreso y tomins

    Ejemplo:
        @api_view(['POST'])
        @require_auth
        @rate_limit_leccion
        def completar_leccion(request, leccion_id):
            # ... código ...
    """
    @wraps(func)
    @ratelimit(key='user', rate='20/h', method='POST')
    def wrapper(request, *args, **kwargs):
        # Verificar si fue rate limited
        respuesta_limit = verificar_rate_limit(request)
        if respuesta_limit:
            return respuesta_limit

        # Continuar con la función original
        return func(request, *args, **kwargs)

    return wrapper


def rate_limit_compra(func):
    """
    Decorador de rate limit para endpoints de compra (vidas/tomins).

    Límite: 10 compras por minuto por usuario
    Razón: Prevenir exploits de duplicación de recursos

    Ejemplo:
        @api_view(['POST'])
        @require_auth
        @rate_limit_compra
        def comprar_vida(request):
            # ... código ...
    """
    @wraps(func)
    @ratelimit(key='user', rate='10/m', method='POST')
    def wrapper(request, *args, **kwargs):
        # Verificar si fue rate limited
        respuesta_limit = verificar_rate_limit(request)
        if respuesta_limit:
            return respuesta_limit

        # Continuar con la función original
        return func(request, *args, **kwargs)

    return wrapper


def rate_limit_api(func):
    """
    Decorador de rate limit general para endpoints de API.

    Límite: 100 peticiones por minuto por IP
    Razón: Protección general contra DoS y scraping

    Ejemplo:
        @api_view(['GET'])
        @rate_limit_api
        def listar_lecciones(request):
            # ... código ...
    """
    @wraps(func)
    @ratelimit(key='ip', rate='100/m', method=['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    def wrapper(request, *args, **kwargs):
        # Verificar si fue rate limited
        respuesta_limit = verificar_rate_limit(request)
        if respuesta_limit:
            return respuesta_limit

        # Continuar con la función original
        return func(request, *args, **kwargs)

    return wrapper


def rate_limit_admin(func):
    """
    Decorador de rate limit para endpoints administrativos (CRUD).

    Límite: 30 operaciones por minuto por usuario
    Razón: Prevenir abuso de operaciones de escritura en BD

    Ejemplo:
        @api_view(['POST'])
        @require_auth
        @require_role(['admin'])
        @rate_limit_admin
        def crear_leccion(request):
            # ... código ...
    """
    @wraps(func)
    @ratelimit(key='user', rate='30/m', method=['POST', 'PUT', 'PATCH', 'DELETE'])
    def wrapper(request, *args, **kwargs):
        # Verificar si fue rate limited
        respuesta_limit = verificar_rate_limit(request)
        if respuesta_limit:
            return respuesta_limit

        # Continuar con la función original
        return func(request, *args, **kwargs)

    return wrapper
