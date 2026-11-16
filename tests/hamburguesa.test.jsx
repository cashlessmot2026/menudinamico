import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'
import { catalogo } from '../src/data/catalogo.js'
import { buildersDesde, seleccionInicial, toggleOpcion, opcionesElegidas } from '../src/lib/builder.js'
import { capasHamburguesa } from '../src/components/PlatoPreview.jsx'

vi.mock('../src/lib/api.js', () => ({
  getCatalogo: () => Promise.resolve(catalogo),
  leerPedidosLocales: () => [],
  guardarPedidoLocal: () => {},
  consultarPedido: () => Promise.resolve(null),
  suscribirPedido: () => () => {},
  crearPedido: () => Promise.resolve({ codigo: 'DEM-TEST' })
}))

const b = buildersDesde(catalogo).hamburguesa
const elegir = (pares) => opcionesElegidas(b, pares.reduce((s, [p, id]) => toggleOpcion(b, s, p, id), seleccionInicial(b)))

test('las opciones con foto llevan el nombre de su foto', () => {
  const nombres = b.pasos.flatMap((p) => p.opciones.filter((o) => o.imagen).map((o) => o.nombre))
  expect(nombres).toEqual(expect.arrayContaining([
    'Pan dorado', 'Pan con sésamo', 'Carne de res a la parrilla', 'Tocino crujiente', 'Lechuga rizada',
    'Aros de cebolla morada', 'Pepinillos en escabeche', 'Kétchup', 'Mostaza dorada', 'Salsa rosada'
  ]))
})

test('la torre va de la base a la tapa, en orden, y cada capa queda más arriba que la anterior', () => {
  const capas = capasHamburguesa(elegir([['toppings', 'lechuga'], ['salsas', 'ketchup'], ['quesos', 'cheddar']]))
  expect(capas.map((c) => c.key)).toEqual(['pan-base', 'carne-res-0', 'quesos-cheddar-0', 'toppings-lechuga-0', 'salsas-ketchup-0', 'pan-tapa'])
  for (let i = 1; i < capas.length; i++) {
    expect(capas[i].y).toBeGreaterThan(capas[i - 1].y)
    // la capa nueva tapa a la anterior, pero deja ver una franja de ella
    expect(capas[i].y).toBeLessThan(capas[i - 1].y + capas[i - 1].alto)
  }
})

test('doble carne y ×2 ponen dos capas', () => {
  const capas = capasHamburguesa(elegir([['carne', 'doble-res'], ['toppings', 'tocineta'], ['toppings', 'tocineta']]))
  expect(capas.filter((c) => c.key.startsWith('carne-doble-res')).length).toBe(2)
  expect(capas.filter((c) => c.key.startsWith('toppings-tocineta')).length).toBe(2)
})

test('con muchos ingredientes la torre se comprime para caber', () => {
  const todo = b.pasos.filter((p) => p.tipo === 'multi').flatMap((p) => p.opciones.map((o) => [p.id, o.id]))
  const capas = capasHamburguesa(elegir([...todo, ...todo]), 230, 286)
  const tapa = capas[capas.length - 1]
  expect(tapa.y + tapa.alto).toBeLessThanOrEqual(286 + 0.001)
})

test('la tapa usa la foto del pan elegido', async () => {
  render(<MemoryRouter initialEntries={['/armar/hamburguesa']}><App /></MemoryRouter>)
  const tapa = await screen.findByAltText('Pan dorado')
  expect(tapa.getAttribute('src')).toMatch(/pan-dorado\.webp$/)
  await userEvent.click(screen.getByRole('button', { name: /Pan con sésamo/ }))
  expect((await screen.findByAltText('Pan con sésamo')).getAttribute('src')).toMatch(/pan-sesamo\.webp$/)
})
