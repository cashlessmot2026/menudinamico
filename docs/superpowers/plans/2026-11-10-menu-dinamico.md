# Menú Dinámico "Demo" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PWA React instalable para el negocio "Demo" con landing 3D animada, menú, constructor de pizza, pedido con datos obligatorios, seguimiento persistente y dashboard admin sobre Supabase.

**Architecture:** SPA Vite + React Router. Lógica pura (precios, estados, códigos) en `src/lib` con pruebas Vitest. Datos vía `supabase-js` con RPC `security definer`; el catálogo local (`src/data`) sirve de respaldo si la BD no responde. El precio final lo calcula el servidor en `crear_pedido`.

**Tech Stack:** Vite, React 18, react-router-dom 6, framer-motion, @supabase/supabase-js, vite-plugin-pwa, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-10-menu-dinamico-design.md`

## Global Constraints

- Moneda COP, formato `es-CO` sin decimales.
- Supabase URL `https://tgioyejecmcbxrwcjuub.supabase.co`; llave en `VITE_SUPABASE_ANON_KEY` (nunca hardcodeada). URL en `VITE_SUPABASE_URL`.
- Estados: `recibido`, `preparando`, `en_camino`, `entregado`, `cancelado`. Los pedidos nunca se borran.
- Código de pedido `DEM-XXXX` (4 caracteres de `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`).
- Checkout obligatorio: nombre, teléfono, dirección, barrio, referencia.
- Clave admin `1234` guardada con bcrypt (pgcrypto), nunca en el cliente.
- Textos de UI en español. Layout móvil primero, tarjetas/botones con `border-radius >= 20px`.
- Subir a GitHub (`cashlessmot2026/menudinamico`) solo con confirmación explícita del usuario.

## Review Focus

- Teléfono con espacios, `+57` o guiones debe normalizarse y encontrar el mismo pedido (Task 2, 7).
- Doble clic en "Confirmar pedido" no debe crear dos pedidos (Task 7).
- Carrito vacío no puede llegar a checkout (Task 7).
- Cliente manipula precios en el request: el servidor recalcula y los ignora (Task 10).
- Código/teléfono incorrectos en seguimiento muestran error claro, no pantalla vacía (Task 8).
- Intentos repetidos de clave admin se bloquean temporalmente (Task 10, 11).
- Token admin expirado/borrado devuelve al login (Task 11).
- localStorage no disponible (modo privado) no rompe la app (Task 3, 8).
- Ingrediente/producto no disponible no se puede agregar (Task 5, 6).
- Pedido entregado o cancelado sigue visible para el cliente y el admin (Task 8, 11).

## File Structure

```
package.json, vite.config.js, index.html, .env.example, .gitignore
public/icons/                      íconos PWA
src/main.jsx, App.jsx, styles.css  arranque, rutas, tokens de diseño
src/lib/supabase.js                cliente
src/lib/price.js                   cálculo de precios
src/lib/orderStatus.js             máquina de estados
src/lib/orderCode.js               generación de código
src/lib/phone.js, format.js        normalizar teléfono, formato COP
src/lib/api.js                     RPC/consultas (catálogo, pedidos, admin)
src/data/catalogo.js               catálogo de respaldo (productos + ingredientes)
src/store/CartContext.jsx          carrito + pedidos guardados en dispositivo
src/components/                    Tilt3D, Navbar, ProductCard, PizzaPreview, Timeline, InstallButton
src/pages/                         Landing, Menu, ArmarPizza, Carrito, Checkout, Pedido, Seguimiento, Admin
supabase/schema.sql, seed.sql
tests/                             unitarias (Vitest) y e2e (Playwright)
```

---

### Task 1: Scaffold del proyecto, PWA y tokens de diseño

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `.env.example`, `.env`, `src/main.jsx`, `src/App.jsx`, `src/styles.css`, `public/icons/icon-192.png`, `public/icons/icon-512.png`
- Test: `tests/smoke.test.jsx`

**Interfaces:**
- Produces: `App` con `<Routes>` vacías y `Layout`; clases CSS globales `.card`, `.btn`, `.btn-primary`, `.scene3d`; variables CSS `--radius: 28px`, `--brand`, `--bg`.

