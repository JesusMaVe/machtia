"""
Script de testing para endpoints de lecciones

Uso:
    python test_lecciones.py
"""
import requests
import json

BASE_URL = 'http://localhost:8000'

# Variables globales para almacenar datos de testing
token = None
leccion_id_creada = None


def print_test(nombre_test, exitoso, mensaje=''):
    """Imprime resultado del test con formato"""
    emoji = '✅' if exitoso else '❌'
    print(f'{emoji} {nombre_test}')
    if mensaje:
        print(f'   {mensaje}')


def test_1_registrar_usuario():
    """Test 1: Registrar usuario para obtener token"""
    global token

    url = f'{BASE_URL}/api/auth/register/'
    data = {
        'email': 'test_lecciones@example.com',
        'nombre': 'Test Lecciones',
        'password': 'password123'
    }

    try:
        response = requests.post(url, json=data)

        # Si el usuario ya existe, hacer login
        if response.status_code == 400:
            url_login = f'{BASE_URL}/api/auth/login/'
            response = requests.post(url_login, json={
                'email': data['email'],
                'password': data['password']
            })

        if response.status_code in [200, 201]:
            result = response.json()
            # El token puede venir en diferentes formatos
            if isinstance(result.get('token'), dict):
                token = result.get('token', {}).get('access_token')
            else:
                token = result.get('token')
            print_test('Registro/Login de usuario', True, f'Token obtenido')
            return True
        else:
            print_test('Registro/Login de usuario', False, f'Status: {response.status_code}')
            return False

    except Exception as e:
        print_test('Registro/Login de usuario', False, str(e))
        return False


def test_2_crear_leccion():
    """Test 2: Crear una lección"""
    global token, leccion_id_creada

    url = f'{BASE_URL}/api/lecciones/crear/'
    headers = {'Authorization': f'Bearer {token}'}
    data = {
        'nombre': 'Lección de Prueba: Saludos',
        'tema': 'saludos',
        'dificultad': 'principiante',
        'contenido': 'Aprende los saludos básicos en náhuatl',
        'tominsAlCompletar': 10,
        'nivel_id': 1,  # Agregado campo nivel_id
        'palabras': [
            {
                'palabra_nahuatl': 'Niltze',
                'español': 'Hola',
                'audio': None
            },
            {
                'palabra_nahuatl': 'Panoltih',
                'español': 'Adiós',
                'audio': None
            },
            {
                'palabra_nahuatl': 'Tlazohcamati',
                'español': 'Gracias',
                'audio': None
            }
        ]
    }

    try:
        response = requests.post(url, json=data, headers=headers)

        if response.status_code == 201:
            result = response.json()
            leccion_id_creada = result.get('leccion', {}).get('id')
            palabras_count = result.get('leccion', {}).get('cantidadPalabras')
            print_test('Crear lección', True, f'Lección ID {leccion_id_creada} con {palabras_count} palabras')
            return True
        else:
            print_test('Crear lección', False, f'Status: {response.status_code} - {response.text}')
            return False

    except Exception as e:
        print_test('Crear lección', False, str(e))
        return False


def test_3_listar_lecciones():
    """Test 3: Listar todas las lecciones"""
    url = f'{BASE_URL}/api/lecciones/'

    try:
        response = requests.get(url)

        if response.status_code == 200:
            result = response.json()
            # El endpoint ahora retorna una lista directa
            if isinstance(result, list):
                count = len(result)
            else:
                count = result.get('count', 0)
            print_test('Listar lecciones', True, f'{count} lecciones encontradas')
            return True
        else:
            print_test('Listar lecciones', False, f'Status: {response.status_code}')
            return False

    except Exception as e:
        print_test('Listar lecciones', False, str(e))
        return False


def test_4_filtrar_por_dificultad():
    """Test 4: Filtrar lecciones por dificultad"""
    url = f'{BASE_URL}/api/lecciones/?dificultad=principiante'

    try:
        response = requests.get(url)

        if response.status_code == 200:
            result = response.json()
            # El endpoint ahora retorna una lista directa
            if isinstance(result, list):
                count = len(result)
            else:
                count = result.get('count', 0)
            print_test('Filtrar por dificultad', True, f'{count} lecciones principiantes')
            return True
        else:
            print_test('Filtrar por dificultad', False, f'Status: {response.status_code}')
            return False

    except Exception as e:
        print_test('Filtrar por dificultad', False, str(e))
        return False


def test_5_obtener_leccion_especifica():
    """Test 5: Obtener una lección específica"""
    global leccion_id_creada

    if not leccion_id_creada:
        print_test('Obtener lección específica', False, 'No hay lección creada para probar')
        return False

    url = f'{BASE_URL}/api/lecciones/{leccion_id_creada}/'

    try:
        response = requests.get(url)

        if response.status_code == 200:
            result = response.json()
            leccion = result.get('leccion', {})
            nombre = leccion.get('nombre')
            palabras = len(leccion.get('palabras', []))
            print_test('Obtener lección específica', True, f'{nombre} con {palabras} palabras')
            return True
        else:
            print_test('Obtener lección específica', False, f'Status: {response.status_code}')
            return False

    except Exception as e:
        print_test('Obtener lección específica', False, str(e))
        return False


