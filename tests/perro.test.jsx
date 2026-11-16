import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'
import { catalogo } from '../src/data/catalogo.js'
import { buildersDesde, seleccionInicial, toggleOpcion, opcionesElegidas, precioBuilder } from '../src/lib/builder.js'
import { capasPerro, capasHamburguesa } from '../src/components/PlatoPreview.jsx'

vi.mock('../src/lib/api.js', () => ({
  getCatalogo: () => Promise.resolve(catalogo),
  leerPedidosLocales: () => [],
  guardarPedidoLocal: () => {},
  consultarPedido: () => Promise.resolve(null),
  suscribirPedido: () => () => {},
  crearPedido: () => Promise.resolve({ codigo: 'DEM-TEST' })
}))

const builders = buildersDesde(catalogo)
const b = builders.perro
const elegir = (pares) => opcionesElegidas(b, pares.reduce((s, [p, id]) => toggleOpcion(b, s, p, id), seleccionInicial(b)))

test('el perro caliente arranca con pan y salchicha y cobra la base', () => {
  const sel = seleccionInicial(b)
  expect(sel.pan).toEqual({ clasico: 1 })
  expect(sel.salchicha).toEqual({ frankfurt: 1 })
  expect(precioBuilder(b, sel)).toBe(6000 + 4000)
  expect(precioBuilder(b, toggleOpcion(b, sel, 'salsas', 'ketchup'))).toBe(10000)
})

test('todos los ingredientes con foto del perro la usan', () => {
  const sinFoto = b.pasos.flatMap((p) => p.opciones).filter((o) => !o.imagen).map((o) => o.id)
  expect(sinFoto).toEqual(['bbq']) // la única opción que sigue con emoji
})

test('hay productos de perros calientes en el catálogo', () => {
  expect(catalogo.productos.filter((p) => p.categoria === 'perros').length).toBeGreaterThanOrEqual(3)
})

test('capas del perro: pan abajo, salchicha encima y los ingredientes más arriba, escalonados', () => {
  const capas = capasPerro(elegir([['toppings', 'cheddar-rallado'], ['salsas', 'ketchup']]))
  expect(capas.map((c) => c.key)).toEqual(['pan', 'salchicha-0', 'toppings-cheddar-rallado-0', 'salsas-ketchup-0'])
  for (let i = 1; i < capas.length; i++) expect(capas[i].y).toBeGreaterThan(capas[i - 1].y)
})

test('las salsas del perro miden lo mismo que la salchicha y caben en el pan', () => {
  const capas = capasPerro(elegir([['salsas', 'ketchup'], ['salsas', 'mostaza'], ['salsas', 'rosada']]), 300)
  const pan = capas.find((c) => c.key === 'pan')
  const salchicha = capas.find((c) => c.key === 'salchicha-0')
  const salsas = capas.filter((c) => c.key.startsWith('salsas'))
  expect(salsas).toHaveLength(3)
  for (const s of salsas) {
    expect(s.ancho).toBeCloseTo(salchicha.ancho, 5)
    expect(s.ancho).toBeLessThanOrEqual(pan.ancho)
  }
})

test('doble salchicha pone dos salchichas y sube lo que va encima', () => {
  const una = capasPerro(elegir([['salsas', 'ketchup']]))
  const dos = capasPerro(elegir([['salchicha', 'doble-frankfurt'], ['salsas', 'ketchup']]))
  expect(dos.filter((c) => c.key.startsWith('salchicha')).length).toBe(2)
  expect(dos.at(-1).y).toBeGreaterThan(una.at(-1).y)
})

test('el perro caliente se arma desde la ruta /armar/perro', async () => {
  render(<MemoryRouter initialEntries={['/armar/perro']}><App /></MemoryRouter>)
  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/perro caliente/i)
  expect(await screen.findByAltText('Pan de hot dog')).toBeTruthy()
  await userEvent.click(screen.getByRole('tab', { name: /Salsas/ }))
  await userEvent.click(screen.getByRole('button', { name: /Kétchup/ }))
  expect(await screen.findByAltText('Kétchup')).toBeTruthy()
})

test('hamburguesa: lonchas de queso, cebolla caramelizada, papas ripio y tomate usan su foto', () => {
  const h = builders.hamburguesa
  const marcar = (pares) => opcionesElegidas(h, pares.reduce((s, [p, id]) => toggleOpcion(h, s, p, id), seleccionInicial(h)))
  const capas = capasHamburguesa(marcar([['quesos', 'cheddar'], ['quesos', 'mozzarella'], ['toppings', 'cebolla-caramelizada'], ['toppings', 'papas-ripio'], ['toppings', 'tomate']]))
  expect(capas.filter((c) => c.tipo === 'foto').length).toBe(capas.length) // ninguna cae al dibujo o al emoji
  expect(h.pasos.find((p) => p.id === 'quesos').opciones.find((o) => o.id === 'cheddar').nombre).toBe('Loncha de cheddar')
})

test('pizza: la mozzarella cubre la pizza con su foto y el pepperoni usa rodajas reales', () => {
  const p = builders.pizza
  const mozz = p.pasos.find((x) => x.id === 'quesos').opciones.find((o) => o.id === 'mozzarella')
  const pep = p.pasos.find((x) => x.id === 'carnes').opciones.find((o) => o.id === 'pepperoni')
  expect(mozz.cubre).toBe(true)
  expect(mozz.imagen).toMatch(/pizza-queso\.webp$/)
  expect(pep.imagen).toMatch(/pepperoni\.webp$/)
  expect(pep.nombre).toBe('Rodajas de pepperoni')
})
