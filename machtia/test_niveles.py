"""
Script para probar los endpoints de niveles y su integración con lecciones

Uso:
    python test_niveles.py
"""
import requests
import json

# Configuración
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

# Variables globales para almacenar datos de prueba
token = None
usuario_id = None
nivel_id = None


def print_header(text):
    """Imprime un encabezado decorado"""
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)


def print_success(text):
    """Imprime mensaje de éxito"""
    print(f"✅ {text}")


def print_error(text):
    """Imprime mensaje de error"""
    print(f"❌ {text}")


def print_info(text):
    """Imprime mensaje informativo"""
    print(f"ℹ️  {text}")


def test_crear_usuario():
    """Test: Crear un usuario para las pruebas"""
    global token, usuario_id

    print_header("TEST 1: Crear Usuario de Prueba")

    url = f"{API_URL}/auth/register/"
    data = {
        "email": "test_niveles@test.com",
        "nombre": "Usuario Test Niveles",
        "password": "password123"
    }

    response = requests.post(url, json=data)

    if response.status_code in [200, 201]:
        result = response.json()
        token = result.get('token')
        usuario_id = result.get('usuario', {}).get('id')
        print_success(f"Usuario creado exitosamente")
        print_info(f"Token: {token[:20]}...")
        print_info(f"Usuario ID: {usuario_id}")
        return True
    else:
        print_error(f"Error al crear usuario: {response.status_code}")
        print(response.text)
        return False


def test_listar_niveles_sin_auth():
    """Test: Listar niveles sin autenticación"""
    print_header("TEST 2: Listar Niveles (Sin Autenticación)")

    url = f"{API_URL}/niveles/"
    response = requests.get(url)

    if response.status_code == 200:
        niveles = response.json()
        print_success(f"Niveles obtenidos: {len(niveles)}")
        for nivel in niveles[:3]:  # Mostrar solo primeros 3
            print(f"   - Nivel {nivel['numero']}: {nivel['titulo']} ({nivel['dificultad']})")
        return True
    else:
        print_error(f"Error al listar niveles: {response.status_code}")
        return False


def test_listar_niveles_con_auth():
    """Test: Listar niveles con autenticación"""
    global token

    print_header("TEST 3: Listar Niveles (Con Autenticación)")

    url = f"{API_URL}/niveles/"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        niveles = response.json()
        print_success(f"Niveles obtenidos con estado de usuario")
        for nivel in niveles[:3]:
            bloqueado = "🔒 Bloqueado" if nivel.get('bloqueado') else "✓ Disponible"
            completado = "✓ Completado" if nivel.get('completado') else "Pendiente"
            print(f"   - Nivel {nivel['numero']}: {nivel['titulo']}")
            print(f"     Estado: {bloqueado} | {completado}")
        return True
    else:
        print_error(f"Error al listar niveles: {response.status_code}")
        return False


def test_obtener_nivel_especifico():
    """Test: Obtener un nivel específico"""
    global token

    print_header("TEST 4: Obtener Nivel Específico")

    # Intentar obtener nivel 1
    url = f"{API_URL}/niveles/1/"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        nivel = response.json()
        print_success("Nivel obtenido correctamente")
        print(f"   ID: {nivel['id']}")
        print(f"   Título: {nivel['titulo']}")
        print(f"   Tema: {nivel['tema']}")
        print(f"   Dificultad: {nivel['dificultad']}")
        print(f"   Bloqueado: {nivel.get('bloqueado', False)}")
        print(f"   Completado: {nivel.get('completado', False)}")
        return True
    else:
        print_error(f"Error al obtener nivel: {response.status_code}")
        return False


def test_filtrar_niveles_por_dificultad():
    """Test: Filtrar niveles por dificultad"""
    print_header("TEST 5: Filtrar Niveles por Dificultad")

    dificultades = ['principiante', 'intermedio', 'avanzado']

    for dificultad in dificultades:
        url = f"{API_URL}/niveles/?dificultad={dificultad}"
        response = requests.get(url)

        if response.status_code == 200:
            niveles = response.json()
            print_success(f"Dificultad '{dificultad}': {len(niveles)} niveles")
        else:
            print_error(f"Error al filtrar por {dificultad}")
            return False

    return True


def test_crear_nivel():
    """Test: Crear un nuevo nivel"""
    global token, nivel_id

    print_header("TEST 6: Crear Nuevo Nivel")

    url = f"{API_URL}/niveles/crear/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "nombre": "Nivel de Prueba",
        "tema": "test",
        "dificultad": "principiante",
        "contenido": "Este es un nivel creado para pruebas automáticas"
    }

    response = requests.post(url, json=data, headers=headers)

    if response.status_code in [200, 201]:
        result = response.json()
        nivel_id = result.get('nivel', {}).get('numero')
        print_success("Nivel creado exitosamente")
        print_info(f"ID del nivel creado: {nivel_id}")
        return True
    else:
        print_error(f"Error al crear nivel: {response.status_code}")
        print(response.text)
        return False


