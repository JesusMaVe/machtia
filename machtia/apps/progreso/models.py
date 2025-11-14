"""
Modelos de progreso usando Mongoengine (ODM para MongoDB)
"""
from mongoengine import Document, EmbeddedDocument, StringField, IntField, ListField, DateTimeField, EmbeddedDocumentField, BooleanField
from datetime import datetime, timedelta


class ActividadDiaria(EmbeddedDocument):
    """
    Documento embebido que representa la actividad de un día específico.

    Campos:
        fecha (datetime): Fecha del día
        leccionesCompletadas (int): Número de lecciones completadas ese día
        tominsGanados (int): Tomins ganados ese día
        tiempoEstudio (int): Minutos de estudio ese día (estimado)
    """
    fecha = DateTimeField(required=True)
    leccionesCompletadas = IntField(default=0)
    tominsGanados = IntField(default=0)
    tiempoEstudio = IntField(default=0)  # en minutos

    def __str__(self) -> str:
        return f"{self.fecha.strftime('%Y-%m-%d')}: {self.leccionesCompletadas} lecciones"


class Logro(EmbeddedDocument):
    """
    Documento embebido que representa un logro/achievement desbloqueado.

    Campos:
        id (str): ID único del logro
        nombre (str): Nombre del logro
        descripcion (str): Descripción del logro
        icono (str): Emoji o URL del icono
        fechaDesbloqueo (datetime): Cuándo se desbloqueó
    """
    id = StringField(required=True)
    nombre = StringField(required=True)
    descripcion = StringField(required=True)
    icono = StringField(default="🏆")
    fechaDesbloqueo = DateTimeField(default=datetime.utcnow)

    def __str__(self) -> str:
        return f"{self.icono} {self.nombre}"


