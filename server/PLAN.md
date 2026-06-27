# Plan de Backend — CaféLog (`server/`)

> Plan de arquitectura e implementación. No hay código todavía. Fecha: 2025-06-27.

---

## Evaluación del stack propuesto

El stack base (Node.js + Express + TypeScript + pnpm + PostgreSQL + Prisma + JWT) es el correcto para este proyecto. Tres ajustes recomendados:

| Adición | Por qué |
|---|---|
| **Zod** | Validación de inputs con tipos TypeScript inferidos. Complementa Prisma perfectamente. |
| **bcryptjs** | Hashear la contraseña del usuario. Más portable que `argon2` (no requiere compilación nativa). |
| **Neon** en lugar de Render DB | Tier gratuito más generoso, branching de DB para dev/prod, mejor latencia. Render DB gratis se elimina a los 90 días. |
| **helmet + cors + morgan** | Seguridad HTTP básica y logs de requests. Tres líneas de configuración. |

Sobre deploy: Render backend en plan gratuito hace spin-down después de 15 min de inactividad (cold start ~30s). Aceptable para uso personal de Yeison. Si molesta, Railway tiene plan gratuito sin spin-down.

---

## 1. Estructura de carpetas de `server/`

```
server/
├── prisma/
│   ├── schema.prisma           # Definición de modelos y relaciones
│   └── seed.ts                 # Datos iniciales (usuario Yeison + tipos de café base)
│
├── src/
│   ├── index.ts                # Entry point: arranca el servidor HTTP
│   ├── app.ts                  # Express: registra middlewares globales y rutas
│   │
│   ├── config/
│   │   └── env.ts              # Lee y valida variables de entorno con Zod; falla si falta alguna
│   │
│   ├── db/
│   │   └── client.ts           # Instancia singleton de PrismaClient (evita conexiones duplicadas)
│   │
│   ├── middleware/
│   │   ├── auth.ts             # Verifica JWT en Authorization header; inyecta req.user
│   │   ├── errorHandler.ts     # Captura todos los errores no manejados; responde JSON uniforme
│   │   └── validate.ts         # Factory que toma un schema Zod y valida req.body antes del controller
│   │
│   ├── routes/
│   │   ├── index.ts            # Monta todos los routers bajo /api/v1 con authMiddleware global
│   │   ├── auth.ts             # Rutas públicas: /login, /me
│   │   ├── compras.ts
│   │   ├── lotes.ts
│   │   ├── tiposCafe.ts
│   │   ├── configuracion.ts
│   │   └── resumen.ts
│   │
│   ├── controllers/            # Maneja req/res: parsea input, llama al service, responde JSON
│   │   ├── auth.controller.ts
│   │   ├── compras.controller.ts
│   │   ├── lotes.controller.ts
│   │   ├── tiposCafe.controller.ts
│   │   ├── configuracion.controller.ts
│   │   └── resumen.controller.ts
│   │
│   ├── services/               # Lógica de negocio y acceso a DB; no sabe de req/res
│   │   ├── auth.service.ts
│   │   ├── compras.service.ts
│   │   ├── lotes.service.ts
│   │   ├── tiposCafe.service.ts
│   │   ├── configuracion.service.ts
│   │   └── calculos.service.ts  # Kilos secos, ganancia, semanas ISO — espejo de calculos.ts del frontend
│   │
│   ├── schemas/                # Schemas Zod para validar inputs de la API
│   │   ├── compra.schema.ts
│   │   ├── lote.schema.ts
│   │   ├── tipoCafe.schema.ts
│   │   └── configuracion.schema.ts
│   │
│   └── types/
│       └── index.ts            # Tipos TS internos: RequestWithUser, ApiResponse<T>, etc.
│
├── .env                        # Variables locales (no subir al repo)
├── .env.example                # Template con todas las variables necesarias (sin valores)
├── package.json
├── tsconfig.json
└── .gitignore
```

**Decisión de capas:** La separación `routes → controllers → services` permite testear los services de forma aislada en el futuro. Los controllers son deliberadamente delgados: solo adaptan HTTP ↔ lógica.

---

## 2. Esquema de base de datos (Prisma)

### Decisión: CostoAdicional como JSON embebido

`CostoAdicional` **no será tabla propia** para `costosAdicionales` de `Compra` ni para `gastosAdicionales` de `Lote`. Razones:

