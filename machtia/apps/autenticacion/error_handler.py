"""
Utilidades para manejo seguro de errores.

Este módulo proporciona funciones para:
- Generar IDs únicos de error para tracking
- Logging seguro de excepciones
- Respuestas de error genéricas al cliente
- Prevención de exposición de información sensible

Uso:
    from apps.autenticacion.error_handler import manejar_error_seguro

    try:
        # ... código ...
    except ValueError as e:
        # Errores de validación - seguros de mostrar
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        # Errores inesperados - usar manejo seguro
        return manejar_error_seguro(e, 'Error al procesar solicitud')
"""
import logging
import uuid
from rest_framework.response import Response
from rest_framework import status

# Logger para seguridad
security_logger = logging.getLogger('security')

# Logger para errores de aplicación
app_logger = logging.getLogger('django')


def generar_error_id() -> str:
    """
    Genera un ID único para tracking de errores.

    Returns:
        str: ID único en formato UUID4
    """
    return str(uuid.uuid4())


def log_error_con_id(error_id: str, error: Exception, contexto: str = None) -> None:
    """
    Registra un error en los logs con su ID único.

    Args:
        error_id (str): ID único del error
        error (Exception): La excepción capturada
        contexto (str, optional): Contexto adicional sobre el error
    """
    mensaje = f"Error ID {error_id}: {str(error)}"
    if contexto:
        mensaje = f"{contexto} | {mensaje}"

    app_logger.error(mensaje, exc_info=True)


def manejar_error_seguro(
    error: Exception,
    mensaje_cliente: str = 'Ha ocurrido un error interno',
    contexto: str = None,
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
) -> Response:
    """
    Maneja una excepción de forma segura sin exponer detalles internos.

    Args:
        error (Exception): La excepción capturada
        mensaje_cliente (str): Mensaje genérico para mostrar al cliente
        contexto (str, optional): Contexto adicional para logging
        status_code (int): Código de estado HTTP a retornar

    Returns:
        Response: Respuesta DRF con mensaje genérico y error_id
    """
    error_id = generar_error_id()
    log_error_con_id(error_id, error, contexto)

    return Response({
        'status': 'error',
        'message': mensaje_cliente,
        'error_id': error_id,
        'contacto': 'Si el problema persiste, contacta al soporte con el error_id'
    }, status=status_code)


def log_security_event(
    event_type: str,
    user_id: str = None,
    ip_address: str = None,
    details: str = None,
    severity: str = 'INFO'
) -> None:
    """
    Registra un evento de seguridad en los logs.

    Args:
        event_type (str): Tipo de evento (LOGIN_FAILED, UNAUTHORIZED_ACCESS, etc.)
        user_id (str, optional): ID del usuario involucrado
        ip_address (str, optional): IP del cliente
        details (str, optional): Detalles adicionales del evento
        severity (str): Nivel de severidad (INFO, WARNING, ERROR, CRITICAL)
    """
    mensaje = f"{event_type}"
    if details:
        mensaje = f"{mensaje} | {details}"

    extra = {
        'user_id': user_id or 'anonymous',
        'ip': ip_address or 'unknown'
    }

    if severity == 'CRITICAL':
        security_logger.critical(mensaje, extra=extra)
    elif severity == 'ERROR':
        security_logger.error(mensaje, extra=extra)
    elif severity == 'WARNING':
        security_logger.warning(mensaje, extra=extra)
    else:
        security_logger.info(mensaje, extra=extra)


def obtener_ip_cliente(request) -> str:
    """
    Obtiene la IP del cliente desde el request.

    Args:
        request: Request de Django

    Returns:
        str: Dirección IP del cliente
    """
    # Priorizar headers de proxy si existen
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', 'unknown')

    return ip
