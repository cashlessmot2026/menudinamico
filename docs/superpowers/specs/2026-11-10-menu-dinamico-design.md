# Menú Dinámico "Demo" — Diseño

Fecha: 2026-11-10

## 1. Objetivo
PWA instalable en React para el negocio **Demo** (pizzas, hamburguesas, asados). El cliente ve una landing animada, arma su pedido (incluida pizza personalizada), deja sus datos de domicilio y sigue el estado del pedido. El administrador gestiona pedidos y catálogo desde un dashboard. Backend: Supabase (sin proveedores de auth externos).

## 2. Alcance y supuestos
- Estilo visual inspirado en los videos de referencia (`pizzas/pizza.mp4`, `hamburguesa/hamburguesa.mp4`, `asados/video pollo.mp4`): tarjetas y botones redondeados, efecto 3D (tilt con perspectiva, parallax por capas, ingredientes que caen y flotan), animaciones fluidas.
- Fotogramas de los videos se extraen con el navegador (Playwright) porque no hay ffmpeg.
- Moneda: COP. Catálogo y precios demo inventados, editables por el admin.
- Imágenes disponibles: `pizzas/aceituna verde.*`, `pizzas/rugula.jpg`, `pizzas/tomate.jpeg`. El resto se ilustra con SVG/CSS.
- Supabase: URL `https://tgioyejecmcbxrwcjuub.supabase.co`, llave publicable en variable de entorno `VITE_SUPABASE_ANON_KEY`. La llave publicable no es secreta, pero no se hardcodea.
- Las tablas no se pueden crear con la llave publicable: se entregan `schema.sql` y `seed.sql` para ejecutar en el SQL Editor.
- Seguimiento del cliente (opción A): el pedido y el teléfono se guardan en el dispositivo; además se consulta con **teléfono + código de pedido**, sin cuentas.
- Subida a `github.com/cashlessmot2026/menudinamico` solo tras confirmación explícita del usuario.

## 3. Stack
Vite + React + React Router, Framer Motion, CSS 3D, `@supabase/supabase-js`, `vite-plugin-pwa`. Vitest para unitarias, Playwright para flujos.

## 4. Rutas
- `/` landing: hero animado, tres categorías, cómo funciona, contacto.
- `/menu/:categoria` tarjetas 3D con "Agregar".
- `/armar-pizza` constructor paso a paso.
- `/carrito` → `/checkout` → `/pedido/:codigo`.
- `/seguimiento` consulta por teléfono + código.
- `/admin` login y dashboard.

## 5. Constructor de pizza
- Tamaño: personal, mediana, grande, familiar.
- Masa: clásica, delgada, gruesa, integral, sin gluten, rellena de queso.
- Salsa base: pasta de tomate, pesto, BBQ, blanca, ajo y aceite de oliva.
- Quesos: mozzarella, parmesano, provolone, cheddar, queso azul, burrata.
- Carnes: pepperoni, jamón, tocineta, salami, pollo, carne molida, chorizo.
- Vegetales: rúgula, lechuga, aceitunas verdes, aceitunas moradas (kalamata), cebolla blanca, morada y caramelizada, champiñones, pimentón, tomate cherry, maíz, espinaca, alcachofa, jalapeño, albahaca.
- Extras: piña, orégano, borde de queso.
- Cada ingrediente tiene precio; el total se recalcula en vivo y el ingrediente se anima al caer sobre la pizza.

## 6. Pedido y seguimiento
- Checkout obligatorio: nombre, teléfono, dirección, barrio, referencia. Sin estos datos no se confirma.
- Código corto de pedido (`DEM-XXXX`). Pedido y teléfono se guardan en localStorage.
- Estados: `recibido → preparando → en camino → entregado`, o `cancelado` (con motivo).
- Los pedidos nunca se borran; se conserva historial de cambios de estado.
- Seguimiento en vivo (Supabase Realtime o polling de respaldo) con línea de tiempo animada.
- Consulta sin dispositivo: RPC `consultar_pedido(telefono, codigo)`.

## 7. Dashboard admin
- Login con clave `1234` vía RPC `admin_login(clave)`: compara contra hash bcrypt (pgcrypto) y devuelve token de sesión con expiración. Límite de intentos por ventana de tiempo.
- Pedidos: filtros por estado, cambio de estado, cancelación con motivo, historial.
- CRUD de productos e ingredientes (precio, disponibilidad).
- Resumen del día: ventas, número de pedidos, producto más vendido.

## 8. Base de datos y seguridad
Tablas: `productos`, `ingredientes`, `pedidos`, `pedido_items`, `pedido_historial`, `admin_config`, `admin_sesiones`.
- RLS activo en todas. Público: lee catálogo, crea pedidos vía RPC `crear_pedido`. No puede listar pedidos.
- Lecturas del cliente: solo RPC con teléfono + código.
- Operaciones de admin: RPC `security definer` que validan el token.
- Riesgo conocido: una clave de 4 dígitos es débil; se mitiga con límite de intentos y se recomienda cambiarla (RPC `admin_cambiar_clave`).

## 9. PWA
Manifest, íconos, service worker (caché offline del catálogo y shell), botón "Instalar app".

## 10. Pruebas
- Vitest: cálculo de precios, máquina de estados del pedido, generación de código.
- Playwright: pedido completo, seguimiento, flujo admin (cambio de estado y cancelación).

## 11. Fuera de alcance
Pagos en línea, cuentas de cliente, notificaciones push, 3D real con Three.js.
