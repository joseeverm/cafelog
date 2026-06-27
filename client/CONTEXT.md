# CaféLog — Contexto del Proyecto

> Este archivo es la fuente de verdad para sesiones de Claude Code. Léelo completo antes de tocar cualquier cosa.

---

## 1. Descripción del Proyecto

**CaféLog** es una aplicación web de gestión de compras de café para compradores intermediarios (también llamados "cosecheros" o "compradores de finca"). El usuario típico es una persona que recorre fincas comprando café en diferentes estados (húmedo o seco), agrupa las compras en lotes de secado, y luego vende esos lotes calculando su ganancia.

**Flujo principal del negocio:**
1. El comprador registra cada compra de café: agricultor, kilos, precio/kg, costos adicionales (transporte, sacos, etc.)
2. Agrupa varias compras en un **lote** de secado
3. El café húmedo pierde peso al secarse (configurado como % de pérdida)
4. Al vender el lote, registra el precio de venta por kilo seco y ve la ganancia neta

**Estado:** 100% frontend, sin backend. Todos los datos viven en `localStorage`.

---

## 2. Stack Técnico

| Herramienta | Versión | Nota |
|---|---|---|
| React | ^19.2.7 | Con React DOM |
| Vite | ^8.1.0 | Bundler y dev server |
| TypeScript | ~6.0.2 | Strict mode |
| Tailwind CSS | ^4.3.1 | **v4** — integrado vía plugin de Vite, NO PostCSS |
| @tailwindcss/vite | ^4.3.1 | Plugin de Vite (reemplaza `postcss.config.js`) |
| React Router DOM | ^7.18.0 | Rutas client-side |
| lucide-react | ^1.21.0 | Todos los íconos de la UI |
| jspdf | ^4.2.1 | Exportar PDF |
| jspdf-autotable | ^5.0.8 | Tablas en PDF |
| xlsx | ^0.18.5 | Exportar Excel |
| oxlint | ^1.69.0 | Linter (reemplaza ESLint) |

**Comandos:**
```bash
pnpm dev          # servidor de desarrollo
pnpm build        # build de producción (tsc -b && vite build)
pnpm tsc --noEmit # verificar tipos sin compilar
```

---

## 3. Estructura de Carpetas

```
client/
├── public/
├── src/
│   ├── App.tsx                    # Raíz: AppProvider → ThemeProvider → Router → Layout
│   ├── main.tsx                   # Entry point de React
│   ├── index.css                  # Estilos globales + temas dark/gtavi (CSS fuera de @layer)
│   ├── App.css                    # Vacío / sin uso relevante
│   │
│   ├── types/
│   │   └── index.ts               # Todas las interfaces TypeScript del dominio
│   │
│   ├── hooks/
│   │   ├── useStorage.ts          # Hook genérico para sincronizar estado con localStorage
│   │   └── useTheme.ts            # Hook de tema (light/dark/gtavi), maneja clases en <html>
│   │
│   ├── context/
│   │   ├── AppContext.tsx         # Estado global: compras, lotes, config + todas las mutaciones
│   │   └── ThemeContext.tsx       # Contexto de tema (wrappea useTheme para evitar prop drilling)
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx          # Ruta "/": resumen semanal, tarjetas, compras recientes
│   │   ├── NuevaCompra.tsx        # Ruta "/nueva-compra": página dedicada con FormularioCompra
│   │   ├── Lotes.tsx              # Ruta "/lotes": lista + detalle de lotes, gastos, vender
│   │   ├── Historial.tsx          # Ruta "/historial": tabla filtrable, edición, exportar
│   │   └── Configuracion.tsx      # Ruta "/configuracion": tema, tipos de café, costos frecuentes
│   │
│   ├── components/
│   │   ├── Layout.tsx             # Sidebar desktop + bottom nav móvil + <Outlet />
│   │   ├── PageHeader.tsx         # Cabecera reutilizable con título, subtítulo y acción
│   │   ├── Boton.tsx              # Botón con variantes: primario | secundario | peligro | ghost
│   │   ├── Modal.tsx              # Modal genérico con overlay y botón de cierre (icono X)
│   │   ├── Tarjeta.tsx            # Card de métrica con título, valor, ícono y color opcional
│   │   ├── BadgeEstado.tsx        # Badge visual para estado de café (húmedo/seco) y lote
│   │   ├── EstadoVacio.tsx        # Componente de "sin datos" con ícono, mensaje y acción
│   │   ├── FormularioCompra.tsx   # Formulario completo de compra (nueva y edición)
│   │   └── InputMoneda.tsx        # Input de texto con auto-formateo de miles (es-CO)
│   │
│   └── utils/
│       ├── calculos.ts            # Toda la lógica de negocio (kilos secos, ganancia, semanas)
│       ├── formato.ts             # Formateo de pesos, números, fechas, IDs
│       ├── exportar.ts            # Exportar Excel (xlsx) y PDF (jspdf + autotable)
│       └── datosEjemplo.ts        # Datos iniciales que se cargan en el primer uso
│
├── CONTEXT.md                     # Este archivo
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 4. Tipos Principales (`src/types/index.ts`)

```typescript
interface TipoCafe {
  id: string      // generarId()
  nombre: string  // "Pergamino", "Pasilla", "Cereza"
  color: string   // hex, ej: "#b8833a"
}