- [ ] **Step 1: Write the failing test** `tests/smoke.test.jsx`: renderiza `<App/>` dentro de `MemoryRouter` en `/` y espera texto "Demo" en el documento.
- [ ] **Step 2: Run** `npx vitest run tests/smoke.test.jsx` → Expected: FAIL (módulos inexistentes).
- [ ] **Step 3: Scaffold** con `npm create vite@latest` (plantilla react), instalar dependencias del stack, configurar Vitest (jsdom, `@testing-library/react`). `vite.config.js` usa `VitePWA` con manifest (name "Demo", theme_color `--brand`, íconos 192/512, `display: standalone`) y `registerType: 'autoUpdate'`. `.env` contiene URL y llave del usuario; `.env` en `.gitignore`, `.env.example` con placeholders.
- [ ] **Step 4: Run** `npx vitest run` → PASS; `npm run build` termina sin errores y genera `dist/manifest.webmanifest`.
- [ ] **Step 5: Commit** `feat: scaffold vite react pwa`

### Task 2: Utilidades puras (precio, estados, código, teléfono, formato)

**Files:**
- Create: `src/lib/price.js`, `src/lib/orderStatus.js`, `src/lib/orderCode.js`, `src/lib/phone.js`, `src/lib/format.js`
- Test: `tests/lib.test.js`

**Interfaces:**
- Produces:
  - `precioPizza({tamano, masa, salsa, ingredientes}, catalogo) -> number` (base del tamaño + masa + salsa + suma de ingredientes disponibles).
  - `totalCarrito(items) -> number` (`sum(precioUnit * cantidad)`).
  - `ESTADOS = ['recibido','preparando','en_camino','entregado','cancelado']`; `puedeTransicionar(desde, hacia) -> boolean` (avance solo al siguiente; `cancelado` desde `recibido|preparando|en_camino`; `entregado` y `cancelado` son finales).
  - `generarCodigo(rand = Math.random) -> 'DEM-XXXX'`.
  - `normalizarTelefono(s) -> string` (solo dígitos; quita prefijo `57` si quedan 12 dígitos).
  - `cop(n) -> string` (ej. `$ 25.000`).

- [ ] **Step 1: Write failing tests** `tests/lib.test.js`: `normalizarTelefono('+57 300-123 4567') === '3001234567'`; `puedeTransicionar('recibido','preparando') === true`, `('recibido','entregado') === false`, `('entregado','cancelado') === false`, `('en_camino','cancelado') === true`; `generarCodigo(()=>0)` es `'DEM-AAAA'` y coincide con `/^DEM-[A-HJ-NP-Z2-9]{4}$/`; `precioPizza` con ingrediente `disponible:false` no lo suma; `totalCarrito([])===0`; `cop(25000)` contiene `25.000`.
- [ ] **Step 2: Run** `npx vitest run tests/lib.test.js` → FAIL.
- [ ] **Step 3: Implement** los cinco módulos con las firmas de arriba.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: pure helpers for price, status, code, phone`

### Task 3: Catálogo de respaldo, cliente Supabase y API

**Files:**
- Create: `src/data/catalogo.js`, `src/lib/supabase.js`, `src/lib/api.js`
- Test: `tests/catalogo.test.js`

**Interfaces:**
- Produces:
  - `catalogo = { productos: Producto[], ingredientes: Ingrediente[], tamanos, masas, salsas }`. `Producto = {id, categoria: 'pizzas'|'hamburguesas'|'asados', nombre, descripcion, precio, disponible, imagen?}`. `Ingrediente = {id, grupo: 'queso'|'carne'|'vegetal'|'extra', nombre, precio, disponible, imagen?}`. Contenido exacto de ingredientes: el de la sección 5 del spec (tamaños, masas, salsas, quesos, carnes, vegetales, extras). Rúgula, aceitunas verdes y tomate usan `/img/rugula.jpg`, `/img/aceituna-verde.jpeg`, `/img/tomate.jpeg` copiados desde `pizzas/` a `public/img/`.
  - `supabase` (cliente) leyendo `import.meta.env`.
  - `api.getCatalogo() -> Promise<catalogo>` (consulta tablas; si falla o vacío, devuelve el catálogo local).
  - `api.crearPedido(payload) -> Promise<{codigo, id}>`, `api.consultarPedido(telefono, codigo) -> Promise<Pedido|null>`, `api.suscribirPedido(id, cb) -> unsubscribe` (Realtime; respaldo polling cada 8 s).
  - `guardarPedidoLocal(codigo, telefono)` / `leerPedidosLocales() -> {codigo, telefono}[]` con `try/catch` (si localStorage falla, devuelve `[]`).

- [ ] **Step 1: Write failing test:** el catálogo contiene ingredientes `rugula`, `aceituna-verde`, `aceituna-morada`, `cebolla-morada`, `pasta-tomate` (salsa), 6 masas y 4 tamaños; `leerPedidosLocales()` devuelve `[]` si `localStorage.getItem` lanza.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** los tres módulos; copiar las imágenes a `public/img/`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: catalog, supabase client and api layer`

