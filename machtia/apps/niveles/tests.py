"""
Tests para el módulo de niveles
"""
from django.test import TestCase
from mongoengine.connection import get_db
from apps.niveles.models import Nivel
from apps.autenticacion.models import Usuario
from apps.lecciones.models import Leccion, Palabra


class NivelModelTest(TestCase):
    """Tests para el modelo Nivel"""

    @classmethod
    def setUpClass(cls):
        """Configuración inicial para todos los tests"""
        super().setUpClass()
        cls.db = get_db()

    def setUp(self):
        """Configuración antes de cada test"""
        # Limpiar colecciones
        self.db.niveles.delete_many({})
        self.db.lecciones.delete_many({})
        self.db.usuarios.delete_many({})

    def tearDown(self):
        """Limpieza después de cada test"""
        self.db.niveles.delete_many({})
        self.db.lecciones.delete_many({})
        self.db.usuarios.delete_many({})

    def test_crear_nivel(self):
        """Test: Crear un nivel correctamente"""
        nivel = Nivel(
            _id=1,
            nombre='Animales',
            tema='animales',
            dificultad='principiante',
            contenido='Aprende vocabulario sobre animales'
        )
        nivel.save()

        # Verificar que se guardó
        nivel_guardado = self.db.niveles.find_one({'_id': 1})
        self.assertIsNotNone(nivel_guardado)
        self.assertEqual(nivel_guardado['nombre'], 'Animales')
        self.assertEqual(nivel_guardado['tema'], 'animales')
        self.assertEqual(nivel_guardado['dificultad'], 'principiante')

    def test_obtener_siguiente_id(self):
        """Test: Obtener el siguiente ID disponible"""
        # Sin niveles, debe retornar 1
        siguiente_id = Nivel.obtener_siguiente_id()
        self.assertEqual(siguiente_id, 1)

        # Crear un nivel
        nivel1 = Nivel(_id=1, nombre='Nivel 1', tema='test', dificultad='principiante', contenido='Test')
        nivel1.save()

        # Ahora debe retornar 2
        siguiente_id = Nivel.obtener_siguiente_id()
        self.assertEqual(siguiente_id, 2)

        # Crear más niveles
        nivel2 = Nivel(_id=2, nombre='Nivel 2', tema='test', dificultad='intermedio', contenido='Test')
        nivel2.save()
        nivel5 = Nivel(_id=5, nombre='Nivel 5', tema='test', dificultad='avanzado', contenido='Test')
        nivel5.save()

        # Debe retornar 6 (el último + 1)
        siguiente_id = Nivel.obtener_siguiente_id()
        self.assertEqual(siguiente_id, 6)

    def test_niveles_con_diferentes_dificultades(self):
        """Test: Crear niveles con diferentes dificultades"""
        nivel_principiante = Nivel(
            _id=1,
            nombre='Nivel Fácil',
            tema='test',
            dificultad='principiante',
            contenido='Nivel para principiantes'
        )
        nivel_principiante.save()

        nivel_intermedio = Nivel(
            _id=2,
            nombre='Nivel Medio',
            tema='test',
            dificultad='intermedio',
            contenido='Nivel intermedio'
        )
        nivel_intermedio.save()

        nivel_avanzado = Nivel(
            _id=3,
            nombre='Nivel Difícil',
            tema='test',
            dificultad='avanzado',
            contenido='Nivel avanzado'
        )
        nivel_avanzado.save()

        # Verificar que todos se guardaron correctamente
        principiantes = list(self.db.niveles.find({'dificultad': 'principiante'}))
        intermedios = list(self.db.niveles.find({'dificultad': 'intermedio'}))
        avanzados = list(self.db.niveles.find({'dificultad': 'avanzado'}))

        self.assertEqual(len(principiantes), 1)
        self.assertEqual(len(intermedios), 1)
        self.assertEqual(len(avanzados), 1)

    def test_ordenamiento_de_niveles(self):
        """Test: Los niveles se ordenan correctamente por _id"""
        # Crear niveles en orden aleatorio
        nivel3 = Nivel(_id=3, nombre='Nivel 3', tema='test', dificultad='principiante', contenido='Test')
        nivel3.save()
        nivel1 = Nivel(_id=1, nombre='Nivel 1', tema='test', dificultad='principiante', contenido='Test')
        nivel1.save()
        nivel2 = Nivel(_id=2, nombre='Nivel 2', tema='test', dificultad='principiante', contenido='Test')
        nivel2.save()

        # Obtener niveles ordenados
        niveles = list(self.db.niveles.find({}).sort('_id', 1))

        # Verificar orden
        self.assertEqual(niveles[0]['_id'], 1)
        self.assertEqual(niveles[1]['_id'], 2)
        self.assertEqual(niveles[2]['_id'], 3)


