"""
Modelos de autenticación usando Mongoengine (ODM para MongoDB)
"""
from mongoengine import Document, StringField, IntField, ListField, DateTimeField, EmailField
from datetime import datetime, timedelta
import bcrypt


class Usuario(Document):
    """
    Modelo de Usuario para la aplicación de aprendizaje de Náhuatl.

    Campos:
        email (str): Email único del usuario
        nombre (str): Nombre completo del usuario
        password (str): Contraseña hasheada con bcrypt
        tomin (int): Monedas virtuales del usuario (nunca negativo)
        vidas (int): Vidas disponibles (máximo 5)
        leccionesCompletadas (list): Lista de IDs de lecciones completadas
        leccionActual (int): ID de la lección actual
        ultimaRegeneracionVida (datetime): Timestamp de última regeneración de vida
        createdAt (datetime): Fecha de creación del usuario
    """

    # Campos requeridos
    email = EmailField(required=True, unique=True)
    nombre = StringField(required=True, max_length=100)
    password = StringField(required=True)

    # SEGURIDAD: Sistema de roles para control de acceso (RBAC)
    # - estudiante: Usuario normal, solo puede ver y completar lecciones
    # - profesor: Puede crear y editar lecciones/niveles
    # - admin: Acceso total (crear, editar, eliminar)
    rol = StringField(
        required=True,
        default='estudiante',
        choices=['estudiante', 'profesor', 'admin']
    )

    # Campos de progreso
    tomin = IntField(default=0, min_value=0)
    vidas = IntField(default=3, min_value=0, max_value=5)
    leccionesCompletadas = ListField(IntField(), default=list)
    leccionActual = IntField(default=1)

    # Progreso de niveles
    nivelesCompletados = ListField(IntField(), default=list)
    nivelActual = IntField(default=1)

    # Campos de tiempo
    ultimaRegeneracionVida = DateTimeField(default=datetime.utcnow)
    createdAt = DateTimeField(default=datetime.utcnow)

    # Configuración de la colección MongoDB
    meta = {
        'collection': 'usuarios',
        'indexes': [
            'email',
            'leccionActual',
            'nivelActual'
        ]
    }

    def __str__(self) -> str:
        """Representación en string del usuario"""
        return f"{self.nombre} ({self.email})"

    def set_password(self, raw_password: str) -> None:
        """
        Hashea y almacena la contraseña usando bcrypt.

        Args:
            raw_password (str): Contraseña en texto plano
        """
        hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
        self.password = hashed.decode('utf-8')

    def check_password(self, raw_password: str) -> bool:
        """
        Verifica si la contraseña proporcionada coincide con la almacenada.

        Args:
            raw_password (str): Contraseña en texto plano a verificar

        Returns:
            bool: True si la contraseña es correcta, False en caso contrario
        """
        return bcrypt.checkpw(
            raw_password.encode('utf-8'),
            self.password.encode('utf-8')
        )

    def agregar_tomin(self, cantidad: int) -> None:
        """
        Agrega tomins al usuario usando operación atómica (nunca permite valores negativos).

        SEGURIDAD MEDIA CORREGIDA: Usa operaciones atómicas de MongoDB para
        prevenir race conditions.

        Args:
            cantidad (int): Cantidad de tomins a agregar
        """
        from mongoengine.connection import get_db
        from bson import ObjectId

        # OPERACIÓN ATÓMICA: Incrementar tomins
        db = get_db()
        result = db.usuarios.find_one_and_update(
            {'_id': ObjectId(self.id)},
            {'$inc': {'tomin': cantidad}},  # Incrementar atómicamente
            return_document=True
        )

        if result:
            # Actualizar objeto local con el valor atómico
            self.tomin = result['tomin']

    def usar_tomin(self, cantidad: int) -> bool:
        """
        Usa tomins del usuario si tiene suficientes (operación atómica).

        SEGURIDAD MEDIA CORREGIDA: Usa operaciones atómicas de MongoDB para
        prevenir race conditions en compras simultáneas.

        Args:
            cantidad (int): Cantidad de tomins a usar

        Returns:
            bool: True si se pudieron usar, False si no tenía suficientes
        """
        from mongoengine.connection import get_db
        from bson import ObjectId

        # OPERACIÓN ATÓMICA: Decrementar tomins solo si tiene suficientes
        db = get_db()
        result = db.usuarios.find_one_and_update(
            {
                '_id': ObjectId(self.id),
                'tomin': {'$gte': cantidad}  # Solo si tiene suficientes tomins
            },
            {
                '$inc': {'tomin': -cantidad}  # Decrementar atómicamente
            },
            return_document=True
        )

        if result:
            # Actualizar objeto local con el valor atómico
            self.tomin = result['tomin']
            return True
        return False

    def completar_leccion(self, leccion_id: int, tomins_ganados: int) -> None:
        """
        Marca una lección como completada y otorga tomins.

        Args:
            leccion_id (int): ID de la lección completada
            tomins_ganados (int): Cantidad de tomins a otorgar
        """
        if leccion_id not in self.leccionesCompletadas:
            self.leccionesCompletadas.append(leccion_id)
            self.agregar_tomin(tomins_ganados)

            # Avanzar a la siguiente lección si corresponde
            if leccion_id == self.leccionActual:
                self.leccionActual = leccion_id + 1

            self.save()

    def completar_nivel(self, nivel_id: int) -> None:
        """
        Marca un nivel como completado y avanza al siguiente.

        Args:
            nivel_id (int): ID del nivel completado
        """
        if nivel_id not in self.nivelesCompletados:
            self.nivelesCompletados.append(nivel_id)

            # Avanzar al siguiente nivel si corresponde
            if nivel_id == self.nivelActual:
                self.nivelActual = nivel_id + 1

            self.save()

    def puede_acceder_nivel(self, nivel_id: int) -> bool:
        """
        Verifica si el usuario puede acceder a un nivel específico.

        Un usuario puede acceder a un nivel si:
        - Es el nivel actual
        - Ya lo completó antes
        - Es un nivel anterior al actual

        Args:
            nivel_id (int): ID del nivel a verificar

        Returns:
            bool: True si puede acceder, False si está bloqueado
        """
        return nivel_id <= self.nivelActual

    def calcular_vidas_regeneradas(self) -> int:
        """
        Calcula cuántas vidas se han regenerado desde la última regeneración.

        Regla: 1 vida cada 5 minutos (máximo 5 vidas)

        Returns:
            int: Número de vidas regeneradas
        """
        if self.vidas >= 5:
            return 0  # Ya tiene el máximo

        ahora = datetime.utcnow()
        tiempo_transcurrido = ahora - self.ultimaRegeneracionVida
        minutos_transcurridos = tiempo_transcurrido.total_seconds() / 60

        # 1 vida cada 5 minutos
        vidas_regeneradas = int(minutos_transcurridos // 5)

        return vidas_regeneradas

    def regenerar_vidas(self) -> dict:
        """
        Regenera vidas basándose en el tiempo transcurrido.

        Returns:
            dict: Info sobre la regeneración (vidas_anteriores, vidas_actuales, vidas_regeneradas)
        """
        vidas_anteriores = self.vidas
        vidas_regeneradas = self.calcular_vidas_regeneradas()

        if vidas_regeneradas > 0:
            # Calcular nuevas vidas (máximo 5)
            self.vidas = min(5, self.vidas + vidas_regeneradas)

            # Actualizar timestamp de última regeneración
            # Ajustar al tiempo exacto de las vidas regeneradas (no "ahora")
            minutos_regenerados = vidas_regeneradas * 5
            self.ultimaRegeneracionVida = self.ultimaRegeneracionVida + timedelta(minutes=minutos_regenerados)

            self.save()

        return {
            'vidas_anteriores': vidas_anteriores,
            'vidas_actuales': self.vidas,
            'vidas_regeneradas': vidas_regeneradas
        }

    def usar_vida(self) -> bool:
        """
        Usa una vida del usuario si tiene disponibles (operación atómica).

        SEGURIDAD MEDIA CORREGIDA: Usa operaciones atómicas de MongoDB para
        prevenir race conditions cuando múltiples peticiones simultáneas intentan
        usar vidas al mismo tiempo.

        Returns:
            bool: True si se pudo usar, False si no tiene vidas
        """
        from mongoengine.connection import get_db
        from bson import ObjectId

        # Primero intentar regenerar vidas
        self.regenerar_vidas()

        # OPERACIÓN ATÓMICA: Decrementar vidas solo si > 0
        # Usa findAndModify para garantizar atomicidad
        db = get_db()
        result = db.usuarios.find_one_and_update(
            {
                '_id': ObjectId(self.id),
                'vidas': {'$gt': 0}  # Solo si tiene vidas disponibles
            },
            {
                '$inc': {'vidas': -1}  # Decrementar atómicamente
            },
            return_document=True  # Retornar documento actualizado
        )

        if result:
            # Actualizar objeto local con el valor atómico
            self.vidas = result['vidas']
            return True
        return False

    def agregar_vida(self, cantidad: int = 1) -> None:
        """
        Agrega vidas al usuario (máximo 5) usando operación atómica.

        SEGURIDAD MEDIA CORREGIDA: Usa operaciones atómicas de MongoDB para
        prevenir race conditions.

        Args:
            cantidad (int): Cantidad de vidas a agregar (default: 1)
        """
        from mongoengine.connection import get_db
        from bson import ObjectId

        # OPERACIÓN ATÓMICA: Agregar vidas pero mantener máximo de 5
        db = get_db()
        result = db.usuarios.find_one_and_update(
            {'_id': ObjectId(self.id)},
            [
                {
                    '$set': {
                        'vidas': {
                            '$min': [
                                5,  # Máximo 5 vidas
                                {'$add': ['$vidas', cantidad]}  # Sumar cantidad
                            ]
                        }
                    }
                }
            ],
            return_document=True
        )

        if result:
            # Actualizar objeto local con el valor atómico
            self.vidas = result['vidas']

    def tiene_vidas_disponibles(self) -> bool:
        """
        Verifica si el usuario tiene vidas disponibles (considerando regeneración).

        Returns:
            bool: True si tiene vidas, False si no
        """
        # Regenerar vidas antes de verificar
        self.regenerar_vidas()
        return self.vidas > 0

    def tiempo_proxima_vida(self) -> dict:
        """
        Calcula el tiempo restante para la próxima vida.

        Returns:
            dict: Info sobre próxima vida (tiene_maximo, minutos_restantes, segundos_restantes)
        """
        if self.vidas >= 5:
            return {
                'tiene_maximo': True,
                'minutos_restantes': 0,
                'segundos_restantes': 0
            }

        ahora = datetime.utcnow()
        tiempo_transcurrido = ahora - self.ultimaRegeneracionVida
        minutos_transcurridos = tiempo_transcurrido.total_seconds() / 60

        # Minutos hasta la próxima vida (5 minutos por vida)
        minutos_en_ciclo_actual = minutos_transcurridos % 5
        minutos_restantes = 5 - minutos_en_ciclo_actual
        segundos_restantes = int(minutos_restantes * 60)

        return {
            'tiene_maximo': False,
            'minutos_restantes': int(minutos_restantes),
            'segundos_restantes': segundos_restantes
        }
