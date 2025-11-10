"""
Serializadores para el módulo de progreso.
Mapean los datos del backend a formato esperado por el frontend TypeScript.
"""
from datetime import datetime, timedelta


def serializar_racha_frontend(racha) -> dict:
    """
    Serializa la racha al formato esperado por el frontend TypeScript.

    Frontend espera:
    {
      diasActuales: number;
      diasMaximos: number;
      estado: 'nueva' | 'activa' | 'en_riesgo' | 'perdida';
      ultimaActividad: string;
      proximaExpiracion?: string;
    }

    Args:
        racha: Instancia de Racha

    Returns:
        dict: Racha serializada para frontend
    """
    # Determinar estado de la racha
    hoy = datetime.utcnow().date()
    estado = 'nueva'
    proxima_expiracion = None

    if racha.ultimaActividad:
        ultima_actividad_date = racha.ultimaActividad.date()

        if ultima_actividad_date == hoy:
            estado = 'activa'
            # Expira mañana si no estudia
            proxima_expiracion = (hoy + timedelta(days=2)).strftime('%Y-%m-%d')
        elif ultima_actividad_date == hoy - timedelta(days=1):
            estado = 'en_riesgo'  # Última actividad ayer, hoy aún puede estudiar
            # Expira hoy si no estudia
            proxima_expiracion = (hoy + timedelta(days=1)).strftime('%Y-%m-%d')
        else:
            estado = 'perdida'

    return {
        'diasActuales': racha.rachaActual,
        'diasMaximos': racha.rachaMaxima,
        'estado': estado,
        'ultimaActividad': racha.ultimaActividad.strftime('%Y-%m-%dT%H:%M:%S.000Z') if racha.ultimaActividad else None,
        'proximaExpiracion': proxima_expiracion
    }


def serializar_estadisticas_frontend(racha, usuario) -> dict:
    """
    Serializa las estadísticas al formato esperado por el frontend TypeScript.

    Frontend espera:
    {
      leccionesCompletadas: number;
      totalLecciones: number;
      tominsAcumulados: number;
      tominsGastados: number;
      horasEstudio: number;
      palabrasAprendidas: number;
      nivel: string;
      progreso: number; // 0-100
    }

    Args:
        racha: Instancia de Racha
        usuario: Instancia de Usuario

    Returns:
        dict: Estadísticas serializadas para frontend
    """
    from mongoengine.connection import get_db
    db = get_db()

    # Contar total de lecciones
    total_lecciones = db.lecciones.count_documents({})

    # Calcular progreso porcentual
    lecciones_completadas = len(usuario.leccionesCompletadas)
    progreso = round((lecciones_completadas / total_lecciones) * 100, 2) if total_lecciones > 0 else 0

    # Determinar nivel según progreso
    if progreso == 0:
        nivel = 'Principiante'
    elif progreso < 25:
        nivel = 'Aprendiz'
    elif progreso < 50:
        nivel = 'Intermedio'
    elif progreso < 75:
        nivel = 'Avanzado'
    elif progreso < 100:
        nivel = 'Experto'
    else:
        nivel = 'Maestro'

    # Calcular palabras aprendidas (cada lección tiene palabras)
    palabras_aprendidas = 0
    for leccion_id in usuario.leccionesCompletadas:
        leccion_data = db.lecciones.find_one({'_id': leccion_id})
        if leccion_data:
            palabras_aprendidas += len(leccion_data.get('palabras', []))

    # Tomins gastados = tomins ganados - tomins actuales
    tomins_gastados = racha.totalTominsGanados - usuario.tomin if racha.totalTominsGanados > usuario.tomin else 0

    return {
        'leccionesCompletadas': lecciones_completadas,
        'totalLecciones': total_lecciones,
        'tominsAcumulados': racha.totalTominsGanados,
        'tominsGastados': tomins_gastados,
        'horasEstudio': round(racha.totalTiempoEstudio / 60, 2),  # Convertir minutos a horas
        'palabrasAprendidas': palabras_aprendidas,
        'nivel': nivel,
        'progreso': progreso
    }


