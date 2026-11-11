import { catalogo } from '../src/data/catalogo.js'
import { leerPedidosLocales, guardarPedidoLocal } from '../src/lib/api.js'

test('el catálogo incluye los ingredientes, masas y tamaños pedidos', () => {
  const ids = catalogo.ingredientes.map((i) => i.id)
  for (const id of ['rugula', 'lechuga', 'aceituna-verde', 'aceituna-morada', 'cebolla-morada', 'cebolla-blanca']) {
    expect(ids).toContain(id)
  }
  expect(catalogo.salsas.map((s) => s.id)).toContain('pasta-tomate')
  expect(catalogo.masas).toHaveLength(6)
  expect(catalogo.tamanos).toHaveLength(4)
})

test('hay productos en las tres categorías', () => {
  for (const c of ['pizzas', 'hamburguesas', 'asados']) {
    expect(catalogo.productos.some((p) => p.categoria === c)).toBe(true)
  }
})

test('leerPedidosLocales devuelve [] si localStorage lanza', () => {
  const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado') })
  expect(leerPedidosLocales()).toEqual([])
  spy.mockRestore()
})

test('guardarPedidoLocal persiste y no duplica el mismo código', () => {
  localStorage.clear()
  guardarPedidoLocal('DEM-AAAA', '3001234567')
  guardarPedidoLocal('DEM-AAAA', '3001234567')
  expect(leerPedidosLocales()).toEqual([{ codigo: 'DEM-AAAA', telefono: '3001234567' }])
})
