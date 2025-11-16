#!/usr/bin/env python3
"""
Script de verificación de correcciones de seguridad.

Este script verifica que todas las correcciones de seguridad
hayan sido implementadas correctamente.

Uso:
    python verificar_correcciones.py
"""
import os
import sys
from pathlib import Path


def verificar_debug_mode():
    """Verifica que DEBUG esté en False."""
    print("\n1. Verificando DEBUG mode...")

    env_path = Path('.env')
    if not env_path.exists():
        print("   ❌ Archivo .env no encontrado")
        return False

    with open(env_path, 'r') as f:
        contenido = f.read()

    if 'DEBUG=False' in contenido:
        print("   ✅ DEBUG=False configurado correctamente")
        return True
    elif 'DEBUG=True' in contenido:
        print("   ❌ DEBUG=True (INSEGURO - debe ser False)")
        return False
    else:
        print("   ⚠️  DEBUG no encontrado en .env")
        return False


def verificar_sanitizacion():
    """Verifica que los archivos de sanitización existan."""
    print("\n2. Verificando funciones de sanitización...")

    security_utils = Path('apps/autenticacion/security_utils.py')
    if not security_utils.exists():
        print("   ❌ security_utils.py no encontrado")
        return False

    with open(security_utils, 'r') as f:
        contenido = f.read()

    funciones_requeridas = [
        'sanitizar_email',
        'sanitizar_input_mongo',
        'sanitizar_query_params',
        'sanitizar_user_id',
        'validar_password_input'
    ]

    faltantes = []
    for funcion in funciones_requeridas:
        if f'def {funcion}' not in contenido:
            faltantes.append(funcion)

    if faltantes:
        print(f"   ❌ Funciones faltantes: {', '.join(faltantes)}")
        return False

    print("   ✅ Todas las funciones de sanitización implementadas")
    return True


def verificar_rbac():
    """Verifica que el sistema RBAC esté implementado."""
    print("\n3. Verificando sistema RBAC...")

    # Verificar modelo Usuario
    models_path = Path('apps/autenticacion/models.py')
    if not models_path.exists():
        print("   ❌ models.py no encontrado")
        return False

    with open(models_path, 'r') as f:
        models_contenido = f.read()

    if 'rol = StringField' not in models_contenido:
        print("   ❌ Campo 'rol' no encontrado en modelo Usuario")
        return False

    # Verificar decorador require_role
    utils_path = Path('apps/autenticacion/utils.py')
    if not utils_path.exists():
        print("   ❌ utils.py no encontrado")
        return False

    with open(utils_path, 'r') as f:
        utils_contenido = f.read()

    if 'def require_role' not in utils_contenido:
        print("   ❌ Decorador require_role no encontrado")
        return False

    # Verificar uso en lecciones
    lecciones_path = Path('apps/lecciones/views.py')
    if not lecciones_path.exists():
        print("   ❌ lecciones/views.py no encontrado")
        return False

    with open(lecciones_path, 'r') as f:
        lecciones_contenido = f.read()

    if '@require_role' not in lecciones_contenido:
        print("   ❌ @require_role no usado en lecciones")
        return False

    print("   ✅ Sistema RBAC implementado correctamente")
    return True


def verificar_credenciales():
    """Verifica que las credenciales MongoDB sean seguras."""
    print("\n4. Verificando credenciales MongoDB...")

    env_path = Path('.env')
    if not env_path.exists():
        print("   ❌ Archivo .env no encontrado")
        return False

    with open(env_path, 'r') as f:
        contenido = f.read()

    # Verificar que NO use credenciales predecibles
    if 'nahuatl_user:nahuatl_pass' in contenido:
        print("   ❌ Credenciales predecibles detectadas (INSEGURO)")
        return False

    # Verificar que tenga MONGODB_URI configurado
    if 'MONGODB_URI=' not in contenido:
        print("   ❌ MONGODB_URI no configurado")
        return False

    # Verificar longitud de password
    lines = contenido.split('\n')
    for line in lines:
        if line.startswith('MONGODB_URI='):
            uri = line.split('MONGODB_URI=')[1]
            # Extraer password del URI
            if '://' in uri and '@' in uri:
                creds = uri.split('://')[1].split('@')[0]
                if ':' in creds:
                    password = creds.split(':')[1]
                    if len(password) < 32:
                        print(f"   ⚠️  Password corto ({len(password)} chars, recomendado 32+)")
                        return False

    # Verificar que generate_credentials.py exista
    gen_script = Path('generate_credentials.py')
    if not gen_script.exists():
        print("   ⚠️  Script generate_credentials.py no encontrado")
        return False

    print("   ✅ Credenciales MongoDB seguras configuradas")
    return True


