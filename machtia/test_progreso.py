"""
Script de testing para endpoints de progreso
"""
import requests
import json
from datetime import datetime

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


class TestProgreso:
    def __init__(self):
        self.token = None
        self.leccion_id = None
        self.tests_passed = 0
        self.tests_failed = 0

    def registrar_usuario(self):
        """Registra un usuario de prueba"""
        print_info("Registrando usuario de prueba...")

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data = {
            'email': f'progreso_test_{timestamp}@nahuatl.com',
            'nombre': 'Test Progreso',
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

    def crear_leccion_prueba(self):
        """Crea una lección de prueba"""
        print_info("Creando lección de prueba...")

        data = {
            'nombre': 'Lección de Prueba Progreso',
            'tema': 'testing',
            'dificultad': 'principiante',
            'contenido': 'Lección para probar sistema de progreso',
            'tominsAlCompletar': 10,
            'palabras': [
                {'palabra_nahuatl': 'Test1', 'español': 'Prueba 1'},
                {'palabra_nahuatl': 'Test2', 'español': 'Prueba 2'}
            ]
        }

        response = requests.post(
            f'{BASE_URL}/api/lecciones/crear/',
            json=data,
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 201:
            self.leccion_id = response.json()['leccion']['id']
            print_success(f"Lección creada con ID: {self.leccion_id}")
            return True
        else:
            print_error(f"Error al crear lección: {response.text}")
            return False

    def completar_leccion(self, leccion_id):
        """Completa una lección"""
        print_info(f"Completando lección {leccion_id}...")

        response = requests.post(
            f'{BASE_URL}/api/lecciones/{leccion_id}/completar/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 200:
            data = response.json()
            print_success(f"Lección completada")
            print_info(f"  Tomins ganados: {data.get('tominsGanados', 0)}")
            print_info(f"  Racha actual: {data.get('racha', {}).get('actual', 0)}")
            if data.get('logrosDesbloqueados'):
                print_info(f"  Logros desbloqueados: {', '.join(data['logrosDesbloqueados'])}")
            return True
        else:
            print_error(f"Error al completar lección: {response.text}")
            return False

    def test_obtener_estadisticas(self):
        """Test: GET /api/progreso/estadisticas/"""
        print_section("TEST: Obtener Estadísticas")

        response = requests.get(
            f'{BASE_URL}/api/progreso/estadisticas/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 200:
            data = response.json()

            if data.get('status') == 'success' and 'estadisticas' in data:
                estadisticas = data['estadisticas']

                print_success("Estadísticas obtenidas correctamente")
                print_info(f"  Racha actual: {estadisticas['racha']['actual']}")
                print_info(f"  Racha máxima: {estadisticas['racha']['maxima']}")
                print_info(f"  Lecciones completadas: {estadisticas['totales']['leccionesCompletadas']}")
                print_info(f"  Tomins ganados: {estadisticas['totales']['tominsGanados']}")
                print_info(f"  Tiempo de estudio: {estadisticas['totales']['tiempoEstudioHoras']} horas")
                print_info(f"  Logros desbloqueados: {estadisticas['logros']['desbloqueados']}/{estadisticas['logros']['total']}")
                print_info(f"  Promedio lecciones/día: {estadisticas['promedios']['leccionesPorDia']}")

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

    def test_obtener_racha(self):
        """Test: GET /api/progreso/racha/"""
        print_section("TEST: Obtener Racha")

        response = requests.get(
            f'{BASE_URL}/api/progreso/racha/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 200:
            data = response.json()

            if data.get('status') == 'success' and 'racha' in data:
                racha = data['racha']

                print_success("Racha obtenida correctamente")
                print_info(f"  Racha actual: {racha['actual']}")
                print_info(f"  Racha máxima: {racha['maxima']}")
                print_info(f"  Estado: {racha['estado']}")
                print_info(f"  Mensaje: {racha['mensajes']}")
                print_info(f"  Actividad reciente: {len(racha['actividadReciente'])} días")

                if racha['actividadReciente']:
                    print_info("  Últimos días:")
                    for actividad in racha['actividadReciente'][:3]:
                        print_info(f"    {actividad['fecha']}: {actividad['leccionesCompletadas']} lecciones, {actividad['tominsGanados']} tomins")

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

    def test_obtener_logros(self):
        """Test: GET /api/progreso/logros/"""
        print_section("TEST: Obtener Logros")

        # Probar sin parámetros
        response = requests.get(
            f'{BASE_URL}/api/progreso/logros/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 200:
            data = response.json()

            if data.get('status') == 'success' and 'logros' in data:
                logros = data['logros']

                print_success("Logros obtenidos correctamente")
                print_info(f"  Desbloqueados: {logros['cantidad']}/{logros['total']}")
                print_info(f"  Progreso: {logros['progreso']}%")

                if logros['desbloqueados']:
                    print_info("  Logros desbloqueados:")
                    for logro in logros['desbloqueados']:
                        print_info(f"    {logro['icono']} {logro['nombre']} - {logro['descripcion']}")

                print_info("  Todos los logros disponibles:")
                for logro in logros['disponibles']:
                    estado = '✓' if logro['desbloqueado'] else '✗'
                    print_info(f"    [{estado}] {logro['icono']} {logro['nombre']} - {logro['requisito']}")

                self.tests_passed += 1
            else:
                print_error(f"Respuesta inválida: {data}")
                self.tests_failed += 1
                return False
        else:
            print_error(f"Error {response.status_code}: {response.text}")
            self.tests_failed += 1
            return False

        # Probar con ordenamiento por nombre
        print_info("\nProbando ordenamiento por nombre...")
        response = requests.get(
            f'{BASE_URL}/api/progreso/logros/?ordenar=nombre',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 200:
            print_success("Ordenamiento funcionando correctamente")
            return True
        else:
            print_error(f"Error en ordenamiento: {response.text}")
            return False

    def test_obtener_actividad(self):
        """Test: GET /api/progreso/actividad/"""
        print_section("TEST: Obtener Actividad")

        # Probar sin parámetros (últimos 30 días)
        response = requests.get(
            f'{BASE_URL}/api/progreso/actividad/',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 200:
            data = response.json()

            if data.get('status') == 'success' and 'actividad' in data:
                actividad = data['actividad']

                print_success("Actividad obtenida correctamente")
                print_info(f"  Días mostrados: {actividad['diasMostrados']}")
                print_info(f"  Días con actividad: {actividad['diasConActividad']}")

                resumen = actividad['resumen']
                print_info(f"  Total lecciones: {resumen['totalLecciones']}")
                print_info(f"  Total tomins: {resumen['totalTomins']}")
                print_info(f"  Total tiempo: {resumen['totalTiempoHoras']} horas")
                print_info(f"  Promedio lecciones/día: {resumen['promedioLeccionesPorDia']}")
                print_info(f"  Promedio tomins/día: {resumen['promedioTominsPorDia']}")

                if actividad['historial']:
                    print_info(f"\n  Historial (últimas {min(5, len(actividad['historial']))} entradas):")
                    for dia in actividad['historial'][:5]:
                        print_info(f"    {dia['fecha']}: {dia['leccionesCompletadas']} lecciones, {dia['tominsGanados']} tomins, {dia['tiempoEstudio']} min")

                self.tests_passed += 1
            else:
                print_error(f"Respuesta inválida: {data}")
                self.tests_failed += 1
                return False
        else:
            print_error(f"Error {response.status_code}: {response.text}")
            self.tests_failed += 1
            return False

        # Probar con parámetro de días
        print_info("\nProbando con 7 días...")
        response = requests.get(
            f'{BASE_URL}/api/progreso/actividad/?dias=7',
            headers={'Authorization': f'Bearer {self.token}'}
        )

        if response.status_code == 200:
            data = response.json()
            if data['actividad']['diasMostrados'] == 7:
                print_success("Parámetro 'dias' funcionando correctamente")
                return True
            else:
                print_error("Parámetro 'dias' no funcionó correctamente")
                return False
        else:
            print_error(f"Error con parámetro: {response.text}")
            return False

    def test_sin_autenticacion(self):
        """Test: Validar que requiere autenticación"""
        print_section("TEST: Validar Autenticación Requerida")

        endpoints = [
            '/api/progreso/estadisticas/',
            '/api/progreso/racha/',
            '/api/progreso/logros/',
            '/api/progreso/actividad/'
        ]

        all_passed = True

        for endpoint in endpoints:
            response = requests.get(f'{BASE_URL}{endpoint}')

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
        print_section("TESTING DE ENDPOINTS DE PROGRESO")

        # Setup: Registrar usuario y crear datos
        if not self.registrar_usuario():
            print_error("No se pudo registrar usuario. Abortando tests.")
            return

        if not self.crear_leccion_prueba():
            print_error("No se pudo crear lección. Abortando tests.")
            return

        # Completar la lección para generar datos de progreso
        if not self.completar_leccion(self.leccion_id):
            print_error("No se pudo completar lección. Algunos tests pueden fallar.")

        # Ejecutar tests
        self.test_obtener_estadisticas()
        self.test_obtener_racha()
        self.test_obtener_logros()
        self.test_obtener_actividad()
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
    tester = TestProgreso()
    tester.run_all_tests()
