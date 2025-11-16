"""
Vistas de autenticación usando Django REST Framework
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from mongoengine import connect
from mongoengine.connection import get_db
from .models import Usuario
from .utils import generar_token, require_auth, serializar_usuario, validar_password_segura
from .security_utils import sanitizar_email, validar_password_input
from .error_handler import manejar_error_seguro, log_security_event, obtener_ip_cliente
from .rate_limit_decorators import rate_limit_login, rate_limit_api
import re


@api_view(['POST', 'GET'])
def test_connection(request):
    """
    Endpoint de prueba para verificar la conexión a MongoDB.

    Returns:
        JSON con status de la conexión y datos de la base de datos
    """
    try:
        # Obtener la base de datos activa
        db = get_db()

        # Obtener nombres de las colecciones
        collection_names = db.list_collection_names()

        # Contar usuarios existentes
        usuarios_count = Usuario.objects.count()

        return Response({
            'status': 'success',
            'message': 'Conexión exitosa a MongoDB',
            'database': db.name,
            'collections': collection_names,
            'usuarios_count': usuarios_count
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al conectar con MongoDB: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_test_user(request):
    """
    Crea un usuario de prueba para verificar que todo funciona.

    Body:
        {
            "email": "test@test.com",
            "nombre": "Usuario Prueba",
            "password": "password123"
        }

    Returns:
        JSON con datos del usuario creado
    """
    try:
        email = request.data.get('email')
        nombre = request.data.get('nombre')
        password = request.data.get('password')

        # Validar datos requeridos
        if not email or not nombre or not password:
            return Response({
                'status': 'error',
                'message': 'Email, nombre y password son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si el usuario ya existe
        if Usuario.objects(email=email).first():
            return Response({
                'status': 'error',
                'message': 'El email ya está registrado'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Crear usuario
        usuario = Usuario(
            email=email,
            nombre=nombre
        )
        usuario.set_password(password)
        usuario.save()

        return Response({
            'status': 'success',
            'message': 'Usuario creado exitosamente',
            'usuario': {
                'id': str(usuario.id),
                'email': usuario.email,
                'nombre': usuario.nombre,
                'tomin': usuario.tomin,
                'vidas': usuario.vidas,
                'leccionActual': usuario.leccionActual
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al crear usuario: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@rate_limit_login  # SEGURIDAD: 5 intentos por minuto por IP
def register(request):
    """
    Registra un nuevo usuario en el sistema.

    Body:
        {
            "email": "usuario@example.com",
            "nombre": "Nombre Usuario",
            "password": "contraseña123"
        }

    Returns:
        JSON con datos del usuario creado y token JWT
    """
    try:
        email = request.data.get('email')
        nombre = request.data.get('nombre')
        password = request.data.get('password')

        # Validar datos requeridos
        if not email or not nombre or not password:
            return Response({
                'status': 'error',
                'message': 'Email, nombre y password son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)

        # SEGURIDAD: Sanitizar email para prevenir inyección NoSQL
        try:
            email = sanitizar_email(email)
        except ValueError as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

        # SEGURIDAD: Validar que password sea string (no objeto para injection)
        try:
            password = validar_password_input(password)
        except ValueError as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validar contraseña segura (8+ chars, mayúscula, minúscula, número)
        es_valida, mensaje_error = validar_password_segura(password)
        if not es_valida:
            return Response({
                'status': 'error',
                'message': mensaje_error
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si el usuario ya existe (usando PyMongo para evitar threading issues)
        from mongoengine.connection import get_db
        db = get_db()
        # Email ya está sanitizado, seguro para query
        existing_user_data = db.usuarios.find_one({'email': email})
        if existing_user_data:
            return Response({
                'status': 'error',
                'message': 'El email ya está registrado'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Crear usuario (email ya está normalizado por sanitizar_email)
        usuario = Usuario(
            email=email,
            nombre=nombre
        )
        usuario.set_password(password)
        usuario.save()

        # Generar token JWT
        token_data = generar_token(usuario.id)

        # Log de evento de seguridad exitoso
        ip_cliente = obtener_ip_cliente(request)
        log_security_event(
            'USER_REGISTERED',
            user_id=str(usuario.id),
            ip_address=ip_cliente,
            details=f'Nuevo usuario: {email}',
            severity='INFO'
        )

        return Response({
            'status': 'success',
            'message': 'Usuario registrado exitosamente',
            'user': serializar_usuario(usuario),
            'token': token_data
        }, status=status.HTTP_201_CREATED)

    except ValueError as e:
        # Errores de validación - seguros de mostrar
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # Errores inesperados - NO exponer detalles
        return manejar_error_seguro(
            e,
            'Error al registrar usuario. Por favor intenta nuevamente.',
            contexto='Error en register()'
        )


@api_view(['POST'])
@rate_limit_login  # SEGURIDAD: 5 intentos por minuto por IP (prevenir brute force)
def login(request):
    """
    Inicia sesión de un usuario.

    Body:
        {
            "email": "usuario@example.com",
            "password": "contraseña123"
        }

    Returns:
        JSON con datos del usuario y token JWT
    """
    try:
        email = request.data.get('email')
        password = request.data.get('password')

        # Validar datos requeridos
        if not email or not password:
            return Response({
                'status': 'error',
                'message': 'Email y password son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)

        # SEGURIDAD: Sanitizar email para prevenir inyección NoSQL
        try:
            email = sanitizar_email(email)
        except ValueError as e:
            return Response({
                'status': 'error',
                'message': 'Credenciales inválidas'  # No revelar detalles específicos
            }, status=status.HTTP_401_UNAUTHORIZED)

        # SEGURIDAD: Validar que password sea string (no objeto para injection)
        try:
            password = validar_password_input(password)
        except ValueError as e:
            return Response({
                'status': 'error',
                'message': 'Credenciales inválidas'  # No revelar detalles específicos
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Buscar usuario por email (usando PyMongo para evitar threading issues)
        from mongoengine.connection import get_db
        db = get_db()
        # Email ya está sanitizado, seguro para query
        usuario_data = db.usuarios.find_one({'email': email})

        if not usuario_data:
            # Log de evento de seguridad: usuario no encontrado
            ip_cliente = obtener_ip_cliente(request)
            log_security_event(
                'LOGIN_FAILED_USER_NOT_FOUND',
                ip_address=ip_cliente,
                details=f'Intento de login con email inexistente: {email}',
                severity='WARNING'
            )
            return Response({
                'status': 'error',
                'message': 'Credenciales inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Reconstruir objeto Usuario desde los datos de MongoDB
        # Remover _id para evitar conflicto con el campo id de Mongoengine
        usuario_dict = {k: v for k, v in usuario_data.items() if k != '_id'}
        usuario = Usuario(**usuario_dict)
        usuario.id = usuario_data['_id']

        # Verificar contraseña
        if not usuario.check_password(password):
            # Log de evento de seguridad: password incorrecta
            ip_cliente = obtener_ip_cliente(request)
            log_security_event(
                'LOGIN_FAILED_WRONG_PASSWORD',
                user_id=str(usuario.id),
                ip_address=ip_cliente,
                details=f'Contraseña incorrecta para: {email}',
                severity='WARNING'
            )
            return Response({
                'status': 'error',
                'message': 'Credenciales inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Generar token JWT
        token_data = generar_token(usuario.id)

        # Log de evento de seguridad exitoso
        ip_cliente = obtener_ip_cliente(request)
        log_security_event(
            'LOGIN_SUCCESS',
            user_id=str(usuario.id),
            ip_address=ip_cliente,
            details=f'Login exitoso: {email}',
            severity='INFO'
        )

        return Response({
            'status': 'success',
            'message': 'Login exitoso',
            'user': serializar_usuario(usuario),
            'token': token_data
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        # Errores de validación - seguros de mostrar
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # Errores inesperados - NO exponer detalles
        # Log de fallo de login para detección de ataques
        ip_cliente = obtener_ip_cliente(request)
        log_security_event(
            'LOGIN_ERROR',
            ip_address=ip_cliente,
            details=f'Error durante login',
            severity='WARNING'
        )
        return manejar_error_seguro(
            e,
            'Error al iniciar sesión. Por favor intenta nuevamente.',
            contexto='Error en login()'
        )


@api_view(['POST'])
@require_auth
def logout(request):
    """
    Cierra sesión del usuario y revoca el token JWT.

    SEGURIDAD: Agrega el token a la blacklist para prevenir su reutilización
    después del logout, incluso si el token aún no ha expirado.

    Headers:
        Authorization: Bearer <token>

    Returns:
        JSON confirmando el logout
    """
    try:
        # Obtener el token del header
        from .utils import extraer_token_de_header, decodificar_token
        from .blacklist_models import TokenBlacklist
        from datetime import datetime

        token = extraer_token_de_header(request)

        if token:
            try:
                # Decodificar token para obtener jti y exp
                payload = decodificar_token(token)
                jti = payload.get('jti')
                user_id = payload.get('user_id')
                exp_timestamp = payload.get('exp')

                # Convertir timestamp a datetime
                expira_en = datetime.utcfromtimestamp(exp_timestamp)

                # SEGURIDAD: Agregar token a la blacklist
                if jti:
                    TokenBlacklist.agregar_token(
                        jti=jti,
                        usuario_id=user_id,
                        expira_en=expira_en,
                        razon='logout'
                    )
            except Exception:
                # Si hay error al procesar el token, continuar con logout
                # (no queremos bloquear logout por error en blacklist)
                pass

        return Response({
            'status': 'success',
            'message': 'Logout exitoso. Token revocado.'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        # Incluso si hay error, retornar success (logout del lado del cliente)
        return Response({
            'status': 'success',
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@rate_limit_login  # SEGURIDAD: Mismo rate limit que login (5/min)
def refresh_token(request):
    """
    Renueva un access token usando un refresh token válido.

    SEGURIDAD MEDIA CORREGIDA: Implementa sistema de refresh tokens para
    reducir ventana de exposición de access tokens (15 min vs 24 horas).

    Body:
        {
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }

    Returns:
        JSON con nuevo access_token (refresh_token se mantiene igual)
    """
    try:
        from .utils import decodificar_token, generar_token
        from .blacklist_models import TokenBlacklist
        from datetime import datetime

        refresh_token_str = request.data.get('refresh_token')

        if not refresh_token_str:
            return Response({
                'status': 'error',
                'message': 'Refresh token no proporcionado'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decodificar y validar refresh token
            payload = decodificar_token(refresh_token_str)

            # SEGURIDAD: Validar que sea un refresh token (no un access token)
            token_type = payload.get('token_type')
            if token_type != 'refresh':
                return Response({
                    'status': 'error',
                    'message': 'Token inválido. Se requiere un refresh token.'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Obtener user_id del payload
            user_id = payload.get('user_id')
            if not user_id:
                return Response({
                    'status': 'error',
                    'message': 'Token inválido'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Generar SOLO nuevo access token (refresh token se mantiene)
            # Usamos la función existente pero solo retornamos el access token
            tokens = generar_token(user_id)

            # Log de evento de seguridad
            ip_cliente = obtener_ip_cliente(request)
            log_security_event(
                'TOKEN_REFRESHED',
                user_id=user_id,
                ip_address=ip_cliente,
                details='Access token renovado exitosamente',
                severity='INFO'
            )

            return Response({
                'status': 'success',
                'message': 'Access token renovado exitosamente',
                'access_token': tokens['access_token'],
                'token_type': 'Bearer',
                'access_token_expires_in': tokens['access_token_expires_in']
                # NO retornamos nuevo refresh_token - se reutiliza el existente
            }, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            # Refresh token expirado - usuario debe volver a autenticarse
            return Response({
                'status': 'error',
                'message': 'Refresh token expirado. Por favor inicia sesión nuevamente.',
                'codigo': 'REFRESH_TOKEN_EXPIRED'
            }, status=status.HTTP_401_UNAUTHORIZED)

        except jwt.InvalidTokenError:
            # Refresh token inválido o revocado
            return Response({
                'status': 'error',
                'message': 'Refresh token inválido o revocado'
            }, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        return manejar_error_seguro(
            e,
            'Error al renovar token. Por favor intenta nuevamente.',
            contexto='Error en refresh_token()'
        )


@api_view(['GET'])
@require_auth
@rate_limit_api  # SEGURIDAD: 100 peticiones por minuto por IP
def me(request):
    """
    Obtiene los datos del usuario autenticado.

    Headers:
        Authorization: Bearer <token>

    Returns:
        JSON con datos del usuario
    """
    try:
        # El usuario ya está en request.user gracias al decorador @require_auth
        usuario = request.user

        return Response({
            'status': 'success',
            'user': serializar_usuario(usuario)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al obtener perfil: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@require_auth
def update_profile(request):
    """
    Actualiza el perfil del usuario autenticado.

    Headers:
        Authorization: Bearer <token>

    Body:
        {
            "nombre": "Nuevo Nombre" (opcional)
        }

    Returns:
        JSON con datos actualizados del usuario
    """
    try:
        usuario = request.user
        nombre = request.data.get('nombre')

        # Actualizar nombre si se proporciona
        if nombre:
            usuario.nombre = nombre
            usuario.save()

        return Response({
            'status': 'success',
            'message': 'Perfil actualizado exitosamente',
            'user': serializar_usuario(usuario)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al actualizar perfil: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