### Task 4: Componentes 3D y layout base

**Files:**
- Create: `src/components/Tilt3D.jsx`, `Navbar.jsx`, `InstallButton.jsx`, `ProductCard.jsx`; modify `src/App.jsx`, `src/styles.css`
- Test: `tests/components.test.jsx`

**Interfaces:**
- Produces: `<Tilt3D max={12}>children</Tilt3D>` (inclinación con `rotateX/rotateY` por puntero, `perspective: 900px`, se desactiva con `prefers-reduced-motion`); `<ProductCard producto onAdd/>` (deshabilitado y con etiqueta "Agotado" si `disponible:false`); `<InstallButton/>` (escucha `beforeinstallprompt`); `<Navbar/>` con enlaces y contador de carrito.

- [ ] **Step 1: Write failing test:** `ProductCard` con `disponible:false` muestra "Agotado" y su botón está `disabled`; con `disponible:true` llama `onAdd(producto)` al hacer clic.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** componentes con Framer Motion (entrada animada, `whileHover`/`whileTap`) y estilos redondeados.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: 3d card and layout components`

### Task 5: Carrito (contexto) y pedidos locales

**Files:**
- Create: `src/store/CartContext.jsx`
- Test: `tests/cart.test.jsx`

**Interfaces:**
- Consumes: `totalCarrito` (Task 2).
- Produces: `useCart() -> { items, agregar(item), quitar(id), cambiarCantidad(id, n), vaciar(), total }`. `item = {id, tipo: 'producto'|'pizza_custom', nombre, precioUnit, cantidad, detalle?}`. Persistido en localStorage con `try/catch`.

- [ ] **Step 1: Write failing tests:** agregar el mismo producto dos veces suma cantidad; `cambiarCantidad(id,0)` lo elimina; `vaciar()` deja `total===0`; con localStorage lanzando errores el contexto funciona en memoria.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: cart context`

### Task 6: Landing y Menú por categoría

**Files:**
- Create: `src/pages/Landing.jsx`, `src/pages/Menu.jsx`; modify `src/App.jsx` (rutas `/`, `/menu/:categoria`)
- Test: `tests/menu.test.jsx`

**Interfaces:** Consumes `api.getCatalogo`, `ProductCard`, `useCart`.

- [ ] **Step 1: Write failing test:** `/menu/pizzas` lista solo productos de categoría `pizzas`; categoría inexistente muestra "Categoría no encontrada"; pulsar "Agregar" incrementa el contador del carrito.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.** Landing: hero con pizza/hamburguesa/pollo flotando en capas con parallax (`useScroll`/`useTransform`), tres tarjetas de categoría con `Tilt3D`, sección "Cómo funciona" y contacto. Antes de diseñar los visuales finales, extraer fotogramas de los 3 videos con Playwright (video en `<video>` + canvas) a `scratchpad` para copiar paleta y composición.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: landing and category menu`

### Task 7: Constructor de pizza, carrito y checkout

**Files:**
- Create: `src/components/PizzaPreview.jsx`, `src/pages/ArmarPizza.jsx`, `Carrito.jsx`, `Checkout.jsx`; modify `src/App.jsx`
- Test: `tests/pizza.test.jsx`, `tests/checkout.test.jsx`

**Interfaces:** Consumes `precioPizza`, `useCart`, `normalizarTelefono`, `api.crearPedido`, `guardarPedidoLocal`. `<PizzaPreview config/>` renderiza capas SVG/CSS por ingrediente con animación de caída.

- [ ] **Step 1: Write failing tests:** (a) en ArmarPizza, elegir tamaño grande + masa gruesa + rúgula actualiza el total mostrado a `precioPizza(...)`; ingrediente no disponible está deshabilitado; "Agregar al carrito" crea un item `pizza_custom` con `detalle`. (b) Checkout con cualquier campo obligatorio vacío no llama `crearPedido` y marca el campo; con datos válidos llama una sola vez aunque se haga doble clic; con carrito vacío redirige a `/carrito`.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.** Pasos del constructor: tamaño → masa → salsa → quesos → carnes → vegetales → extras → resumen. Checkout deshabilita el botón mientras envía; al éxito guarda `{codigo, telefono normalizado}` localmente, vacía el carrito y navega a `/pedido/:codigo`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: pizza builder, cart and checkout`

