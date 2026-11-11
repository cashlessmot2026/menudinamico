import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'

const m = vi.hoisted(() => ({
  adminLogin: vi.fn(),
  adminListar: vi.fn(),
  adminCambiarEstado: vi.fn(),
  adminResumen: vi.fn(),
  getCatalogo: vi.fn()
}))
vi.mock('../src/lib/api.js', () => ({
  getCatalogo: m.getCatalogo,
  leerPedidosLocales: () => [],
  guardarPedidoLocal: () => {},
  consultarPedido: () => Promise.resolve(null),
  suscribirPedido: () => () => {},
  crearPedido: () => Promise.resolve({ codigo: 'DEM-TEST' }),
  adminLogin: m.adminLogin,
  adminListar: m.adminListar,
  adminCambiarEstado: m.adminCambiarEstado,
  adminResumen: m.adminResumen,
  adminGuardarProducto: vi.fn(),
  adminGuardarOpcion: vi.fn(),
  adminCambiarClave: vi.fn()
}))

const ir = () => render(<MemoryRouter initialEntries={['/admin']}><App /></MemoryRouter>)
const ped = (id, codigo, estado, extra = {}) => ({
  id, codigo, estado, total: 28000, nombre: 'Ana', telefono: '3001234567', direccion: 'Calle 1', barrio: 'Centro',
  referencia: 'Casa azul', created_at: new Date().toISOString(), items: [{ nombre: 'Margarita', cantidad: 1, precio_unit: 28000 }], historial: [], ...extra
})
const conSesion = () => sessionStorage.setItem('demo_admin_token', 'tok')

beforeEach(() => {
  sessionStorage.clear()
  Object.values(m).forEach((f) => f.mockReset())
  m.getCatalogo.mockResolvedValue({ productos: [], opciones: [] })
  m.adminResumen.mockResolvedValue({ ventas_hoy: 0, pedidos_hoy: 0, por_estado: {}, mas_vendido: null })
})

test('clave incorrecta muestra el mensaje', async () => {
  m.adminLogin.mockResolvedValue(null)
  ir()
  await userEvent.type(screen.getByLabelText(/clave/i), '0000')
  await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
  expect(await screen.findByText('Clave incorrecta')).toBeInTheDocument()
})

test('bloqueo por intentos muestra espera de 10 minutos', async () => {
  m.adminLogin.mockRejectedValue(new Error('bloqueado'))
  ir()
  await userEvent.type(screen.getByLabelText(/clave/i), '0000')
  await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
  expect(await screen.findByText(/Demasiados intentos, espera 10 minutos/)).toBeInTheDocument()
})

test('login correcto guarda el token y muestra los pedidos', async () => {
  m.adminLogin.mockResolvedValue('tok-nuevo')
  m.adminListar.mockResolvedValue([ped(1, 'DEM-AAAA', 'recibido')])
  ir()
  await userEvent.type(screen.getByLabelText(/clave/i), '1234')
  await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
  expect(await screen.findByText('DEM-AAAA')).toBeInTheDocument()
  expect(sessionStorage.getItem('demo_admin_token')).toBe('tok-nuevo')
})

test('token expirado (no_autorizado) devuelve al login', async () => {
  conSesion()
  m.adminListar.mockRejectedValue(new Error('no_autorizado'))
  ir()
  expect(await screen.findByLabelText(/clave/i)).toBeInTheDocument()
  expect(sessionStorage.getItem('demo_admin_token')).toBeNull()
})

test('cancelar sin motivo no llama a la API', async () => {
  conSesion()
  m.adminListar.mockResolvedValue([ped(1, 'DEM-AAAA', 'recibido')])
  ir()
  await userEvent.click(await screen.findByRole('button', { name: /cancelar pedido/i }))
  await userEvent.click(screen.getByRole('button', { name: /confirmar cancelación/i }))
  expect(m.adminCambiarEstado).not.toHaveBeenCalled()
  expect(screen.getByText(/escribe el motivo/i)).toBeInTheDocument()
})

test('cancelar con motivo llama a la API', async () => {
  conSesion()
  m.adminListar.mockResolvedValue([ped(1, 'DEM-AAAA', 'recibido')])
  m.adminCambiarEstado.mockResolvedValue({})
  ir()
  await userEvent.click(await screen.findByRole('button', { name: /cancelar pedido/i }))
  await userEvent.type(screen.getByLabelText(/motivo/i), 'Sin ingredientes')
  await userEvent.click(screen.getByRole('button', { name: /confirmar cancelación/i }))
  expect(m.adminCambiarEstado).toHaveBeenCalledWith('tok', 1, 'cancelado', 'Sin ingredientes')
})

test('avanzar estado llama a la API con el siguiente estado', async () => {
  conSesion()
  m.adminListar.mockResolvedValue([ped(1, 'DEM-AAAA', 'recibido')])
  m.adminCambiarEstado.mockResolvedValue({})
  ir()
  await userEvent.click(await screen.findByRole('button', { name: /pasar a preparando/i }))
  expect(m.adminCambiarEstado).toHaveBeenCalledWith('tok', 1, 'preparando', null)
})

test('pedidos entregados y cancelados siguen apareciendo en la lista', async () => {
  conSesion()
  m.adminListar.mockResolvedValue([
    ped(1, 'DEM-ENTR', 'entregado'),
    ped(2, 'DEM-CANC', 'cancelado', { motivo_cancelacion: 'Sin stock' })
  ])
  ir()
  expect(await screen.findByText('DEM-ENTR')).toBeInTheDocument()
  expect(screen.getByText('DEM-CANC')).toBeInTheDocument()
  expect(screen.getByText(/Sin stock/)).toBeInTheDocument()
})