interface CostoAdicional {
  id: string
  descripcion: string  // "Transporte", "Sacos", etc.
  monto: number        // siempre entero, pesos colombianos
}

type EstadoCafe = 'humedo' | 'seco'
type EstadoLote = 'abierto' | 'vendido'

interface Compra {
  id: string
  fecha: string           // "YYYY-MM-DD"
  agricultor: string
  tipoCafeId: string      // referencia a TipoCafe.id
  estado: EstadoCafe
  kilos: number
  precioPorKilo: number
  costosAdicionales: CostoAdicional[]
  notas: string
  loteId?: string         // opcional, referencia a Lote.id
}

interface Lote {
  id: string
  nombre: string
  fechaCreacion: string   // "YYYY-MM-DD"
  compraIds: string[]     // IDs de compras incluidas en el lote
  precioVentaPorKilo?: number  // solo si estado === 'vendido'
  estado: EstadoLote
  gastosAdicionales: CostoAdicional[]  // gastos propios del lote (secado, flete, empaque)
}

interface Configuracion {
  porcentajePerdidaSecado: number  // default 50 (%)
  tiposCafe: TipoCafe[]
  costosFrecuentes: CostoAdicional[]  // acceso rápido al crear compras
}

interface ResumenSemana {
  semana: string            // "2025-W26" formato ISO
  totalKilosComprados: number
  totalKilosSecos: number
  totalInvertido: number
  cantidadCompras: number
}
```

---

## 5. Lógica de Negocio Clave (`src/utils/calculos.ts`)

### Kilos secos estimados
```typescript
kilosSecos(kilos, estado, porcentajePerdida):
  si estado === 'seco'  → kilos (sin cambio)
  si estado === 'humedo' → kilos * (1 - porcentajePerdida / 100)
// Ej: 100 kg húmedos con 50% pérdida = 50 kg secos
```

### Total pagado por compra
```typescript
totalPagadoCompra(compra) = compra.kilos * compra.precioPorKilo + Σ(costosAdicionales.monto)
```

### Ganancia de un lote
```typescript
gananciaLote(lote, compras, config):
  si no hay precioVentaPorKilo → null
  secos = kilosSecosTotales(comprasDelLote, config)
  invertido = totalInvertido(comprasDelLote) + totalGastosLote(lote)
  ganancia = secos * precioVentaPorKilo - invertido
```

### Resumen semanal
Filtra compras por semana ISO (lunes a domingo), suma kilos, kilos secos y total invertido. La semana se calcula con el algoritmo ISO 8601 — funciones `getSemanaISO()`, `getSemanaActual()`, `semanaAnterior()`, `semanaSiguiente()`.

---

## 6. Páginas y Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Dashboard` | Panel con 4 tarjetas métricas (kilos, secos, invertido, cantidad), navegador de semanas, y lista de 5 compras más recientes. Tiene FAB en móvil y botón en header para abrir modal de nueva compra. Tocar una compra reciente abre el modal de edición (igual que "Editar" en Historial). |
| `/nueva-compra` | `NuevaCompra` | Página full con `FormularioCompra`. "Guardar" redirige a `/`, "Guardar y nueva" recarga la página. |
| `/lotes` | `Lotes` | Lista de lotes a la izquierda + detalle al lado derecho. Desde el detalle se agregan/editan gastos del lote y se marca como vendido (abre modal con precio de venta). |
| `/historial` | `Historial` | Tabla de todas las compras con filtros por semana, tipo de café, agricultor y estado. Permite editar y eliminar compras. Botones para exportar Excel y PDF. |
| `/configuracion` | `Configuracion` | Selector de tema (grid 2×2), slider de % de pérdida por secado, CRUD de tipos de café con color picker, CRUD de costos frecuentes. |

