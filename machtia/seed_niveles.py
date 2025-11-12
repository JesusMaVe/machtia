"""
Script para poblar la base de datos con niveles de aprendizaje de Náhuatl

Uso:
    python seed_niveles.py
"""
import os
import django

# Configurar entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.niveles.models import Nivel
from mongoengine.connection import get_db


def crear_niveles():
    """Crea niveles de ejemplo para el aprendizaje de Náhuatl"""

    niveles_data = [
        {
            '_id': 1,
            'nombre': 'Animales',
            'contenido': 'Aprende vocabulario sobre animales comunes en Náhuatl.',
            'dificultad': 'principiante',
            'tema': 'animales'
        },
        {
            '_id': 2,
            'nombre': 'Comida',
            'contenido': 'Conoce palabras relacionadas con alimentos y bebidas tradicionales.',
            'dificultad': 'intermedio',
            'tema': 'commida'
        },
        {
            '_id': 3,
            'nombre': 'Cosas',
            'contenido': 'Vocabulario básico para objetos cotidianos en Náhuatl.',
            'dificultad': 'avanzado',
            'tema': 'cosas'
        }
    ]

    print('🌱 Poblando base de datos con niveles de Náhuatl...\n')

    creados = 0
    existentes = 0

    db = get_db()

    for nivel_data in niveles_data:
        nivel_existente = db.niveles.find_one({'_id': nivel_data['_id']})

        if nivel_existente:
            print(f'⚠️  Nivel {nivel_data["_id"]} ya existe: {nivel_data["nombre"]}')
            existentes += 1
            continue

        nivel = Nivel(
            _id=nivel_data['_id'],
            nombre=nivel_data['nombre'],
            contenido=nivel_data['contenido'],
            dificultad=nivel_data['dificultad'],
            tema=nivel_data['tema']
        )

        nivel.save()
        print(f'✅ Nivel {nivel._id} creado: {nivel.nombre}')
        creados += 1

    print('\n📊 Resumen:')
    print(f'   Creados: {creados}')
    print(f'   Ya existían: {existentes}')
    print('\n🎉 ¡Niveles cargados exitosamente!\n')


if __name__ == '__main__':
    try:
        crear_niveles()
    except Exception as e:
        print(f'\n❌ Error: {e}\n')
