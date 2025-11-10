"""
Script para poblar la base de datos con 15 lecciones completas de Náhuatl

Uso:
    python seed_15_lecciones.py

Opciones:
    --force    Sobrescribe lecciones existentes
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.lecciones.models import Leccion, Palabra
from mongoengine.connection import get_db


def crear_lecciones(force=False):
    """Crea o actualiza las 15 lecciones de Náhuatl"""

    lecciones_data = [
        {
            "_id": 1,
            "nombre": "Saludos Básicos",
            "tema": "saludos",
            "dificultad": "principiante",
            "contenido": "Aprende los saludos más comunes en náhuatl",
            "tominsAlCompletar": 5,
            "palabras": [
                {"palabra_nahuatl": "Niltze", "español": "Hola", "audio": None},
                {"palabra_nahuatl": "Tlenón ticpiya?", "español": "¿Cómo estás?", "audio": None},
                {"palabra_nahuatl": "Cualli", "español": "Bien", "audio": None},
                {"palabra_nahuatl": "Tlazohcamati", "español": "Gracias", "audio": None},
                {"palabra_nahuatl": "Moztlayoc", "español": "Hasta mañana", "audio": None}
            ]
        },
        {
            "_id": 2,
            "nombre": "La Familia",
            "tema": "familia",
            "dificultad": "principiante",
            "contenido": "Conoce los nombres de los miembros de la familia",
            "tominsAlCompletar": 5,
            "palabras": [
                {"palabra_nahuatl": "Tahtli", "español": "Padre", "audio": None},
                {"palabra_nahuatl": "Nantli", "español": "Madre", "audio": None},
                {"palabra_nahuatl": "Ichpochtli", "español": "Hija", "audio": None},
                {"palabra_nahuatl": "Telpochtli", "español": "Hijo", "audio": None},
                {"palabra_nahuatl": "Achtli", "español": "Abuelo", "audio": None},
                {"palabra_nahuatl": "Cihtli", "español": "Abuela", "audio": None}
            ]
        },
        {
            "_id": 3,
            "nombre": "Números del 1 al 10",
            "tema": "números",
            "dificultad": "principiante",
            "contenido": "Aprende a contar del 1 al 10 en náhuatl",
            "tominsAlCompletar": 5,
            "palabras": [
                {"palabra_nahuatl": "Ce", "español": "Uno", "audio": None},
                {"palabra_nahuatl": "Ome", "español": "Dos", "audio": None},
                {"palabra_nahuatl": "Yei", "español": "Tres", "audio": None},
                {"palabra_nahuatl": "Nahui", "español": "Cuatro", "audio": None},
                {"palabra_nahuatl": "Macuilli", "español": "Cinco", "audio": None},
                {"palabra_nahuatl": "Chicuace", "español": "Seis", "audio": None},
                {"palabra_nahuatl": "Chicome", "español": "Siete", "audio": None},
                {"palabra_nahuatl": "Chicuei", "español": "Ocho", "audio": None},
                {"palabra_nahuatl": "Chicnahui", "español": "Nueve", "audio": None},
                {"palabra_nahuatl": "Mahtlactli", "español": "Diez", "audio": None}
            ]
        },
        {
            "_id": 4,
            "nombre": "Colores Básicos",
            "tema": "colores",
            "dificultad": "principiante",
            "contenido": "Descubre los colores principales en náhuatl",
            "tominsAlCompletar": 5,
            "palabras": [
                {"palabra_nahuatl": "Iztac", "español": "Blanco", "audio": None},
                {"palabra_nahuatl": "Tliltic", "español": "Negro", "audio": None},
                {"palabra_nahuatl": "Chichiltic", "español": "Rojo", "audio": None},
                {"palabra_nahuatl": "Xoxoctic", "español": "Verde", "audio": None},
                {"palabra_nahuatl": "Coztic", "español": "Amarillo", "audio": None},
                {"palabra_nahuatl": "Texohtic", "español": "Azul", "audio": None}
            ]
        },
        {
            "_id": 5,
            "nombre": "Animales Comunes",
            "tema": "animales",
            "dificultad": "principiante",
            "contenido": "Conoce los nombres de animales comunes",
            "tominsAlCompletar": 5,
            "palabras": [
                {"palabra_nahuatl": "Itzcuintli", "español": "Perro", "audio": None},
                {"palabra_nahuatl": "Miztli", "español": "Gato", "audio": None},
                {"palabra_nahuatl": "Totolin", "español": "Pájaro", "audio": None},
                {"palabra_nahuatl": "Ocelotl", "español": "Jaguar", "audio": None},
                {"palabra_nahuatl": "Coyotl", "español": "Coyote", "audio": None},
                {"palabra_nahuatl": "Cuauhtli", "español": "Águila", "audio": None},
                {"palabra_nahuatl": "Papalotl", "español": "Mariposa", "audio": None}
            ]
        },
        {
            "_id": 6,
            "nombre": "Alimentos Tradicionales",
            "tema": "comida",
            "dificultad": "principiante",
            "contenido": "Aprende los nombres de alimentos típicos",
            "tominsAlCompletar": 5,
            "palabras": [
                {"palabra_nahuatl": "Tlaxcalli", "español": "Tortilla", "audio": None},
                {"palabra_nahuatl": "Elotl", "español": "Elote", "audio": None},
                {"palabra_nahuatl": "Etl", "español": "Frijol", "audio": None},
                {"palabra_nahuatl": "Xitomatl", "español": "Tomate", "audio": None},
                {"palabra_nahuatl": "Chilli", "español": "Chile", "audio": None},
                {"palabra_nahuatl": "Cacahuatl", "español": "Cacao", "audio": None},
                {"palabra_nahuatl": "Atl", "español": "Agua", "audio": None}
            ]
        },
        {
            "_id": 7,
            "nombre": "Partes del Cuerpo",
            "tema": "cuerpo",
            "dificultad": "intermedio",
            "contenido": "Identifica las partes del cuerpo en náhuatl",
            "tominsAlCompletar": 7,
            "palabras": [
                {"palabra_nahuatl": "Cuaitl", "español": "Cabeza", "audio": None},
                {"palabra_nahuatl": "Ixtli", "español": "Cara", "audio": None},
                {"palabra_nahuatl": "Ixtelolotl", "español": "Ojo", "audio": None},
                {"palabra_nahuatl": "Nacaztli", "español": "Oreja", "audio": None},
                {"palabra_nahuatl": "Camactli", "español": "Boca", "audio": None},
                {"palabra_nahuatl": "Maitl", "español": "Mano", "audio": None},
                {"palabra_nahuatl": "Icxitl", "español": "Pie", "audio": None},
                {"palabra_nahuatl": "Yollotl", "español": "Corazón", "audio": None}
            ]
        },
        {
            "_id": 8,
            "nombre": "La Naturaleza",
            "tema": "naturaleza",
            "dificultad": "intermedio",
            "contenido": "Vocabulario sobre elementos naturales",
            "tominsAlCompletar": 7,
            "palabras": [
                {"palabra_nahuatl": "Tonatiuh", "español": "Sol", "audio": None},
                {"palabra_nahuatl": "Metztli", "español": "Luna", "audio": None},
                {"palabra_nahuatl": "Citlalli", "español": "Estrella", "audio": None},
                {"palabra_nahuatl": "Cuahuitl", "español": "Árbol", "audio": None},
                {"palabra_nahuatl": "Xochitl", "español": "Flor", "audio": None},
                {"palabra_nahuatl": "Tepetl", "español": "Montaña", "audio": None},
                {"palabra_nahuatl": "Quiyahuitl", "español": "Lluvia", "audio": None}
            ]
        },
        {
            "_id": 9,
            "nombre": "En la Casa",
            "tema": "hogar",
            "dificultad": "intermedio",
            "contenido": "Objetos y espacios del hogar",
            "tominsAlCompletar": 7,
            "palabras": [
                {"palabra_nahuatl": "Calli", "español": "Casa", "audio": None},
                {"palabra_nahuatl": "Quixohuayan", "español": "Puerta", "audio": None},
                {"palabra_nahuatl": "Icpalli", "español": "Silla", "audio": None},
                {"palabra_nahuatl": "Tepotzoicpalli", "español": "Mesa", "audio": None},
                {"palabra_nahuatl": "Cochitl", "español": "Cama", "audio": None},
                {"palabra_nahuatl": "Texcalli", "español": "Cocina", "audio": None}
            ]
        },
        {
            "_id": 10,
            "nombre": "Expresiones Cotidianas",
            "tema": "expresiones",
            "dificultad": "intermedio",
            "contenido": "Frases útiles para el día a día",
            "tominsAlCompletar": 7,
            "palabras": [
                {"palabra_nahuatl": "Quenin?", "español": "¿Cómo?", "audio": None},
                {"palabra_nahuatl": "Canin?", "español": "¿Dónde?", "audio": None},
                {"palabra_nahuatl": "Quezqui?", "español": "¿Cuánto?", "audio": None},
                {"palabra_nahuatl": "Quema", "español": "Sí", "audio": None},
                {"palabra_nahuatl": "Amo", "español": "No", "audio": None}
            ]
        },
        {
            "_id": 11,
            "nombre": "El Tiempo",
            "tema": "tiempo",
            "dificultad": "intermedio",
            "contenido": "Vocabulario sobre el tiempo y las estaciones",
            "tominsAlCompletar": 7,
            "palabras": [
                {"palabra_nahuatl": "Tonalli", "español": "Día", "audio": None},
                {"palabra_nahuatl": "Yohualli", "español": "Noche", "audio": None},
                {"palabra_nahuatl": "Moztla", "español": "Mañana", "audio": None},
                {"palabra_nahuatl": "Axcan", "español": "Hoy", "audio": None},
                {"palabra_nahuatl": "Xopantla", "español": "Primavera/Verano", "audio": None},
                {"palabra_nahuatl": "Tonalco", "español": "Otoño/Invierno", "audio": None}
            ]
        },
        {
            "_id": 12,
            "nombre": "Verbos Básicos",
            "tema": "verbos",
            "dificultad": "avanzado",
            "contenido": "Aprende verbos de uso común",
            "tominsAlCompletar": 10,
            "palabras": [
                {"palabra_nahuatl": "Nitlazohtla", "español": "Yo amo", "audio": None},
                {"palabra_nahuatl": "Nicochi", "español": "Yo duermo", "audio": None},
                {"palabra_nahuatl": "Niqui", "español": "Yo como", "audio": None},
                {"palabra_nahuatl": "Niyauh", "español": "Yo voy", "audio": None},
                {"palabra_nahuatl": "Ninemih", "español": "Yo vivo", "audio": None},
                {"palabra_nahuatl": "Niquitta", "español": "Yo veo", "audio": None},
                {"palabra_nahuatl": "Nitlatoa", "español": "Yo hablo", "audio": None},
                {"palabra_nahuatl": "Nimomachtia", "español": "Yo aprendo", "audio": None}
            ]
        },
        {
            "_id": 13,
            "nombre": "Profesiones y Oficios",
            "tema": "profesiones",
            "dificultad": "avanzado",
            "contenido": "Conoce diferentes profesiones en náhuatl",
            "tominsAlCompletar": 10,
            "palabras": [
                {"palabra_nahuatl": "Ticitl", "español": "Médico/Curandero", "audio": None},
                {"palabra_nahuatl": "Tlamatini", "español": "Sabio/Maestro", "audio": None},
                {"palabra_nahuatl": "Amantecatl", "español": "Artesano", "audio": None},
                {"palabra_nahuatl": "Miltlacah", "español": "Agricultor", "audio": None},
                {"palabra_nahuatl": "Tlahcuiloh", "español": "Escribano/Pintor", "audio": None},
                {"palabra_nahuatl": "Cuicani", "español": "Cantante", "audio": None}
            ]
        },
        {
            "_id": 14,
            "nombre": "Sentimientos y Emociones",
            "tema": "emociones",
            "dificultad": "avanzado",
            "contenido": "Expresa cómo te sientes en náhuatl",
            "tominsAlCompletar": 10,
            "palabras": [
                {"palabra_nahuatl": "Nipaqui", "español": "Estoy feliz", "audio": None},
                {"palabra_nahuatl": "Nichocani", "español": "Estoy triste", "audio": None},
                {"palabra_nahuatl": "Nimauhti", "español": "Tengo miedo", "audio": None},
                {"palabra_nahuatl": "Niyolcocoliztli", "español": "Estoy enojado", "audio": None},
                {"palabra_nahuatl": "Nitlazohtla", "español": "Amo", "audio": None},
                {"palabra_nahuatl": "Niciahui", "español": "Estoy cansado", "audio": None}
            ]
        },
        {
            "_id": 15,
            "nombre": "Frases Avanzadas",
            "tema": "conversación",
            "dificultad": "avanzado",
            "contenido": "Conversaciones más complejas",
            "tominsAlCompletar": 10,
            "palabras": [
                {"palabra_nahuatl": "Tlen motoca?", "español": "¿Cómo te llamas?", "audio": None},
                {"palabra_nahuatl": "Canin tinemih?", "español": "¿Dónde vives?", "audio": None},
                {"palabra_nahuatl": "Nixnequi nimomachtiz nahuatl", "español": "Quiero aprender náhuatl", "audio": None},
                {"palabra_nahuatl": "Ximopanolti", "español": "Ten cuidado", "audio": None},
                {"palabra_nahuatl": "Ma cualli tonalli", "español": "Que tengas un buen día", "audio": None}
            ]
        }
    ]

    print('🌱 Poblando base de datos con 15 lecciones de Náhuatl...\n')

    db = get_db()
    creadas = 0
    actualizadas = 0
    saltadas = 0

    for leccion_data in lecciones_data:
        # Verificar si la lección ya existe
        leccion_existente = db.lecciones.find_one({'_id': leccion_data['_id']})

        if leccion_existente and not force:
            print(f'⏭️  Lección {leccion_data["_id"]} ya existe: {leccion_data["nombre"]} (usar --force para sobrescribir)')
            saltadas += 1
            continue

        if leccion_existente and force:
            # Eliminar lección existente
            db.lecciones.delete_one({'_id': leccion_data['_id']})
            print(f'🔄 Sobrescribiendo lección {leccion_data["_id"]}: {leccion_data["nombre"]}')

        # Crear lección
        leccion = Leccion(
            _id=leccion_data['_id'],
            nombre=leccion_data['nombre'],
            tema=leccion_data['tema'],
            dificultad=leccion_data['dificultad'],
            contenido=leccion_data['contenido'],
            tominsAlCompletar=leccion_data['tominsAlCompletar']
        )

        # Agregar palabras
        for palabra_data in leccion_data['palabras']:
            palabra = Palabra(
                palabra_nahuatl=palabra_data['palabra_nahuatl'],
                español=palabra_data['español'],
                audio=palabra_data.get('audio')
            )
            leccion.palabras.append(palabra)

        # Guardar
        leccion.save()

        if leccion_existente:
            print(f'✅ Lección {leccion._id} actualizada: {leccion.nombre} ({len(leccion.palabras)} palabras)')
            actualizadas += 1
        else:
            print(f'✅ Lección {leccion._id} creada: {leccion.nombre} ({len(leccion.palabras)} palabras)')
            creadas += 1

    print(f'\n📊 Resumen:')
    print(f'   Creadas: {creadas}')
    print(f'   Actualizadas: {actualizadas}')
    print(f'   Saltadas: {saltadas}')
    print(f'   Total en BD: {db.lecciones.count_documents({})}')
    print(f'\n🎉 ¡Proceso completado exitosamente!\n')


if __name__ == '__main__':
    force = '--force' in sys.argv

    try:
        crear_lecciones(force=force)
    except Exception as e:
        print(f'\n❌ Error: {e}\n')
        import traceback
        traceback.print_exc()
