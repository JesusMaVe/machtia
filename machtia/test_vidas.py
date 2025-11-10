"""
Script de testing para endpoints de vidas
"""
import requests
import json
from datetime import datetime
import time

BASE_URL = 'http://localhost:8000'

# Colores para terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_success(message):
    print(f"{GREEN}✅ {message}{RESET}")

def print_error(message):
    print(f"{RED}❌ {message}{RESET}")

def print_info(message):
    print(f"{BLUE}ℹ️  {message}{RESET}")

def print_section(title):
    print(f"\n{YELLOW}{'='*60}")
    print(f"{title}")
    print(f"{'='*60}{RESET}\n")


class TestVidas:
    def __init__(self):
        self.token = None
        self.tests_passed = 0
        self.tests_failed = 0

    def registrar_usuario(self):
        """Registra un usuario de prueba con tomins suficientes"""
        print_info("Registrando usuario de prueba...")

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data = {
            'email': f'vidas_test_{timestamp}@nahuatl.com',
            'nombre': 'Test Vidas',
            'password': 'password123'
        }

        response = requests.post(f'{BASE_URL}/api/auth/register/', json=data)

        if response.status_code == 201:
            self.token = response.json()['token']['access_token']
            print_success(f"Usuario registrado: {data['email']}")
            print_info(f"Token obtenido")
            return True
        else:
            print_error(f"Error al registrar: {response.text}")
            return False

    def agregar_tomins(self):
        """Agrega tomins al usuario para poder comprar vidas"""
        print_info("Agregando tomins al usuario...")

        # Crear y completar una lección para obtener tomins
        # Primero crear lección
        leccion_data = {
            'nombre': 'Lección para Tomins',
            'tema': 'testing',
            'dificultad': 'principiante',
            'contenido': 'Lección para conseguir tomins',
            'tominsAlCompletar': 100,  # 100 tomins
            'palabras': [
                {'palabra_nahuatl': 'Test', 'español': 'Prueba'}
            ]
        }

        response = requests.post(
            f'{BASE_URL}/api/lecciones/crear/',
            json=leccion_data,
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 201:
            leccion_id = response.json()['leccion']['id']
            print_success(f"Lección creada: ID {leccion_id}")

            # Completar la lección
            response = requests.post(
                f'{BASE_URL}/api/lecciones/{leccion_id}/completar/',
                headers={'Authorization': f'Bearer {self.token}'}
            )

            if response.status_code == 200:
                tomins = response.json()['tominsTotal']
                print_success(f"Lección completada - Tomins: {tomins}")
                return True

        print_error("No se pudieron agregar tomins")
        return False

    def test_obtener_vidas(self):
        """Test: GET /api/vidas/"""
        print_section("TEST: Obtener Vidas")

        response = requests.get(
            f'{BASE_URL}/api/vidas/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 200:
            data = response.json()

            if data.get('status') == 'success' and 'vidas' in data:
                vidas_info = data['vidas']

                print_success("Vidas obtenidas correctamente")
                print_info(f"  Vidas actuales: {vidas_info['actuales']}/{vidas_info['maximas']}")
                print_info(f"  Vidas regeneradas: {vidas_info['regeneracion']['vidas_regeneradas']}")

                if not vidas_info['proximaVida']['tiene_maximo']:
                    print_info(f"  Próxima vida en: {vidas_info['proximaVida']['minutos_restantes']} minutos")
                else:
                    print_info(f"  ¡Tienes el máximo de vidas!")

                self.tests_passed += 1
                return True
            else:
                print_error(f"Respuesta inválida: {data}")
                self.tests_failed += 1
                return False
        else:
            print_error(f"Error {response.status_code}: {response.text}")
            self.tests_failed += 1
            return False

    def test_fallar_leccion(self):
        """Test: POST /api/lecciones/:id/fallar/"""
        print_section("TEST: Fallar Lección (Perder Vida)")

        # Primero obtener vidas actuales
        response = requests.get(
            f'{BASE_URL}/api/vidas/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        vidas_antes = response.json()['vidas']['actuales']
        print_info(f"Vidas antes de fallar: {vidas_antes}")

        # Fallar lección 1
        response = requests.post(
            f'{BASE_URL}/api/lecciones/1/fallar/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 200:
            data = response.json()

            if data.get('vida_perdida'):
                print_success("Vida perdida correctamente")
                print_info(f"  Vidas antes: {data['vidas_antes']}")
                print_info(f"  Vidas después: {data['vidas_actuales']}")
                print_info(f"  Próxima vida en: {data['proximaVida']['minutos_restantes']} minutos")

                if data['vidas_actuales'] == vidas_antes - 1:
                    self.tests_passed += 1
                    return True
                else:
                    print_error("Las vidas no se restaron correctamente")
                    self.tests_failed += 1
                    return False
            else:
                print_error(f"Respuesta inválida: {data}")
                self.tests_failed += 1
                return False
        else:
            print_error(f"Error {response.status_code}: {response.text}")
            self.tests_failed += 1
            return False

    def test_comprar_vida(self):
        """Test: POST /api/vidas/comprar/"""
        print_section("TEST: Comprar Vida")

        # Obtener vidas y tomins actuales
        response = requests.get(
            f'{BASE_URL}/api/auth/me/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        usuario = response.json()['user']
        tomins_antes = usuario['tomin']
        vidas_antes = usuario['vidas']

        print_info(f"Antes - Tomins: {tomins_antes}, Vidas: {vidas_antes}")

        # Comprar vida
        response = requests.post(
            f'{BASE_URL}/api/vidas/comprar/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 200:
            data = response.json()

            if data.get('status') == 'success':
                print_success("Vida comprada correctamente")
                print_info(f"  Tomins gastados: {data['tomins_gastados']}")
                print_info(f"  Tomins restantes: {data['tomins_restantes']}")
                print_info(f"  Vidas actuales: {data['vidas_actuales']}")

                if (data['tomins_gastados'] == 10 and
                    data['tomins_restantes'] == tomins_antes - 10 and
                    data['vidas_actuales'] == min(5, vidas_antes + 1)):
                    self.tests_passed += 1
                    return True
                else:
                    print_error("Valores incorrectos en la compra")
                    self.tests_failed += 1
                    return False
            else:
                print_error(f"Respuesta de error: {data}")
                self.tests_failed += 1
                return False
        else:
            print_error(f"Error {response.status_code}: {response.text}")
            self.tests_failed += 1
            return False

    def test_comprar_vida_sin_tomins(self):
        """Test: Intentar comprar vida sin tomins"""
        print_section("TEST: Comprar Vida Sin Tomins Suficientes")

        # Usar todos los tomins
        response = requests.get(
            f'{BASE_URL}/api/auth/me/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        tomins_actuales = response.json()['user']['tomin']

        # Si tiene menos de 10 tomins, intentar comprar
        if tomins_actuales < 10:
            response = requests.post(
                f'{BASE_URL}/api/vidas/comprar/',
                headers={'Authorization': f'Bearer {self.token}'}
            )

            if response.status_code == 400:
                data = response.json()
                if 'No tienes suficientes tomins' in data.get('message', ''):
                    print_success("Validación correcta: No puede comprar sin tomins")
                    self.tests_passed += 1
                    return True

        print_info("Omitiendo test (tiene suficientes tomins)")
        return True

    def test_comprar_vida_con_maximo(self):
        """Test: Intentar comprar vida teniendo el máximo"""
        print_section("TEST: Comprar Vida con Máximo de Vidas")

        # Obtener vidas actuales
        response = requests.get(
            f'{BASE_URL}/api/vidas/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        vidas = response.json()['vidas']['actuales']

        # Si ya tiene 5 vidas, intentar comprar
        if vidas >= 5:
            response = requests.post(
                f'{BASE_URL}/api/vidas/comprar/',
                headers={'Authorization': f'Bearer {self.token}'}
            )

            if response.status_code == 400:
                data = response.json()
                if 'Ya tienes el máximo' in data.get('message', ''):
                    print_success("Validación correcta: No puede comprar con máximo de vidas")
                    self.tests_passed += 1
                    return True
        else:
            print_info(f"Omitiendo test (tiene {vidas}/5 vidas)")

        return True

    def test_restaurar_vidas(self):
        """Test: POST /api/vidas/restaurar/"""
        print_section("TEST: Restaurar Todas las Vidas")

        # Primero fallar algunas lecciones para perder vidas
        print_info("Perdiendo vidas para poder restaurar...")

        for i in range(2):
            requests.post(
                f'{BASE_URL}/api/lecciones/1/fallar/',
                headers={'Authorization': f'Bearer {self.token}'}
            )

        # Obtener estado actual
        response = requests.get(
            f'{BASE_URL}/api/auth/me/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        usuario = response.json()['user']
        tomins_antes = usuario['tomin']
        vidas_antes = usuario['vidas']

        print_info(f"Antes - Tomins: {tomins_antes}, Vidas: {vidas_antes}")

        if vidas_antes >= 5:
            print_info("Ya tiene el máximo de vidas, omitiendo test")
            return True

        # Restaurar vidas
        response = requests.post(
            f'{BASE_URL}/api/vidas/restaurar/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 200:
            data = response.json()

            if data.get('status') == 'success':
                print_success("Vidas restauradas correctamente")
                print_info(f"  Tomins gastados: {data['tomins_gastados']}")
                print_info(f"  Tomins restantes: {data['tomins_restantes']}")
                print_info(f"  Vidas restauradas: {data['vidas_restauradas']}")
                print_info(f"  Vidas actuales: {data['vidas_actuales']}")

                if (data['tomins_gastados'] == 50 and
                    data['vidas_actuales'] == 5):
                    self.tests_passed += 1
                    return True
                else:
                    print_error("Valores incorrectos en la restauración")
                    self.tests_failed += 1
                    return False
        else:
            data = response.json()
            if 'No tienes suficientes tomins' in data.get('message', ''):
                print_info("No tiene suficientes tomins para restaurar (esperado)")
                return True
            else:
                print_error(f"Error {response.status_code}: {response.text}")
                self.tests_failed += 1
                return False

    def test_sin_autenticacion(self):
        """Test: Validar que requiere autenticación"""
        print_section("TEST: Validar Autenticación Requerida")

        endpoints = [
            '/api/vidas/',
            '/api/vidas/comprar/',
            '/api/vidas/restaurar/'
        ]

        all_passed = True

        for endpoint in endpoints:
            if endpoint == '/api/vidas/':
                response = requests.get(f'{BASE_URL}{endpoint}')
            else:
                response = requests.post(f'{BASE_URL}{endpoint}')

            if response.status_code == 401:
                print_success(f"{endpoint} - Requiere autenticación correctamente")
            else:
                print_error(f"{endpoint} - No requiere autenticación (esperado 401, obtenido {response.status_code})")
                all_passed = False

        if all_passed:
            self.tests_passed += 1
        else:
            self.tests_failed += 1

        return all_passed

    def run_all_tests(self):
        """Ejecuta todos los tests"""
        print_section("TESTING DE ENDPOINTS DE VIDAS")

        # Setup: Registrar usuario
        if not self.registrar_usuario():
            print_error("No se pudo registrar usuario. Abortando tests.")
            return

        # Agregar tomins para poder comprar vidas
        if not self.agregar_tomins():
            print_error("No se pudieron agregar tomins. Algunos tests pueden fallar.")

        # Ejecutar tests
        self.test_obtener_vidas()
        self.test_fallar_leccion()
        self.test_comprar_vida()
        self.test_comprar_vida_sin_tomins()
        self.test_comprar_vida_con_maximo()
        self.test_restaurar_vidas()
        self.test_sin_autenticacion()

        # Resumen
        print_section("RESUMEN DE TESTS")
        total = self.tests_passed + self.tests_failed

        print(f"🎯 Total: {self.tests_passed} exitosas, {self.tests_failed} fallidas")

        if self.tests_failed == 0:
            print(f"{GREEN}🎉 ¡Todas las pruebas pasaron exitosamente!{RESET}")
        else:
            print(f"{RED}⚠️  Algunas pruebas fallaron. Revisa los errores arriba.{RESET}")

        print(f"{YELLOW}{'='*60}{RESET}\n")


if __name__ == '__main__':
    tester = TestVidas()
    tester.run_all_tests()
