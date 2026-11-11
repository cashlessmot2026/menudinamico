import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'

vi.mock('../src/lib/api.js', async () => {
  const { catalogo } = await import('../src/data/catalogo.js')
  return {
    getCatalogo: () => Promise.resolve(catalogo),
    leerPedidosLocales: () => [],
    guardarPedidoLocal: () => {},
    consultarPedido: () => Promise.resolve(null),
    suscribirPedido: () => () => {},
    crearPedido: () => Promise.resolve({ codigo: 'DEM-TEST' })
  }
})

const ir = (ruta) => render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>)

beforeEach(() => localStorage.clear())

test('/menu/pizzas lista solo productos de pizzas', async () => {
  ir('/menu/pizzas')
  expect(await screen.findByText('Margarita')).toBeInTheDocument()
  expect(screen.queryByText('Churrasco')).not.toBeInTheDocument()
  expect(screen.queryByText('Doble carne')).not.toBeInTheDocument()
})

test('categoría inexistente muestra mensaje', async () => {
  ir('/menu/sushi')
  expect(await screen.findByText('Categoría no encontrada')).toBeInTheDocument()
})

test('agregar incrementa el contador del carrito', async () => {
  ir('/menu/pizzas')
  await screen.findByText('Margarita')
  await userEvent.click(screen.getAllByRole('button', { name: /agregar/i })[0])
  expect(screen.getByLabelText('Carrito')).toHaveTextContent('1')
})

test('la landing enlaza a las tres categorías', async () => {
  ir('/')
  expect((await screen.findAllByRole('link', { name: /pizzas/i })).length).toBeGreaterThan(0)
  expect(screen.getAllByRole('link', { name: /hamburguesas/i }).length).toBeGreaterThan(0)
  expect(screen.getAllByRole('link', { name: /asados/i }).length).toBeGreaterThan(0)
})