def serializar_logro_frontend(logro) -> dict:
    """
    Serializa un logro al formato esperado por el frontend TypeScript.

    Frontend espera:
    {
      id: string;
      nombre: string;
      descripcion: string;
      icono: string;
      requisito: string;
      desbloqueado: boolean;
      fechaDesbloqueo?: string;
    }

    Args:
        logro: Instancia de Logro (EmbeddedDocument)

    Returns:
        dict: Logro serializado para frontend
    """
    return {
        'id': logro.id,
        'nombre': logro.nombre,
        'descripcion': logro.descripcion,
        'icono': logro.icono,
        'requisito': logro.descripcion,  # Reutilizar descripción como requisito
        'desbloqueado': True,  # Si está en la lista, está desbloqueado
        'fechaDesbloqueo': logro.fechaDesbloqueo.strftime('%Y-%m-%dT%H:%M:%S.000Z') if logro.fechaDesbloqueo else None
    }


def serializar_logros_disponibles_frontend(racha) -> list:
    """
    Serializa todos los logros (desbloqueados y bloqueados) al formato del frontend.

    Args:
        racha: Instancia de Racha

    Returns:
        list: Lista de todos los logros con su estado
    """
    # Definir todos los logros disponibles
    logros_disponibles = [
        {
            'id': 'primera_leccion',
            'nombre': 'Primera Lección',
            'descripcion': 'Completaste tu primera lección de Náhuatl',
            'icono': '🎓',
            'requisito': 'Completar 1 lección',
            'desbloqueado': False
        },
        {
            'id': 'racha_7',
            'nombre': 'Semana Completa',
            'descripcion': 'Mantuviste una racha de 7 días',
            'icono': '🔥',
            'requisito': 'Racha de 7 días',
            'desbloqueado': False
        },
        {
            'id': 'racha_30',
            'nombre': 'Mes de Dedicación',
            'descripcion': 'Mantuviste una racha de 30 días',
            'icono': '🏆',
            'requisito': 'Racha de 30 días',
            'desbloqueado': False
        },
        {
            'id': 'lecciones_10',
            'nombre': 'Aprendiz Dedicado',
            'descripcion': 'Completaste 10 lecciones',
            'icono': '📚',
            'requisito': 'Completar 10 lecciones',
            'desbloqueado': False
        },
        {
            'id': 'lecciones_50',
            'nombre': 'Maestro del Náhuatl',
            'descripcion': 'Completaste 50 lecciones',
            'icono': '🎖️',
            'requisito': 'Completar 50 lecciones',
            'desbloqueado': False
        },
        {
            'id': 'rico',
            'nombre': 'Rico en Tomins',
            'descripcion': 'Acumulaste 100 tomins',
            'icono': '💰',
            'requisito': 'Acumular 100 tomins',
            'desbloqueado': False
        },
        {
            'id': 'millonario',
            'nombre': 'Millonario',
            'descripcion': 'Acumulaste 1000 tomins',
            'icono': '💎',
            'requisito': 'Acumular 1000 tomins',
            'desbloqueado': False
        }
    ]

    # Marcar como desbloqueados los que el usuario tiene
    ids_desbloqueados = {logro.id for logro in racha.logrosDesbloqueados}

    for logro in logros_disponibles:
        if logro['id'] in ids_desbloqueados:
            logro['desbloqueado'] = True
            # Buscar fecha de desbloqueo
            for logro_desbloqueado in racha.logrosDesbloqueados:
                if logro_desbloqueado.id == logro['id']:
                    logro['fechaDesbloqueo'] = logro_desbloqueado.fechaDesbloqueo.strftime('%Y-%m-%dT%H:%M:%S.000Z')
                    break

    return logros_disponibles
