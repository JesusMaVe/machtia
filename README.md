# Machtia - Plataforma de Aprendizaje de Náhuatl

![Django](https://img.shields.io/badge/Django-4.2-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![React Router](https://img.shields.io/badge/React_Router-v7-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

Aplicación educativa estilo Duolingo para aprender el idioma Náhuatl, con sistema de gamificación completo, autenticación JWT, seguimiento de progreso y logros.

## Arquitectura del Proyecto

Este es un monorepo que contiene dos proyectos principales:

```
nahualt/
├── machtia/           # Backend - Django + MongoDB + Docker
│   ├── apps/          # Aplicaciones Django (autenticacion, lecciones, progreso, vidas)
│   ├── config/        # Configuración Django
│   ├── doc/           # Documentación del backend
│   └── docker-compose.yml
│
├── machita-front/     # Frontend - React Router v7 + TypeScript
│   ├── app/           # Rutas de React Router
│   ├── src/           # Código fuente (features, components, shared)
│   └── public/        # Assets estáticos
│
└── README.md          # Este archivo
```

## Stack Tecnológico

### Backend

- **Framework:** Django 4.2 with Django REST Framework
- **Base de Datos:** MongoDB 7.0 (con Mongoengine ODM)
- **Autenticación:** JWT tokens (PyJWT 2.8.0) con bcrypt
- **Containerización:** Docker Compose (MongoDB + Mongo Express UI)
- **API:** RESTful con documentación Postman

### Frontend

- **Framework:** React Router v7.9.2 (full-stack meta-framework con SSR)
- **Lenguaje:** TypeScript 5.9 (strict mode)
- **UI Library:** shadcn/ui + Radix UI + Tailwind CSS v4
- **Forms:** react-hook-form + Zod validation
- **State Management:** Context API
- **Build Tool:** Vite 7.1.7

### Gamificación

- **Tomins**: Moneda virtual ganada al completar lecciones (5-10 tomins por lección)
- **Sistema de Vidas**:
  - Inicio: 3 vidas
  - Máximo: 5 vidas
  - Regeneración: 1 vida cada 30 minutos (automático)
  - Pérdida: Al fallar una lección
  - Compra: 10 tomins por 1 vida, 50 tomins para restaurar todas
- **Rachas**:
  - Incrementa si estudias días consecutivos
  - Se reinicia si hay más de 1 día de inactividad
  - Estados: nueva, activa, en_riesgo, perdida
- **Logros** (7 total):
  - `primera_leccion` - Completa 1 lección
  - `racha_7` - 7 días de racha
  - `racha_30` - 30 días de racha
  - `lecciones_10` - Completa 10 lecciones
  - `lecciones_50` - Completa 50 lecciones
  - `rico` - Acumula 100 tomins
  - `millonario` - Acumula 1000 tomins

### Seguimiento de Progreso

- **Estadísticas Detalladas**: Lecciones completadas, tomins, horas de estudio, palabras aprendidas
- **Heatmap de Actividad**: Calendario estilo GitHub mostrando días de estudio
- **Historial de Actividad**: Registro de actividad diaria con lecciones, tomins y tiempo

## 🛠️ Configuración e Instalación

### Prerrequisitos

- **Python 3.10+** (para backend)
- **Node.js 18+** y npm (para frontend)
- **Docker** y Docker Compose (para MongoDB)
- **Git**

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd nahualt
```

### 2. Configurar Backend (Django + MongoDB)

```bash
# Navegar al directorio del backend
cd machtia

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env (basado en .env.example)
cat > .env << EOF
DEBUG=True
SECRET_KEY=your-secret-key-here
MONGODB_URI=mongodb://nahuatl_user:nahuatl_pass@localhost:27017/nahuatl_db?authSource=nahuatl_db
JWT_SECRET=your-jwt-secret-here
EOF

# Iniciar MongoDB con Docker
docker-compose up -d

# Poblar base de datos con lecciones iniciales
python seed_lecciones.py

# Iniciar servidor Django
python manage.py runserver
```

El backend estará disponible en `http://localhost:8000`

### 3. Configurar Frontend (React Router + TypeScript)

```bash
# En una nueva terminal, navegar al frontend
cd machita-front

# Instalar dependencias
npm install

# Crear archivo .env (opcional - usa localhost:8000 por defecto)
echo "VITE_API_URL=http://localhost:8000" > .env

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Comandos de Desarrollo

#### Backend (machtia/)

```bash
# Iniciar MongoDB
docker-compose up -d

# Logs de MongoDB
docker-compose logs -f mongodb

# Iniciar servidor Django
python manage.py runserver

# Ejecutar tests
python test_auth.py
python test_lecciones.py
python test_progreso.py
python test_vidas.py

# Acceder a MongoDB shell
docker exec -it nahuatl_mongodb mongosh -u nahuatl_user -p nahuatl_pass --authenticationDatabase nahuatl_db

# Mongo Express UI
# http://localhost:8081 (admin / admin123)

# Detener servicios
docker-compose down
```

#### Frontend (machita-front/)

```bash
# Desarrollo con HMR
npm run dev

# Build de producción
npm run build

# Ejecutar build de producción
npm start

# Type checking
npm run typecheck
```

## API Endpoints

### Autenticación (`/api/auth/`)

```
POST   /register/         # Registrar nuevo usuario (devuelve JWT)
POST   /login/            # Login (devuelve JWT)
POST   /logout/           # Logout
GET    /me/               # Obtener perfil del usuario
PUT    /me/update/        # Actualizar perfil
```

### Lecciones (`/api/lecciones/`)

```
GET    /                  # Listar todas las lecciones (con filtros opcionales)
GET    /:id/              # Obtener lección específica
GET    /siguiente/        # Obtener siguiente lección para el usuario
POST   /:id/completar/    # Completar lección (actualiza racha, logros, tomins)
POST   /:id/fallar/       # Fallar lección (pierde 1 vida)
POST   /crear/            # Crear nueva lección
PUT    /:id/actualizar/   # Actualizar lección
DELETE /:id/eliminar/     # Eliminar lección
```

### Progreso (`/api/progreso/`)

```
GET    /estadisticas/     # Estadísticas generales del usuario
GET    /racha/            # Información de racha actual
GET    /logros/           # Lista de logros
GET    /actividad/        # Historial de actividad diaria
```

### Vidas (`/api/vidas/`)

```
GET    /                  # Estado de vidas (auto-regenera)
POST   /comprar/          # Comprar 1 vida por 10 tomins
POST   /restaurar/        # Restaurar todas las vidas por 50 tomins
```

**Autenticación**: Todos los endpoints protegidos requieren header:

```
Authorization: Bearer <jwt-token>
```

## Modelos de Datos

### Usuario (MongoDB - usuarios)

```python
{
  email: string (unique, indexed),
  nombre: string,
  password: string (hashed con bcrypt),
  tomin: number (min: 0),
  vidas: number (min: 0, max: 5, default: 3),
  ultimaRegeneracionVida: datetime,
  leccionesCompletadas: [number],
  leccionActual: number (default: 1)
}
```

### Lección (MongoDB - lecciones)

```python
{
  _id: number (1, 2, 3... - NO ObjectId),
  nombre: string,
  contenido: string,
  dificultad: "principiante" | "intermedio" | "avanzado",
  tema: string,
  palabras: [{
    palabra_nahuatl: string,
    español: string,
    audio: string,
    ejemplo: string (optional),
    categoria: string (optional)
  }],
  tominsAlCompletar: number (default: 5)
}
```

### Racha (MongoDB - rachas)

```python
{
  usuario_id: string (unique, indexed),
  rachaActual: number,
  rachaMaxima: number,
  ultimaActividad: datetime,
  diasActivos: [{
    fecha: date,
    leccionesCompletadas: number,
    tominsGanados: number,
    tiempoEstudio: number
  }],
  logrosDesbloqueados: [{
    nombre: string,
    descripcion: string,
    icono: string,
    fechaDesbloqueo: datetime
  }],
  totalLeccionesCompletadas: number
}
```

## Testing

### Backend

Scripts de prueba disponibles en `machtia/`:

```bash
python test_mongodb_connection.py  # Probar conexión a MongoDB
python test_auth.py                # Probar autenticación JWT
python test_lecciones.py           # Probar CRUD de lecciones
python test_progreso.py            # Probar sistema de progreso
python test_vidas.py               # Probar sistema de vidas
```

### Postman Collection

Importar `machtia/Machtia_API.postman_collection.json` para testing completo de API con scripts automáticos de manejo de tokens.
