import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'
import Timeline from '../src/components/Timeline.jsx'

const m = vi.hoisted(() => ({
  consultarPedido: vi.fn(),
  leerPedidosLocales: vi.fn(() => []),
  guardarPedidoLocal: vi.fn()
}))
vi.mock('../src/lib/api.js', () => ({
  getCatalogo: () => Promise.resolve({}),
  leerPedidosLocales: m.leerPedidosLocales,
  guardarPedidoLocal: m.guardarPedidoLocal,
  consultarPedido: m.consultarPedido,
  suscribirPedido: () => () => {},
  crearPedido: () => Promise.resolve({ codigo: 'DEM-TEST' })
}))

const ir = (r) => render(<MemoryRouter initialEntries={[r]}><App /></MemoryRouter>)
const pedido = (estado, extra = {}) => ({
  codigo: 'DEM-AAAA', estado, total: 28000, nombre: 'Ana', direccion: 'Calle 1', barrio: 'Centro',
  items: [{ nombre: 'Margarita', cantidad: 1, precio_unit: 28000 }], historial: [], ...extra
})

beforeEach(() => {
  m.consultarPedido.mockReset()
  m.leerPedidosLocales.mockReset().mockReturnValue([])
  m.guardarPedidoLocal.mockReset()
})

test('Timeline preparando marca recibido y preparando como completos', () => {
  render(<Timeline estado="preparando" />)
  expect(screen.getByText('Recibido').closest('li')).toHaveAttribute('data-done', 'true')
  expect(screen.getByText('Preparando').closest('li')).toHaveAttribute('data-done', 'true')
  expect(screen.getByText('En camino').closest('li')).toHaveAttribute('data-done', 'false')
})

test('Timeline cancelado muestra el motivo', () => {
  render(<Timeline estado="cancelado" motivo="Sin ingredientes" />)
  expect(screen.getByText(/Sin ingredientes/)).toBeInTheDocument()
})

test('seguimiento con código inexistente muestra error claro', async () => {
  m.consultarPedido.mockResolvedValue(null)
  ir('/seguimiento')
  await userEvent.type(screen.getByLabelText(/teléfono/i), '3001234567')
  await userEvent.type(screen.getByLabelText(/código/i), 'DEM-ZZZZ')
  await userEvent.click(screen.getByRole('button', { name: /consultar/i }))
  expect(await screen.findByText(/No encontramos tu pedido/i)).toBeInTheDocument()
})

test('seguimiento normaliza el teléfono y guarda el pedido localmente', async () => {
  m.consultarPedido.mockResolvedValue(pedido('recibido'))
  ir('/seguimiento')
  await userEvent.type(screen.getByLabelText(/teléfono/i), '+57 300 123 4567')
  await userEvent.type(screen.getByLabelText(/código/i), 'dem-aaaa')
  await userEvent.click(screen.getByRole('button', { name: /consultar/i }))
  await screen.findByText(/Margarita/)
  expect(m.consultarPedido).toHaveBeenCalledWith('3001234567', 'DEM-AAAA')
  expect(m.guardarPedidoLocal).toHaveBeenCalledWith('DEM-AAAA', '3001234567')
})

test('/pedido/:codigo sin teléfono local pide el teléfono', async () => {
  ir('/pedido/DEM-AAAA')
  expect(await screen.findByLabelText(/teléfono/i)).toBeInTheDocument()
  expect(m.consultarPedido).not.toHaveBeenCalled()
})

test('un pedido entregado sigue visible para el cliente', async () => {
  m.leerPedidosLocales.mockReturnValue([{ codigo: 'DEM-AAAA', telefono: '3001234567' }])
  m.consultarPedido.mockResolvedValue(pedido('entregado'))
  ir('/pedido/DEM-AAAA')
  expect(await screen.findByText(/Margarita/)).toBeInTheDocument()
  expect(screen.getByText('Entregado').closest('li')).toHaveAttribute('data-done', 'true')
})
