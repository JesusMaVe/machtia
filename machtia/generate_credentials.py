#!/usr/bin/env python3
"""
Script para generar credenciales seguras para MongoDB.

SEGURIDAD CRÍTICA: Este script genera passwords criptográficamente seguros
para reemplazar las credenciales predecibles por defecto.

Uso:
    python generate_credentials.py

El script generará:
- Usuario de MongoDB
- Password de MongoDB (32+ caracteres, alta entropía)
- URI completa de conexión

Las credenciales deben copiarse manualmente al archivo .env
"""
import secrets
import string


def generar_password_seguro(longitud=32):
    """
    Genera un password criptográficamente seguro.

    Args:
        longitud (int): Longitud del password (mínimo 32 caracteres)

    Returns:
        str: Password aleatorio con alta entropía

    Características de seguridad:
    - Usa secrets.choice() (fuente criptográficamente segura)
    - Incluye mayúsculas, minúsculas, dígitos y símbolos
    - Longitud mínima de 32 caracteres
    - 256 bits de entropía aproximadamente
    """
    if longitud < 32:
        longitud = 32

    # Caracteres permitidos (excluyendo ambiguos: O, 0, I, l, 1)
    letras_mayusculas = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    letras_minusculas = 'abcdefghijkmnopqrstuvwxyz'
    digitos = '23456789'
    simbolos = '!@#$%^&*()-_=+[]{}|;:,.<>?'

    # Combinar todos los caracteres
    todos_caracteres = letras_mayusculas + letras_minusculas + digitos + simbolos

    # Generar password asegurando al menos uno de cada tipo
    password = [
        secrets.choice(letras_mayusculas),
        secrets.choice(letras_minusculas),
        secrets.choice(digitos),
        secrets.choice(simbolos),
    ]

    # Rellenar el resto con caracteres aleatorios
    password += [secrets.choice(todos_caracteres) for _ in range(longitud - 4)]

    # Mezclar para evitar patrones predecibles
    secrets.SystemRandom().shuffle(password)

    return ''.join(password)


def generar_usuario_seguro(prefijo='nahuatl'):
    """
    Genera un nombre de usuario aleatorio.

    Args:
        prefijo (str): Prefijo para el usuario

    Returns:
        str: Nombre de usuario con sufijo aleatorio
    """
    sufijo = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(8))
    return f"{prefijo}_user_{sufijo}"


def main():
    """Genera y muestra credenciales seguras para MongoDB."""
    print("=" * 80)
    print("GENERADOR DE CREDENCIALES SEGURAS PARA MONGODB")
    print("=" * 80)
    print()

    # Generar credenciales
    usuario = generar_usuario_seguro()
    password = generar_password_seguro(longitud=40)
    database = "nahuatl_db"
    host = "localhost"
    puerto = "27017"

    # Mostrar credenciales
    print("CREDENCIALES GENERADAS:")
    print("-" * 80)
    print(f"Usuario:   {usuario}")
    print(f"Password:  {password}")
    print(f"Database:  {database}")
    print()

    # Generar URI de conexión
    mongodb_uri = f"mongodb://{usuario}:{password}@{host}:{puerto}/{database}"

    print("URI DE CONEXIÓN MONGODB:")
    print("-" * 80)
    print(mongodb_uri)
    print()

    # Instrucciones
    print("INSTRUCCIONES:")
    print("-" * 80)
    print("1. Copia el URI de conexión de arriba")
    print("2. Abre el archivo .env en tu editor")
    print("3. Reemplaza la línea MONGODB_URI con:")
    print(f"   MONGODB_URI={mongodb_uri}")
    print()
    print("4. IMPORTANTE: Debes crear este usuario en MongoDB antes de usarlo.")
    print("   Ejecuta estos comandos en la consola de MongoDB:")
    print()
    print(f"   docker exec -it nahuatl_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin")
    print()
    print("   Luego dentro de mongosh:")
    print()
    print(f"   use {database}")
    print(f"   db.createUser({{")
    print(f"     user: '{usuario}',")
    print(f"     pwd: '{password}',")
    print(f"     roles: [{{")
    print(f"       role: 'readWrite',")
    print(f"       db: '{database}'")
    print(f"     }}]")
    print(f"   }})")
    print()
    print("5. Reinicia el servidor Django después de actualizar el .env")
    print()

    # Advertencias de seguridad
    print("ADVERTENCIAS DE SEGURIDAD:")
    print("-" * 80)
    print("- NUNCA compartas estas credenciales públicamente")
    print("- NUNCA las commits a Git (el archivo .env ya está en .gitignore)")
    print("- Cambia las credenciales si sospechas que fueron comprometidas")
    print("- En producción, usa variables de entorno del sistema, no archivos .env")
    print("=" * 80)


if __name__ == "__main__":
    main()
