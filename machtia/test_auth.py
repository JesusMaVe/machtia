#!/usr/bin/env python
"""
Script de testing para endpoints de autenticación.

Este script prueba:
1. Registro de usuario
2. Login
3. Obtener perfil (endpoint protegido)
4. Actualizar perfil (endpoint protegido)
5. Logout
6. Validaciones (email inválido, contraseña corta, etc.)

Uso:
    python test_auth.py
"""

import requests
import json
from datetime import datetime


BASE_URL = "http://localhost:8000/api/auth"
HEADERS = {"Content-Type": "application/json"}


def print_separator():
    """Imprime una línea separadora"""
    print("\n" + "=" * 70)


def print_test_header(test_name):
    """Imprime el encabezado de un test"""
    print_separator()
    print(f"TEST: {test_name}")
    print_separator()


def print_response(response):
    """Imprime la respuesta de una petición HTTP"""
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        return data
    except:
        print(f"Response: {response.text}")
        return None


def test_register():
    """Prueba el endpoint de registro"""
    print_test_header("Registro de Usuario")

    # Generar email único usando timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    email = f"test_{timestamp}@nahuatl.com"

    data = {
        "email": email,
        "nombre": "Usuario de Prueba",
        "password": "password123"
    }

    print(f"POST {BASE_URL}/register/")
    print(f"Body: {json.dumps(data, indent=2)}\n")

    response = requests.post(f"{BASE_URL}/register/", json=data, headers=HEADERS)
    result = print_response(response)

    if response.status_code == 201 and result:
        print("\n✅ Registro exitoso")
        return result.get('user'), result.get('token')
    else:
        print("\n❌ Error en registro")
        return None, None


def test_register_validations():
    """Prueba las validaciones del endpoint de registro"""
    print_test_header("Validaciones de Registro")

    # Test 1: Email duplicado
    print("\n--- Test 1: Email duplicado ---")
    data = {
        "email": "admin@nahuatl.com",  # Email que ya existe
        "nombre": "Otro Usuario",
        "password": "password123"
    }
    print(f"POST {BASE_URL}/register/")
    response = requests.post(f"{BASE_URL}/register/", json=data, headers=HEADERS)
    print_response(response)
    print("✅ Validación de email duplicado" if response.status_code == 400 else "❌ Fallo")

    # Test 2: Contraseña corta
    print("\n--- Test 2: Contraseña corta ---")
    data = {
        "email": "nuevo@test.com",
        "nombre": "Usuario Nuevo",
        "password": "12345"  # Menos de 6 caracteres
    }
    print(f"POST {BASE_URL}/register/")
    response = requests.post(f"{BASE_URL}/register/", json=data, headers=HEADERS)
    print_response(response)
    print("✅ Validación de contraseña corta" if response.status_code == 400 else "❌ Fallo")

    # Test 3: Email inválido
    print("\n--- Test 3: Email inválido ---")
    data = {
        "email": "email-invalido",
        "nombre": "Usuario Nuevo",
        "password": "password123"
    }
    print(f"POST {BASE_URL}/register/")
    response = requests.post(f"{BASE_URL}/register/", json=data, headers=HEADERS)
    print_response(response)
    print("✅ Validación de formato de email" if response.status_code == 400 else "❌ Fallo")


def test_login(email, password):
    """Prueba el endpoint de login"""
    print_test_header("Login de Usuario")

    data = {
        "email": email,
        "password": password
    }

    print(f"POST {BASE_URL}/login/")
    print(f"Body: {json.dumps(data, indent=2)}\n")

    response = requests.post(f"{BASE_URL}/login/", json=data, headers=HEADERS)
    result = print_response(response)

    if response.status_code == 200 and result:
        print("\n✅ Login exitoso")
        return result.get('token')
    else:
        print("\n❌ Error en login")
        return None


def test_login_invalid_credentials():
    """Prueba login con credenciales inválidas"""
    print_test_header("Login con Credenciales Inválidas")

    data = {
        "email": "noexiste@test.com",
        "password": "wrongpassword"
    }

    print(f"POST {BASE_URL}/login/")
    print(f"Body: {json.dumps(data, indent=2)}\n")

    response = requests.post(f"{BASE_URL}/login/", json=data, headers=HEADERS)
    print_response(response)

    if response.status_code == 401:
        print("\n✅ Validación de credenciales inválidas correcta")
    else:
        print("\n❌ Debería retornar 401")