- Nunca se consultan individualmente por ID desde fuera de su padre
- Siempre se leen/escriben junto con la entidad que los contiene
- No hay relaciones cruzadas entre costos adicionales de diferentes compras o lotes
- Evita JOINs innecesarios y simplifica el schema enormemente

`costosFrecuentes` de `Configuracion` → también JSON por el mismo motivo.

La única entidad que merece tabla propia es `TipoCafe`, porque `Compra.tipoCafeId` la referencia como foreign key real.

---

### Modelos

#### `Usuario`
| Campo | Tipo | Notas |
|---|---|---|
| id | String (CUID) | PK |
| email | String | único |
| passwordHash | String | bcrypt |
| nombre | String | "Yeison" |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

#### `TipoCafe`
| Campo | Tipo | Notas |
|---|---|---|
| id | String | PK — se preserva el ID original del frontend (timestamp-random) |
| nombre | String | "Pergamino", "Pasilla", "Cereza" |
| color | String | hex, ej: "#b8833a" |
| usuarioId | String | FK → Usuario (multiusuario futuro) |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

#### `Compra`
| Campo | Tipo | Notas |
|---|---|---|
| id | String | PK |
| fecha | String | "YYYY-MM-DD" — se preserva como string para evitar problemas de timezone |
| agricultor | String | |
| tipoCafeId | String | FK → TipoCafe |
| estado | Enum `EstadoCafe` | `humedo` \| `seco` |
| kilos | Float | |
| precioPorKilo | Int | pesos COP, siempre entero |
| costosAdicionales | Json | `CostoAdicional[]` embebido |
| notas | String | default "" |
| loteId | String? | FK → Lote (nullable) |
| usuarioId | String | FK → Usuario |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

> **Nota sobre `fecha` como String:** El frontend usa `"YYYY-MM-DD"` y aplica `+ 'T12:00:00'` para evitar el offset de Colombia (-5h). Preservar el string evita introducir ese bug en el servidor y mantiene compatibilidad exacta con el cliente.

#### `Lote`
| Campo | Tipo | Notas |
|---|---|---|
| id | String | PK |
| nombre | String | |
| fechaCreacion | String | "YYYY-MM-DD" |
| precioVentaPorKilo | Int? | null si aún no está vendido |
| estado | Enum `EstadoLote` | `abierto` \| `vendido` |
| gastosAdicionales | Json | `CostoAdicional[]` embebido |
| usuarioId | String | FK → Usuario |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

> **Nota sobre `compraIds`:** En el frontend `Lote.compraIds` es un array de IDs. En la DB la relación se modela con `Compra.loteId` (foreign key inversa). La API puede derivar `compraIds` de `SELECT id FROM compra WHERE loteId = X` sin necesitar almacenarlo. El frontend puede seguir recibiendo `compraIds` en la respuesta, pero como campo calculado.

#### `Configuracion`
| Campo | Tipo | Notas |
|---|---|---|
| id | String | PK — valor fijo `"config-{usuarioId}"` para facilitar upsert |
| porcentajePerdidaSecado | Int | default 50 |
| costosFrecuentes | Json | `CostoAdicional[]` embebido |
| usuarioId | String | FK → Usuario, único |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

> `TipoCafe` está separado de `Configuracion` a nivel de tabla, pero el endpoint `GET /configuracion` los devuelve juntos para que el cliente reciba exactamente la misma estructura que tenía en localStorage.

---

### Enums de Prisma

```
enum EstadoCafe  { humedo  seco }
enum EstadoLote  { abierto vendido }
```

---

## 3. Endpoints REST

Base URL: `/api/v1`

Todas las rutas excepto `/auth/login` requieren `Authorization: Bearer <token>`.

Las respuestas siguen el formato:
```
{ data: T }                    // éxito
{ error: string, details?: T } // error
```

---

### Auth

| Método | Ruta | Body | Respuesta | Descripción |
|---|---|---|---|---|
| POST | `/auth/login` | `{email, password}` | `{token, usuario}` | Login; retorna JWT |
| GET | `/auth/me` | — | `{usuario}` | Verifica token; retorna datos del usuario |

> No hay registro público. El usuario Yeison se crea en el `seed.ts`. Para multiusuario futuro, se agrega `POST /auth/register` aquí.

---

### Compras