class NivelUsuarioIntegrationTest(TestCase):
    """Tests de integración entre Nivel y Usuario"""

    @classmethod
    def setUpClass(cls):
        """Configuración inicial"""
        super().setUpClass()
        cls.db = get_db()

    def setUp(self):
        """Configuración antes de cada test"""
        self.db.niveles.delete_many({})
        self.db.usuarios.delete_many({})

    def tearDown(self):
        """Limpieza después de cada test"""
        self.db.niveles.delete_many({})
        self.db.usuarios.delete_many({})

    def test_usuario_completar_nivel(self):
        """Test: Usuario completa un nivel"""
        # Crear usuario
        usuario = Usuario(
            email='test@test.com',
            nombre='Test User',
            nivelActual=1
        )
        usuario.set_password('password123')
        usuario.save()

        # Completar nivel 1
        usuario.completar_nivel(1)

        # Verificar cambios
        usuario_actualizado = self.db.usuarios.find_one({'email': 'test@test.com'})
        self.assertIn(1, usuario_actualizado['nivelesCompletados'])
        self.assertEqual(usuario_actualizado['nivelActual'], 2)

    def test_usuario_puede_acceder_nivel(self):
        """Test: Verificar acceso de usuario a niveles"""
        usuario = Usuario(
            email='test@test.com',
            nombre='Test User',
            nivelActual=3
        )
        usuario.set_password('password123')
        usuario.save()

        # Usuario en nivel 3 puede acceder a 1, 2, 3
        self.assertTrue(usuario.puede_acceder_nivel(1))
        self.assertTrue(usuario.puede_acceder_nivel(2))
        self.assertTrue(usuario.puede_acceder_nivel(3))

        # No puede acceder a 4, 5, etc.
        self.assertFalse(usuario.puede_acceder_nivel(4))
        self.assertFalse(usuario.puede_acceder_nivel(5))

    def test_usuario_niveles_completados(self):
        """Test: Rastrear niveles completados"""
        usuario = Usuario(
            email='test@test.com',
            nombre='Test User',
            nivelActual=1,
            nivelesCompletados=[]
        )
        usuario.set_password('password123')
        usuario.save()

        # Completar varios niveles en orden
        usuario.completar_nivel(1)
        usuario.completar_nivel(2)
        usuario.completar_nivel(3)

        # Verificar
        usuario_actualizado = self.db.usuarios.find_one({'email': 'test@test.com'})
        self.assertEqual(len(usuario_actualizado['nivelesCompletados']), 3)
        self.assertIn(1, usuario_actualizado['nivelesCompletados'])
        self.assertIn(2, usuario_actualizado['nivelesCompletados'])
        self.assertIn(3, usuario_actualizado['nivelesCompletados'])
        self.assertEqual(usuario_actualizado['nivelActual'], 4)

    def test_completar_nivel_no_duplica(self):
        """Test: Completar un nivel dos veces no duplica el registro"""
        usuario = Usuario(
            email='test@test.com',
            nombre='Test User',
            nivelActual=1
        )
        usuario.set_password('password123')
        usuario.save()

        # Completar nivel 1 dos veces
        usuario.completar_nivel(1)
        usuario.completar_nivel(1)

        # Verificar que solo aparece una vez
        usuario_actualizado = self.db.usuarios.find_one({'email': 'test@test.com'})
        nivel_count = usuario_actualizado['nivelesCompletados'].count(1)
        self.assertEqual(nivel_count, 1)


