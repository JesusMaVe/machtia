# 🚀 Guía de Configuración Rápida - Machtia

Guía paso a paso para configurar y ejecutar el proyecto Machtia localmente.

## 📋 Requisitos Previos

- **Docker** y **Docker Compose** instalados
- **Node.js** v18 o superior
- **Python** 3.11 o superior
- **Git**

---

## ⚡ Configuración Rápida (5 minutos)

### 1️⃣ Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd machtia
```

### 2️⃣ Configurar Backend

```bash
cd machtia

# Copiar archivo de configuración
cp .env.example .env

# IMPORTANTE: Verifica que el .env contenga estas líneas:
# MONGODB_URI=mongodb://nahuatl_user:nahuatl_pass@localhost:27017/nahuatl_db
# SECRET_KEY=<tu_secret_key>
# JWT_SECRET=<tu_jwt_secret>

# Iniciar servicios con Docker
docker compose up -d --build

# Esperar 10 segundos para que MongoDB se inicialice
sleep 10

# Verificar que todo funciona
python test_mongodb_connection.py
```

**Deberías ver:**
```
✅ Todas las pruebas pasaron exitosamente!
```

### 3️⃣ Configurar Frontend

```bash
cd ../machita-front

# Copiar archivo de configuración
cp .env.example .env

# IMPORTANTE: Verifica que el .env contenga:
# VITE_API_URL=http://localhost:8000/api

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 4️⃣ Verificar que todo funciona

1. **Backend:** Abre `http://localhost:8000/api/auth/test-connection/`
   - Deberías ver: `{"status":"success","message":"Conexión exitosa a MongoDB"}`

2. **Frontend:** Abre `http://localhost:5173`
   - Deberías ver la página de inicio de Machtia
   - Sin errores 404

3. **Probar registro:**
   - Click en "Comenzar Ahora"
   - Completa el formulario de registro
   - Deberías poder crear una cuenta exitosamente

---

## 🐳 Servicios Docker

El proyecto usa 3 contenedores:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **Backend** (Django) | 8000 | API REST del backend |
| **MongoDB** | 27017 | Base de datos |
| **Mongo Express** | 8081 | Interfaz web para MongoDB |

### Comandos útiles de Docker

```bash
# Ver servicios corriendo
docker ps

# Ver logs del backend
docker compose logs backend --tail=50 -f

# Reiniciar servicios
docker compose restart

# Detener servicios
docker compose down

# Reiniciar TODO desde cero (BORRA DATOS)
docker compose down
docker volume rm machtia_mongodb_data
docker compose up -d --build
```

---

## 📁 Estructura del Proyecto

```
machtia/
├── machtia/                    # Backend Django
│   ├── apps/                   # Aplicaciones Django
│   │   ├── autenticacion/      # Sistema de auth y usuarios
│   │   ├── lecciones/          # Gestión de lecciones
│   │   ├── niveles/            # Gestión de niveles
│   │   ├── progreso/           # Seguimiento de progreso
│   │   └── vidas/              # Sistema de vidas
│   ├── config/                 # Configuración de Django
│   ├── docker-compose.yml      # ⚠️ IMPORTANTE: Define servicios Docker
│   ├── Dockerfile              # Imagen del backend
│   ├── init-mongo.js           # ⚠️ IMPORTANTE: Crea usuario de MongoDB
│   ├── .env                    # ⚠️ IMPORTANTE: Variables de entorno
│   └── test_*.py               # Scripts de testing
│
├── machita-front/              # Frontend React Router v7
│   ├── app/                    # Código de la aplicación
│   │   ├── routes/             # ⚠️ IMPORTANTE: Rutas de la app
│   │   │   ├── home.tsx        # Página de inicio
│   │   │   ├── auth.login.tsx  # Login
│   │   │   ├── auth.register.tsx # Registro
│   │   │   └── ...
│   │   ├── routes.ts           # ⚠️ IMPORTANTE: Configuración de rutas
│   │   └── root.tsx            # Layout principal
│   ├── src/                    # Código fuente
│   │   ├── features/           # Features de la app
│   │   │   ├── auth/           # Sistema de autenticación
│   │   │   ├── lecciones/      # Gestión de lecciones
│   │   │   ├── niveles/        # Gestión de niveles
│   │   │   └── ...
│   │   ├── shared/             # Componentes compartidos
│   │   └── components/         # Componentes UI
│   └── .env                    # ⚠️ IMPORTANTE: Variables de entorno
│
├── SETUP.md                    # ← Esta guía
└── TROUBLESHOOTING.md          # Guía de solución de problemas
```

---

## 🔑 Archivos Clave de Configuración

### Backend: `machtia/.env`

```bash
# Django Configuration
DEBUG=True
SECRET_KEY=<genera_uno_nuevo>
JWT_SECRET=<genera_uno_nuevo>

# Network Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ALLOWED_HOSTS=localhost,127.0.0.1

# Puertos
MONGODB_PORT=27017
DJANGO_PORT=8000

# Credenciales MongoDB
MONGODB_ROOT_USER=admin
MONGODB_ROOT_PASSWORD=admin123

# ⚠️ IMPORTANTE: Debe coincidir con init-mongo.js
MONGODB_URI=mongodb://nahuatl_user:nahuatl_pass@localhost:27017/nahuatl_db
```

