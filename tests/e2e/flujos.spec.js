import { test, expect } from '@playwright/test'
import { fakeSupabase } from './fakeSupabase.js'

async function pedirPizza(page, nombre) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Armar mi pizza' }).click()
  await page.getByRole('tab', { name: /vegetales/i }).click()
  await page.getByRole('button', { name: /rúgula/i }).click()
  await page.getByRole('button', { name: /agregar al pedido/i }).click()
  await page.getByRole('link', { name: 'Ir al carrito' }).click()
  await page.getByRole('link', { name: /continuar con mis datos/i }).click()
  await page.getByLabel('Nombre completo').fill(nombre)
  await page.getByLabel('Teléfono').fill('+57 300 123 4567')
  await page.getByLabel('Dirección').fill('Calle 1 # 2-3')
  await page.getByLabel('Barrio').fill('Centro')
  await page.getByLabel(/Referencia/).fill('Casa azul')
  await page.getByRole('button', { name: /confirmar pedido/i }).click()
  await expect(page).toHaveURL(/\/pedido\/DEM-E2E\d+/)
}

test('el cliente pide, el admin cambia el estado y cancela; el cliente lo ve y no se borra', async ({ context }) => {
  await fakeSupabase(context)
  const cliente = await context.newPage()

  await pedirPizza(cliente, 'Ana Pérez')
  await expect(cliente.getByText('Recibido')).toBeVisible()
  const codigo = (await cliente.url()).split('/').pop()

  // el pedido sigue visible después de recargar (se guarda en el dispositivo)
  await cliente.reload()
  await expect(cliente.getByText('Recibido')).toBeVisible()

  const admin = await context.newPage()
  await admin.goto('/admin')
  await admin.getByLabel('Clave').fill('1234')
  await admin.getByRole('button', { name: 'Entrar' }).click()
  await expect(admin.getByText(codigo)).toBeVisible()
  await admin.getByRole('button', { name: /pasar a preparando/i }).click()
  await expect(admin.locator('.chip.estado-preparando')).toBeVisible()

  await cliente.reload()
  await expect(cliente.locator('li[data-done="true"]', { hasText: 'Preparando' })).toBeVisible()

  await admin.getByRole('button', { name: /cancelar pedido/i }).click()
  await admin.getByLabel(/motivo/i).fill('Sin ingredientes')
  await admin.getByRole('button', { name: /confirmar cancelación/i }).click()
  await expect(admin.getByText(/Motivo: Sin ingredientes/)).toBeVisible()
  await expect(admin.getByText(codigo)).toBeVisible()

  await cliente.reload()
  await expect(cliente.getByText(/Cancelado: Sin ingredientes/)).toBeVisible()
})

test('con clave incorrecta el admin no entra', async ({ context }) => {
  await fakeSupabase(context)
  const admin = await context.newPage()
  await admin.goto('/admin')
  await admin.getByLabel('Clave').fill('0000')
  await admin.getByRole('button', { name: 'Entrar' }).click()
  await expect(admin.getByText('Clave incorrecta')).toBeVisible()
})

test('el checkout exige los datos del domicilio', async ({ page, context }) => {
  await fakeSupabase(context)
  await page.goto('/menu/pizzas')
  await page.getByRole('button', { name: 'Agregar' }).first().click()
  await page.goto('/checkout')
  await page.getByRole('button', { name: /confirmar pedido/i }).click()
  await expect(page.getByText('Este campo es obligatorio')).toHaveCount(5)
  await expect(page).toHaveURL(/\/checkout/)
})

test('sin scroll horizontal en móvil (375 px)', async ({ browser, context }) => {
  const movil = await browser.newContext({ viewport: { width: 375, height: 800 } })
  await fakeSupabase(movil)
  const page = await movil.newPage()
  for (const ruta of ['/', '/menu/pizzas', '/armar/pizza', '/armar/hamburguesa', '/armar/pollo', '/seguimiento', '/admin']) {
    await page.goto(ruta)
    await page.waitForLoadState('networkidle')
    const ancho = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
    expect(ancho.sw, `scroll horizontal en ${ruta}`).toBeLessThanOrEqual(ancho.cw)
  }
  await movil.close()
})

test('la app es instalable: manifest válido', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest')
  expect(res.ok()).toBeTruthy()
  const m = await res.json()
  expect(m.display).toBe('standalone')
  expect(m.icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']))
})
