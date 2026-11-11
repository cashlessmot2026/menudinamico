import { tamanos, masas, salsas, ingredientes } from '../data/catalogo.js'

const EMOJI = {
  // pizza
  mozzarella: '🧀', parmesano: '🧀', provolone: '🧀', cheddar: '🧀', 'queso-azul': '🧀', burrata: '⚪',
  pepperoni: '🔴', jamon: '🍖', tocineta: '🥓', salami: '🥩', pollo: '🍗', 'carne-molida': '🥩', chorizo: '🌭',
  rugula: '🌿', lechuga: '🥬', 'aceituna-verde': '🫒', 'aceituna-morada': '🫐', 'cebolla-blanca': '🧅',
  'cebolla-morada': '🧅', 'cebolla-caramelizada': '🧅', champinones: '🍄', pimenton: '🫑', 'tomate-cherry': '🍅',
  maiz: '🌽', espinaca: '🥬', alcachofa: '🌱', jalapeno: '🌶️', albahaca: '🌿', pina: '🍍', oregano: '🌿',
  'borde-queso': '🧀'
}

const op = (id, nombre, precio, emoji, extra = {}) => ({ id, nombre, precio, disponible: true, emoji, ...extra })

const HAMBURGUESA = {
  id: 'hamburguesa',
  titulo: 'Arma tu',
  em: 'hamburguesa',
  subtitulo: 'Plancha caliente, a tu gusto',
  emoji: '🍔',
  base: 12000,
  pasos: [
    { id: 'pan', titulo: 'Pan', tipo: 'single', opciones: [
      op('brioche', 'Brioche', 0, '🍞'), op('integral', 'Integral', 1500, '🌾'),
      op('sin-gluten', 'Sin gluten', 3000, '🥖'), op('papa', 'Pan de papa', 1000, '🥔')
    ] },
    { id: 'carne', titulo: 'Carne', tipo: 'single', opciones: [
      op('res', 'Res 150 g', 6000, '🥩'), op('doble-res', 'Doble res', 12000, '🥩'),
      op('pollo-crispy', 'Pollo crispy', 5500, '🍗'), op('veggie', 'Garbanzo veggie', 5000, '🥙')
    ] },
    { id: 'quesos', titulo: 'Quesos', tipo: 'multi', opciones: [
      op('cheddar', 'Cheddar', 2000, '🧀'), op('suizo', 'Suizo', 2500, '🧀'),
      op('mozzarella', 'Mozzarella', 2500, '🧀'), op('azul', 'Queso azul', 3500, '🧀')
    ] },
    { id: 'toppings', titulo: 'Toppings', tipo: 'multi', opciones: [
      op('tocineta', 'Tocineta', 3500, '🥓'), op('huevo', 'Huevo frito', 2500, '🍳'),
      op('lechuga', 'Lechuga', 800, '🥬'), op('tomate', 'Tomate', 800, '🍅'),
      op('cebolla-morada', 'Cebolla morada', 800, '🧅'), op('pepinillos', 'Pepinillos', 1000, '🥒'),
      op('jalapeno', 'Jalapeño', 1000, '🌶️'), op('aros-cebolla', 'Aros de cebolla', 2500, '🧅'),
      op('champinones', 'Champiñones', 2000, '🍄'), op('pina', 'Piña asada', 1500, '🍍'),
      op('aguacate', 'Aguacate', 3000, '🥑')
    ] },
    { id: 'salsas', titulo: 'Salsas', tipo: 'multi', opciones: [
      op('bbq', 'BBQ', 0, '🟤'), op('mayo-ajo', 'Mayonesa de ajo', 0, '⚪'), op('mostaza', 'Mostaza', 0, '🟡'),
      op('ketchup', 'Ketchup', 0, '🔴'), op('chimichurri', 'Chimichurri', 500, '🟢'), op('picante', 'Salsa picante', 0, '🌶️')
    ] }
  ]
}

const POLLO = {
  id: 'pollo',
  titulo: 'Arma tu',
  em: 'pollo a la brasa',
  subtitulo: 'Carbón, papas y tus cremas favoritas',
  emoji: '🍗',
  base: 0,
  pasos: [
    { id: 'plato', titulo: 'Plato', tipo: 'single', opciones: [
      op('cuarto', 'Cuarto de pollo', 14000, '🍗'), op('medio', 'Medio pollo', 24000, '🍗'), op('entero', 'Pollo entero', 42000, '🍗')
    ] },
    { id: 'acompanantes', titulo: 'Acompañantes', tipo: 'multi', opciones: [
      op('papas-fritas', 'Papas fritas', 5000, '🍟'), op('papa-criolla', 'Papa criolla', 4500, '🥔'),
      op('arroz', 'Arroz', 3500, '🍚'), op('ensalada', 'Ensalada', 4000, '🥗'), op('yuca', 'Yuca frita', 4000, '🍠'),
      op('arepa', 'Arepa', 2000, '🫓'), op('platano', 'Plátano maduro', 3500, '🍌')
    ] },
    { id: 'cremas', titulo: 'Cremas', tipo: 'multi', opciones: [
      op('aji', 'Ají', 0, '🟠'), op('mayonesa', 'Mayonesa', 0, '⚪'), op('ketchup', 'Ketchup', 0, '🔴'),
      op('mostaza', 'Mostaza', 0, '🟡'), op('guacamole', 'Guacamole', 1500, '🥑'), op('rosada', 'Salsa rosada', 0, '🩷')
    ] },
    { id: 'extras', titulo: 'Extras', tipo: 'multi', opciones: [
      op('gaseosa', 'Gaseosa 400 ml', 4000, '🥤'), op('limonada', 'Limonada natural', 5000, '🍋'),
      op('chicha', 'Chicha', 5000, '🥛'), op('chorizo', 'Chorizo', 6000, '🌭')
    ] }
  ]
}

