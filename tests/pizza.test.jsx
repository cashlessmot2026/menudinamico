import { render, screen, fireEvent } from '@testing-library/react'
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

describe('arrastrar ingredientes sobre la pizza', () => {
  const rect = { left: 0, top: 0, width: 300, height: 300, right: 300, bottom: 300, x: 0, y: 0 }
  beforeEach(() => vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(rect))
  afterEach(() => vi.restoreAllMocks())

  async function abrirRugula() {
    ir('/armar/pizza')
    await userEvent.click(await screen.findByRole('tab', { name: /vegetales/i }))
    return screen.getByRole('button', { name: /rúgula/i })
  }

  test('mientras se arrastra aparece la imagen pegada al puntero y la pizza se resalta', async () => {
    const chip = await abrirRugula()
    fireEvent.pointerDown(chip, { clientX: 5, clientY: 5, button: 0, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 150, clientY: 150, pointerId: 1 })
    const ghost = await screen.findByTestId('ghost')
    expect(ghost).toHaveStyle({ left: '150px', top: '150px' })
    expect(screen.getByTestId('pizza-drop')).toHaveClass('sobre')
    fireEvent.pointerUp(window, { clientX: 150, clientY: 150, pointerId: 1 })
  })

  test('soltar sobre la pizza agrega el ingrediente y quita la imagen flotante', async () => {
    const chip = await abrirRugula()
    fireEvent.pointerDown(chip, { clientX: 5, clientY: 5, button: 0, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 150, clientY: 150, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 150, clientY: 150, pointerId: 1 })
    expect(screen.queryByTestId('ghost')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rúgula/i })).toHaveAttribute('aria-pressed', 'true')
    // 16.000 (personal) + 2.500 de rúgula
    expect(screen.getByTestId('total')).toHaveTextContent('18.500')
  })

  test('soltar fuera de la pizza no agrega nada', async () => {
    const chip = await abrirRugula()
    fireEvent.pointerDown(chip, { clientX: 5, clientY: 5, button: 0, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 700, clientY: 700, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 700, clientY: 700, pointerId: 1 })
    expect(screen.getByRole('button', { name: /rúgula/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('total')).toHaveTextContent('16.000')
  })

  test('un toque corto sin mover sigue agregando (accesible sin arrastrar)', async () => {
    const chip = await abrirRugula()
    await userEvent.click(chip)
    expect(screen.getByRole('button', { name: /rúgula/i })).toHaveAttribute('aria-pressed', 'true')
  })

  test('la rúgula usa la foto real y reparte piezas por la pizza', async () => {
    const chip = await abrirRugula()
    await userEvent.click(chip)
    const piezas = document.querySelectorAll('img.topping-img[data-ing="rugula"]')
    expect(piezas.length).toBe(9)
    expect(piezas[0].getAttribute('src')).toMatch(/img\/ing\/rugula\.webp$/)
  })
})
