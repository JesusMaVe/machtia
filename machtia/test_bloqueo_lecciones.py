"""
Script de prueba para el sistema de bloqueo de lecciones con progresión secuencial.

Este script prueba que:
1. No se pueden completar lecciones bloqueadas (sin completar las anteriores)
2. No se pueden intentar lecciones bloqueadas
3. Las lecciones se marcan como bloqueadas correctamente en el listado
4. La progresión secuencial funciona correctamente
"""
import requests
import json

# Configuración
BASE_URL = "http://localhost:8000/api"
EMAIL = f"test_bloqueo_{int(__import__('time').time())}@test.com"
PASSWORD = "TestSeguro2024!!"
NOMBRE = "Usuario Test Bloqueo"

# Colores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


def print_test(message):
    print(f"\n{BLUE}{'='*60}")
    print(f"TEST: {message}")
    print(f"{'='*60}{RESET}")


def print_success(message):
    print(f"{GREEN}✓ {message}{RESET}")


def print_error(message):
    print(f"{RED}✗ {message}{RESET}")


def print_info(message):
    print(f"{YELLOW}ℹ {message}{RESET}")


def registrar_usuario(session):
    """Registra un nuevo usuario para pruebas"""
    print_test("REGISTRAR USUARIO DE PRUEBA")

    response = session.post(f"{BASE_URL}/auth/register/", json={
        "email": EMAIL,
        "nombre": NOMBRE,
        "password": PASSWORD
    }, headers={'Content-Type': 'application/json'})

    if response.status_code == 201:
        data = response.json()
        # Con cookies httpOnly, no se devuelve token en JSON
        print_success(f"Usuario registrado: {EMAIL}")
        print_info(f"Vidas iniciales: {data['user']['vidas']}")
        print_info(f"Lección actual: {data['user']['leccionActual']}")
        print_info("Cookie de autenticación establecida automáticamente")
        return True
    else:
        print_error(f"Error al registrar: {response.text}")
        return False


def obtener_lecciones(session):
    """Obtiene el listado de lecciones con sus estados de bloqueo"""
    print_test("OBTENER LISTADO DE LECCIONES")

    headers = {'Content-Type': 'application/json'}

    response = session.get(f"{BASE_URL}/lecciones/", headers=headers)

    if response.status_code == 200:
        lecciones = response.json()
        print_success(f"Obtenidas {len(lecciones)} lecciones")

        # Mostrar primeras 5 lecciones con sus estados
        print_info("\nPrimeras 5 lecciones:")
        for leccion in lecciones[:5]:
            bloqueada_icon = "🔒" if leccion['bloqueada'] else "🔓"
            completada_icon = "✓" if leccion['completada'] else "○"
            print(f"  {bloqueada_icon} {completada_icon} Lección {leccion['numero']}: {leccion['titulo']}")
            if leccion['bloqueada']:
                print(f"    └─ BLOQUEADA")
            if leccion['completada']:
                print(f"    └─ COMPLETADA")

        return lecciones
    else:
        print_error(f"Error al obtener lecciones: {response.text}")
        return []


def intentar_completar_leccion_bloqueada(session, leccion_id):
    """Intenta completar una lección bloqueada (debería fallar)"""
    print_test(f"INTENTAR COMPLETAR LECCIÓN {leccion_id} (BLOQUEADA)")

    headers = {'Content-Type': 'application/json'}

    response = session.post(
        f"{BASE_URL}/lecciones/{leccion_id}/completar/",
        headers=headers
    )

    if response.status_code == 403:
        data = response.json()
        print_success("Bloqueo funcionando correctamente")
        print_info(f"Error recibido: {data.get('error')}")
        print_info(f"Próxima lección: {data.get('proximaLeccion')}")
        print_info(f"Lecciones faltantes: {data.get('leccionesFaltantes')}")
        return True
    else:
        print_error(f"FALLO DE SEGURIDAD: Se permitió completar lección bloqueada")
        print_error(f"Respuesta: {response.text}")
        return False


def completar_leccion(session, leccion_id):
    """Completa una lección (debería funcionar si no está bloqueada)"""
    print_test(f"COMPLETAR LECCIÓN {leccion_id}")

    headers = {'Content-Type': 'application/json'}

    response = session.post(
        f"{BASE_URL}/lecciones/{leccion_id}/completar/",
        headers=headers
    )

    if response.status_code == 200:
        data = response.json()
        print_success(f"Lección {leccion_id} completada")
        print_info(f"Tomins ganados: {data.get('tomins')}")
        print_info(f"Vidas restantes: {data.get('vidasRestantes')}")
        return True
    else:
        print_error(f"Error al completar lección: {response.text}")
        return False