const delCatalogo = (lista, nombreGrupo) =>
  lista.filter((i) => i.grupo === nombreGrupo).map((i) => ({ ...i, emoji: EMOJI[i.id] || '🍕' }))

/** Construye los tres constructores. La pizza toma precios y disponibilidad del catálogo (BD o local). */
export function buildersDesde(catalogo) {
  const ing = catalogo.ingredientes || ingredientes
  const pizza = {
    id: 'pizza',
    titulo: 'Arma tu',
    em: 'pizza',
    subtitulo: 'Estilo napolitano, horneada al momento',
    emoji: '🍕',
    base: 0,
    pasos: [
      { id: 'tamano', titulo: 'Tamaño', tipo: 'single', segmentado: true, opciones: (catalogo.tamanos || tamanos).map((t) => ({ ...t, disponible: t.disponible !== false, emoji: '📏' })) },
      { id: 'masa', titulo: 'Masa', tipo: 'single', opciones: (catalogo.masas || masas).map((m) => ({ ...m, disponible: m.disponible !== false, emoji: '🫓' })) },
      { id: 'salsa', titulo: 'Salsa base', tipo: 'single', opciones: (catalogo.salsas || salsas).map((s) => ({ ...s, disponible: s.disponible !== false, emoji: '🍅' })) },
      { id: 'quesos', titulo: 'Quesos', tipo: 'multi', opciones: delCatalogo(ing, 'queso') },
      { id: 'carnes', titulo: 'Carnes', tipo: 'multi', opciones: delCatalogo(ing, 'carne') },
      { id: 'vegetales', titulo: 'Vegetales', tipo: 'multi', opciones: delCatalogo(ing, 'vegetal') },
      { id: 'extras', titulo: 'Extras', tipo: 'multi', opciones: delCatalogo(ing, 'extra') }
    ]
  }
  return aplicarBD({ pizza, hamburguesa: HAMBURGUESA, pollo: POLLO }, catalogo)
}

/** La BD manda en precio y disponibilidad (filas de `opciones`) y en la base (`constructores`). */
function aplicarBD(builders, catalogo) {
  const filas = catalogo.opciones || []
  const bases = catalogo.constructores || []
  if (!filas.length && !bases.length) return builders
  const out = {}
  for (const [k, b] of Object.entries(builders)) {
    const base = bases.find((x) => x.id === k)?.base
    out[k] = {
      ...b,
      base: base ?? b.base,
      pasos: b.pasos.map((p) => ({
        ...p,
        opciones: p.opciones.map((o) => {
          const f = filas.find((r) => r.constructor === k && r.paso === p.id && r.id === o.id)
          return f ? { ...o, precio: f.precio, disponible: f.disponible } : o
        })
      }))
    }
  }
  return out
}

const MAX_CANTIDAD = 2

export function seleccionInicial(builder) {
  const sel = {}
  for (const paso of builder.pasos) {
    if (paso.tipo === 'single') {
      const primera = paso.opciones.find((o) => o.disponible)
      sel[paso.id] = primera ? { [primera.id]: 1 } : {}
    } else {
      sel[paso.id] = {}
    }
  }
  return sel
}

export function toggleOpcion(builder, sel, pasoId, opcionId) {
  const paso = builder.pasos.find((p) => p.id === pasoId)
  const opcion = paso?.opciones.find((o) => o.id === opcionId)
  if (!paso || !opcion || !opcion.disponible) return sel
  if (paso.tipo === 'single') return { ...sel, [pasoId]: { [opcionId]: 1 } }
  const actual = sel[pasoId]?.[opcionId] || 0
  const proximo = actual + 1 > MAX_CANTIDAD ? 0 : actual + 1
  const copia = { ...sel[pasoId] }
  if (proximo === 0) delete copia[opcionId]
  else copia[opcionId] = proximo
  return { ...sel, [pasoId]: copia }
}

/** Lista plana [{paso, id, cantidad, nombre, precio}] de lo elegido. */
export function opcionesElegidas(builder, sel) {
  const out = []
  for (const paso of builder.pasos) {
    for (const o of paso.opciones) {
      const cantidad = sel[paso.id]?.[o.id] || 0
      if (cantidad > 0 && o.disponible) out.push({ paso: paso.id, id: o.id, cantidad, nombre: o.nombre, precio: o.precio, emoji: o.emoji })
    }
  }
  return out
}

export function precioBuilder(builder, sel) {
  return builder.base + opcionesElegidas(builder, sel).reduce((s, o) => s + o.precio * o.cantidad, 0)
}

export function resumenSeleccion(builder, sel) {
  return opcionesElegidas(builder, sel)
    .map((o) => (o.cantidad > 1 ? `${o.nombre} x${o.cantidad}` : o.nombre))
    .join(', ')
}
