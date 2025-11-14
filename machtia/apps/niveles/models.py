"""
Modelo "niveles" usando Mongoengine (ODM para MongoDB)
"""
from mongoengine import Document, StringField, IntField

class Nivel(Document):
    """
    Nivel que contendrá una o más lecciones para el aprendizaje de Náhuatl.

    Campos:
        _id (int): ID secuencial del nivel (1, 2, 3...)
        nombre (str): Nombre descriptivo del nivel
        tema (str): Tema principal del nivel (ej: "saludos", "números")
        dificultad (str): Nivel de dificultad (principiante, intermedio, avanzado)
        contenido (str): Descripción del contenido del nivel
    """

    # ID secuencial personalizado
    _id = IntField(required=True, primary_key=True)

    # Información del nivel
    nombre = StringField(required=True, max_length=200)
    tema = StringField(required=True, max_length=100)
    dificultad = StringField(
        required=True,
        choices=['principiante', 'intermedio', 'avanzado'],
        default='principiante'
    )
    contenido = StringField(required=True)

    # Configuración de la colección MongoDB
    meta = {
        'collection': 'niveles',
        'indexes': ['nombre'],
        'ordering': ['_id']  # Ordenar por ID ascendente por defecto
    }

    def __str__(self) -> str:
        """Representación en string del nivel de aprendizaje"""
        return f"Nivel {self._id}: {self.nombre}"

    @classmethod
    def obtener_siguiente_id(cls) -> int:
        """
        Obtiene el ID del siguiente nivel.

        Returns:
            int: Siguiente ID secuencial
        """
        ultimo_nivel = cls.objects.order_by('-_id').first()
        if ultimo_nivel:
            return ultimo_nivel._id + 1
        return 1
