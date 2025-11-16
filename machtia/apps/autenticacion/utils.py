"""
Utilidades para autenticación JWT
"""
import jwt
import uuid
from datetime import datetime, timedelta
from django.conf import settings
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .models import Usuario
from .security_utils import sanitizar_user_id
from .blacklist_models import TokenBlacklist


def generar_token(usuario_id: str) -> dict:
    """
    Genera tokens JWT (Access + Refresh) para el usuario con JWT ID únicos (jti).

    SEGURIDAD MEDIA CORREGIDA:
    - Access Token: 15 minutos (antes 24 horas) - para operaciones diarias
    - Refresh Token: 7 días - para renovar access tokens sin volver a autenticar
    - Cada token tiene su propio jti para blacklist individual

    Args:
        usuario_id (str): ID del usuario en MongoDB

    Returns:
        dict: {
            'access_token': str,
            'refresh_token': str,
            'access_token_expires_in': int (segundos),
            'refresh_token_expires_in': int (segundos),
            'token_type': 'Bearer'
        }
    """
    # Generar Access Token (corto plazo - 15 minutos)
    access_jti = str(uuid.uuid4())
    access_exp = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRATION_MINUTES)

    access_payload = {
        'user_id': str(usuario_id),
        'jti': access_jti,
        'token_type': 'access',  # NUEVO: Identificar tipo de token
        'exp': access_exp,
        'iat': datetime.utcnow()
    }

    access_token = jwt.encode(
        access_payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )

    # Generar Refresh Token (largo plazo - 7 días)
    refresh_jti = str(uuid.uuid4())
    refresh_exp = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRATION_DAYS)

    refresh_payload = {
        'user_id': str(usuario_id),
        'jti': refresh_jti,
        'token_type': 'refresh',  # NUEVO: Identificar tipo de token
        'exp': refresh_exp,
        'iat': datetime.utcnow()
    }

    refresh_token = jwt.encode(
        refresh_payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )

    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer',
        'access_token_expires_in': settings.JWT_ACCESS_TOKEN_EXPIRATION_MINUTES * 60,  # En segundos
        'refresh_token_expires_in': settings.JWT_REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 3600,  # En segundos
        'access_jti': access_jti,  # Para debugging/logging
        'refresh_jti': refresh_jti  # Para debugging/logging
    }


def verificar_token(token: str) -> dict:
    """
    Verifica y decodifica un token JWT, validando contra blacklist.

    SEGURIDAD: Valida que el token no haya sido revocado mediante el sistema
    de blacklist, previniendo el uso de tokens después de logout.

    Args:
        token (str): Token JWT a verificar

    Returns:
        dict: Payload del token si es válido y no está revocado

    Raises:
        jwt.ExpiredSignatureError: Si el token expiró
        jwt.InvalidTokenError: Si el token es inválido o está revocado
    """
    try:
        # Decodificar token
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )

        # SEGURIDAD: Verificar si el token está en la blacklist
        jti = payload.get('jti')
        if jti and TokenBlacklist.esta_revocado(jti):
            raise jwt.InvalidTokenError('Token revocado')

        return payload

    except jwt.ExpiredSignatureError:
        raise jwt.ExpiredSignatureError('El token ha expirado')
    except jwt.InvalidTokenError as e:
        # Preservar mensaje específico si es token revocado
        if 'revocado' in str(e):
            raise jwt.InvalidTokenError('Token revocado')
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

    # SEGURIDAD: Validar user_id antes de usarlo en query
    try:
        user_id = sanitizar_user_id(user_id)
    except ValueError:
        return None

    # Usar PyMongo directamente para evitar threading issues
    from mongoengine.connection import get_db
    from bson import ObjectId

    db = get_db()
    try:
        usuario_data = db.usuarios.find_one({'_id': ObjectId(user_id)})
    except Exception:
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


