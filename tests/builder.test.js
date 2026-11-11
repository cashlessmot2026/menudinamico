import { buildersDesde, seleccionInicial, toggleOpcion, precioBuilder, resumenSeleccion } from '../src/lib/builder.js'
import { catalogo } from '../src/data/catalogo.js'

const builders = buildersDesde(catalogo)

test('hay tres constructores: pizza, hamburguesa y pollo', () => {
  expect(Object.keys(builders).sort()).toEqual(['hamburguesa', 'pizza', 'pollo'])
})

test('seleccionInicial elige la primera opción disponible de cada paso único', () => {
  const sel = seleccionInicial(builders.pizza)
  expect(sel.tamano).toEqual({ personal: 1 })
  expect(sel.masa).toEqual({ clasica: 1 })
  expect(sel.salsa).toEqual({ 'pasta-tomate': 1 })
  expect(sel.quesos).toEqual({})
})

test('toggleOpcion cicla 0 -> 1 -> 2 -> 0 en pasos múltiples', () => {
  const b = builders.pizza
  let sel = seleccionInicial(b)
  sel = toggleOpcion(b, sel, 'carnes', 'pepperoni')
  expect(sel.carnes.pepperoni).toBe(1)
  sel = toggleOpcion(b, sel, 'carnes', 'pepperoni')
  expect(sel.carnes.pepperoni).toBe(2)
  sel = toggleOpcion(b, sel, 'carnes', 'pepperoni')
  expect(sel.carnes.pepperoni).toBeUndefined()
})

test('toggleOpcion en paso único reemplaza la elección', () => {
  const b = builders.pizza
  const sel = toggleOpcion(b, seleccionInicial(b), 'tamano', 'grande')
  expect(sel.tamano).toEqual({ grande: 1 })
})

test('precioBuilder pizza: tamaño + masa + salsa + ingredientes x cantidad', () => {
  const b = builders.pizza
  let sel = toggleOpcion(b, seleccionInicial(b), 'tamano', 'grande')
  sel = toggleOpcion(b, sel, 'masa', 'gruesa')
  sel = toggleOpcion(b, sel, 'vegetales', 'rugula')
  sel = toggleOpcion(b, sel, 'carnes', 'pepperoni')
  sel = toggleOpcion(b, sel, 'carnes', 'pepperoni')
  expect(precioBuilder(b, sel)).toBe(34000 + 3000 + 0 + 2500 + 2 * 4000)
})

test('opción no disponible no se agrega ni se cobra', () => {
  const cat = { ...catalogo, ingredientes: catalogo.ingredientes.map((i) => (i.id === 'burrata' ? { ...i, disponible: false } : i)) }
  const b = buildersDesde(cat).pizza
  const sel = toggleOpcion(b, seleccionInicial(b), 'quesos', 'burrata')
  expect(sel.quesos.burrata).toBeUndefined()
  expect(precioBuilder(b, sel)).toBe(16000)
})

test('precioBuilder hamburguesa incluye base y resumen lista lo elegido', () => {
  const b = builders.hamburguesa
  const sel = toggleOpcion(b, seleccionInicial(b), 'toppings', 'tocineta')
  expect(precioBuilder(b, sel)).toBeGreaterThan(b.base)
  expect(resumenSeleccion(b, sel)).toContain('Tocineta')
})
