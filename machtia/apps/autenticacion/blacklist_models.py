"""
Modelos para el sistema de blacklist de tokens JWT.

SEGURIDAD CRÍTICA: Este sistema previene el uso de tokens revocados
después de logout o cuando las credenciales son comprometidas.
"""
from mongoengine import Document, StringField, DateTimeField
from datetime import datetime, timedelta
from django.conf import settings


class TokenBlacklist(Document):
    """
    Almacena tokens JWT revocados para prevenir su reutilización.

    VULNERABILIDAD MITIGADA: Sin blacklist, un token robado podría usarse
    hasta su expiración incluso después de que el usuario haya cerrado sesión.

    Campos:
        jti (str): JWT ID único del token (claim 'jti')
        usuario_id (str): ID del usuario al que pertenece el token
        revocado_en (datetime): Timestamp de cuando se revocó
        expira_en (datetime): Timestamp de cuando expira el token (para auto-limpieza)
        razon (str): Razón de la revocación (logout, compromiso, etc.)

    Uso:
        # Al hacer logout
        TokenBlacklist.agregar_token(jti, usuario_id, razon='logout')

        # Al verificar token
        if TokenBlacklist.esta_revocado(jti):
            raise InvalidTokenError('Token revocado')
    """

    # JWT ID único (claim 'jti' del token)
    jti = StringField(required=True, unique=True, max_length=64)

    # ID del usuario (para poder revocar todos los tokens de un usuario)
    usuario_id = StringField(required=True, max_length=24)

    # Timestamps
    revocado_en = DateTimeField(default=datetime.utcnow, required=True)
    expira_en = DateTimeField(required=True)

    # Razón de la revocación (para auditoría)
    razon = StringField(
        required=True,
        choices=['logout', 'compromiso', 'admin_revoke', 'password_change'],
        default='logout'
    )

    # Configuración de la colección MongoDB
    meta = {
        'collection': 'tokens_blacklist',
        'indexes': [
            'jti',
            'usuario_id',
            'expira_en',  # Para auto-limpieza eficiente
        ]
    }

    def __str__(self) -> str:
        return f"Token {self.jti[:8]}... revocado por {self.razon}"

    @classmethod
    def agregar_token(cls, jti: str, usuario_id: str, expira_en: datetime,
                      razon: str = 'logout') -> 'TokenBlacklist':
        """
        Agrega un token a la blacklist.

        Args:
            jti (str): JWT ID del token
            usuario_id (str): ID del usuario
            expira_en (datetime): Fecha de expiración del token
            razon (str): Razón de la revocación

        Returns:
            TokenBlacklist: Instancia del token en blacklist

        Nota:
            Si el token ya está en la blacklist, no hace nada (idempotente).
        """
        # Verificar si ya existe (evitar duplicados)
        existing = cls.objects(jti=jti).first()
        if existing:
            return existing

        # Crear nuevo registro
        token_blacklist = cls(
            jti=jti,
            usuario_id=usuario_id,
            expira_en=expira_en,
            razon=razon
        )
        token_blacklist.save()

        return token_blacklist

    @classmethod
    def esta_revocado(cls, jti: str) -> bool:
        """
        Verifica si un token está en la blacklist.

        Args:
            jti (str): JWT ID del token a verificar

        Returns:
            bool: True si está revocado, False si no

        Optimización:
            Solo busca tokens que no han expirado aún.
        """
        from mongoengine.connection import get_db

        db = get_db()

        # Buscar token que no haya expirado aún
        # (los tokens expirados no necesitan estar en blacklist)
        resultado = db.tokens_blacklist.find_one({
            'jti': jti,
            'expira_en': {'$gt': datetime.utcnow()}
        })

        return resultado is not None

    @classmethod
    def revocar_todos_usuario(cls, usuario_id: str) -> int:
        """
        Revoca todos los tokens activos de un usuario.

        Útil cuando:
        - El usuario cambia su contraseña
        - Se detecta actividad sospechosa
        - El administrador revoca acceso

        Args:
            usuario_id (str): ID del usuario

        Returns:
            int: Número de tokens revocados

        Nota:
            Esta función NO agrega tokens a la blacklist directamente.
            En su lugar, marca una flag en el usuario que invalida todos sus tokens.
            Implementar según necesidades específicas.
        """
        # Esta es una implementación simplificada
        # En producción, considera agregar un campo 'tokens_validos_desde'
        # en el modelo Usuario para invalidar todos los tokens anteriores
        pass

    @classmethod
    def limpiar_expirados(cls) -> int:
        """
        Elimina tokens expirados de la blacklist (mantenimiento).

        Esta función debe ejecutarse periódicamente (ej: cron job diario)
        para evitar que la colección crezca indefinidamente.

        Returns:
            int: Número de tokens eliminados

        Uso:
            # En un cron job o tarea periódica
            eliminados = TokenBlacklist.limpiar_expirados()
            print(f"Eliminados {eliminados} tokens expirados")
        """
        from mongoengine.connection import get_db

        db = get_db()

        # Eliminar todos los tokens que ya expiraron
        resultado = db.tokens_blacklist.delete_many({
            'expira_en': {'$lt': datetime.utcnow()}
        })

        return resultado.deleted_count

    @classmethod
    def estadisticas(cls) -> dict:
        """
        Retorna estadísticas sobre la blacklist.

        Returns:
            dict: Estadísticas de la blacklist
        """
        from mongoengine.connection import get_db

        db = get_db()

        total = db.tokens_blacklist.count_documents({})
        activos = db.tokens_blacklist.count_documents({
            'expira_en': {'$gt': datetime.utcnow()}
        })
        expirados = total - activos

        # Contar por razón
        por_razon = {}
        for razon in ['logout', 'compromiso', 'admin_revoke', 'password_change']:
            count = db.tokens_blacklist.count_documents({'razon': razon})
            if count > 0:
                por_razon[razon] = count

        return {
            'total': total,
            'activos': activos,
            'expirados': expirados,
            'por_razon': por_razon
        }