### Backend: `machtia/init-mongo.js`

```javascript
// ⚠️ IMPORTANTE: Estas credenciales deben coincidir con MONGODB_URI
db.createUser({
  user: 'nahuatl_user',        // Usuario
  pwd: 'nahuatl_pass',         // Contraseña
  roles: [{
    role: 'readWrite',
    db: 'nahuatl_db'
  }]
});
```

### Backend: `machtia/docker-compose.yml`

```yaml
services:
  # ⚠️ IMPORTANTE: Este servicio DEBE existir
  backend:
    build: .
    container_name: nahuatl_backend
    ports:
      - "8000:8000"
    # ... resto de configuración
```

### Frontend: `machita-front/.env`

```bash
# ⚠️ IMPORTANTE: URL del backend
VITE_API_URL=http://localhost:8000/api
```

### Frontend: `machita-front/app/routes.ts`

```typescript
export default [
  // Rutas públicas
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("auth/login", "routes/auth.login.tsx"),

  // ⚠️ IMPORTANTE: Esta ruta DEBE existir para el registro
  route("auth/register", "routes/auth.register.tsx"),

  // ... resto de rutas
] satisfies RouteConfig;
```

---

## ✅ Verificación de la Instalación

Ejecuta estos comandos para verificar que todo está correcto:

### Backend

```bash
cd machtia

# 1. Verificar contenedores Docker
docker ps
# Debes ver: nahuatl_mongodb, nahuatl_backend, nahuatl_mongo_express

# 2. Verificar conexión a MongoDB
python test_mongodb_connection.py
# Debe mostrar: ✅ 5 pruebas exitosas

# 3. Verificar API
curl http://localhost:8000/api/auth/test-connection/
# Debe retornar JSON con "status": "success"

# 4. Ver logs del backend
docker compose logs backend --tail=20
# No debe haber errores de autenticación o conexión
```

### Frontend

```bash
cd machita-front

# 1. Verificar servidor de desarrollo
lsof -i :5173
# Debe mostrar un proceso en el puerto 5173

# 2. Abrir en navegador
# http://localhost:5173
# Debe cargar la página de inicio sin errores 404
```

---

## 🧪 Probar la Aplicación

### Crear cuenta de usuario

1. Abre `http://localhost:5173`
2. Click en **"Comenzar Ahora"**
3. Completa el formulario:
   - Email: `test@ejemplo.com`
   - Nombre: `Usuario de Prueba`
   - Contraseña: `password123`
4. Click en **"Registrarse"**
5. Deberías ser redirigido a la página de aprendizaje

### Iniciar sesión

1. Abre `http://localhost:5173`
2. Click en **"Iniciar Sesión"**
3. Ingresa las credenciales creadas
4. Click en **"Iniciar Sesión"**
5. Deberías acceder a tu cuenta

---

## 🐛 Problemas Comunes

Si tienes problemas, consulta **[TROUBLESHOOTING.md](./machtia/TROUBLESHOOTING.md)** que documenta:

- ❌ Error 404 al intentar registrarse
- ❌ Backend no responde en localhost:8000
- ❌ Error de autenticación MongoDB
- ✅ Verificación de servicios

---

## 🔄 Actualizar el Proyecto

Si haces `git pull` y hay cambios:

```bash
# Backend
cd machtia
docker compose down
docker compose up -d --build

# Frontend
cd ../machita-front
npm install
npm run dev
```

---

## 📦 Scripts Útiles

### Backend

```bash
# Crear usuario de prueba
python test_auth.py

# Poblar base de datos con lecciones
python seed_lecciones.py

# Verificar correcciones de seguridad
python verificar_correcciones.py

# Ver colecciones en MongoDB
# Abre http://localhost:8081
# Usuario: admin
# Contraseña: admin123
```

### Frontend

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar tests
npm run test

# Ejecutar linter
npm run lint
```

---

## 🚀 Siguientes Pasos

Una vez que todo esté funcionando:

1. ✅ Explora la aplicación y crea una cuenta
2. ✅ Completa algunas lecciones
3. ✅ Revisa el código en `machtia/apps/` y `machita-front/src/`
4. ✅ Lee la documentación de las APIs en `Machtia_API.postman_collection.json`
5. ✅ Contribuye al proyecto!

---

## 📚 Recursos Adicionales

- **React Router v7:** https://reactrouter.com/
- **Django REST Framework:** https://www.django-rest-framework.org/
- **MongoDB:** https://docs.mongodb.com/
- **Docker:** https://docs.docker.com/

---

## 💡 Consejos

1. **Siempre usa modo incógnito** para probar autenticación (evita problemas de caché)
2. **Revisa los logs** si algo no funciona: `docker compose logs backend -f`
3. **Usa Mongo Express** para ver la base de datos: `http://localhost:8081`
4. **Recarga con cache limpio** en el frontend: Ctrl+Shift+R (Cmd+Shift+R en Mac)

---

¿Problemas? Consulta **[TROUBLESHOOTING.md](./machtia/TROUBLESHOOTING.md)** 🔧
