import { repartir, PIEZAS_POR_UNIDAD, dentroDelCirculo } from '../src/lib/spread.js'
import { buildersDesde, seleccionInicial, incrementarOpcion } from '../src/lib/builder.js'
import { catalogo } from '../src/data/catalogo.js'

test('repartir devuelve PIEZAS_POR_UNIDAD piezas por cada unidad', () => {
  expect(repartir('rugula', 1)).toHaveLength(PIEZAS_POR_UNIDAD)
  expect(repartir('rugula', 2)).toHaveLength(PIEZAS_POR_UNIDAD * 2)
  expect(repartir('rugula', 0)).toHaveLength(0)
})

test('todas las piezas quedan dentro del círculo, sin tocar el borde', () => {
  for (const id of ['rugula', 'pepperoni', 'aceituna-verde', 'x']) {
    for (const p of repartir(id, 2)) {
      expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(0.85)
      expect(p.scale).toBeGreaterThan(0.7)
      expect(p.scale).toBeLessThan(1.35)
    }
  }
})

test('el reparto es estable: pasar de x1 a x2 no mueve las primeras piezas', () => {
  const uno = repartir('pepperoni', 1)
  const dos = repartir('pepperoni', 2)
  expect(dos.slice(0, uno.length)).toEqual(uno)
})

test('cada ingrediente tiene una distribución distinta y repetible', () => {
  expect(repartir('rugula', 1)).toEqual(repartir('rugula', 1))
  expect(repartir('rugula', 1)).not.toEqual(repartir('pepperoni', 1))
})

test('las piezas se reparten por toda la pizza (no se amontonan en un lado)', () => {
  const ps = repartir('jamon', 2)
  const cuadrantes = new Set(ps.map((p) => `${p.x > 0}${p.y > 0}`))
  expect(cuadrantes.size).toBe(4)
})

test('dentroDelCirculo detecta si un punto está sobre la pizza', () => {
  const rect = { left: 100, top: 100, width: 200, height: 200 }
  expect(dentroDelCirculo(200, 200, rect)).toBe(true)
  expect(dentroDelCirculo(105, 105, rect)).toBe(false) // esquina del cuadrado, fuera del círculo
  expect(dentroDelCirculo(400, 200, rect)).toBe(false)
})

test('incrementarOpcion suma hasta 2 y nunca quita (soltar no borra)', () => {
  const b = buildersDesde(catalogo).pizza
  let sel = seleccionInicial(b)
  sel = incrementarOpcion(b, sel, 'vegetales', 'rugula')
  expect(sel.vegetales.rugula).toBe(1)
  sel = incrementarOpcion(b, sel, 'vegetales', 'rugula')
  expect(sel.vegetales.rugula).toBe(2)
  expect(incrementarOpcion(b, sel, 'vegetales', 'rugula')).toBe(sel)
})

test('incrementarOpcion ignora pasos únicos y opciones no disponibles', () => {
  const cat = { ...catalogo, ingredientes: catalogo.ingredientes.map((i) => (i.id === 'burrata' ? { ...i, disponible: false } : i)) }
  const b = buildersDesde(cat).pizza
  const sel = seleccionInicial(b)
  expect(incrementarOpcion(b, sel, 'tamano', 'grande')).toBe(sel)
  expect(incrementarOpcion(b, sel, 'quesos', 'burrata')).toBe(sel)
})
