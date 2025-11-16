"""
Vistas (endpoints) para el módulo de niveles
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from mongoengine.connection import get_db
from bson import ObjectId
from apps.autenticacion.utils import require_auth, require_role
from .models import Nivel
from .serializers import serializar_nivel_frontend


@api_view(['GET'])
def listar_niveles(request):
    """
    GET /api/niveles/

    Retorna todos los niveles ordenados por ID en formato compatible con frontend.

    Query params:
        - dificultad: filtrar por dificultad (principiante, intermedio, avanzado)
        - tema: filtrar por tema

    Returns:
        Nivel[]: Lista de niveles con estado de completado/bloqueado si hay usuario autenticado
    """
    try:
        db = get_db()

        # Construir filtro
        filtro = {}

        dificultad = request.GET.get('dificultad')
        if dificultad and dificultad in ['principiante', 'intermedio', 'avanzado']:
            filtro['dificultad'] = dificultad

        tema = request.GET.get('tema')
        if tema:
            filtro['tema'] = tema

        # Buscar niveles
        niveles_cursor = db.niveles.find(filtro).sort('_id', 1)

        # Obtener usuario si está autenticado (sin requerir auth)
        usuario = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                from apps.autenticacion.utils import decodificar_token
                payload = decodificar_token(token)
                if payload:
                    from apps.autenticacion.models import Usuario
                    usuario_data = db.usuarios.find_one({'_id': ObjectId(payload['user_id'])})
                    if usuario_data:
                        usuario_dict = {k: v for k, v in usuario_data.items() if k != '_id'}
                        usuario = Usuario(**usuario_dict)
                        usuario.id = usuario_data['_id']
            except:
                pass  # Si falla, simplemente no hay usuario

        # Serializar niveles
        niveles = []
        for nivel_data in niveles_cursor:
            niveles.append(serializar_nivel_frontend(nivel_data, usuario))

        return Response(niveles)

    except Exception as e:
        return Response({
            'error': f'Error al obtener niveles: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def obtener_nivel(request, nivel_id):
    """
    GET /api/niveles/:id/

    Retorna un nivel específico.

    Returns:
        Nivel: Objeto de nivel con estado si hay usuario autenticado
    """
    try:
        db = get_db()

        # Convertir nivel_id a int
        try:
            nivel_id = int(nivel_id)
        except ValueError:
            return Response({
                'error': 'ID de nivel inválido'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Buscar nivel
        nivel_data = db.niveles.find_one({'_id': nivel_id})

        if not nivel_data:
            return Response({
                'error': 'Nivel no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

        # Obtener usuario si está autenticado
        usuario = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                from apps.autenticacion.utils import decodificar_token
                payload = decodificar_token(token)
                if payload:
                    from apps.autenticacion.models import Usuario
                    usuario_data = db.usuarios.find_one({'_id': ObjectId(payload['user_id'])})
                    if usuario_data:
                        usuario_dict = {k: v for k, v in usuario_data.items() if k != '_id'}
                        usuario = Usuario(**usuario_dict)
                        usuario.id = usuario_data['_id']
            except:
                pass

        return Response(serializar_nivel_frontend(nivel_data, usuario))

    except Exception as e:
        return Response({
            'error': f'Error al obtener nivel: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_role(['admin', 'profesor'])  # SEGURIDAD: Solo admin y profesor pueden crear niveles
def crear_nivel(request):
    """
    POST /api/niveles/

    Crea un nuevo nivel.

    Body:
        - nombre: Nombre del nivel
        - tema: Tema principal del nivel
        - dificultad: principiante, intermedio o avanzado
        - contenido: Descripción del contenido

    SEGURIDAD: Requiere rol 'admin' o 'profesor'.
    """
    try:
        data = request.data

        # Validar campos requeridos
        campos_requeridos = ['nombre', 'tema', 'dificultad', 'contenido']
        for campo in campos_requeridos:
            if not data.get(campo):
                return Response({
                    'status': 'error',
                    'message': f'El campo {campo} es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Validar dificultad
        if data['dificultad'] not in ['principiante', 'intermedio', 'avanzado']:
            return Response({
                'status': 'error',
                'message': 'Dificultad debe ser: principiante, intermedio o avanzado'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Obtener siguiente ID
        siguiente_id = Nivel.obtener_siguiente_id()

        # Crear nivel
        nivel = Nivel(
            _id=siguiente_id,
            nombre=data['nombre'],
            tema=data['tema'],
            dificultad=data['dificultad'],
            contenido=data['contenido']
        )

        # Guardar
        nivel.save()

        # Serializar para respuesta
        db = get_db()
        nivel_data = db.niveles.find_one({'_id': siguiente_id})

        return Response({
            'status': 'success',
            'message': 'Nivel creado exitosamente',
            'nivel': serializar_nivel_frontend(nivel_data)
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al crear nivel: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@require_role(['admin', 'profesor'])  # SEGURIDAD: Solo admin y profesor pueden actualizar niveles
def actualizar_nivel(request, nivel_id):
    """
    PUT/PATCH /api/niveles/:id/

    Actualiza un nivel existente.

    Body (todos opcionales):
        - nombre
        - tema
        - dificultad
        - contenido

    SEGURIDAD: Requiere rol 'admin' o 'profesor'.
    """
    try:
        db = get_db()
        data = request.data

        # Convertir nivel_id a int
        try:
            nivel_id = int(nivel_id)
        except ValueError:
            return Response({
                'status': 'error',
                'message': 'ID de nivel inválido'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que existe
        nivel_data = db.niveles.find_one({'_id': nivel_id})
        if not nivel_data:
            return Response({
                'status': 'error',
                'message': 'Nivel no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

        # Construir diccionario de actualización
        actualizacion = {}

        if 'nombre' in data:
            actualizacion['nombre'] = data['nombre']

        if 'tema' in data:
            actualizacion['tema'] = data['tema']

        if 'dificultad' in data:
            if data['dificultad'] not in ['principiante', 'intermedio', 'avanzado']:
                return Response({
                    'status': 'error',
                    'message': 'Dificultad debe ser: principiante, intermedio o avanzado'
                }, status=status.HTTP_400_BAD_REQUEST)
            actualizacion['dificultad'] = data['dificultad']

        if 'contenido' in data:
            actualizacion['contenido'] = data['contenido']

        # Aplicar actualización
        if actualizacion:
            db.niveles.update_one(
                {'_id': nivel_id},
                {'$set': actualizacion}
            )

        # Obtener nivel actualizado
        nivel_actualizado = db.niveles.find_one({'_id': nivel_id})

        return Response({
            'status': 'success',
            'message': 'Nivel actualizado exitosamente',
            'nivel': serializar_nivel_frontend(nivel_actualizado)
        })

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al actualizar nivel: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@require_role(['admin'])  # SEGURIDAD: Solo admin puede eliminar niveles
def eliminar_nivel(request, nivel_id):
    """
    DELETE /api/niveles/:id/

    Elimina un nivel.

    ADVERTENCIA: Esto puede causar problemas si usuarios tienen este nivel
    en su progreso. Usar con precaución.

    SEGURIDAD: Requiere rol 'admin' únicamente.
    """
    try:
        db = get_db()

        # Convertir nivel_id a int
        try:
            nivel_id = int(nivel_id)
        except ValueError:
            return Response({
                'status': 'error',
                'message': 'ID de nivel inválido'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que existe
        nivel_data = db.niveles.find_one({'_id': nivel_id})
        if not nivel_data:
            return Response({
                'status': 'error',
                'message': 'Nivel no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

        # Eliminar
        resultado = db.niveles.delete_one({'_id': nivel_id})

        if resultado.deleted_count > 0:
            return Response({
                'status': 'success',
                'message': 'Nivel eliminado exitosamente'
            })
        else:
            return Response({
                'status': 'error',
                'message': 'No se pudo eliminar el nivel'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al eliminar nivel: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def obtener_lecciones_de_nivel(request, nivel_id):
    """
    GET /api/niveles/:id/lecciones/

    Retorna todas las lecciones asociadas a un nivel específico.

    Returns:
        Leccion[]: Lista de lecciones del nivel con estado si hay usuario autenticado
    """
    try:
        db = get_db()

        # Convertir nivel_id a int
        try:
            nivel_id = int(nivel_id)
        except ValueError:
            return Response({
                'error': 'ID de nivel inválido'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que el nivel existe
        nivel_data = db.niveles.find_one({'_id': nivel_id})
        if not nivel_data:
            return Response({
                'error': 'Nivel no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

        # Buscar lecciones de este nivel
        lecciones_cursor = db.lecciones.find({'nivel_id': nivel_id}).sort('_id', 1)

        # Obtener usuario si está autenticado
        usuario = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                from apps.autenticacion.utils import decodificar_token
                payload = decodificar_token(token)
                if payload:
                    from apps.autenticacion.models import Usuario
                    usuario_data = db.usuarios.find_one({'_id': ObjectId(payload['user_id'])})
                    if usuario_data:
                        usuario_dict = {k: v for k, v in usuario_data.items() if k != '_id'}
                        usuario = Usuario(**usuario_dict)
                        usuario.id = usuario_data['_id']
            except:
                pass

        # Serializar lecciones
        from apps.lecciones.serializers import serializar_leccion_frontend
        lecciones = []
        for leccion_data in lecciones_cursor:
            lecciones.append(serializar_leccion_frontend(leccion_data, usuario))

        return Response({
            'nivel': serializar_nivel_frontend(nivel_data, usuario),
            'lecciones': lecciones,
            'total_lecciones': len(lecciones)
        })

    except Exception as e:
        return Response({
            'error': f'Error al obtener lecciones del nivel: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
