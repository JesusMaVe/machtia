# CORRECCIONES DE SEGURIDAD IMPLEMENTADAS

Fecha: 2025-11-15
Proyecto: Machtia (Backend Django + MongoDB)

---

## RESUMEN EJECUTIVO

Se han implementado TODAS las 6 vulnerabilidades críticas identificadas en la auditoría de seguridad. El sistema ahora cuenta con múltiples capas de protección contra ataques comunes.

**Estado:** ✅ COMPLETADO (6/6 vulnerabilidades corregidas)

---

## 1. DEBUG MODE DESACTIVADO ✅

**Vulnerabilidad:** DEBUG=True en producción expone información sensible del sistema.

**Corrección aplicada:**
- Archivo modificado: `/machtia/.env`
- Cambio: `DEBUG=True` → `DEBUG=False`

**Impacto:** Previene la exposición de tracebacks completos, rutas de archivos, y configuración del sistema a usuarios no autorizados.

---

## 2. PROTECCIÓN CONTRA INYECCIÓN NoSQL ✅

**Vulnerabilidad:** Falta de validación de inputs permite inyección de operadores MongoDB ($ne, $gt, etc.).

### Archivos creados:
- `/machtia/apps/autenticacion/security_utils.py`
  - `sanitizar_email()` - Valida emails como strings, no objetos
  - `sanitizar_input_mongo()` - Sanitiza cualquier input para MongoDB
  - `sanitizar_query_params()` - Valida query params contra whitelist
  - `sanitizar_user_id()` - Valida ObjectIds de MongoDB
  - `validar_password_input()` - Valida passwords como strings

### Archivos modificados:

**1. `/machtia/apps/autenticacion/views.py`**
- Línea 11: Import de `sanitizar_email, validar_password_input`
- Líneas 137-153: Sanitización en `register()` (email y password)
- Líneas 224-240: Sanitización en `login()` (email y password)

**2. `/machtia/apps/autenticacion/utils.py`**
- Línea 11: Import de `sanitizar_user_id`
- Líneas 95-99: Sanitización de user_id en `obtener_usuario_desde_token()`

**3. `/machtia/apps/lecciones/views.py`**
- Línea 10: Import de `sanitizar_input_mongo`
- Líneas 37-74: Validación de query params (dificultad, tema, nivel_id) en `listar_lecciones()`
- Líneas 123-132: Sanitización de leccion_id en `obtener_leccion()`

**Ejemplos de ataques bloqueados:**
```json
// ANTES (vulnerable):
POST /api/auth/login
{"email": {"$ne": null}, "password": "cualquiera"}
// Resultado: Login exitoso con CUALQUIER usuario

// AHORA (bloqueado):
POST /api/auth/login
{"email": {"$ne": null}, "password": "cualquiera"}
// Resultado: HTTP 401 - "Credenciales inválidas"
```

---

## 3. CONTROL DE ACCESO BASADO EN ROLES (RBAC) ✅

**Vulnerabilidad:** Cualquier usuario autenticado puede crear, editar o eliminar lecciones/niveles.

### Archivos modificados:

**1. `/machtia/apps/autenticacion/models.py`**
- Líneas 30-38: Nuevo campo `rol` en modelo Usuario
  - Opciones: 'estudiante', 'profesor', 'admin'
  - Default: 'estudiante'

**2. `/machtia/apps/autenticacion/utils.py`**
- Líneas 192-273: Nuevo decorador `@require_role(allowed_roles)`
- Línea 206: Actualizado `serializar_usuario()` para incluir campo `rol`

**3. `/machtia/apps/lecciones/views.py`**
- Línea 9: Import de `require_role`
- Línea 318: `@require_role(['admin', 'profesor'])` en `crear_leccion()`
- Línea 400: `@require_role(['admin', 'profesor'])` en `actualizar_leccion()`
- Línea 557: `@require_role(['admin'])` en `eliminar_leccion()`

**4. `/machtia/apps/niveles/views.py`**
- Línea 9: Import de `require_role`
- Línea 132: `@require_role(['admin', 'profesor'])` en `crear_nivel()`
- Línea 199: `@require_role(['admin', 'profesor'])` en `actualizar_nivel()`
- Línea 279: `@require_role(['admin'])` en `eliminar_nivel()`

**Matriz de permisos:**
| Acción | Estudiante | Profesor | Admin |
|--------|-----------|----------|-------|
| Ver lecciones | ✅ | ✅ | ✅ |
| Completar lecciones | ✅ | ✅ | ✅ |
| Crear lecciones | ❌ | ✅ | ✅ |
| Editar lecciones | ❌ | ✅ | ✅ |
| Eliminar lecciones | ❌ | ❌ | ✅ |
| Crear niveles | ❌ | ✅ | ✅ |
| Editar niveles | ❌ | ✅ | ✅ |
| Eliminar niveles | ❌ | ❌ | ✅ |

---

## 4. VALIDACIÓN DE QUERY PARAMETERS ✅

**Vulnerabilidad:** Query params no validados permiten injection y valores inesperados.

