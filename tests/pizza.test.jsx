import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'
import { catalogo } from '../src/data/catalogo.js'

const cat = { ...catalogo, ingredientes: catalogo.ingredientes.map((i) => (i.id === 'burrata' ? { ...i, disponible: false } : i)) }
vi.mock('../src/lib/api.js', () => ({
  getCatalogo: () => Promise.resolve(cat),
  leerPedidosLocales: () => [],
  guardarPedidoLocal: () => {},
  consultarPedido: () => Promise.resolve(null),
  suscribirPedido: () => () => {},
  crearPedido: () => Promise.resolve({ codigo: 'DEM-TEST' })
}))

beforeEach(() => localStorage.clear())
const ir = (r) => render(<MemoryRouter initialEntries={[r]}><App /></MemoryRouter>)

test('elegir tamaño grande y rúgula actualiza el total', async () => {
  ir('/armar/pizza')
  await userEvent.click(await screen.findByRole('button', { name: /grande/i }))
  await userEvent.click(screen.getByRole('tab', { name: /vegetales/i }))
  await userEvent.click(screen.getByRole('button', { name: /rúgula/i }))
  // 34.000 + 0 (masa clásica) + 0 (pasta de tomate) + 2.500
  expect(screen.getByTestId('total')).toHaveTextContent('36.500')
})

test('ingrediente no disponible está deshabilitado', async () => {
  ir('/armar/pizza')
  await userEvent.click(await screen.findByRole('tab', { name: /quesos/i }))
  expect(screen.getByRole('button', { name: /burrata/i })).toBeDisabled()
})

test('agregar al pedido crea un item custom en el carrito', async () => {
  ir('/armar/pizza')
  await userEvent.click(await screen.findByRole('button', { name: /agregar al pedido/i }))
  expect(screen.getByLabelText('Carrito')).toHaveTextContent('1')
  const guardado = JSON.parse(localStorage.getItem('demo_carrito'))
  expect(guardado[0].tipo).toBe('custom')
  expect(guardado[0].constructor).toBe('pizza')
  expect(guardado[0].selecciones.length).toBeGreaterThan(0)
})

test('tipo de constructor inexistente muestra mensaje', async () => {
  ir('/armar/sushi')
  expect(await screen.findByText(/no existe/i)).toBeInTheDocument()
})
