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

        # Validar formato de email
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return Response({
                'status': 'error',
                'message': 'Formato de email inválido'
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
        existing_user_data = db.usuarios.find_one({'email': email.lower()})
        if existing_user_data:
            return Response({
                'status': 'error',
                'message': 'El email ya está registrado'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Crear usuario
        usuario = Usuario(
            email=email.lower(),
            nombre=nombre
        )
        usuario.set_password(password)
        usuario.save()

        # Generar token JWT
        token_data = generar_token(usuario.id)

        return Response({
            'status': 'success',
            'message': 'Usuario registrado exitosamente',
            'user': serializar_usuario(usuario),
            'token': token_data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al registrar usuario: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
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

        # Buscar usuario por email (usando PyMongo para evitar threading issues)
        from mongoengine.connection import get_db
        db = get_db()
        usuario_data = db.usuarios.find_one({'email': email.lower()})

        if not usuario_data:
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
            return Response({
                'status': 'error',
                'message': 'Credenciales inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Generar token JWT
        token_data = generar_token(usuario.id)

        return Response({
            'status': 'success',
            'message': 'Login exitoso',
            'user': serializar_usuario(usuario),
            'token': token_data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al iniciar sesión: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_auth
def logout(request):
    """
    Cierra sesión del usuario.

    Headers:
        Authorization: Bearer <token>

    Returns:
        JSON confirmando el logout
    """
    # En JWT, el logout se maneja del lado del cliente eliminando el token
    # Aquí podríamos agregar el token a una blacklist si fuera necesario

    return Response({
        'status': 'success',
        'message': 'Logout exitoso'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@require_auth
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
