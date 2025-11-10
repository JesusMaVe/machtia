"""
Serializadores para el módulo de lecciones.
Mapean los datos del backend a formato esperado por el frontend TypeScript.
"""


def serializar_palabra_frontend(palabra_dict: dict) -> dict:
    """
    Serializa una palabra al formato esperado por el frontend TypeScript.

    Frontend espera:
    {
      id: string;
      nahuatl: string;
      espanol: string;
      audio: string;
      ejemplo?: string;
      categoria?: string;
    }

    Args:
        palabra_dict: Diccionario con datos de palabra desde MongoDB

    Returns:
        dict: Palabra serializada para frontend
    """
    return {
        'id': str(palabra_dict.get('_id', '')),  # Generar ID único si no existe
        'nahuatl': palabra_dict.get('palabra_nahuatl', ''),
        'espanol': palabra_dict.get('español', ''),
        'audio': palabra_dict.get('audio', ''),
        'ejemplo': palabra_dict.get('ejemplo'),
        'categoria': palabra_dict.get('categoria')
    }


def serializar_leccion_frontend(leccion_data: dict, usuario=None) -> dict:
    """
    Serializa una lección al formato esperado por el frontend TypeScript.

    Frontend espera:
    {
      id: string;
      numero: number;
      titulo: string;
      descripcion: string;
      dificultad: 'principiante' | 'intermedio' | 'avanzado';
      palabras: Palabra[];
      tomins: number;
      completada: boolean;
      bloqueada: boolean;
      estrellas?: number;
    }

    Args:
        leccion_data: Documento de lección desde MongoDB
        usuario: Instancia de Usuario para determinar estado (completada/bloqueada)

    Returns:
        dict: Lección serializada para frontend
    """
    leccion_id = leccion_data['_id']

    # Determinar si está completada y bloqueada
    completada = False
    bloqueada = False

    if usuario:
        completada = leccion_id in usuario.leccionesCompletadas
        # Una lección está bloqueada si su ID es mayor que leccionActual del usuario
        bloqueada = leccion_id > usuario.leccionActual

    # Serializar palabras
    palabras_serializadas = []
    palabras_raw = leccion_data.get('palabras', [])

    for idx, palabra_dict in enumerate(palabras_raw):
        # Agregar _id temporal si no existe
        if '_id' not in palabra_dict:
            palabra_dict['_id'] = f"{leccion_id}-{idx}"
        palabras_serializadas.append(serializar_palabra_frontend(palabra_dict))

    return {
        'id': str(leccion_id),  # Frontend espera string
        'numero': leccion_id,  # Usamos el ID como número de lección
        'titulo': leccion_data.get('nombre', ''),
        'descripcion': leccion_data.get('contenido', ''),
        'dificultad': leccion_data.get('dificultad', 'principiante'),
        'tema': leccion_data.get('tema'),  # Opcional
        'palabras': palabras_serializadas,
        'tomins': leccion_data.get('tominsAlCompletar', 5),
        'completada': completada,
        'bloqueada': bloqueada,
        'estrellas': leccion_data.get('estrellas')  # Opcional
    }


def serializar_resultado_completar(usuario, racha_actual, racha_maxima, logros_nuevos, tomins_ganados) -> dict:
    """
    Serializa el resultado de completar una lección.

    Frontend espera:
    {
      exito: boolean;
      tomins: number;
      mensaje: string;
      vidasRestantes: number;
      nuevosLogros?: string[];
    }
    """
    return {
        'exito': True,
        'tomins': tomins_ganados,
        'mensaje': f'¡Lección completada! +{tomins_ganados} tomins',
        'vidasRestantes': usuario.vidas,
        'nuevosLogros': logros_nuevos if logros_nuevos else None
    }


def serializar_resultado_fallar(vidas_actuales) -> dict:
    """
    Serializa el resultado de fallar una lección.

    Frontend espera:
    {
      vidasRestantes: number;
      mensaje: string;
    }
    """
    return {
        'vidasRestantes': vidas_actuales,
        'mensaje': 'Intento fallido. Has perdido una vida.' if vidas_actuales > 0 else '¡Te quedaste sin vidas!'
    }
