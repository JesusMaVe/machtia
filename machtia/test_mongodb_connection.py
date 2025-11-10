#!/usr/bin/env python
"""
Script de testing para verificar la conexión a MongoDB.

Este script:
1. Verifica la conexión a MongoDB
2. Muestra las colecciones disponibles
3. Crea un usuario de prueba
4. Lista los usuarios existentes
5. Crea una lección de prueba
6. Lista las lecciones existentes

Uso:
    python test_mongodb_connection.py
"""

import os
import sys
import django
from pathlib import Path

# Agregar el directorio raíz al path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from mongoengine.connection import get_db
from apps.autenticacion.models import Usuario
from apps.lecciones.models import Leccion, Palabra


def print_separator():
    """Imprime una línea separadora"""
    print("\n" + "=" * 70)


def test_connection():
    """Prueba la conexión a MongoDB"""
    print_separator()
    print("PRUEBA 1: Verificar conexión a MongoDB")
    print_separator()

    try:
        db = get_db()
        print(f"Conexión exitosa a la base de datos: {db.name}")

        collections = db.list_collection_names()
        print(f"Colecciones disponibles: {collections}")

        return True
    except Exception as e:
        print(f"Error al conectar: {str(e)}")
        return False


def test_create_user():
    """Crea un usuario de prueba"""
    print_separator()
    print("PRUEBA 2: Crear usuario de prueba")
    print_separator()

    try:
        # Eliminar usuario de prueba si existe
        Usuario.objects(email="test@nahuatl.com").delete()

        # Crear usuario
        usuario = Usuario(
            email="test@nahuatl.com",
            nombre="Usuario Prueba"
        )
        usuario.set_password("password123")
        usuario.save()

        print(f"Usuario creado exitosamente:")
        print(f"   ID: {usuario.id}")
        print(f"   Email: {usuario.email}")
        print(f"   Nombre: {usuario.nombre}")
        print(f"   Tomins: {usuario.tomin}")
        print(f"   Vidas: {usuario.vidas}")
        print(f"   Lección actual: {usuario.leccionActual}")

        # Verificar password
        if usuario.check_password("password123"):
            print("Verificación de password correcta")
        else:
            print("Error en verificación de password")

        return True
    except Exception as e:
        print(f"Error al crear usuario: {str(e)}")
        return False


def test_list_users():
    """Lista todos los usuarios"""
    print_separator()
    print("PRUEBA 3: Listar usuarios")
    print_separator()

    try:
        usuarios = Usuario.objects.all()
        count = usuarios.count()

        print(f"Total de usuarios: {count}")

        for usuario in usuarios:
            print(f"\n   • {usuario.nombre} ({usuario.email})")
            print(f"     Tomins: {usuario.tomin} | Vidas: {usuario.vidas} | Lección: {usuario.leccionActual}")

        return True
    except Exception as e:
        print(f"Error al listar usuarios: {str(e)}")
        return False


def test_create_leccion():
    """Crea una lección de prueba"""
    print_separator()
    print("PRUEBA 4: Crear lección de prueba")
    print_separator()

    try:
        # Eliminar lección de prueba si existe
        Leccion.objects(_id=999).delete()

        # Crear lección
        leccion = Leccion(
            _id=999,
            nombre="Lección de Prueba: Saludos",
            tema="saludos",
            dificultad="principiante",
            contenido="Aprende a saludar en náhuatl",
            tominsAlCompletar=5
        )

        # Agregar palabras
        leccion.agregar_palabra("Niltze", "Hola")
        leccion.agregar_palabra("Tlenón ticpiya?", "¿Cómo estás?")
        leccion.agregar_palabra("Cualli", "Bien")

        print(f"Lección creada exitosamente:")
        print(f"   ID: {leccion._id}")
        print(f"   Nombre: {leccion.nombre}")
        print(f"   Tema: {leccion.tema}")
        print(f"   Dificultad: {leccion.dificultad}")
        print(f"   Palabras: {leccion.cantidad_palabras()}")
        print(f"   Tomins al completar: {leccion.tominsAlCompletar}")

        print("\n   Palabras en la lección:")
        for palabra in leccion.palabras:
            print(f"   • {palabra.palabra_nahuatl} - {palabra.español}")

        return True
    except Exception as e:
        print(f"Error al crear lección: {str(e)}")
        return False


def test_list_lecciones():
    """Lista todas las lecciones"""
    print_separator()
    print("PRUEBA 5: Listar lecciones")
    print_separator()

    try:
        lecciones = Leccion.objects.all()
        count = lecciones.count()

        print(f"Total de lecciones: {count}")

        for leccion in lecciones:
            print(f"\n   • Lección {leccion._id}: {leccion.nombre}")
            print(f"     Tema: {leccion.tema} | Dificultad: {leccion.dificultad}")
            print(f"     Palabras: {leccion.cantidad_palabras()} | Tomins: {leccion.tominsAlCompletar}")

        return True
    except Exception as e:
        print(f"Error al listar lecciones: {str(e)}")
        return False


def main():
    """Función principal que ejecuta todas las pruebas"""
    print("\n" + "=" * 70)
    print("SCRIPT DE TESTING - CONEXIÓN MONGODB")
    print("=" * 70)

    # Ejecutar pruebas
    resultados = []

    resultados.append(("Conexión a MongoDB", test_connection()))
    resultados.append(("Crear usuario", test_create_user()))
    resultados.append(("Listar usuarios", test_list_users()))
    resultados.append(("Crear lección", test_create_leccion()))
    resultados.append(("Listar lecciones", test_list_lecciones()))

    # Mostrar resumen
    print_separator()
    print("RESUMEN DE PRUEBAS")
    print_separator()

    passed = 0
    failed = 0

    for nombre, resultado in resultados:
        if resultado:
            print(f"{nombre}")
            passed += 1
        else:
            print(f"{nombre}")
            failed += 1

    print(f"\nTotal: {passed} exitosas, {failed} fallidas")

    if failed == 0:
        print("\n¡Todas las pruebas pasaron exitosamente!")
        print("La conexión Django-MongoDB está funcionando correctamente")
    else:
        print("\nAlgunas pruebas fallaron. Revisa los errores arriba.")

    print_separator()


if __name__ == '__main__':
    main()