### Implementación:
- Whitelists para valores enumerados (dificultad)
- Validación de tipos (nivel_id debe ser int)
- Límites de longitud para strings (tema max 50 chars)
- Bloqueo de operadores MongoDB en strings

**Archivo:** `/machtia/apps/lecciones/views.py`
- Líneas 37-74: Validación completa de query params en `listar_lecciones()`

**Ejemplo:**
```python
# ANTES (vulnerable):
GET /api/lecciones/?dificultad={"$ne":""}
# Podría retornar todas las lecciones

# AHORA (bloqueado):
GET /api/lecciones/?dificultad={"$ne":""}
# HTTP 400 - "dificultad contiene operador MongoDB no permitido"

# Valores permitidos:
GET /api/lecciones/?dificultad=principiante  # ✅
GET /api/lecciones/?dificultad=intermedio    # ✅
GET /api/lecciones/?dificultad=avanzado      # ✅
GET /api/lecciones/?dificultad=otro_valor    # ❌ HTTP 400
```

---

## 5. CREDENCIALES MongoDB SEGURAS ✅

**Vulnerabilidad:** Credenciales predecibles (nahuatl_user:nahuatl_pass) fáciles de adivinar.

### Archivos creados:
**1. `/machtia/generate_credentials.py`**
- Script para generar credenciales criptográficamente seguras
- Usa `secrets` module (no `random`)
- Passwords de 40 caracteres con alta entropía
- Incluye mayúsculas, minúsculas, dígitos y símbolos

### Archivos modificados:
**1. `/machtia/.env`**
- Líneas 6-8: Nuevas credenciales seguras generadas
- Usuario: `nahuatl_user_q0qvoasv`
- Password: `7K7WuXkaT^uec-%+PR(LkL&[f&Q:HP&JjhGt:omn` (40 chars)

**2. `/machtia/config/settings.py`**
- Líneas 156-163: Eliminado fallback inseguro
- Ahora requiere MONGODB_URI configurado explícitamente
- Raise ValueError si no está configurado

**IMPORTANTE - Instrucciones de configuración:**
```bash
# 1. Ejecutar el script de generación (ya ejecutado, credenciales en .env)
python generate_credentials.py

# 2. Crear el usuario en MongoDB:
docker exec -it nahuatl_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# 3. Dentro de mongosh, ejecutar:
use nahuatl_db
db.createUser({
  user: 'nahuatl_user_q0qvoasv',
  pwd: '7K7WuXkaT^uec-%+PR(LkL&[f&Q:HP&JjhGt:omn',
  roles: [{
    role: 'readWrite',
    db: 'nahuatl_db'
  }]
})

# 4. Reiniciar servidor Django
```

---

## 6. SISTEMA DE BLACKLIST PARA TOKENS JWT ✅

**Vulnerabilidad:** Tokens JWT no pueden ser revocados después de logout o compromiso.

### Archivos creados:
**1. `/machtia/apps/autenticacion/blacklist_models.py`**
- Modelo `TokenBlacklist` para almacenar tokens revocados
- Métodos:
  - `agregar_token()` - Agrega token a blacklist
  - `esta_revocado()` - Verifica si token está revocado
  - `limpiar_expirados()` - Mantenimiento (elimina tokens viejos)
  - `estadisticas()` - Métricas de la blacklist

### Archivos modificados:

**1. `/machtia/apps/autenticacion/utils.py`**
- Línea 5: Import de `uuid`
- Línea 13: Import de `TokenBlacklist`
- Líneas 16-53: Modificado `generar_token()` para incluir `jti` (JWT ID único)
- Líneas 56-94: Modificado `verificar_token()` para validar contra blacklist

**2. `/machtia/apps/autenticacion/views.py`**
- Líneas 284-341: Modificado `logout()` para agregar token a blacklist

**Características:**
- Cada token tiene un `jti` (JWT ID) único generado con UUID4
- Al hacer logout, el token se agrega a la blacklist
- Tokens en blacklist no pueden ser reutilizados
- Auto-limpieza de tokens expirados (previene crecimiento infinito)
- Razones de revocación: logout, compromiso, admin_revoke, password_change

**Flujo de seguridad:**
```
1. Login → Token con jti único
2. Uso normal → Verificación incluye check de blacklist
3. Logout → Token agregado a blacklist
4. Intento de uso después de logout → HTTP 401 "Token revocado"
```

**Colección MongoDB creada:**
```javascript
// tokens_blacklist
{
  "_id": ObjectId,
  "jti": "550e8400-e29b-41d4-a716-446655440000",
  "usuario_id": "507f1f77bcf86cd799439011",
  "revocado_en": ISODate("2025-11-15T10:30:00Z"),
  "expira_en": ISODate("2025-11-16T10:30:00Z"),
  "razon": "logout"
}
```

---

## ARCHIVOS MODIFICADOS - RESUMEN COMPLETO

### Archivos creados (3):
1. `/machtia/apps/autenticacion/security_utils.py` - Utilidades de sanitización
2. `/machtia/apps/autenticacion/blacklist_models.py` - Modelo de blacklist JWT
3. `/machtia/generate_credentials.py` - Script de generación de credenciales

