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

    # Nivel 1: Animales (principiante)
    # Nivel 2: Comida (intermedio)
    # Nivel 3: Cosas (avanzado)

    lecciones_data = [
        # Lecciones del Nivel 1 - Animales (principiante)
        {
            '_id': 1,
            'nombre': 'Animales Domésticos',
            'tema': 'animales',
            'dificultad': 'principiante',
            'contenido': 'Nombres de animales domésticos en náhuatl',
            'tominsAlCompletar': 10,
            'nivel_id': 1,
            'palabras': [
                {'palabra_nahuatl': 'Itzcuintli', 'español': 'Perro'},
                {'palabra_nahuatl': 'Miztli', 'español': 'Gato'},
                {'palabra_nahuatl': 'Totolin', 'español': 'Gallina'},
                {'palabra_nahuatl': 'Cuanaca', 'español': 'Gallo'},
                {'palabra_nahuatl': 'Pitzotl', 'español': 'Cerdo'},
            ]
        },
        {
            '_id': 2,
            'nombre': 'Animales Salvajes',
            'tema': 'animales',
            'dificultad': 'principiante',
            'contenido': 'Nombres de animales salvajes en náhuatl',
            'tominsAlCompletar': 10,
            'nivel_id': 1,
            'palabras': [
                {'palabra_nahuatl': 'Cuauhtli', 'español': 'Águila'},
                {'palabra_nahuatl': 'Ocelotl', 'español': 'Jaguar'},
                {'palabra_nahuatl': 'Coātl', 'español': 'Serpiente'},
                {'palabra_nahuatl': 'Mazatl', 'español': 'Venado'},
                {'palabra_nahuatl': 'Coyotl', 'español': 'Coyote'},
            ]
        },
        {
            '_id': 3,
            'nombre': 'Aves y Peces',
            'tema': 'animales',
            'dificultad': 'principiante',
            'contenido': 'Nombres de aves y peces en náhuatl',
            'tominsAlCompletar': 10,
            'nivel_id': 1,
            'palabras': [
                {'palabra_nahuatl': 'Tototl', 'español': 'Pájaro'},
                {'palabra_nahuatl': 'Michin', 'español': 'Pez'},
                {'palabra_nahuatl': 'Huilotl', 'español': 'Paloma'},
                {'palabra_nahuatl': 'Tzinitzcan', 'español': 'Murciélago'},
                {'palabra_nahuatl': 'Quetzalli', 'español': 'Pluma preciosa'},
            ]
        },

        # Lecciones del Nivel 2 - Comida (intermedio)
        {
            '_id': 4,
            'nombre': 'Alimentos Básicos',
            'tema': 'comida',
            'dificultad': 'intermedio',
            'contenido': 'Vocabulario relacionado con alimentos básicos',
            'tominsAlCompletar': 15,
            'nivel_id': 2,
            'palabras': [
                {'palabra_nahuatl': 'Tlaxcalli', 'español': 'Tortilla'},
                {'palabra_nahuatl': 'Etl', 'español': 'Frijol'},
                {'palabra_nahuatl': 'Chīlli', 'español': 'Chile'},
                {'palabra_nahuatl': 'Xitomatl', 'español': 'Tomate'},
                {'palabra_nahuatl': 'Elotl', 'español': 'Elote/Maíz'},
            ]
        },
        {
            '_id': 5,
            'nombre': 'Bebidas Tradicionales',
            'tema': 'comida',
            'dificultad': 'intermedio',
            'contenido': 'Nombres de bebidas tradicionales',
            'tominsAlCompletar': 12,
            'nivel_id': 2,
            'palabras': [
                {'palabra_nahuatl': 'Atl', 'español': 'Agua'},
                {'palabra_nahuatl': 'Xocolatl', 'español': 'Chocolate'},
                {'palabra_nahuatl': 'Atolli', 'español': 'Atole'},
                {'palabra_nahuatl': 'Octli', 'español': 'Pulque'},
            ]
        },
        {
            '_id': 6,
            'nombre': 'Frutas y Vegetales',
            'tema': 'comida',
            'dificultad': 'intermedio',
            'contenido': 'Frutas y vegetales en náhuatl',
            'tominsAlCompletar': 15,
            'nivel_id': 2,
            'palabras': [
                {'palabra_nahuatl': 'Ahuacatl', 'español': 'Aguacate'},
                {'palabra_nahuatl': 'Xicama', 'español': 'Jícama'},
                {'palabra_nahuatl': 'Tomatl', 'español': 'Tomate verde'},
                {'palabra_nahuatl': 'Chilli', 'español': 'Chile'},
                {'palabra_nahuatl': 'Nochtli', 'español': 'Tuna'},
            ]
        },

        # Lecciones del Nivel 3 - Cosas (avanzado)
        {
            '_id': 7,
            'nombre': 'Objetos del Hogar',
            'tema': 'cosas',
            'dificultad': 'avanzado',
            'contenido': 'Vocabulario de objetos cotidianos del hogar',
            'tominsAlCompletar': 20,
            'nivel_id': 3,
            'palabras': [
                {'palabra_nahuatl': 'Calli', 'español': 'Casa'},
                {'palabra_nahuatl': 'Comitl', 'español': 'Olla'},
                {'palabra_nahuatl': 'Metlatl', 'español': 'Metate'},
                {'palabra_nahuatl': 'Teponaztli', 'español': 'Tambor'},
                {'palabra_nahuatl': 'Petlatl', 'español': 'Petate/Estera'},
            ]
        },
        {
            '_id': 8,
            'nombre': 'Herramientas y Utensilios',
            'tema': 'cosas',
            'dificultad': 'avanzado',
            'contenido': 'Herramientas y utensilios tradicionales',
            'tominsAlCompletar': 20,
            'nivel_id': 3,
            'palabras': [
                {'palabra_nahuatl': 'Tepoztli', 'español': 'Hacha'},
                {'palabra_nahuatl': 'Huictli', 'español': 'Cuchara'},
                {'palabra_nahuatl': 'Itztetl', 'español': 'Obsidiana/Navaja'},
                {'palabra_nahuatl': 'Quauitl', 'español': 'Palo/Madera'},
                {'palabra_nahuatl': 'Xicalli', 'español': 'Jícara/Vasija'},
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
            tominsAlCompletar=leccion_data['tominsAlCompletar'],
            nivel_id=leccion_data.get('nivel_id', 1)  # Por defecto nivel 1
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
