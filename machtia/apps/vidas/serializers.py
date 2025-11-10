"""
Serializadores para el módulo de vidas.
Mapean los datos del backend a formato esperado por el frontend TypeScript.
"""


def serializar_estado_vidas_frontend(usuario) -> dict:
    """
    Serializa el estado de vidas al formato esperado por el frontend TypeScript.

    Frontend espera:
    {
      vidasActuales: number;
      vidasMaximas: number;
      proximaVidaEn?: number; // minutos
      regeneracionActiva: boolean;
    }

    Args:
        usuario: Instancia de Usuario

    Returns:
        dict: Estado de vidas serializado para frontend
    """
    # Regenerar vidas automáticamente
    usuario.regenerar_vidas()

    # Calcular tiempo para próxima vida
    tiempo_proxima = usuario.tiempo_proxima_vida()

    # Determinar si está en regeneración activa
    regeneracion_activa = usuario.vidas < 5

    return {
        'vidasActuales': usuario.vidas,
        'vidasMaximas': 5,
        'proximaVidaEn': tiempo_proxima['minutos_restantes'] if regeneracion_activa else None,
        'regeneracionActiva': regeneracion_activa
    }


def serializar_compra_vida_frontend(usuario, tomins_gastados) -> dict:
    """
    Serializa el resultado de comprar una vida al formato esperado por el frontend TypeScript.

    Frontend espera:
    {
      exito: boolean;
      mensaje: string;
      vidasNuevas: number;
      tominsRestantes: number;
    }

    Args:
        usuario: Instancia de Usuario
        tomins_gastados: Cantidad de tomins gastados

    Returns:
        dict: Resultado de compra serializado para frontend
    """
    return {
        'exito': True,
        'mensaje': f'Vida comprada exitosamente. Gastaste {tomins_gastados} tomins.',
        'vidasNuevas': usuario.vidas,
        'tominsRestantes': usuario.tomin
    }