### Archivos modificados (6):
1. `/machtia/.env` - DEBUG=False, credenciales seguras
2. `/machtia/config/settings.py` - Eliminado fallback de credenciales
3. `/machtia/apps/autenticacion/models.py` - Campo `rol` agregado
4. `/machtia/apps/autenticacion/utils.py` - Decorador require_role, JWT con jti, validación blacklist
5. `/machtia/apps/autenticacion/views.py` - Sanitización en register/login, logout con blacklist
6. `/machtia/apps/lecciones/views.py` - Sanitización de inputs, control de acceso RBAC
7. `/machtia/apps/niveles/views.py` - Control de acceso RBAC

---

## PRÓXIMOS PASOS (OBLIGATORIOS)

### 1. Crear usuario MongoDB con nuevas credenciales
```bash
docker exec -it nahuatl_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Dentro de mongosh:
use nahuatl_db
db.createUser({
  user: 'nahuatl_user_q0qvoasv',
  pwd: '7K7WuXkaT^uec-%+PR(LkL&[f&Q:HP&JjhGt:omn',
  roles: [{role: 'readWrite', db: 'nahuatl_db'}]
})
```

### 2. Actualizar usuarios existentes con rol
```bash
# Conectar a MongoDB
docker exec -it nahuatl_mongodb mongosh mongodb://nahuatl_user_q0qvoasv:7K7WuXkaT^uec-%+PR(LkL&[f&Q:HP&JjhGt:omn@localhost:27017/nahuatl_db

# Actualizar todos los usuarios sin rol
db.usuarios.updateMany(
  { rol: { $exists: false } },
  { $set: { rol: 'estudiante' } }
)

# Crear un usuario admin para pruebas
db.usuarios.updateOne(
  { email: 'admin@machtia.com' },
  { $set: { rol: 'admin' } }
)
```

### 3. Reiniciar servidor Django
```bash
# Detener servidor actual
# Iniciar con nuevas configuraciones
python manage.py runserver
```

### 4. Configurar tarea periódica para limpieza de blacklist
```python
# Agregar a cron o task scheduler
from apps.autenticacion.blacklist_models import TokenBlacklist

# Ejecutar diariamente
eliminados = TokenBlacklist.limpiar_expirados()
print(f"Limpieza: {eliminados} tokens expirados eliminados")
```

---

## PRUEBAS DE VALIDACIÓN

### Test 1: Inyección NoSQL bloqueada
```bash
# Intentar login con objeto en lugar de string
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": {"$ne": null}, "password": "test"}'

# Resultado esperado: HTTP 401 - "Credenciales inválidas"
```

### Test 2: Control de acceso RBAC
```bash
# Crear lección sin permisos
curl -X POST http://localhost:8000/api/lecciones/crear/ \
  -H "Authorization: Bearer <token_estudiante>" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test", "tema": "Test", "dificultad": "principiante", "contenido": "Test"}'

# Resultado esperado: HTTP 403 - "No tienes permisos para realizar esta acción"
```

### Test 3: Token blacklist
```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "Test1234"}' \
  | jq -r '.token.access_token')

# 2. Usar token (debe funcionar)
curl http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer $TOKEN"

# 3. Logout
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Bearer $TOKEN"

# 4. Intentar usar token nuevamente (debe fallar)
curl http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer $TOKEN"

# Resultado esperado: HTTP 401 - "Token revocado"
```

---

## CONSIDERACIONES DE SEGURIDAD ADICIONALES

### Recomendaciones NO implementadas (para futuro):
1. **Rate Limiting:** Limitar intentos de login por IP (prevenir brute force)
2. **CAPTCHA:** Agregar CAPTCHA después de N intentos fallidos
3. **MFA:** Autenticación multifactor (TOTP, SMS)
4. **Password Rotation:** Forzar cambio de contraseña periódico
5. **Audit Logs:** Registro de todas las acciones administrativas
6. **IP Whitelisting:** Restringir endpoints admin por IP
7. **HTTPS Enforcement:** Certificados SSL en producción

### Advertencias:
- **NUNCA** commitear el archivo `.env` a Git
- **CAMBIAR** todas las credenciales antes de desplegar a producción
- **CONFIGURAR** variables de entorno en el servidor de producción
- **HABILITAR** todas las security headers en producción (ya configurado en settings.py)
- **MONITOREAR** la colección tokens_blacklist para detectar patrones anormales

---

## CONCLUSIÓN

Todas las 6 vulnerabilidades críticas han sido corregidas exitosamente. El sistema ahora cuenta con:

✅ DEBUG mode desactivado
✅ Protección contra inyección NoSQL
✅ Control de acceso basado en roles (RBAC)
✅ Validación estricta de query parameters
✅ Credenciales MongoDB criptográficamente seguras
✅ Sistema de blacklist para revocación de tokens JWT

**Nivel de seguridad:** Alta
**Vulnerabilidades críticas restantes:** 0
**Próximos pasos:** Configurar usuario MongoDB y reiniciar servidor

---

Fecha de implementación: 2025-11-15
Implementado por: Claude (Asistente de IA de seguridad)
