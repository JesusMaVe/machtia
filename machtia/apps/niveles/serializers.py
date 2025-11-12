"""
Serializadores para el módulo de niveles.
Mapean los datos del backend a formato esperado por el frontend TypeScript.
"""


def serializar_nivel_frontend(nivel_data: dict, usuario=None) -> dict:
    """
    Serializa un nivel al formato esperado por el frontend TypeScript.

    Frontend espera:
    {
      id: string;
      numero: number;
      titulo: string;
      descripcion: string;
      dificultad: 'principiante' | 'intermedio' | 'avanzado';
      tema: string;
      completado: boolean;
      bloqueado: boolean;
      progreso?: number;
    }

    Args:
        nivel_data: Documento de nivel desde MongoDB
        usuario: Instancia de Usuario para determinar estado (completado/bloqueado)

    Returns:
        dict: Nivel serializado para frontend
    """
    nivel_id = nivel_data['_id']

    # Determinar si está completado y bloqueado
    completado = False
    bloqueado = False

    if usuario:
        # Un nivel se considera completado si su ID está en la lista del usuario
        completado = nivel_id in getattr(usuario, 'nivelesCompletados', [])
        # Un nivel está bloqueado si su ID es mayor que el nivel actual del usuario
        bloqueado = nivel_id > getattr(usuario, 'nivelActual', 1)

    return {
        'id': str(nivel_id),  # Frontend espera string
        'numero': nivel_id,  # Usamos el ID como número de nivel
        'titulo': nivel_data.get('nombre', ''),
        'descripcion': nivel_data.get('contenido', ''),
        'dificultad': nivel_data.get('dificultad', 'principiante'),
        'tema': nivel_data.get('tema', ''),
        'completado': completado,
        'bloqueado': bloqueado,
        'progreso': nivel_data.get('progreso')  # Opcional
    }