def test_me(token):
    """Prueba el endpoint de perfil (protegido)"""
    print_test_header("Obtener Perfil de Usuario (Endpoint Protegido)")

    headers = {
        **HEADERS,
        "Authorization": f"Bearer {token['access_token']}"
    }

    print(f"GET {BASE_URL}/me/")
    print(f"Headers: Authorization: Bearer {token['access_token'][:20]}...\n")

    response = requests.get(f"{BASE_URL}/me/", headers=headers)
    result = print_response(response)

    if response.status_code == 200:
        print("\n✅ Obtención de perfil exitosa")
        return True
    else:
        print("\n❌ Error al obtener perfil")
        return False


def test_me_without_token():
    """Prueba acceder a endpoint protegido sin token"""
    print_test_header("Acceso sin Token (Debe Fallar)")

    print(f"GET {BASE_URL}/me/")
    print("Headers: (sin Authorization)\n")

    response = requests.get(f"{BASE_URL}/me/", headers=HEADERS)
    print_response(response)

    if response.status_code == 401:
        print("\n✅ Protección de endpoint correcta (401 sin token)")
    else:
        print("\n❌ Debería retornar 401")


def test_update_profile(token):
    """Prueba actualizar el perfil"""
    print_test_header("Actualizar Perfil de Usuario")

    headers = {
        **HEADERS,
        "Authorization": f"Bearer {token['access_token']}"
    }

    data = {
        "nombre": "Nombre Actualizado"
    }

    print(f"PUT {BASE_URL}/me/update/")
    print(f"Body: {json.dumps(data, indent=2)}\n")

    response = requests.put(f"{BASE_URL}/me/update/", json=data, headers=headers)
    result = print_response(response)

    if response.status_code == 200:
        print("\n✅ Actualización de perfil exitosa")
        return True
    else:
        print("\n❌ Error al actualizar perfil")
        return False


def test_logout(token):
    """Prueba el endpoint de logout"""
    print_test_header("Logout de Usuario")

    headers = {
        **HEADERS,
        "Authorization": f"Bearer {token['access_token']}"
    }

    print(f"POST {BASE_URL}/logout/")
    print(f"Headers: Authorization: Bearer {token['access_token'][:20]}...\n")

    response = requests.post(f"{BASE_URL}/logout/", headers=headers)
    print_response(response)

    if response.status_code == 200:
        print("\n✅ Logout exitoso")
        return True
    else:
        print("\n❌ Error en logout")
        return False


def main():
    """Función principal que ejecuta todos los tests"""
    print("\n" + "=" * 70)
    print("🧪 SCRIPT DE TESTING - AUTENTICACIÓN JWT")
    print("=" * 70)

    resultados = []

    try:
        # Test 1: Registro
        user, token = test_register()
        resultados.append(("Registro de usuario", user is not None and token is not None))

        if not user or not token:
            print("\n⚠️  Error en registro, no se pueden ejecutar los siguientes tests")
            return

        email = user['email']
        password = "password123"  # La contraseña que usamos en el registro

        # Test 2: Validaciones de registro
        test_register_validations()

        # Test 3: Login
        token = test_login(email, password)
        resultados.append(("Login de usuario", token is not None))

        if not token:
            print("\n⚠️  Error en login, no se pueden ejecutar los siguientes tests")
            return

        # Test 4: Login con credenciales inválidas
        test_login_invalid_credentials()

        # Test 5: Acceso sin token (debe fallar)
        test_me_without_token()

        # Test 6: Obtener perfil (protegido)
        success = test_me(token)
        resultados.append(("Obtener perfil", success))

        # Test 7: Actualizar perfil
        success = test_update_profile(token)
        resultados.append(("Actualizar perfil", success))

        # Test 8: Logout
        success = test_logout(token)
        resultados.append(("Logout", success))

    except requests.exceptions.ConnectionError:
        print("\n❌ Error: No se puede conectar al servidor")
        print("Asegúrate de que el servidor Django esté corriendo:")
        print("  python manage.py runserver")
        return

    except Exception as e:
        print(f"\n❌ Error inesperado: {str(e)}")
        return

    # Mostrar resumen
    print_separator()
    print("📋 RESUMEN DE PRUEBAS")
    print_separator()

    passed = 0
    failed = 0

    for nombre, resultado in resultados:
        if resultado:
            print(f"✅ {nombre}")
            passed += 1
        else:
            print(f"❌ {nombre}")
            failed += 1

    print(f"\n🎯 Total: {passed} exitosas, {failed} fallidas")

    if failed == 0:
        print("\n🎉 ¡Todas las pruebas pasaron exitosamente!")
        print("✅ El sistema de autenticación JWT está funcionando correctamente")
    else:
        print("\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.")

    print_separator()


if __name__ == '__main__':
    main()