**Layout:** Sidebar fijo en desktop (260px), bottom nav de 5 ítems en móvil. El ítem "Nueva Compra" usa la etiqueta corta "Compra" en móvil (`labelMovil`).

---

## 7. Persistencia (`useStorage` + `localStorage`)

### Hook `useStorage`
```typescript
// src/hooks/useStorage.ts
useStorage<T>(key: string, valorInicial: T): [T, (valor: T) => void]
```
- Inicializa desde `localStorage` o usa `valorInicial` si no existe
- Sincroniza con `localStorage` en cada cambio vía `useEffect`
- **IMPORTANTE:** El setter es un reemplazo total del valor, NO un setter funcional de React. Siempre pasar el nuevo valor completo (sin `prev => ...`).

### Keys de `localStorage`

| Key | Tipo | Descripción |
|---|---|---|
| `cafelog_compras` | `Compra[]` | Array de todas las compras |
| `cafelog_lotes` | `Lote[]` | Array de todos los lotes |
| `cafelog_config` | `Configuracion` | Configuración del usuario |
| `cafelog_initialized` | `"1"` | Flag de primera ejecución (se setea con `localStorage.setItem`, no con `useStorage`) |
| `cafelog_theme` | `'light' \| 'dark' \| 'gtavi'` | Tema activo (manejado por `useTheme`, no por `useStorage`) |

### Datos de ejemplo
Al primer arranque (si `cafelog_initialized` no existe), se cargan datos de `datosEjemplo.ts`:
- 3 tipos de café: Pergamino, Pasilla, Cereza
- 2 costos frecuentes: Transporte ($15.000), Sacos ($3.000)
- 5 compras de los últimos días
- 1 lote abierto con 3 compras
- Porcentaje de pérdida: 50%

---

## 8. Sistema de Temas

### Implementación
- `useTheme.ts` maneja el estado y aplica clases en `<html>`
- `ThemeContext.tsx` expone el tema vía React Context (evita prop drilling hacia `Configuracion`)
- Tema activo se persiste en `localStorage` clave `cafelog_theme`

### Temas disponibles

| ID | Clases en `<html>` | Descripción |
|---|---|---|
| `light` | *(ninguna)* | Claro con acento amber/dorado |
| `dark` | `.dark` | Oscuro con acento amber, fondos zinc |
| `gtavi` | `.dark .gtavi` | Vice City: fondos purple-black, acento magenta `#f72585`, gradientes |

### Tailwind dark mode
Configurado en `index.css` con `@variant dark (&:where(.dark, .dark *))` — modo por clase, no por `prefers-color-scheme`.

### CSS de temas custom
Los overrides para `gtavi` están al final de `index.css` **fuera de cualquier `@layer`**. Esto garantiza mayor especificidad que las utilidades de Tailwind (que viven en `@layer utilities`). Se usa `!important` adicionalmente. El tema GTA VI incluye cambios de UI propios: franja de gradiente en cabeceras (`.page-header::before`), logo en gradiente itálico, H1 en uppercase, nav activo con borde izquierdo magenta.

---

## 9. Componentes Clave — Detalles

### `InputMoneda`
Input de texto con formateo automático de miles al escribir (locale `es-CO`).
- Acepta `value: string | number` y llama `onChange(rawDigitos: string)` con solo los dígitos
- Usa `inputMode="numeric"` para teclado numérico en móvil
- El padre sigue almacenando el número crudo (ej: `"23000"`), compatible con `parseFloat()`
- **Úsalo** para todos los campos de moneda (pesos COP). Para kilos (decimal) se usan inputs normales.

### `FormularioCompra`
Único formulario compartido para nueva compra y edición. Acepta `compraInicial?: Compra` para modo edición. El preview en tiempo real (kilos secos + total a pagar) aparece en cuanto hay kilos o precio.

### `Tarjeta`
En móvil: ícono oculto (`hidden sm:flex`) y fuente `text-lg`. En desktop: ícono visible y `text-2xl`. Esto evita que montos grandes en COP (ej: `$ 1.250.000`) se trunquen en el grid de 2 columnas.