class NivelLeccionIntegrationTest(TestCase):
    """Tests de integración entre Nivel y Lección"""

    @classmethod
    def setUpClass(cls):
        """Configuración inicial"""
        super().setUpClass()
        cls.db = get_db()

    def setUp(self):
        """Configuración antes de cada test"""
        self.db.niveles.delete_many({})
        self.db.lecciones.delete_many({})

    def tearDown(self):
        """Limpieza después de cada test"""
        self.db.niveles.delete_many({})
        self.db.lecciones.delete_many({})

    def test_lecciones_asociadas_a_nivel(self):
        """Test: Lecciones están correctamente asociadas a niveles"""
        # Crear nivel
        nivel = Nivel(
            _id=1,
            nombre='Animales',
            tema='animales',
            dificultad='principiante',
            contenido='Aprende sobre animales'
        )
        nivel.save()

        # Crear lecciones asociadas al nivel
        leccion1 = Leccion(
            _id=1,
            nombre='Animales Domésticos',
            tema='animales',
            dificultad='principiante',
            contenido='Perros y gatos',
            nivel_id=1
        )
        leccion1.save()

        leccion2 = Leccion(
            _id=2,
            nombre='Animales Salvajes',
            tema='animales',
            dificultad='principiante',
            contenido='Leones y tigres',
            nivel_id=1
        )
        leccion2.save()

        # Verificar asociación
        lecciones_nivel_1 = list(self.db.lecciones.find({'nivel_id': 1}))
        self.assertEqual(len(lecciones_nivel_1), 2)

    def test_filtrar_lecciones_por_nivel(self):
        """Test: Filtrar lecciones por nivel_id"""
        # Crear múltiples niveles y lecciones
        nivel1 = Nivel(_id=1, nombre='Nivel 1', tema='test1', dificultad='principiante', contenido='Test')
        nivel1.save()
        nivel2 = Nivel(_id=2, nombre='Nivel 2', tema='test2', dificultad='intermedio', contenido='Test')
        nivel2.save()

        # Lecciones del nivel 1
        for i in range(1, 4):
            leccion = Leccion(
                _id=i,
                nombre=f'Lección {i}',
                tema='test1',
                dificultad='principiante',
                contenido='Test',
                nivel_id=1
            )
            leccion.save()

        # Lecciones del nivel 2
        for i in range(4, 7):
            leccion = Leccion(
                _id=i,
                nombre=f'Lección {i}',
                tema='test2',
                dificultad='intermedio',
                contenido='Test',
                nivel_id=2
            )
            leccion.save()

        # Verificar filtros
        lecciones_nivel_1 = list(self.db.lecciones.find({'nivel_id': 1}))
        lecciones_nivel_2 = list(self.db.lecciones.find({'nivel_id': 2}))

        self.assertEqual(len(lecciones_nivel_1), 3)
        self.assertEqual(len(lecciones_nivel_2), 3)

    def test_lecciones_ordenadas_dentro_de_nivel(self):
        """Test: Las lecciones dentro de un nivel están ordenadas"""
        nivel = Nivel(_id=1, nombre='Test', tema='test', dificultad='principiante', contenido='Test')
        nivel.save()

        # Crear lecciones en orden aleatorio
        leccion3 = Leccion(_id=3, nombre='L3', tema='test', dificultad='principiante', contenido='Test', nivel_id=1)
        leccion3.save()
        leccion1 = Leccion(_id=1, nombre='L1', tema='test', dificultad='principiante', contenido='Test', nivel_id=1)
        leccion1.save()
        leccion2 = Leccion(_id=2, nombre='L2', tema='test', dificultad='principiante', contenido='Test', nivel_id=1)
        leccion2.save()

        # Obtener lecciones ordenadas
        lecciones = list(self.db.lecciones.find({'nivel_id': 1}).sort('_id', 1))

        # Verificar orden
        self.assertEqual(lecciones[0]['_id'], 1)
        self.assertEqual(lecciones[1]['_id'], 2)
        self.assertEqual(lecciones[2]['_id'], 3)
