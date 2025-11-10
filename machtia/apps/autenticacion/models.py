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

    # Campos de progreso
    tomin = IntField(default=0, min_value=0)
    vidas = IntField(default=3, min_value=0, max_value=5)
    leccionesCompletadas = ListField(IntField(), default=list)
    leccionActual = IntField(default=1)

    # Campos de tiempo
    ultimaRegeneracionVida = DateTimeField(default=datetime.utcnow)
    createdAt = DateTimeField(default=datetime.utcnow)

    # Configuración de la colección MongoDB
    meta = {
        'collection': 'usuarios',
        'indexes': [
            'email',
            'leccionActual'
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
        Agrega tomins al usuario (nunca permite valores negativos).

        Args:
            cantidad (int): Cantidad de tomins a agregar
        """
        self.tomin = max(0, self.tomin + cantidad)
        self.save()

    def usar_tomin(self, cantidad: int) -> bool:
        """
        Usa tomins del usuario si tiene suficientes.

        Args:
            cantidad (int): Cantidad de tomins a usar

        Returns:
            bool: True si se pudieron usar, False si no tenía suficientes
        """
        if self.tomin >= cantidad:
            self.tomin -= cantidad
            self.save()
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

    def calcular_vidas_regeneradas(self) -> int:
        """
        Calcula cuántas vidas se han regenerado desde la última regeneración.

        Regla: 1 vida cada 30 minutos (máximo 5 vidas)

        Returns:
            int: Número de vidas regeneradas
        """
        if self.vidas >= 5:
            return 0  # Ya tiene el máximo

        ahora = datetime.utcnow()
        tiempo_transcurrido = ahora - self.ultimaRegeneracionVida
        minutos_transcurridos = tiempo_transcurrido.total_seconds() / 60

        # 1 vida cada 30 minutos
        vidas_regeneradas = int(minutos_transcurridos // 30)

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
            minutos_regenerados = vidas_regeneradas * 30
            self.ultimaRegeneracionVida = self.ultimaRegeneracionVida + timedelta(minutes=minutos_regenerados)

            self.save()

        return {
            'vidas_anteriores': vidas_anteriores,
            'vidas_actuales': self.vidas,
            'vidas_regeneradas': vidas_regeneradas
        }

    def usar_vida(self) -> bool:
        """
        Usa una vida del usuario si tiene disponibles.

        Returns:
            bool: True si se pudo usar, False si no tiene vidas
        """
        # Primero intentar regenerar vidas
        self.regenerar_vidas()

        if self.vidas > 0:
            self.vidas -= 1
            self.save()
            return True
        return False

    def agregar_vida(self, cantidad: int = 1) -> None:
        """
        Agrega vidas al usuario (máximo 5).

        Args:
            cantidad (int): Cantidad de vidas a agregar (default: 1)
        """
        self.vidas = min(5, self.vidas + cantidad)
        self.save()

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

        # Minutos hasta la próxima vida (30 minutos por vida)
        minutos_en_ciclo_actual = minutos_transcurridos % 30
        minutos_restantes = 30 - minutos_en_ciclo_actual
        segundos_restantes = int(minutos_restantes * 60)

        return {
            'tiene_maximo': False,
            'minutos_restantes': int(minutos_restantes),
            'segundos_restantes': segundos_restantes
        }