| Método | Ruta | Query params | Body | Descripción |
|---|---|---|---|---|
| GET | `/compras` | `semana`, `tipoCafeId`, `agricultor`, `estado`, `loteId` | — | Lista de compras con filtros opcionales |
| POST | `/compras` | — | `CompraInput` | Crear compra nueva |
| GET | `/compras/:id` | — | — | Detalle de una compra |
| PUT | `/compras/:id` | — | `CompraInput` | Actualizar compra completa |
| DELETE | `/compras/:id` | — | — | Eliminar compra (desvincula del lote si estaba asignada) |

`CompraInput`: `{fecha, agricultor, tipoCafeId, estado, kilos, precioPorKilo, costosAdicionales, notas, loteId?}`

---

### Lotes

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/lotes` | — | Lista de todos los lotes con `compraIds` calculado |
| POST | `/lotes` | `{nombre, fechaCreacion}` | Crear lote vacío |
| GET | `/lotes/:id` | — | Detalle del lote + compras completas incluidas |
| PUT | `/lotes/:id` | `LoteInput` | Actualizar nombre, gastosAdicionales |
| DELETE | `/lotes/:id` | — | Eliminar lote (desvincula compras, no las borra) |
| PUT | `/lotes/:id/vender` | `{precioVentaPorKilo}` | Marcar como vendido con precio de venta |
| PUT | `/lotes/:id/compras` | `{compraIds}` | Reemplaza el conjunto de compras del lote |

> **Por qué `PUT /lotes/:id/compras`:** En la UI se agregan/quitan compras del lote. Es más claro tener un endpoint dedicado que enviar `compraIds` completos cada vez que se edita el nombre del lote.

---

### Tipos de Café

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/tipos-cafe` | — | Lista de todos los tipos del usuario |
| POST | `/tipos-cafe` | `{nombre, color}` | Crear tipo de café |
| PUT | `/tipos-cafe/:id` | `{nombre, color}` | Actualizar nombre o color |
| DELETE | `/tipos-cafe/:id` | — | Eliminar (falla si hay compras que lo referencian) |

---

### Configuración

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| GET | `/configuracion` | — | Devuelve `{porcentajePerdidaSecado, tiposCafe[], costosFrecuentes[]}` — misma forma que localStorage |
| PUT | `/configuracion` | `{porcentajePerdidaSecado?, costosFrecuentes?}` | Actualizar configuración (patch parcial) |

> `tiposCafe` no se actualiza aquí; tiene su propio recurso REST. Pero GET devuelve el objeto completo para que el cliente reciba todo en un solo request al iniciar.

---

### Resumen

| Método | Ruta | Query params | Descripción |
|---|---|---|---|
| GET | `/resumen/semana` | `semana=2025-W26` | `ResumenSemana` para la semana indicada. Réplica de `resumenSemana()` del frontend. |

El servidor calcula `totalKilosSecos` usando el `porcentajePerdidaSecado` de la configuración del usuario. Esto garantiza que el cálculo sea consistente aunque el % cambie en el futuro.

---

## 4. Estrategia de migración

### El problema

El frontend tiene datos en `localStorage`. Los usuarios no deben perderlos al hacer el switch a la API.

### Fase 1 — Capa de abstracción en el cliente

Crear `client/src/api/client.ts`: un módulo con funciones como `getCompras()`, `createCompra()`, etc., que internamente llaman a `fetch` con el token JWT. Este módulo reemplaza el rol que hoy hace `useStorage`.

El `AppContext.tsx` actualmente usa `useStorage` directamente. La migración consiste en:
1. Cambiar cada `useStorage` por un `useQuery`/`useMutation` propio (fetch nativo, sin librerías por ahora)
2. El estado local en React sigue existiendo — la API es la fuente de verdad, React cache local
3. En el arranque: `useEffect` llama a `GET /compras`, `GET /lotes`, `GET /configuracion` en paralelo

### Fase 2 — Script de migración one-shot

Una página o botón oculto en `/configuracion` que:
1. Lee `localStorage` (`cafelog_compras`, `cafelog_lotes`, `cafelog_config`)
2. Llama a `POST /migration/import` con el JSON completo
3. El servidor hace `upsert` de todos los datos preservando los IDs originales (por eso el campo `id` de la DB acepta strings externos, no auto-incrementos)
4. Al terminar, marca `cafelog_migrated = "1"` en localStorage y el hook deja de leer del storage