### Task 8: Seguimiento del pedido (cliente)

**Files:**
- Create: `src/components/Timeline.jsx`, `src/pages/Pedido.jsx`, `src/pages/Seguimiento.jsx`; modify `src/App.jsx`
- Test: `tests/tracking.test.jsx`

**Interfaces:** Consumes `api.consultarPedido`, `api.suscribirPedido`, `leerPedidosLocales`, `ESTADOS`. `<Timeline estado motivo?/>`.

- [ ] **Step 1: Write failing tests:** `Timeline estado="preparando"` marca recibido y preparando como completos; `estado="cancelado"` muestra el motivo; Seguimiento con código inexistente muestra "No encontramos tu pedido"; teléfono `+57 300 123 4567` consulta con `3001234567`; `/pedido/:codigo` sin teléfono local muestra el formulario de teléfono; pedido `entregado` sigue mostrándose.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** (home muestra además "Mis pedidos" desde `leerPedidosLocales`). **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: order tracking`

### Task 9: Esquema SQL y semillas

**Files:**
- Create: `supabase/schema.sql`, `supabase/seed.sql`, `supabase/README.md`

**Interfaces — Produces (SQL):** tablas `productos`, `ingredientes`, `pedidos(id, codigo unique, nombre, telefono, direccion, barrio, referencia, total, estado, motivo_cancelacion, created_at)`, `pedido_items`, `pedido_historial`, `admin_config(clave_hash)`, `admin_sesiones(token, expira)`, `admin_intentos`. RLS activo; `anon` solo `select` en `productos`/`ingredientes`. RPC: `crear_pedido(datos jsonb)`, `consultar_pedido(p_telefono text, p_codigo text)`, `admin_login(p_clave text)`, y las del Task 10. Realtime habilitado para `pedidos` no se expone al público (el cliente usa polling vía RPC si Realtime no autoriza).

- [ ] **Step 1:** Escribir `schema.sql` (idempotente: `create ... if not exists`, `create or replace function`, `create extension if not exists pgcrypto`). `admin_config` se inicializa con `crypt('1234', gen_salt('bf'))`.
- [ ] **Step 2:** Escribir `seed.sql` con el catálogo de `src/data/catalogo.js` (mismos ids).
- [ ] **Step 3:** `README.md` con instrucciones: abrir Supabase → SQL Editor → ejecutar `schema.sql` y luego `seed.sql`.
- [ ] **Step 4: Verify** por inspección que ninguna tabla sensible tiene policy para `anon` y que todas las funciones usan `security definer` con `set search_path = public`.
- [ ] **Step 5: Commit** `feat: supabase schema and seed`

### Task 10: RPC de pedidos y admin (lógica servidor)

**Files:** Modify `supabase/schema.sql`; Create `supabase/tests.sql`

**Interfaces — Produces (RPC):**
- `crear_pedido(datos jsonb) returns json {codigo,id}`: valida campos obligatorios no vacíos, **recalcula precios desde `productos`/`ingredientes`** (ignora precios del cliente), rechaza ítems no disponibles, genera código único, inserta pedido + items + historial `recibido`.
- `consultar_pedido(p_telefono, p_codigo) returns json` (pedido, items, historial; null si no coincide).
- `admin_login(p_clave) returns text token` (bcrypt; tras 5 fallos en 10 min lanza `bloqueado`); sesiones 12 h.
- `admin_listar_pedidos(p_token, p_estado text default null)`, `admin_cambiar_estado(p_token, p_id, p_estado, p_motivo text default null)` (valida transición igual que `puedeTransicionar`; `cancelado` exige motivo), `admin_resumen(p_token)`, `admin_guardar_producto(p_token, datos jsonb)`, `admin_guardar_ingrediente(p_token, datos jsonb)`, `admin_cambiar_clave(p_token, p_nueva)`. Todas lanzan `no_autorizado` con token inválido/expirado.

- [ ] **Step 1:** Escribir `supabase/tests.sql` con bloques `do $$ ... assert ... $$` que comprueban: precio manipulado ignorado, ítem no disponible rechazado, transición inválida rechazada, cancelar sin motivo rechazado, 6.º intento fallido lanza `bloqueado`, token falso lanza `no_autorizado`.
- [ ] **Step 2:** Implementar las funciones. **Step 3:** Actualizar `README.md` indicando ejecutar `tests.sql` tras el schema (se ejecuta en una transacción con `rollback`).
- [ ] **Step 4:** Si el usuario ya ejecutó el schema, ejecutar `tests.sql` en el SQL Editor y confirmar sin errores.
- [ ] **Step 5: Commit** `feat: order and admin rpc functions`

### Task 11: Dashboard admin

**Files:**
- Create: `src/pages/Admin.jsx`, `src/pages/admin/Pedidos.jsx`, `Catalogo.jsx`, `Resumen.jsx`; extend `src/lib/api.js` con `adminLogin`, `adminListar`, `adminCambiarEstado`, `adminResumen`, `adminGuardarProducto`, `adminGuardarIngrediente`
- Test: `tests/admin.test.jsx`

**Interfaces:** Consumes RPC del Task 10. Token en `sessionStorage` (con `try/catch`). Cualquier error `no_autorizado` limpia el token y vuelve al login.

- [ ] **Step 1: Write failing tests (api mockeada):** clave incorrecta muestra "Clave incorrecta"; error `bloqueado` muestra "Demasiados intentos, espera 10 minutos"; respuesta `no_autorizado` en cualquier llamada regresa al login; cambiar a `cancelado` sin motivo no llama la API; pedidos `entregado` y `cancelado` aparecen en la lista con filtro "Todos".
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** pestañas Pedidos / Catálogo / Resumen, con actualización periódica (cada 10 s). **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: admin dashboard`

