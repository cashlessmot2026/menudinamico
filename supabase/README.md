# Base de datos (Supabase)

Proyecto: `https://tgioyejecmcbxrwcjuub.supabase.co`

## Instalación (una sola vez)

1. Abre Supabase → **SQL Editor** → *New query*.
2. Pega y ejecuta **`schema.sql`** (tablas, seguridad RLS y funciones RPC).
3. Pega y ejecuta **`seed.sql`** (productos y opciones iniciales).
4. Opcional: pega y ejecuta **`tests.sql`**. Corre dentro de una transacción que se revierte; si termina con el aviso `TODAS LAS PRUEBAS PASARON`, todo está bien.

Los tres scripts son idempotentes: se pueden volver a ejecutar sin duplicar datos.

## Seguridad

- Las tablas de pedidos y de admin **no tienen policies**: el público no puede leerlas ni escribirlas directamente.
- El cliente solo crea pedidos con `crear_pedido` (el servidor recalcula los precios) y los consulta con `consultar_pedido(teléfono, código)`.
- El admin entra con `admin_login(clave)`; la clave inicial es `1234`, guardada con bcrypt. Tras 5 intentos fallidos en 10 minutos, el login se bloquea 10 minutos (el bloqueo es global, porque hay un solo admin).
- **Una clave de 4 dígitos es débil.** Cámbiala desde el dashboard cuando quieras (`admin_cambiar_clave`).
- Los pedidos nunca se borran: no existe ninguna función que los elimine.
- Si cambias precios u opciones, hazlo desde el dashboard (o en las tablas `productos` y `opciones`); la app y el servidor usan siempre esos valores.