def require_role(allowed_roles: list):
    """
    Decorador para validar que el usuario tenga uno de los roles permitidos.

    SEGURIDAD CRÍTICA: Implementa control de acceso basado en roles (RBAC)
    para prevenir escalación de privilegios y acceso no autorizado.

    Uso:
        @api_view(['POST'])
        @require_role(['admin'])
        def eliminar_leccion(request, leccion_id):
            # Solo usuarios con rol 'admin' pueden ejecutar esto
            pass

        @api_view(['POST'])
        @require_role(['admin', 'profesor'])
        def crear_leccion(request):
            # Usuarios con rol 'admin' o 'profesor' pueden ejecutar esto
            pass

    Args:
        allowed_roles (list): Lista de roles permitidos ['estudiante', 'profesor', 'admin']

    Returns:
        decorator: Decorador que valida el rol antes de ejecutar la vista

    Raises:
        HTTP 401: Si el usuario no está autenticado
        HTTP 403: Si el usuario no tiene el rol requerido
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Primero verificar autenticación (extrae y valida token)
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

                # CONTROL DE ACCESO: Validar rol del usuario
                usuario_rol = getattr(usuario, 'rol', 'estudiante')

                if usuario_rol not in allowed_roles:
                    return Response({
                        'status': 'error',
                        'message': 'No tienes permisos para realizar esta acción',
                        'rol_actual': usuario_rol,
                        'roles_requeridos': allowed_roles
                    }, status=status.HTTP_403_FORBIDDEN)

                # Usuario autenticado y con rol correcto, ejecutar vista
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
    return decorator


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
        'rol': getattr(usuario, 'rol', 'estudiante'),  # Default a estudiante si no existe
        'tomin': usuario.tomin,
        'vidas': usuario.vidas,
        'leccionActual': usuario.leccionActual,
        'leccionesCompletadas': usuario.leccionesCompletadas,
        'createdAt': usuario.createdAt.isoformat() if usuario.createdAt else None
    }


def validar_password_segura(password: str) -> tuple[bool, str]:
    """
    Valida que la contraseña cumpla con requisitos de seguridad estrictos.

    SEGURIDAD MEDIA CORREGIDA: Protege contra contraseñas débiles, comunes y fácilmente adivinables.

    Requisitos ESTRICTOS:
    - Mínimo 12 caracteres (aumentado desde 8)
    - Al menos 3 de los 4 tipos de caracteres:
      * Mayúsculas (A-Z)
      * Minúsculas (a-z)
      * Números (0-9)
      * Símbolos (!@#$%^&*()_+-=[]{}|;:,.<>?)
    - NO estar en blacklist de contraseñas comunes
    - NO contener secuencias obvias (123456, abcdef)

    Args:
        password (str): Contraseña a validar

    Returns:
        tuple[bool, str]: (es_valida, mensaje_error)
            - es_valida: True si cumple todos los requisitos, False en caso contrario
            - mensaje_error: Descripción del error, None si es válida
    """
    import re

    # Blacklist de contraseñas más comunes (Top 50)
    # Fuente: OWASP, HaveIBeenPwned, NordPass research
    CONTRASENAS_COMUNES = {
        'password', 'password123', 'password1234', 'password12345',
        '123456', '1234567', '12345678', '123456789', '1234567890',
        'qwerty', 'qwerty123', 'qwertyuiop',
        'abc123', 'abc123456',
        'admin', 'admin123', 'admin1234',
        'letmein', 'welcome', 'welcome123',
        'monkey', 'dragon', 'master',
        'sunshine', 'princess', 'football',
        'iloveyou', 'starwars', 'batman',
        'trustno1', 'pass', 'pass123',
        'passw0rd', 'p@ssw0rd', 'p@ssword',
        '111111', '000000', '121212',
        'nahuatl', 'nahuatl123', 'machtia', 'machtia123',
        'test', 'test123', 'test1234',
        'guest', 'guest123', 'usuario', 'usuario123',
        'changeme', 'change_me',
    }

    # Requisito 1: Longitud mínima 12 caracteres
    if len(password) < 12:
        return False, 'La contraseña debe tener al menos 12 caracteres'

    # Requisito 2: Contar tipos de caracteres presentes
    tiene_mayuscula = bool(re.search(r'[A-Z]', password))
    tiene_minuscula = bool(re.search(r'[a-z]', password))
    tiene_numero = bool(re.search(r'\d', password))
    tiene_simbolo = bool(re.search(r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]', password))

    tipos_presentes = sum([tiene_mayuscula, tiene_minuscula, tiene_numero, tiene_simbolo])

    if tipos_presentes < 3:
        return False, (
            'La contraseña debe contener al menos 3 de los siguientes: '
            'mayúsculas, minúsculas, números, símbolos (!@#$%^&*()_+-=[]{}|;:,.<>?)'
        )

    # Requisito 3: Blacklist de contraseñas comunes
    password_lower = password.lower()
    if password_lower in CONTRASENAS_COMUNES:
        return False, 'Esta contraseña es muy común y no está permitida. Elige una más segura.'

    # Requisito 4: Detectar secuencias numéricas obvias
    secuencias_numericas = [
        '012345', '123456', '234567', '345678', '456789',
        '098765', '987654', '876543', '765432', '654321',
        '111111', '222222', '333333', '444444', '555555',
        '666666', '777777', '888888', '999999', '000000',
    ]
    for secuencia in secuencias_numericas:
        if secuencia in password:
            return False, 'La contraseña no puede contener secuencias numéricas obvias (123456, 111111, etc.)'

    # Requisito 5: Detectar secuencias alfabéticas obvias
    secuencias_alfabeticas = ['abcdef', 'qwerty', 'asdfgh', 'zxcvbn']
    for secuencia in secuencias_alfabeticas:
        if secuencia in password_lower:
            return False, 'La contraseña no puede contener secuencias de teclado obvias (qwerty, asdfgh, etc.)'

    # Requisito 6: No repetir caracteres más de 3 veces consecutivas
    if re.search(r'(.)\1{3,}', password):
        return False, 'La contraseña no puede tener el mismo carácter repetido más de 3 veces consecutivas'

    return True, None