class Racha(Document):
    """
    Modelo de Racha (Streak) para tracking de días consecutivos de estudio.

    Campos:
        usuario_id (str): ID del usuario (referencia a Usuario)
        rachaActual (int): Días consecutivos actuales
        rachaMaxima (int): Racha más larga alcanzada
        ultimaActividad (datetime): Última vez que estudió
        diasActivos (list): Lista de actividades diarias
        logrosDesbloqueados (list): Lista de logros obtenidos
        totalLeccionesCompletadas (int): Total histórico de lecciones
        totalTominsGanados (int): Total histórico de tomins
    """
    # Referencia al usuario (usamos ObjectId como string)
    usuario_id = StringField(required=True, unique=True)

    # Racha
    rachaActual = IntField(default=0, min_value=0)
    rachaMaxima = IntField(default=0, min_value=0)
    ultimaActividad = DateTimeField(default=None)

    # Historial de actividad diaria
    diasActivos = ListField(EmbeddedDocumentField(ActividadDiaria), default=list)

    # Logros
    logrosDesbloqueados = ListField(EmbeddedDocumentField(Logro), default=list)

    # Estadísticas totales
    totalLeccionesCompletadas = IntField(default=0, min_value=0)
    totalTominsGanados = IntField(default=0, min_value=0)
    totalTiempoEstudio = IntField(default=0, min_value=0)  # en minutos

    # Timestamps
    createdAt = DateTimeField(default=datetime.utcnow)
    updatedAt = DateTimeField(default=datetime.utcnow)

    # Configuración de la colección MongoDB
    meta = {
        'collection': 'rachas',
        'indexes': ['usuario_id', 'ultimaActividad']
    }

    def __str__(self) -> str:
        return f"Racha de usuario {self.usuario_id}: {self.rachaActual} días"

    def actualizar_racha(self) -> dict:
        """
        Actualiza la racha basándose en la actividad de hoy.

        Lógica:
        - Si estudió hoy, mantiene o incrementa racha
        - Si estudió ayer, incrementa racha
        - Si no estudió ayer ni hoy, reinicia racha a 1

        Returns:
            dict: Info sobre la actualización (rachaAnterior, rachaActual, etc.)
        """
        hoy = datetime.utcnow().date()
        racha_anterior = self.rachaActual

        # Si nunca ha estudiado
        if not self.ultimaActividad:
            self.rachaActual = 1
            self.rachaMaxima = max(self.rachaMaxima, 1)
            self.ultimaActividad = datetime.utcnow()
            self.updatedAt = datetime.utcnow()
            self.save()
            return {
                'rachaAnterior': racha_anterior,
                'rachaActual': self.rachaActual,
                'incremento': True,
                'nuevo': True
            }

        ultima_actividad_date = self.ultimaActividad.date()

        # Si ya estudió hoy, mantener racha
        if ultima_actividad_date == hoy:
            return {
                'rachaAnterior': racha_anterior,
                'rachaActual': self.rachaActual,
                'incremento': False,
                'mensaje': 'Ya estudiaste hoy'
            }

        # Si estudió ayer, incrementar racha
        ayer = hoy - timedelta(days=1)
        if ultima_actividad_date == ayer:
            self.rachaActual += 1
            self.rachaMaxima = max(self.rachaMaxima, self.rachaActual)
            self.ultimaActividad = datetime.utcnow()
            self.updatedAt = datetime.utcnow()
            self.save()
            return {
                'rachaAnterior': racha_anterior,
                'rachaActual': self.rachaActual,
                'incremento': True,
                'mensaje': 'Racha incrementada'
            }

        # Si no estudió ayer, reiniciar racha
        else:
            self.rachaActual = 1
            self.ultimaActividad = datetime.utcnow()
            self.updatedAt = datetime.utcnow()
            self.save()
            return {
                'rachaAnterior': racha_anterior,
                'rachaActual': self.rachaActual,
                'incremento': False,
                'perdida': True,
                'mensaje': 'Racha reiniciada'
            }

    def registrar_actividad(self, lecciones_completadas: int = 1, tomins_ganados: int = 5, tiempo_estudio: int = 10):
        """
        Registra la actividad del día de hoy.

        Args:
            lecciones_completadas (int): Número de lecciones completadas hoy
            tomins_ganados (int): Tomins ganados hoy
            tiempo_estudio (int): Minutos de estudio (estimado)
        """
        hoy = datetime.utcnow().date()

        # Buscar si ya existe actividad de hoy
        actividad_hoy = None
        for actividad in self.diasActivos:
            if actividad.fecha.date() == hoy:
                actividad_hoy = actividad
                break

        # Si ya existe, actualizar
        if actividad_hoy:
            actividad_hoy.leccionesCompletadas += lecciones_completadas
            actividad_hoy.tominsGanados += tomins_ganados
            actividad_hoy.tiempoEstudio += tiempo_estudio
        else:
            # Crear nueva actividad
            nueva_actividad = ActividadDiaria(
                fecha=datetime.utcnow(),
                leccionesCompletadas=lecciones_completadas,
                tominsGanados=tomins_ganados,
                tiempoEstudio=tiempo_estudio
            )
            self.diasActivos.append(nueva_actividad)

        # Actualizar totales
        self.totalLeccionesCompletadas += lecciones_completadas
        self.totalTominsGanados += tomins_ganados
        self.totalTiempoEstudio += tiempo_estudio
        self.updatedAt = datetime.utcnow()

        self.save()

    def desbloquear_logro(self, logro_id: str, nombre: str, descripcion: str, icono: str = "🏆"):
        """
        Desbloquea un logro si no lo tiene ya.

        Args:
            logro_id (str): ID único del logro
            nombre (str): Nombre del logro
            descripcion (str): Descripción
            icono (str): Emoji o URL del icono

        Returns:
            bool: True si se desbloqueó (nuevo), False si ya lo tenía
        """
        # Verificar si ya tiene el logro
        for logro in self.logrosDesbloqueados:
            if logro.id == logro_id:
                return False

        # Desbloquear nuevo logro
        nuevo_logro = Logro(
            id=logro_id,
            nombre=nombre,
            descripcion=descripcion,
            icono=icono,
            fechaDesbloqueo=datetime.utcnow()
        )

        self.logrosDesbloqueados.append(nuevo_logro)
        self.updatedAt = datetime.utcnow()
        self.save()

        return True

    def verificar_logros_automaticos(self):
        """
        Verifica y desbloquea logros basados en estadísticas automáticamente.

        Logros disponibles (Beta - objetivos realistas):
        - primera_leccion: Completar primera lección
        - estudiante_dedicado: Completar 5 lecciones
        - racha_3: Mantener racha de 3 días
        - explorador: Completar lecciones de 2 temas diferentes
        - coleccionista: Acumular 50 tomins

        Returns:
            list: Lista de logros desbloqueados en esta verificación
        """
        logros_nuevos = []

        # Primera lección
        if self.totalLeccionesCompletadas >= 1:
            if self.desbloquear_logro(
                'primera_leccion',
                'Primera Lección',
                'Completa tu primera lección',
                '🎯'
            ):
                logros_nuevos.append('primera_leccion')

        # Estudiante dedicado - 5 lecciones
        if self.totalLeccionesCompletadas >= 5:
            if self.desbloquear_logro(
                'estudiante_dedicado',
                'Estudiante Dedicado',
                'Completa 5 lecciones',
                '📚'
            ):
                logros_nuevos.append('estudiante_dedicado')

        # Racha de 3 días
        if self.rachaActual >= 3:
            if self.desbloquear_logro(
                'racha_3',
                'Racha de 3 Días',
                'Estudia 3 días seguidos',
                '🔥'
            ):
                logros_nuevos.append('racha_3')

        # Explorador - completar lecciones de 2 temas diferentes
        # Verificar temas únicos de las lecciones completadas
        from mongoengine.connection import get_db
        db = get_db()

        # Obtener usuario para acceder a leccionesCompletadas
        usuario_data = db.usuarios.find_one({'_id': self.usuario_id})
        if usuario_data:
            temas_unicos = set()
            for leccion_id in usuario_data.get('leccionesCompletadas', []):
                leccion_data = db.lecciones.find_one({'_id': leccion_id})
                if leccion_data and 'tema' in leccion_data:
                    temas_unicos.add(leccion_data['tema'])

            if len(temas_unicos) >= 2:
                if self.desbloquear_logro(
                    'explorador',
                    'Explorador',
                    'Completa lecciones de 2 temas diferentes',
                    '🗺️'
                ):
                    logros_nuevos.append('explorador')

        # Coleccionista - 50 tomins
        if self.totalTominsGanados >= 50:
            if self.desbloquear_logro(
                'coleccionista',
                'Coleccionista',
                'Acumula 50 tomins',
                '💰'
            ):
                logros_nuevos.append('coleccionista')

        return logros_nuevos
