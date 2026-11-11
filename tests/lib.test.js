import { precioPizza, totalCarrito } from '../src/lib/price.js'
import { ESTADOS, puedeTransicionar } from '../src/lib/orderStatus.js'
import { generarCodigo } from '../src/lib/orderCode.js'
import { normalizarTelefono } from '../src/lib/phone.js'
import { cop } from '../src/lib/format.js'

const catalogo = {
  tamanos: [{ id: 'grande', precio: 30000 }],
  masas: [{ id: 'gruesa', precio: 3000 }],
  salsas: [{ id: 'pasta-tomate', precio: 0 }],
  ingredientes: [
    { id: 'rugula', precio: 2000, disponible: true },
    { id: 'burrata', precio: 6000, disponible: false }
  ]
}

test('normalizarTelefono quita símbolos y prefijo 57', () => {
  expect(normalizarTelefono('+57 300-123 4567')).toBe('3001234567')
  expect(normalizarTelefono('300 123 4567')).toBe('3001234567')
})

test('puedeTransicionar solo avanza al siguiente estado', () => {
  expect(puedeTransicionar('recibido', 'preparando')).toBe(true)
  expect(puedeTransicionar('recibido', 'entregado')).toBe(false)
  expect(puedeTransicionar('entregado', 'cancelado')).toBe(false)
  expect(puedeTransicionar('en_camino', 'cancelado')).toBe(true)
  expect(puedeTransicionar('cancelado', 'recibido')).toBe(false)
  expect(ESTADOS).toEqual(['recibido', 'preparando', 'en_camino', 'entregado', 'cancelado'])
})

test('generarCodigo produce DEM-XXXX válido', () => {
  expect(generarCodigo(() => 0)).toBe('DEM-AAAA')
  expect(generarCodigo()).toMatch(/^DEM-[A-HJ-NP-Z2-9]{4}$/)
})

test('precioPizza suma base + masa + salsa + ingredientes disponibles', () => {
  const cfg = { tamano: 'grande', masa: 'gruesa', salsa: 'pasta-tomate', ingredientes: ['rugula', 'burrata'] }
  expect(precioPizza(cfg, catalogo)).toBe(30000 + 3000 + 0 + 2000)
})

test('totalCarrito suma precioUnit * cantidad y vacío es 0', () => {
  expect(totalCarrito([])).toBe(0)
  expect(totalCarrito([{ precioUnit: 1000, cantidad: 3 }, { precioUnit: 500, cantidad: 2 }])).toBe(4000)
})

test('cop formatea pesos colombianos', () => {
  expect(cop(25000)).toContain('25.000')
})
