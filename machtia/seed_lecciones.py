"""
Script para poblar la base de datos con lecciones de ejemplo de Náhuatl

Uso:
    python seed_lecciones.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.lecciones.models import Leccion, Palabra


def crear_lecciones():
    """Crea lecciones de ejemplo"""

    lecciones_data = [
        {
            '_id': 1,
            'nombre': 'Saludos Básicos',
            'tema': 'saludos',
            'dificultad': 'principiante',
            'contenido': 'Aprende los saludos más comunes en náhuatl',
            'tominsAlCompletar': 5,
            'palabras': [
                {'palabra_nahuatl': 'Niltze', 'español': 'Hola'},
                {'palabra_nahuatl': 'Panoltih', 'español': 'Adiós'},
                {'palabra_nahuatl': 'Tlazohcamati', 'español': 'Gracias'},
                {'palabra_nahuatl': 'Cualli tonalli', 'español': 'Buenos días'},
                {'palabra_nahuatl': 'Cualli yohualli', 'español': 'Buenas noches'},
            ]
        },
        {
            '_id': 2,
            'nombre': 'Números del 1 al 10',
            'tema': 'numeros',
            'dificultad': 'principiante',
            'contenido': 'Aprende a contar del 1 al 10 en náhuatl',
            'tominsAlCompletar': 10,
            'palabras': [
                {'palabra_nahuatl': 'Ce', 'español': 'Uno'},
                {'palabra_nahuatl': 'Ome', 'español': 'Dos'},
                {'palabra_nahuatl': 'Yei', 'español': 'Tres'},
                {'palabra_nahuatl': 'Nahui', 'español': 'Cuatro'},
                {'palabra_nahuatl': 'Macuilli', 'español': 'Cinco'},
                {'palabra_nahuatl': 'Chicuace', 'español': 'Seis'},
                {'palabra_nahuatl': 'Chicome', 'español': 'Siete'},
                {'palabra_nahuatl': 'Chicuei', 'español': 'Ocho'},
                {'palabra_nahuatl': 'Chicnahui', 'español': 'Nueve'},
                {'palabra_nahuatl': 'Mahtlactli', 'español': 'Diez'},
            ]
        },
        {
            '_id': 3,
            'nombre': 'Familia',
            'tema': 'familia',
            'dificultad': 'principiante',
            'contenido': 'Vocabulario relacionado con la familia',
            'tominsAlCompletar': 8,
            'palabras': [
                {'palabra_nahuatl': 'Nantli', 'español': 'Madre'},
                {'palabra_nahuatl': 'Tahtli', 'español': 'Padre'},
                {'palabra_nahuatl': 'Ichpōchtli', 'español': 'Hija'},
                {'palabra_nahuatl': 'Telpōchtli', 'español': 'Hijo'},
                {'palabra_nahuatl': 'Ixhuiuh', 'español': 'Nieto/Nieta'},
                {'palabra_nahuatl': 'Colli', 'español': 'Abuelo/Abuela'},
            ]
        },
        {
            '_id': 4,
            'nombre': 'Colores',
            'tema': 'colores',
            'dificultad': 'principiante',
            'contenido': 'Los colores básicos en náhuatl',
            'tominsAlCompletar': 7,
            'palabras': [
                {'palabra_nahuatl': 'Iztāc', 'español': 'Blanco'},
                {'palabra_nahuatl': 'Tlīltic', 'español': 'Negro'},
                {'palabra_nahuatl': 'Chīchīltic', 'español': 'Rojo'},
                {'palabra_nahuatl': 'Coztic', 'español': 'Amarillo'},
                {'palabra_nahuatl': 'Xoxouhqui', 'español': 'Verde/Azul'},
            ]
        },
        {
            '_id': 5,
            'nombre': 'Animales Comunes',
            'tema': 'animales',
            'dificultad': 'principiante',
            'contenido': 'Nombres de animales en náhuatl',
            'tominsAlCompletar': 10,
            'palabras': [
                {'palabra_nahuatl': 'Itzcuintli', 'español': 'Perro'},
                {'palabra_nahuatl': 'Miztli', 'español': 'Gato'},
                {'palabra_nahuatl': 'Tototl', 'español': 'Pájaro'},
                {'palabra_nahuatl': 'Cuauhtli', 'español': 'Águila'},
                {'palabra_nahuatl': 'Ocelotl', 'español': 'Jaguar'},
                {'palabra_nahuatl': 'Michin', 'español': 'Pez'},
                {'palabra_nahuatl': 'Coātl', 'español': 'Serpiente'},
            ]
        },
        {
            '_id': 6,
            'nombre': 'Frases de Cortesía',
            'tema': 'frases',
            'dificultad': 'intermedio',
            'contenido': 'Expresiones de cortesía y buenos modales',
            'tominsAlCompletar': 12,
            'palabras': [
                {'palabra_nahuatl': 'Xicmocaquilti', 'español': 'Por favor'},
                {'palabra_nahuatl': 'Ximopanolti', 'español': 'Pasa / Adelante'},
                {'palabra_nahuatl': 'Nimitzpalehuia', 'español': 'Te ayudo'},
                {'palabra_nahuatl': 'Cuix tinechpalehuiz', 'español': '¿Me ayudas?'},
                {'palabra_nahuatl': 'Amo, tlazohcamati', 'español': 'No, gracias'},
            ]
        },
        {
            '_id': 7,
            'nombre': 'Comida y Bebida',
            'tema': 'comida',
            'dificultad': 'intermedio',
            'contenido': 'Vocabulario relacionado con alimentos',
            'tominsAlCompletar': 15,
            'palabras': [
                {'palabra_nahuatl': 'Tlaxcalli', 'español': 'Tortilla'},
                {'palabra_nahuatl': 'Etl', 'español': 'Frijol'},
                {'palabra_nahuatl': 'Chīlli', 'español': 'Chile'},
                {'palabra_nahuatl': 'Xitomatl', 'español': 'Tomate'},
                {'palabra_nahuatl': 'Atl', 'español': 'Agua'},
                {'palabra_nahuatl': 'Xocolatl', 'español': 'Chocolate'},
                {'palabra_nahuatl': 'Ahuacatl', 'español': 'Aguacate'},
            ]
        },
        {
            '_id': 8,
            'nombre': 'Partes del Cuerpo',
            'tema': 'cuerpo',
            'dificultad': 'intermedio',
            'contenido': 'Nombres de las partes del cuerpo',
            'tominsAlCompletar': 12,
            'palabras': [
                {'palabra_nahuatl': 'Cuaitl', 'español': 'Cabeza'},
                {'palabra_nahuatl': 'Ixtli', 'español': 'Cara/Rostro'},
                {'palabra_nahuatl': 'Maitl', 'español': 'Mano'},
                {'palabra_nahuatl': 'Xocpalli', 'español': 'Pie'},
                {'palabra_nahuatl': 'Yollotl', 'español': 'Corazón'},
                {'palabra_nahuatl': 'Nacatl', 'español': 'Cuerpo'},
            ]
        }
    ]

    print('🌱 Poblando base de datos con lecciones de Náhuatl...\n')

    creadas = 0
    actualizadas = 0

    for leccion_data in lecciones_data:
        # Verificar si la lección ya existe
        from mongoengine.connection import get_db
        db = get_db()
        leccion_existente = db.lecciones.find_one({'_id': leccion_data['_id']})

        if leccion_existente:
            print(f'⚠️  Lección {leccion_data["_id"]} ya existe: {leccion_data["nombre"]}')
            actualizadas += 1
            continue

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
        print(f'✅ Lección {leccion._id} creada: {leccion.nombre} ({len(leccion.palabras)} palabras)')
        creadas += 1

    print(f'\n📊 Resumen:')
    print(f'   Creadas: {creadas}')
    print(f'   Ya existían: {actualizadas}')
    print(f'\n🎉 ¡Lecciones cargadas exitosamente!\n')


if __name__ == '__main__':
    try:
        crear_lecciones()
    except Exception as e:
        print(f'\n❌ Error: {e}\n')