def verificar_blacklist():
    """Verifica que el sistema de blacklist esté implementado."""
    print("\n5. Verificando sistema de blacklist JWT...")

    blacklist_path = Path('apps/autenticacion/blacklist_models.py')
    if not blacklist_path.exists():
        print("   ❌ blacklist_models.py no encontrado")
        return False

    with open(blacklist_path, 'r') as f:
        blacklist_contenido = f.read()

    if 'class TokenBlacklist' not in blacklist_contenido:
        print("   ❌ Clase TokenBlacklist no encontrada")
        return False

    # Verificar métodos importantes
    metodos_requeridos = ['agregar_token', 'esta_revocado', 'limpiar_expirados']
    faltantes = []
    for metodo in metodos_requeridos:
        if f'def {metodo}' not in blacklist_contenido:
            faltantes.append(metodo)

    if faltantes:
        print(f"   ❌ Métodos faltantes: {', '.join(faltantes)}")
        return False

    # Verificar que generar_token incluya jti
    utils_path = Path('apps/autenticacion/utils.py')
    with open(utils_path, 'r') as f:
        utils_contenido = f.read()

    if "'jti':" not in utils_contenido and '"jti":' not in utils_contenido:
        print("   ❌ Token no incluye 'jti'")
        return False

    # Verificar que verificar_token valide blacklist
    if 'TokenBlacklist.esta_revocado' not in utils_contenido:
        print("   ❌ verificar_token no valida contra blacklist")
        return False

    print("   ✅ Sistema de blacklist JWT implementado correctamente")
    return True


def verificar_settings():
    """Verifica configuraciones de seguridad en settings.py."""
    print("\n6. Verificando settings.py...")

    settings_path = Path('config/settings.py')
    if not settings_path.exists():
        print("   ❌ settings.py no encontrado")
        return False

    with open(settings_path, 'r') as f:
        contenido = f.read()

    # Verificar que no tenga fallback inseguro de MONGODB_URI
    if 'mongodb://nahuatl_user:nahuatl_pass' in contenido:
        print("   ❌ Fallback inseguro de credenciales detectado")
        return False

    # Verificar que valide MONGODB_URI
    if 'raise ValueError' not in contenido or 'MONGODB_URI' not in contenido:
        print("   ⚠️  Validación de MONGODB_URI puede estar faltante")
        return False

    print("   ✅ Settings.py configurado correctamente")
    return True


def main():
    """Ejecuta todas las verificaciones."""
    print("=" * 80)
    print("VERIFICACIÓN DE CORRECCIONES DE SEGURIDAD")
    print("=" * 80)

    # Cambiar al directorio del proyecto
    script_dir = Path(__file__).parent
    os.chdir(script_dir)

    verificaciones = [
        verificar_debug_mode,
        verificar_sanitizacion,
        verificar_rbac,
        verificar_credenciales,
        verificar_blacklist,
        verificar_settings
    ]

    resultados = []
    for verificacion in verificaciones:
        try:
            resultado = verificacion()
            resultados.append(resultado)
        except Exception as e:
            print(f"   ❌ Error en verificación: {str(e)}")
            resultados.append(False)

    # Resumen
    print("\n" + "=" * 80)
    print("RESUMEN DE VERIFICACIÓN")
    print("=" * 80)

    total = len(resultados)
    exitosos = sum(resultados)

    print(f"\nVerificaciones exitosas: {exitosos}/{total}")

    if exitosos == total:
        print("\n✅ TODAS LAS CORRECCIONES IMPLEMENTADAS CORRECTAMENTE")
        print("\nPróximos pasos:")
        print("1. Crear usuario MongoDB con las nuevas credenciales")
        print("2. Actualizar usuarios existentes con campo 'rol'")
        print("3. Reiniciar servidor Django")
        print("4. Ejecutar pruebas de validación")
        return 0
    else:
        print(f"\n❌ {total - exitosos} VERIFICACIONES FALLARON")
        print("\nRevisar el archivo CORRECCIONES_SEGURIDAD.md para más detalles.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