### Task 12: Pruebas e2e, pulido PWA y verificación final

**Files:** Create `playwright.config.js`, `tests/e2e/pedido.spec.js`, `tests/e2e/admin.spec.js`; modify `README.md`

- [ ] **Step 1: Write e2e:** (a) pedido completo: abrir `/`, armar pizza con rúgula, checkout con datos, ver `/pedido/DEM-…` en "recibido"; recargar y sigue visible. (b) admin: login `1234`, pasar el pedido a `preparando`, cancelar otro con motivo; el cliente ve el cambio. (c) viewport 375 px sin scroll horizontal.
- [ ] **Step 2: Run** `npx playwright test` contra `npm run preview` con el SQL ya ejecutado → Expected: PASS.
- [ ] **Step 3:** `npm run build`; verificar manifest, service worker y que se puede instalar (Lighthouse PWA o DevTools Application).
- [ ] **Step 4:** Escribir `README.md` (variables, SQL, scripts, despliegue estático).
- [ ] **Step 5: Commit** `test: e2e flows and docs`. Preguntar al usuario antes de `git remote add` + `git push` a `cashlessmot2026/menudinamico`.

---

## Self-Review

- **Cobertura del spec:** secciones 3 y 9 → Task 1; 4 → Tasks 6–8, 11; 5 → Tasks 3 y 7; 6 → Tasks 7, 8, 10; 7 → Tasks 10, 11; 8 → Tasks 9 y 10; 10 → Tasks 2 y 12. Fotogramas de videos → Task 6.
- **Consistencia:** `puedeTransicionar` (Task 2) y `admin_cambiar_estado` (Task 10) usan las mismas transiciones; `normalizarTelefono` (Task 2) se usa en checkout y seguimiento; mismos ids en `catalogo.js` y `seed.sql`.
- **Dependencia externa:** Tasks 10 (paso 4) y 12 requieren que el usuario ejecute `schema.sql` y `seed.sql` en Supabase.