### `BadgeEstado`
Muestra badges visuales para `'humedo' | 'seco'` y para `'abierto' | 'vendido'`.

---

## 10. Formateo de Datos (`src/utils/formato.ts`)

```typescript
formatPeso(valor: number): string
// → "$ 1.250.000" (Intl, locale es-CO, currency COP, sin decimales)

formatNumero(valor: number, decimales = 2): string
// → "25,50" (Intl, locale es-CO, sin separador de moneda)

formatFecha(fechaStr: string): string
// → "05 jun. 2025" (Intl, locale es-CO)
// IMPORTANTE: usa T12:00:00 para evitar off-by-one por timezone

hoy(): string
// → "2025-06-26" (ISO date de hoy)

generarId(): string
// → "1719408000000-a3b7c9x" (timestamp + random)
```

---

## 11. Estado Actual

### Funciona correctamente
- CRUD completo de compras (crear, editar, eliminar desde Historial; editar también desde Dashboard al tocar una compra reciente)
- Lotes: crear, agregar/editar/eliminar gastos, marcar como vendido
- Dashboard con navegación semanal ISO (lunes–domingo)
- Exportar Excel y PDF desde Historial
- 3 temas: Claro, Oscuro, GTA VI
- Datos de ejemplo en el primer uso
- Formateo automático de moneda en todos los inputs de pesos
- Responsive: sidebar en desktop, bottom nav en móvil

### Limitaciones conocidas
- No hay backend: todos los datos se pierden si el usuario limpia el `localStorage` o cambia de navegador/dispositivo
- No hay sincronización entre dispositivos
- `NuevaCompra.tsx` usa `window.location.reload()` para "Guardar y nueva" (funciona pero no es elegante)
- El filtro de semana en Historial requiere dos clics para activar/desactivar (toggle)
- No hay confirmación de eliminación de compras — solo de "resetear todos los datos"

---

## 12. Decisiones de Diseño

| Decisión | Razón |
|---|---|
| **Tailwind v4 con `@tailwindcss/vite`** | Sin `postcss.config.js`. El plugin de Vite lo maneja todo. No hay archivo `tailwind.config.js`. |
| **Dark mode por clase** | `@variant dark (&:where(.dark, .dark *))` — permite múltiples temas sin depender de `prefers-color-scheme` |
| **Tema GTA VI usa `.dark` + `.gtavi`** | Reutiliza todos los estilos `dark:` existentes para fondos; el CSS de `.gtavi` solo sobreescribe los acentos |
| **CSS de temas fuera de `@layer`** | CSS sin `@layer` tiene mayor especificidad que `@layer utilities`. Combinado con `!important` gana siempre. |
| **lucide-react para íconos** | Consistencia de tamaño, tree-shaking por defecto, tipos TypeScript incluidos |
| **`useStorage` con setter de reemplazo total** | No usar `prev => newState`. Siempre pasar el valor nuevo completo: `setCompras([nueva, ...compras])` |
| **Datos de ejemplo al primer uso** | Mejora la experiencia de onboarding. Controlado por `cafelog_initialized` en localStorage. |
| **`InputMoneda` en lugar de `type="number"`** | Los inputs numéricos del navegador son inconsistentes entre plataformas móviles. `type="text"` con `inputMode="numeric"` y formateo manual da mejor UX. |
| **IDs con `generarId()`** | `${Date.now()}-${Math.random().toString(36).slice(2,9)}` — suficientemente único para uso local |
| **Semanas ISO 8601** | El resumen semanal usa lunes como inicio de semana, cálculo ISO correcto para evitar bugs de año nuevo. |
| **`fecha + 'T12:00:00'`** | Las fechas se parsean con hora al mediodía para evitar problemas de timezone (offset de -5 en Colombia podría hacer que `new Date("2025-06-05")` dé el 4 de junio). |

---

## 13. Próximos Pasos / Segunda Fase

- **Backend planificado** (no iniciado): La app actual es 100% frontend con localStorage. La segunda fase incluirá una API (stack por definir) para persistencia real y sincronización entre dispositivos.
- El directorio raíz es `/home/jose/projects/compracafe/` con solo `client/` por ahora. El backend irá en un directorio hermano (`server/` o similar).
- Posibles mejoras de UX pendientes: confirmación antes de eliminar compras individualmente, búsqueda de texto libre en Historial, gráficas de tendencias.