def test_6_obtener_siguiente_leccion():
    """Test 6: Obtener siguiente lección del usuario"""
    global token

    url = f'{BASE_URL}/api/lecciones/siguiente/'
    headers = {'Authorization': f'Bearer {token}'}

    try:
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            result = response.json()
            leccion = result.get('leccion', {})
            nombre = leccion.get('nombre')
            ya_completada = result.get('yaCompletada')
            print_test('Obtener siguiente lección', True, f'{nombre} (completada: {ya_completada})')
            return True
        else:
            print_test('Obtener siguiente lección', False, f'Status: {response.status_code}')
            return False

    except Exception as e:
        print_test('Obtener siguiente lección', False, str(e))
        return False


def test_7_completar_leccion():
    """Test 7: Completar una lección"""
    global token, leccion_id_creada

    if not leccion_id_creada:
        print_test('Completar lección', False, 'No hay lección para completar')
        return False

    url = f'{BASE_URL}/api/lecciones/{leccion_id_creada}/completar/'
    headers = {'Authorization': f'Bearer {token}'}

    try:
        response = requests.post(url, headers=headers)

        if response.status_code == 200:
            result = response.json()
            tomins = result.get('tominsGanados')
            total = result.get('tominsTotal')
            print_test('Completar lección', True, f'+{tomins} tomins (total: {total})')
            return True
        else:
            print_test('Completar lección', False, f'Status: {response.status_code} - {response.text}')
            return False

    except Exception as e:
        print_test('Completar lección', False, str(e))
        return False


def test_8_actualizar_leccion():
    """Test 8: Actualizar una lección"""
    global token, leccion_id_creada

    if not leccion_id_creada:
        print_test('Actualizar lección', False, 'No hay lección para actualizar')
        return False

    url = f'{BASE_URL}/api/lecciones/{leccion_id_creada}/actualizar/'
    headers = {'Authorization': f'Bearer {token}'}
    data = {
        'nombre': 'Lección Actualizada: Saludos Básicos',
        'tominsAlCompletar': 15
    }

    try:
        response = requests.put(url, json=data, headers=headers)

        if response.status_code == 200:
            result = response.json()
            leccion = result.get('leccion', {})
            nuevo_nombre = leccion.get('nombre')
            print_test('Actualizar lección', True, f'Nombre actualizado a: {nuevo_nombre}')
            return True
        else:
            print_test('Actualizar lección', False, f'Status: {response.status_code}')
            return False

    except Exception as e:
        print_test('Actualizar lección', False, str(e))
        return False


def test_9_validar_leccion_inexistente():
    """Test 9: Validar error al buscar lección inexistente"""
    url = f'{BASE_URL}/api/lecciones/9999/'

    try:
        response = requests.get(url)

        if response.status_code == 404:
            print_test('Validar lección inexistente', True, 'Error 404 correcto')
            return True
        else:
            print_test('Validar lección inexistente', False, f'Status inesperado: {response.status_code}')
            return False

    except Exception as e:
        print_test('Validar lección inexistente', False, str(e))
        return False


def test_10_validar_sin_autenticacion():
    """Test 10: Validar que endpoints protegidos requieren autenticación"""
    url = f'{BASE_URL}/api/lecciones/siguiente/'

    try:
        response = requests.get(url)  # Sin header Authorization

        if response.status_code == 401:
            print_test('Validar sin autenticación', True, 'Error 401 correcto')
            return True
        else:
            print_test('Validar sin autenticación', False, f'Status: {response.status_code}')
            return False

    except Exception as e:
        print_test('Validar sin autenticación', False, str(e))
        return False


def test_11_eliminar_leccion():
    """Test 11: Eliminar una lección (cleanup)"""
    global token, leccion_id_creada

    if not leccion_id_creada:
        print_test('Eliminar lección', False, 'No hay lección para eliminar')
        return False

    url = f'{BASE_URL}/api/lecciones/{leccion_id_creada}/eliminar/'
    headers = {'Authorization': f'Bearer {token}'}

    try:
        response = requests.delete(url, headers=headers)

        if response.status_code == 200:
            print_test('Eliminar lección', True, f'Lección {leccion_id_creada} eliminada')
            return True
        else:
            print_test('Eliminar lección', False, f'Status: {response.status_code}')
            return False

    except Exception as e:
        print_test('Eliminar lección', False, str(e))
        return False


def ejecutar_tests():
    """Ejecuta todos los tests en orden"""
    print('\n' + '='*60)
    print('TESTING DE ENDPOINTS DE LECCIONES')
    print('='*60 + '\n')

    tests = [
        test_1_registrar_usuario,
        test_2_crear_leccion,
        test_3_listar_lecciones,
        test_4_filtrar_por_dificultad,
        test_5_obtener_leccion_especifica,
        test_6_obtener_siguiente_leccion,
        test_7_completar_leccion,
        test_8_actualizar_leccion,
        test_9_validar_leccion_inexistente,
        test_10_validar_sin_autenticacion,
        test_11_eliminar_leccion,
    ]

    exitosos = 0
    fallidos = 0

    for test in tests:
        resultado = test()
        if resultado:
            exitosos += 1
        else:
            fallidos += 1
        print()  # Línea en blanco entre tests

    print('='*60)
    print(f'🎯 Total: {exitosos} exitosas, {fallidos} fallidas')

    if fallidos == 0:
        print('🎉 ¡Todas las pruebas pasaron exitosamente!')
    else:
        print(f'⚠️  {fallidos} prueba(s) fallaron')

    print('='*60 + '\n')


if __name__ == '__main__':
    try:
        ejecutar_tests()
    except KeyboardInterrupt:
        print('\n\n⚠️  Tests interrumpidos por el usuario\n')
    except Exception as e:
        print(f'\n\n❌ Error fatal: {e}\n')
