"""
Utilidades para autenticación JWT
"""
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .models import Usuario


def generar_token(usuario_id: str) -> dict:
    """
    Genera un token JWT para el usuario.

    Args:
        usuario_id (str): ID del usuario en MongoDB

    Returns:
        dict: Diccionario con 'access_token' y 'expires_in'
    """
    payload = {
        'user_id': str(usuario_id),
        'exp': datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )

    return {
        'access_token': token,
        'token_type': 'Bearer',
        'expires_in': settings.JWT_EXPIRATION_HOURS * 3600  # En segundos
    }


def verificar_token(token: str) -> dict:
    """
    Verifica y decodifica un token JWT.

    Args:
        token (str): Token JWT a verificar

    Returns:
        dict: Payload del token si es válido

    Raises:
        jwt.ExpiredSignatureError: Si el token expiró
        jwt.InvalidTokenError: Si el token es inválido
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise jwt.ExpiredSignatureError('El token ha expirado')
    except jwt.InvalidTokenError:
        raise jwt.InvalidTokenError('Token inválido')


# Alias para compatibilidad con código que usa decodificar_token
decodificar_token = verificar_token


def obtener_usuario_desde_token(token: str):
    """
    Obtiene el usuario desde el token JWT.

    Args:
        token (str): Token JWT

    Returns:
        Usuario: Instancia del usuario si existe
        None: Si no se encuentra el usuario

    Raises:
        jwt.ExpiredSignatureError: Si el token expiró
        jwt.InvalidTokenError: Si el token es inválido
    """
    payload = verificar_token(token)
    user_id = payload.get('user_id')

    if not user_id:
        return None

    # Usar PyMongo directamente para evitar threading issues
    from mongoengine.connection import get_db
    from bson import ObjectId

    db = get_db()
    try:
        usuario_data = db.usuarios.find_one({'_id': ObjectId(user_id)})
    except:
        return None

    if not usuario_data:
        return None

    # Reconstruir objeto Usuario
    usuario_dict = {k: v for k, v in usuario_data.items() if k != '_id'}
    usuario = Usuario(**usuario_dict)
    usuario.id = usuario_data['_id']

    return usuario


def extraer_token_de_header(request) -> str:
    """
    Extrae el token JWT del header Authorization.

    Args:
        request: Request de Django

    Returns:
        str: Token JWT sin el prefijo 'Bearer'
        None: Si no hay token
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')

    if auth_header.startswith('Bearer '):
        return auth_header[7:]  # Remover 'Bearer '

    return None


def require_auth(view_func):
    """
    Decorador para requerir autenticación en una vista.

    Uso:
        @api_view(['GET'])
        @require_auth
        def mi_vista_protegida(request):
            # request.user contendrá el usuario autenticado
            return Response({'mensaje': f'Hola {request.user.nombre}'})
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        token = extraer_token_de_header(request)

        if not token:
            return Response({
                'status': 'error',
                'message': 'Token no proporcionado'
            }, status=status.HTTP_401_UNAUTHORIZED)

        try:
            usuario = obtener_usuario_desde_token(token)

            if not usuario:
                return Response({
                    'status': 'error',
                    'message': 'Usuario no encontrado'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Agregar usuario al request
            request.user = usuario

            # Ejecutar la vista
            return view_func(request, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return Response({
                'status': 'error',
                'message': 'El token ha expirado'
            }, status=status.HTTP_401_UNAUTHORIZED)

        except jwt.InvalidTokenError:
            return Response({
                'status': 'error',
                'message': 'Token inválido'
            }, status=status.HTTP_401_UNAUTHORIZED)

    return wrapper


def serializar_usuario(usuario) -> dict:
    """
    Serializa un objeto Usuario a diccionario.

    Args:
        usuario (Usuario): Instancia del modelo Usuario

    Returns:
        dict: Usuario serializado (sin contraseña)
    """
    return {
        'id': str(usuario.id),
        'email': usuario.email,
        'nombre': usuario.nombre,
        'tomin': usuario.tomin,
        'vidas': usuario.vidas,
        'leccionActual': usuario.leccionActual,
        'leccionesCompletadas': usuario.leccionesCompletadas,
        'createdAt': usuario.createdAt.isoformat() if usuario.createdAt else None
    }


def validar_password_segura(password: str) -> tuple[bool, str]:
    """
    Valida que la contraseña cumpla con requisitos de seguridad.

    Requisitos:
    - Mínimo 8 caracteres
    - Al menos 1 letra mayúscula
    - Al menos 1 letra minúscula
    - Al menos 1 número

    Args:
        password (str): Contraseña a validar

    Returns:
        tuple[bool, str]: (es_valida, mensaje_error)
            - es_valida: True si cumple todos los requisitos, False en caso contrario
            - mensaje_error: Descripción del error, None si es válida
    """
    import re

    if len(password) < 8:
        return False, 'La contraseña debe tener al menos 8 caracteres'

    if not re.search(r'[A-Z]', password):
        return False, 'La contraseña debe contener al menos una letra mayúscula'

    if not re.search(r'[a-z]', password):
        return False, 'La contraseña debe contener al menos una letra minúscula'

    if not re.search(r'\d', password):
        return False, 'La contraseña debe contener al menos un número'

    return True, None
