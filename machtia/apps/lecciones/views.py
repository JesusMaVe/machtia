"""
Vistas (endpoints) para el módulo de lecciones
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from mongoengine.connection import get_db
from bson import ObjectId
from apps.autenticacion.utils import require_auth, require_role
from apps.autenticacion.security_utils import sanitizar_input_mongo
from apps.progreso.models import Racha
from .models import Leccion, Palabra
from .serializers import serializar_leccion_frontend, serializar_resultado_completar, serializar_resultado_fallar


@api_view(['GET'])
def listar_lecciones(request):
    """
    GET /api/lecciones/

    Retorna todas las lecciones ordenadas por ID en formato compatible con frontend.

    Query params:
        - dificultad: filtrar por dificultad (principiante, intermedio, avanzado)
        - tema: filtrar por tema
        - nivel_id: filtrar por nivel

    Returns:
        Leccion[]: Lista de lecciones con estado de completada/bloqueada si hay usuario autenticado
    """
    try:
        db = get_db()

        # Construir filtro con validación de seguridad
        filtro = {}

        # SEGURIDAD: Validar dificultad con whitelist
        dificultad = request.GET.get('dificultad')
        if dificultad:
            dificultades_permitidas = ['principiante', 'intermedio', 'avanzado']
            try:
                dificultad_sanitizada = sanitizar_input_mongo(
                    dificultad, tipo_esperado=str, max_length=20, campo_nombre='dificultad'
                )
                if dificultad_sanitizada not in dificultades_permitidas:
                    return Response({
                        'error': f'Dificultad debe ser: {", ".join(dificultades_permitidas)}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                filtro['dificultad'] = dificultad_sanitizada
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # SEGURIDAD: Sanitizar tema
        tema = request.GET.get('tema')
        if tema:
            try:
                filtro['tema'] = sanitizar_input_mongo(
                    tema, tipo_esperado=str, max_length=50, campo_nombre='tema'
                )
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # SEGURIDAD: Validar nivel_id como entero
        nivel_id = request.GET.get('nivel_id')
        if nivel_id:
            try:
                nivel_id_int = int(nivel_id)
                filtro['nivel_id'] = sanitizar_input_mongo(
                    nivel_id_int, tipo_esperado=int, campo_nombre='nivel_id'
                )
            except (ValueError, TypeError) as e:
                return Response({
                    'error': 'nivel_id debe ser un número entero válido'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Buscar lecciones con filtros sanitizados
        lecciones_cursor = db.lecciones.find(filtro).sort('_id', 1)

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

        # Serializar lecciones
        lecciones = []
        for leccion_data in lecciones_cursor:
            lecciones.append(serializar_leccion_frontend(leccion_data, usuario))

        return Response(lecciones)

    except Exception as e:
        return Response({
            'error': f'Error al obtener lecciones: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def obtener_leccion(request, leccion_id):
    """
    GET /api/lecciones/:id/

    Retorna una lección específica con todas sus palabras.

    Returns:
        Leccion: Objeto de lección con estado si hay usuario autenticado
    """
    try:
        db = get_db()

        # SEGURIDAD: Convertir y validar leccion_id
        try:
            leccion_id = int(leccion_id)
            leccion_id = sanitizar_input_mongo(
                leccion_id, tipo_esperado=int, campo_nombre='leccion_id'
            )
        except (ValueError, TypeError) as e:
            return Response({
                'error': 'ID de lección inválido'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Buscar lección con ID sanitizado
        leccion_data = db.lecciones.find_one({'_id': leccion_id})

        if not leccion_data:
            return Response({
                'error': 'Lección no encontrada'
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

        return Response(serializar_leccion_frontend(leccion_data, usuario))

    except Exception as e:
        return Response({
            'error': f'Error al obtener lección: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@require_auth
def obtener_siguiente_leccion(request):
    """
    GET /api/lecciones/siguiente/

    Retorna la siguiente lección disponible para el usuario autenticado.
    Se basa en el campo leccionActual del usuario.

    Requiere autenticación.

    Returns:
        Leccion: Objeto de lección con estado de progreso
    """
    try:
        usuario = request.user
        db = get_db()

        # Buscar la lección actual del usuario
        leccion_data = db.lecciones.find_one({'_id': usuario.leccionActual})

        if not leccion_data:
            return Response({
                'error': 'No hay más lecciones disponibles'
            }, status=status.HTTP_404_NOT_FOUND)

        return Response(serializar_leccion_frontend(leccion_data, usuario))

    except Exception as e:
        return Response({
            'error': f'Error al obtener siguiente lección: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_auth
def completar_leccion(request, leccion_id):
    """
    POST /api/lecciones/:id/completar/

    Marca una lección como completada y otorga la recompensa de tomins.
    Actualiza leccionActual a la siguiente lección.

    Requiere autenticación.

    Returns:
        ResultadoLeccion: Resultado de completar la lección
    """
    try:
        usuario = request.user
        db = get_db()

        # Convertir leccion_id a int
        try:
            leccion_id = int(leccion_id)
        except ValueError:
            return Response({
                'error': 'ID de lección inválido'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que la lección existe
        leccion_data = db.lecciones.find_one({'_id': leccion_id})

        if not leccion_data:
            return Response({
                'error': 'Lección no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)

        # Verificar que sea la lección actual del usuario
        if usuario.leccionActual != leccion_id:
            return Response({
                'error': f'Debes completar primero la lección {usuario.leccionActual}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si ya completó esta lección
        if leccion_id in usuario.leccionesCompletadas:
            return Response({
                'error': 'Ya completaste esta lección'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Obtener recompensa
        tomins_recompensa = leccion_data.get('tominsAlCompletar', 5)

        # Actualizar usuario (el método ya maneja tomins y avance de lección)
        usuario.completar_leccion(leccion_id, tomins_recompensa)

        # === SISTEMA DE PROGRESO ===
        # Buscar o crear racha del usuario
        from apps.progreso.models import ActividadDiaria, Logro

        racha_data = db.rachas.find_one({'usuario_id': str(usuario.id)})

        if not racha_data:
            # Crear nueva racha
            racha = Racha(usuario_id=str(usuario.id))
            racha.save()
            racha_data = db.rachas.find_one({'usuario_id': str(usuario.id)})

        # Reconstruir objeto Racha con embedded documents
        racha_dict = {}

        # Copiar campos simples
        for k, v in racha_data.items():
            if k not in ['_id', 'diasActivos', 'logrosDesbloqueados']:
                racha_dict[k] = v

        # Reconstruir embedded documents
        dias_activos = []
        for dia_data in racha_data.get('diasActivos', []):
            dias_activos.append(ActividadDiaria(**dia_data))
        racha_dict['diasActivos'] = dias_activos

        logros = []
        for logro_data in racha_data.get('logrosDesbloqueados', []):
            logros.append(Logro(**logro_data))
        racha_dict['logrosDesbloqueados'] = logros

        # Crear objeto Racha
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

        # Serializar resultado
        return Response(serializar_resultado_completar(
            usuario=usuario,
            racha_actual=racha.rachaActual,
            racha_maxima=racha.rachaMaxima,
            logros_nuevos=logros_nuevos,
            tomins_ganados=tomins_recompensa
        ))

    except Exception as e:
        return Response({
            'error': f'Error al completar lección: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_role(['admin', 'profesor'])  # SEGURIDAD: Solo admin y profesor pueden crear lecciones
def crear_leccion(request):
    """
    POST /api/lecciones/

    Crea una nueva lección.

    Body:
        - nombre: Nombre de la lección
        - tema: Tema de la lección
        - dificultad: principiante, intermedio o avanzado
        - contenido: Descripción del contenido
        - tominsAlCompletar: Tomins de recompensa (default: 5)
        - palabras: Array de {palabra_nahuatl, español, audio (opcional)}

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
        siguiente_id = Leccion.obtener_siguiente_id()

        # Crear lección
        leccion = Leccion(
            _id=siguiente_id,
            nombre=data['nombre'],
            tema=data['tema'],
            dificultad=data['dificultad'],
            contenido=data['contenido'],
            tominsAlCompletar=data.get('tominsAlCompletar', 5),
            nivel_id=data.get('nivel_id', 1)  # Default nivel 1
        )

        # Agregar palabras si las hay
        palabras = data.get('palabras', [])
        for palabra_data in palabras:
            if palabra_data.get('palabra_nahuatl') and palabra_data.get('español'):
                palabra = Palabra(
                    palabra_nahuatl=palabra_data['palabra_nahuatl'],
                    español=palabra_data['español'],
                    audio=palabra_data.get('audio')
                )
                leccion.palabras.append(palabra)

        # Guardar
        leccion.save()

        # Serializar para respuesta
        db = get_db()
        leccion_data = db.lecciones.find_one({'_id': siguiente_id})

        return Response({
            'status': 'success',
            'message': 'Lección creada exitosamente',
            'leccion': serializar_leccion(leccion_data, incluir_palabras=True)
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al crear lección: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@require_role(['admin', 'profesor'])  # SEGURIDAD: Solo admin y profesor pueden actualizar lecciones
def actualizar_leccion(request, leccion_id):
    """
    PUT/PATCH /api/lecciones/:id/

    Actualiza una lección existente.

    Body (todos opcionales):
        - nombre
        - tema
        - dificultad
        - contenido
        - tominsAlCompletar
        - palabras

    SEGURIDAD: Requiere rol 'admin' o 'profesor'.
    """
    try:
        db = get_db()
        data = request.data

        # Convertir leccion_id a int
        try:
            leccion_id = int(leccion_id)
        except ValueError:
            return Response({
                'status': 'error',
                'message': 'ID de lección inválido'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que existe
        leccion_data = db.lecciones.find_one({'_id': leccion_id})
        if not leccion_data:
            return Response({
                'status': 'error',
                'message': 'Lección no encontrada'
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

        if 'tominsAlCompletar' in data:
            actualizacion['tominsAlCompletar'] = int(data['tominsAlCompletar'])

        if 'nivel_id' in data:
            actualizacion['nivel_id'] = int(data['nivel_id'])

        # Actualizar palabras si se proporcionan
        if 'palabras' in data:
            palabras_serializadas = []
            for palabra_data in data['palabras']:
                if palabra_data.get('palabra_nahuatl') and palabra_data.get('español'):
                    palabras_serializadas.append({
                        'palabra_nahuatl': palabra_data['palabra_nahuatl'],
                        'español': palabra_data['español'],
                        'audio': palabra_data.get('audio')
                    })
            actualizacion['palabras'] = palabras_serializadas

        # Aplicar actualización
        if actualizacion:
            db.lecciones.update_one(
                {'_id': leccion_id},
                {'$set': actualizacion}
            )

        # Obtener lección actualizada
        leccion_actualizada = db.lecciones.find_one({'_id': leccion_id})

        return Response({
            'status': 'success',
            'message': 'Lección actualizada exitosamente',
            'leccion': serializar_leccion(leccion_actualizada, incluir_palabras=True)
        })

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al actualizar lección: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@require_auth
def fallar_leccion(request, leccion_id):
    """
    POST /api/lecciones/:id/fallar/

    Registra que el usuario falló un intento de lección.
    Consume una vida del usuario.

    Validaciones:
    - La lección debe existir
    - El usuario debe tener vidas disponibles

    Requiere autenticación.

    Returns:
        {vidasRestantes, mensaje}: Resultado de fallar la lección
    """
    try:
        usuario = request.user
        db = get_db()

        # Convertir leccion_id a int
        try:
            leccion_id = int(leccion_id)
        except ValueError:
            return Response({
                'error': 'ID de lección inválido'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que la lección existe
        leccion_data = db.lecciones.find_one({'_id': leccion_id})

        if not leccion_data:
            return Response({
                'error': 'Lección no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)

        # Verificar si tiene vidas disponibles (esto regenera automáticamente)
        if not usuario.tiene_vidas_disponibles():
            return Response({
                'error': 'No tienes vidas disponibles. Espera a que se regeneren o cómpralas con tomins.',
                'vidasRestantes': usuario.vidas
            }, status=status.HTTP_400_BAD_REQUEST)

        # Usar una vida
        usuario.usar_vida()

        # Serializar resultado
        return Response(serializar_resultado_fallar(usuario.vidas))

    except Exception as e:
        return Response({
            'error': f'Error al registrar fallo: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@require_role(['admin'])  # SEGURIDAD: Solo admin puede eliminar lecciones
def eliminar_leccion(request, leccion_id):
    """
    DELETE /api/lecciones/:id/

    Elimina una lección.

    ADVERTENCIA: Esto puede causar problemas si usuarios tienen esta lección
    en su progreso. Usar con precaución.

    SEGURIDAD: Requiere rol 'admin' únicamente.
    """
    try:
        db = get_db()

        # Convertir leccion_id a int
        try:
            leccion_id = int(leccion_id)
        except ValueError:
            return Response({
                'status': 'error',
                'message': 'ID de lección inválido'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar que existe
        leccion_data = db.lecciones.find_one({'_id': leccion_id})
        if not leccion_data:
            return Response({
                'status': 'error',
                'message': 'Lección no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)

        # Eliminar
        resultado = db.lecciones.delete_one({'_id': leccion_id})

        if resultado.deleted_count > 0:
            return Response({
                'status': 'success',
                'message': 'Lección eliminada exitosamente'
            })
        else:
            return Response({
                'status': 'error',
                'message': 'No se pudo eliminar la lección'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error al eliminar lección: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
