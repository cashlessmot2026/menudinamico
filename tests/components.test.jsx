import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from '../src/components/ProductCard.jsx'
import Navbar from '../src/components/Navbar.jsx'

const base = { id: 'p1', categoria: 'pizzas', nombre: 'Margarita', descripcion: 'rica', precio: 28000 }

test('ProductCard agotado muestra etiqueta y deshabilita el botón', () => {
  render(<ProductCard producto={{ ...base, disponible: false }} onAdd={() => {}} />)
  expect(screen.getByText('Agotado')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /agregar/i })).toBeDisabled()
})

test('ProductCard disponible llama onAdd con el producto', async () => {
  const onAdd = vi.fn()
  const p = { ...base, disponible: true }
  render(<ProductCard producto={p} onAdd={onAdd} />)
  await userEvent.click(screen.getByRole('button', { name: /agregar/i }))
  expect(onAdd).toHaveBeenCalledWith(p)
})

test('Navbar muestra el contador del carrito', () => {
  render(<MemoryRouter><Navbar count={3} /></MemoryRouter>)
  expect(screen.getByLabelText('Carrito')).toHaveTextContent('3')
})
