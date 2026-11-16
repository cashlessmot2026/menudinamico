# Demo · Menú Dinámico (PWA)

App instalable en React para pedir domicilios de **pizzas, hamburguesas, perros calientes y asados**, con constructores animados en 3D, seguimiento del pedido y panel de administración. Backend: Supabase (sin proveedores externos de auth).

## Qué incluye

- **Landing** del negocio "Demo", menú por categoría y carrito.
- **Constructores** (como los videos de referencia): pizza (tamaño, masa, salsa, quesos, carnes, vegetales como rúgula, lechuga, aceitunas verdes y moradas, cebollas, pasta de tomate…), hamburguesa (torre por capas con fotos reales), perro caliente (pan, salchicha, toppings y salsas) y pollo a la brasa.
- **Checkout** con datos de domicilio obligatorios y **seguimiento** del estado (recibido → preparando → en camino → entregado / cancelado). Los pedidos nunca se borran y se consultan con teléfono + código (`DEM-XXXX`).
- **Panel admin** (`/admin`, clave inicial `1234`): pedidos, cambio de estado, cancelación con motivo, catálogo/precios/disponibilidad y resumen del día.
- **PWA**: instalable, con caché offline del catálogo.

## Puesta en marcha

```bash
npm install
cp .env.example .env     # ya trae el proyecto de Supabase; ajusta si cambia
npm run dev              # desarrollo
npm run build && npm run preview
```

### 1. Base de datos (obligatorio, una sola vez)
Sigue [`supabase/README.md`](supabase/README.md): ejecuta `schema.sql` y `seed.sql` en el SQL Editor de Supabase. Sin esto la app muestra el catálogo local pero **no puede crear pedidos**.

### 2. Pruebas
```bash
npm test          # unitarias y de componentes (Vitest)
npm run e2e       # flujos completos (Playwright, con Supabase simulado)
```
Las funciones SQL se prueban con `supabase/tests.sql` (en el SQL Editor).

## Variables de entorno
`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (llave publicable; no es secreta, pero no se escribe en el código).

## Cuenta y base de datos (Supabase)
| Dato | Valor |
|---|---|
| Correo de la cuenta donde está la base de datos | `Cashlesscol2026@gmail.com` |
| URL de la API | `https://iqqfxghsciwusyidlbze.supabase.co` |
| Llave publicable (`VITE_SUPABASE_ANON_KEY`) | `sb_publishable_zZRYDAq3RVg8qpkw9O-LWA_v7b4u7mD` |

La llave publicable solo permite lo que las políticas RLS dejan al público. Nunca pongas aquí la llave `secret` ni la clave de admin.
Una base nueva está vacía: ejecuta `schema.sql`, `seed.sql` y, si aplica, `migracion-2026-11-fotos-hamburguesa.sql` (ver `supabase/README.md`).

## Seguridad
- RLS activo; el público solo lee el catálogo y usa las funciones `crear_pedido` y `consultar_pedido`.
- El servidor recalcula todos los precios; los precios que envía el cliente se ignoran.
- La clave de admin se guarda con bcrypt y se valida en la base de datos. Con 5 intentos fallidos en 10 minutos el login se bloquea. **`1234` es débil: cámbiala desde el panel (Resumen → Cambiar clave).**

## Despliegue
`npm run build` genera `dist/`, que se sirve como sitio estático (Netlify, Vercel, Cloudflare Pages, Supabase Hosting…). Debe servirse con HTTPS y redirigir todas las rutas a `index.html` para que `/admin`, `/pedido/...` etc. funcionen al recargar.
