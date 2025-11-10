"""
Modelos de lecciones usando Mongoengine (ODM para MongoDB)
"""
from mongoengine import Document, EmbeddedDocument, StringField, IntField, ListField, EmbeddedDocumentField


class Palabra(EmbeddedDocument):
    """
    Documento embebido que representa una palabra náhuatl.

    Campos:
        palabra_nahuatl (str): La palabra en idioma náhuatl
        español (str): Traducción al español
        audio (str): URL o path del archivo de audio (opcional)
    """

    palabra_nahuatl = StringField(required=True, max_length=100)
    español = StringField(required=True, max_length=100)
    audio = StringField(max_length=500)  # URL del archivo de audio

    def __str__(self) -> str:
        """Representación en string de la palabra"""
        return f"{self.palabra_nahuatl} - {self.español}"


class Leccion(Document):
    """
    Modelo de Lección para el aprendizaje de Náhuatl.

    Campos:
        _id (int): ID secuencial de la lección (1, 2, 3...)
        nombre (str): Nombre descriptivo de la lección
        tema (str): Tema principal de la lección (ej: "saludos", "números")
        dificultad (str): Nivel de dificultad (principiante, intermedio, avanzado)
        contenido (str): Descripción del contenido de la lección
        palabras (list): Array de objetos Palabra embebidos
        tominsAlCompletar (int): Cantidad de tomins que se otorgan al completar (fijo: 5)
    """

    # ID secuencial personalizado
    _id = IntField(required=True, primary_key=True)

    # Información de la lección
    nombre = StringField(required=True, max_length=200)
    tema = StringField(required=True, max_length=100)
    dificultad = StringField(
        required=True,
        choices=['principiante', 'intermedio', 'avanzado'],
        default='principiante'
    )
    contenido = StringField(required=True)

    # Palabras de la lección (array de objetos embebidos)
    palabras = ListField(EmbeddedDocumentField(Palabra), default=list)

    # Recompensas
    tominsAlCompletar = IntField(default=5, min_value=0)

    # Configuración de la colección MongoDB
    meta = {
        'collection': 'lecciones',
        'indexes': [
            'tema',
            'dificultad'
        ],
        'ordering': ['_id']  # Ordenar por ID ascendente por defecto
    }

    def __str__(self) -> str:
        """Representación en string de la lección"""
        return f"Lección {self._id}: {self.nombre}"

    def agregar_palabra(self, palabra_nahuatl: str, español: str, audio: str = None) -> None:
        """
        Agrega una nueva palabra a la lección.

        Args:
            palabra_nahuatl (str): Palabra en náhuatl
            español (str): Traducción al español
            audio (str, optional): URL del audio
        """
        palabra = Palabra(
            palabra_nahuatl=palabra_nahuatl,
            español=español,
            audio=audio
        )
        self.palabras.append(palabra)
        self.save()

    def cantidad_palabras(self) -> int:
        """
        Retorna la cantidad de palabras en la lección.

        Returns:
            int: Número de palabras
        """
        return len(self.palabras)

    @classmethod
    def obtener_siguiente_id(cls) -> int:
        """
        Obtiene el siguiente ID disponible para una nueva lección.

        Returns:
            int: Siguiente ID secuencial
        """
        ultima_leccion = cls.objects.order_by('-_id').first()
        if ultima_leccion:
            return ultima_leccion._id + 1
        return 1