def test_obtener_lecciones_de_nivel():
    """Test: Obtener lecciones de un nivel"""
    global token

    print_header("TEST 7: Obtener Lecciones de un Nivel")

    # Probar con nivel 1
    url = f"{API_URL}/niveles/1/lecciones/"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        result = response.json()
        nivel = result.get('nivel', {})
        lecciones = result.get('lecciones', [])
        total = result.get('total_lecciones', 0)

        print_success(f"Nivel: {nivel.get('titulo')}")
        print_info(f"Total de lecciones: {total}")

        if lecciones:
            print_info("Lecciones:")
            for leccion in lecciones[:5]:  # Mostrar solo primeras 5
                print(f"   - Lección {leccion.get('id')}: {leccion.get('nombre')}")
        else:
            print_info("Este nivel aún no tiene lecciones asociadas")

        return True
    else:
        print_error(f"Error al obtener lecciones del nivel: {response.status_code}")
        print(response.text)
        return False


def test_filtrar_lecciones_por_nivel():
    """Test: Filtrar lecciones usando el parámetro nivel_id"""
    print_header("TEST 8: Filtrar Lecciones por Nivel")

    url = f"{API_URL}/lecciones/?nivel_id=1"
    response = requests.get(url)

    if response.status_code == 200:
        lecciones = response.json()
        print_success(f"Lecciones del nivel 1: {len(lecciones)}")
        for leccion in lecciones[:3]:
            print(f"   - {leccion.get('nombre')} (Tema: {leccion.get('tema')})")
        return True
    else:
        print_error(f"Error al filtrar lecciones: {response.status_code}")
        return False


def test_actualizar_nivel():
    """Test: Actualizar un nivel existente"""
    global token, nivel_id

    if not nivel_id:
        print_info("Saltando test de actualización (no hay nivel creado)")
        return True

    print_header("TEST 9: Actualizar Nivel")

    url = f"{API_URL}/niveles/{nivel_id}/actualizar/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "contenido": "Contenido actualizado mediante test automático"
    }

    response = requests.put(url, json=data, headers=headers)

    if response.status_code == 200:
        print_success("Nivel actualizado exitosamente")
        return True
    else:
        print_error(f"Error al actualizar nivel: {response.status_code}")
        return False


def test_eliminar_nivel():
    """Test: Eliminar un nivel"""
    global token, nivel_id

    if not nivel_id:
        print_info("Saltando test de eliminación (no hay nivel creado)")
        return True

    print_header("TEST 10: Eliminar Nivel")

    url = f"{API_URL}/niveles/{nivel_id}/eliminar/"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.delete(url, headers=headers)

    if response.status_code == 200:
        print_success("Nivel eliminado exitosamente")
        return True
    else:
        print_error(f"Error al eliminar nivel: {response.status_code}")
        return False


def run_all_tests():
    """Ejecuta todos los tests"""
    print("\n" + "🚀 " * 20)
    print("  INICIANDO TESTS DE NIVELES")
    print("🚀 " * 20)

    tests = [
        ("Crear Usuario", test_crear_usuario),
        ("Listar Niveles Sin Auth", test_listar_niveles_sin_auth),
        ("Listar Niveles Con Auth", test_listar_niveles_con_auth),
        ("Obtener Nivel Específico", test_obtener_nivel_especifico),
        ("Filtrar por Dificultad", test_filtrar_niveles_por_dificultad),
        ("Crear Nivel", test_crear_nivel),
        ("Obtener Lecciones de Nivel", test_obtener_lecciones_de_nivel),
        ("Filtrar Lecciones por Nivel", test_filtrar_lecciones_por_nivel),
        ("Actualizar Nivel", test_actualizar_nivel),
        ("Eliminar Nivel", test_eliminar_nivel),
    ]

    passed = 0
    failed = 0

    for name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print_error(f"Excepción en {name}: {str(e)}")
            failed += 1

    # Resumen
    print_header("RESUMEN DE TESTS")
    print(f"   ✅ Pasados: {passed}")
    print(f"   ❌ Fallidos: {failed}")
    print(f"   📊 Total: {passed + failed}")

    if failed == 0:
        print("\n🎉 ¡Todos los tests pasaron exitosamente! 🎉\n")
    else:
        print(f"\n⚠️  {failed} test(s) fallaron. Revisa los errores arriba.\n")


if __name__ == '__main__':
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrumpidos por el usuario\n")
    except Exception as e:
        print(f"\n\n❌ Error fatal: {e}\n")