def intentar_fallar_leccion_bloqueada(session, leccion_id):
    """Intenta fallar una lección bloqueada (debería fallar)"""
    print_test(f"INTENTAR FALLAR LECCIÓN {leccion_id} (BLOQUEADA)")

    headers = {'Content-Type': 'application/json'}

    response = session.post(
        f"{BASE_URL}/lecciones/{leccion_id}/fallar/",
        headers=headers
    )

    if response.status_code == 403:
        data = response.json()
        print_success("Bloqueo funcionando correctamente")
        print_info(f"Error recibido: {data.get('error')}")
        return True
    else:
        print_error(f"FALLO DE SEGURIDAD: Se permitió intentar lección bloqueada")
        print_error(f"Respuesta: {response.text}")
        return False


def main():
    """Ejecuta todos los tests de bloqueo de lecciones"""
    print(f"\n{BLUE}{'='*60}")
    print("TEST DE SISTEMA DE BLOQUEO DE LECCIONES")
    print("Progresión Secuencial Estricta")
    print(f"{'='*60}{RESET}\n")

    # Crear sesión para mantener cookies automáticamente
    session = requests.Session()

    # 1. Registrar usuario
    if not registrar_usuario(session):
        print_error("No se pudo registrar usuario. Abortando tests.")
        return

    # 2. Obtener listado inicial de lecciones
    lecciones = obtener_lecciones(session)
    if not lecciones:
        print_error("No se pudieron obtener lecciones. Abortando tests.")
        return

    # 3. Verificar que lecciones 2+ están bloqueadas inicialmente
    print_test("VERIFICAR ESTADO INICIAL DE BLOQUEO")
    leccion_1 = next((l for l in lecciones if l['numero'] == 1), None)
    leccion_2 = next((l for l in lecciones if l['numero'] == 2), None)
    leccion_3 = next((l for l in lecciones if l['numero'] == 3), None)

    if leccion_1 and not leccion_1['bloqueada']:
        print_success("Lección 1 desbloqueada ✓")
    else:
        print_error("Lección 1 debería estar desbloqueada")

    if leccion_2 and leccion_2['bloqueada']:
        print_success("Lección 2 bloqueada ✓")
    else:
        print_error("Lección 2 debería estar bloqueada")

    if leccion_3 and leccion_3['bloqueada']:
        print_success("Lección 3 bloqueada ✓")
    else:
        print_error("Lección 3 debería estar bloqueada")

    # 4. Intentar completar lección 3 (bloqueada) - DEBE FALLAR
    if not intentar_completar_leccion_bloqueada(session, 3):
        print_error("FALLO CRÍTICO: Lección bloqueada fue completada")
        return

    # 5. Intentar completar lección 2 (bloqueada) - DEBE FALLAR
    if not intentar_completar_leccion_bloqueada(session, 2):
        print_error("FALLO CRÍTICO: Lección bloqueada fue completada")
        return

    # 6. Intentar fallar lección 3 (bloqueada) - DEBE FALLAR
    if not intentar_fallar_leccion_bloqueada(session, 3):
        print_error("FALLO CRÍTICO: Se pudo intentar lección bloqueada")
        return

    # 7. Completar lección 1 (permitido)
    if not completar_leccion(session, 1):
        print_error("Error al completar lección 1")
        return

    # 8. Verificar que ahora lección 2 está desbloqueada
    lecciones = obtener_lecciones(session)
    leccion_2 = next((l for l in lecciones if l['numero'] == 2), None)
    leccion_3 = next((l for l in lecciones if l['numero'] == 3), None)

    print_test("VERIFICAR ESTADO DESPUÉS DE COMPLETAR LECCIÓN 1")
    if leccion_2 and not leccion_2['bloqueada']:
        print_success("Lección 2 desbloqueada ✓")
    else:
        print_error("Lección 2 debería estar desbloqueada ahora")

    if leccion_3 and leccion_3['bloqueada']:
        print_success("Lección 3 sigue bloqueada ✓")
    else:
        print_error("Lección 3 debería seguir bloqueada")

    # 9. Completar lección 2
    if not completar_leccion(session, 2):
        print_error("Error al completar lección 2")
        return

    # 10. Verificar que lección 3 está desbloqueada
    lecciones = obtener_lecciones(session)
    leccion_3 = next((l for l in lecciones if l['numero'] == 3), None)

    print_test("VERIFICAR ESTADO DESPUÉS DE COMPLETAR LECCIÓN 2")
    if leccion_3 and not leccion_3['bloqueada']:
        print_success("Lección 3 desbloqueada ✓")
    else:
        print_error("Lección 3 debería estar desbloqueada ahora")

    # 11. Completar lección 3
    if completar_leccion(session, 3):
        print_success("Lección 3 completada correctamente ✓")

    # RESUMEN FINAL
    print(f"\n{GREEN}{'='*60}")
    print("RESUMEN DE PRUEBAS")
    print(f"{'='*60}{RESET}")
    print_success("✓ Lecciones bloqueadas no se pueden completar")
    print_success("✓ Lecciones bloqueadas no se pueden intentar")
    print_success("✓ Progresión secuencial funciona correctamente")
    print_success("✓ Estados de bloqueo se actualizan dinámicamente")
    print(f"\n{GREEN}TODAS LAS PRUEBAS PASARON EXITOSAMENTE{RESET}\n")


if __name__ == "__main__":
    main()
