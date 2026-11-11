import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '../src/store/CartContext.jsx'

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>
const item = { id: 'p1', tipo: 'producto', nombre: 'Margarita', precioUnit: 28000, cantidad: 1 }

beforeEach(() => localStorage.clear())

test('agregar el mismo producto dos veces suma la cantidad', () => {
  const { result } = renderHook(() => useCart(), { wrapper })
  act(() => { result.current.agregar(item); result.current.agregar(item) })
  expect(result.current.items).toHaveLength(1)
  expect(result.current.items[0].cantidad).toBe(2)
  expect(result.current.total).toBe(56000)
})

test('cambiarCantidad a 0 elimina el item y vaciar deja total 0', () => {
  const { result } = renderHook(() => useCart(), { wrapper })
  act(() => result.current.agregar(item))
  act(() => result.current.cambiarCantidad('p1', 0))
  expect(result.current.items).toHaveLength(0)
  act(() => { result.current.agregar(item); result.current.vaciar() })
  expect(result.current.total).toBe(0)
})

test('no agrega items no disponibles', () => {
  const { result } = renderHook(() => useCart(), { wrapper })
  let ok
  act(() => { ok = result.current.agregar({ ...item, disponible: false }) })
  expect(ok).toBe(false)
  expect(result.current.items).toHaveLength(0)
})

test('funciona en memoria si localStorage lanza errores', () => {
  const g = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('x') })
  const s = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('x') })
  const { result } = renderHook(() => useCart(), { wrapper })
  act(() => result.current.agregar(item))
  expect(result.current.items).toHaveLength(1)
  g.mockRestore(); s.mockRestore()
})
