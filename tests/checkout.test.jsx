import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'

const m = vi.hoisted(() => ({
  crearPedido: vi.fn(() => new Promise((res) => setTimeout(() => res({ codigo: 'DEM-TEST' }), 30))),
  guardar: vi.fn()
}))
vi.mock('../src/lib/api.js', () => ({
  getCatalogo: () => Promise.resolve({}),
  leerPedidosLocales: () => [],
  guardarPedidoLocal: m.guardar,
  consultarPedido: () => Promise.resolve(null),
  suscribirPedido: () => () => {},
  crearPedido: m.crearPedido
}))

const item = { id: 'pizza-margarita', tipo: 'producto', nombre: 'Margarita', precioUnit: 28000, cantidad: 1 }
const ir = (r) => render(<MemoryRouter initialEntries={[r]}><App /></MemoryRouter>)

beforeEach(() => {
  localStorage.clear()
  m.crearPedido.mockClear()
  m.guardar.mockClear()
})

test('carrito vacío no puede hacer checkout', async () => {
  ir('/checkout')
  expect(await screen.findByText(/tu carrito está vacío/i)).toBeInTheDocument()
})

test('con campos obligatorios vacíos no se crea el pedido', async () => {
  localStorage.setItem('demo_carrito', JSON.stringify([item]))
  ir('/checkout')
  await userEvent.click(await screen.findByRole('button', { name: /confirmar pedido/i }))
  expect(m.crearPedido).not.toHaveBeenCalled()
  expect(screen.getAllByText(/obligatorio/i).length).toBeGreaterThanOrEqual(5)
})

test('doble clic crea un solo pedido y guarda código y teléfono normalizado', async () => {
  localStorage.setItem('demo_carrito', JSON.stringify([item]))
  ir('/checkout')
  await userEvent.type(await screen.findByLabelText(/nombre/i), 'Ana Pérez')
  await userEvent.type(screen.getByLabelText(/teléfono/i), '+57 300 123 4567')
  await userEvent.type(screen.getByLabelText(/dirección/i), 'Calle 1 # 2-3')
  await userEvent.type(screen.getByLabelText(/barrio/i), 'Centro')
  await userEvent.type(screen.getByLabelText(/referencia/i), 'Casa azul')
  const btn = screen.getByRole('button', { name: /confirmar pedido/i })
  await userEvent.dblClick(btn)
  await screen.findByText(/DEM-TEST/)
  expect(m.crearPedido).toHaveBeenCalledTimes(1)
  expect(m.guardar).toHaveBeenCalledWith('DEM-TEST', '3001234567')
  expect(m.crearPedido.mock.calls[0][0].cliente.telefono).toBe('3001234567')
})