### Fase 3 — Limpieza

Una vez confirmado que la API funciona, el hook `useStorage` queda obsoleto. Se pueden eliminar las lecturas del localStorage en `AppContext` y dejar solo el tema (`cafelog_theme`) que no necesita backend.

### Cómo queda el hook de tema

`useTheme` se queda en localStorage — el tema es una preferencia de UI del dispositivo, no un dato de negocio que necesite sincronización.

---

## 5. Variables de entorno (`.env`)

```
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos (Neon o Render DB)
DATABASE_URL=postgresql://user:password@host/cafelog?sslmode=require

# JWT
JWT_SECRET=una-clave-larga-aleatoria-de-al-menos-32-caracteres
JWT_EXPIRES_IN=30d

# CORS — origen permitido del frontend
CORS_ORIGIN=http://localhost:5173

# En producción:
# CORS_ORIGIN=https://cafelog.tu-dominio.com
```

> `JWT_EXPIRES_IN=30d` da una sesión de 30 días. Para un usuario personal único que accede desde su celular todos los días, este valor es razonable. No hay refresh tokens por ahora; si el token expira, Yeison vuelve a hacer login.

---

## 6. Orden de implementación

El criterio es: cada paso se puede probar con `curl` o un cliente HTTP antes de tocar el frontend.

### Paso 1 — Scaffolding del proyecto
Inicializar `server/` con `pnpm init`, instalar dependencias, configurar `tsconfig.json`, crear `src/index.ts` con un Express mínimo que responda `GET /health → 200 OK`. Verificar que compila y corre.

### Paso 2 — Base de datos y Prisma
Crear cuenta en Neon, obtener `DATABASE_URL`. Escribir `schema.prisma` con todos los modelos. Correr `prisma migrate dev`. Escribir `seed.ts` con el usuario Yeison y los 3 tipos de café base. Verificar con `prisma studio`.

### Paso 3 — Autenticación
Implementar `POST /auth/login` y el middleware `auth.ts`. Probar con curl: login exitoso retorna token, el middleware rechaza requests sin token. Esta es la base que todas las rutas siguientes necesitan.

### Paso 4 — Tipos de Café
La entidad más simple: sin relaciones complejas, sin cálculos. CRUD completo. Probar los 4 endpoints.

### Paso 5 — Configuración
`GET /configuracion` y `PUT /configuracion`. Verificar que el GET devuelve `tiposCafe[]` junto con el porcentaje y costos frecuentes (objeto combinado igual al localStorage).

### Paso 6 — Compras
CRUD completo con filtros en GET. Verificar que los filtros por `semana`, `tipoCafeId` y `agricultor` funcionan. `costosAdicionales` llega como JSON y se guarda como JSON.

### Paso 7 — Lotes
CRUD completo + `PUT /lotes/:id/vender` + `PUT /lotes/:id/compras`. Verificar la lógica de vincular/desvincular compras (actualiza `Compra.loteId`).

### Paso 8 — Resumen semanal
`GET /resumen/semana`. Implementar en `calculos.service.ts` la misma lógica de semanas ISO que ya existe en el frontend. Probar con la semana actual y verificar que los números coinciden con lo que muestra el Dashboard.

### Paso 9 — Endpoint de migración
`POST /migration/import` que recibe el dump de localStorage y hace upsert de todo. Probar con los datos de ejemplo del frontend.

### Paso 10 — Integración con el frontend
Crear `client/src/api/client.ts`. Migrar `AppContext.tsx` para usar la API. Agregar pantalla de login simple. Probar el flujo completo en local: login → ver datos → crear compra → ver en dashboard.

### Paso 11 — Deploy
Configurar Render para el servidor (desde repositorio GitHub). Configurar variables de entorno en Render. Apuntar `CORS_ORIGIN` al dominio del frontend en producción. Verificar con Neon que las migraciones están aplicadas.

---

## Consideraciones adicionales para multiusuario futuro

Todas las tablas tienen `usuarioId`. El middleware de auth ya inyecta `req.user`. Los services siempre filtran por `where: { usuarioId: req.user.id }`. Cuando llegue el momento de multiusuario, el trabajo es:
1. Agregar `POST /auth/register`
2. Quitar el seed de usuario único
3. No hay cambios de schema

La arquitectura ya lo soporta desde el día uno.
