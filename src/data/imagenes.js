// Fotos reales (WebP con transparencia). Los ingredientes sin foto usan su emoji como respaldo.
// Créditos: public/img/ing/CREDITS.md
const BASE = import.meta.env?.BASE_URL ?? '/'
const ruta = (archivo) => `${BASE}img/ing/${archivo}.webp`

// ─── Pizza ───────────────────────────────────────────────────────────────────────────────────
/** `tam` = ancho en px de cada pieza sobre una pizza de 280 px. `cubre` = capa que tapa toda la pizza. */
const foto = (archivo, tam, extra = {}) => ({ src: ruta(archivo), tam, ...extra })

export const PIZZA_MASA = ruta('pizza-masa')

export const IMAGENES_PIZZA = {
  rugula: foto('rugula', 62),
  'tomate-cherry': foto('tomate', 42),
  tocineta: foto('tocino', 52),
  'cebolla-morada': foto('cebolla-morada', 48),
  'cebolla-caramelizada': foto('cebolla-caramelizada', 50),
  pepperoni: foto('pepperoni', 46),
  mozzarella: foto('pizza-queso', 0, { cubre: true })
}

// ─── Hamburguesa y perro caliente: cada foto es una capa de la torre ─────────────────────────
/**
 * - ancho: fracción del ancho del pan
 * - aspecto: alto/ancho de la foto recortada
 * - grosor: fracción de su alto que sigue a la vista cuando cae la capa siguiente encima (hamburguesa)
 * - aplastar: escala vertical (los montones y salpicaduras se aplastan para verse sobre el pan)
 * - estirar: la foto llena toda su caja aunque se deforme (una rodaja redonda vista de lado se ve como elipse)
 * - filtro: CSS para variar el color del pan cuando no hay foto propia
 * - icono: foto alternativa para el botón (las cintas largas se ven muy pequeñas en un círculo)
 * - chip: estilo CSS de la foto en el botón (las piezas largas se giran para llenar el círculo)
 */
const capa = (archivo, ancho, aspecto, grosor, extra = {}) => ({ src: ruta(archivo), ancho, aspecto, grosor, ...extra })

const PAN_DORADO = capa('pan-dorado', 1, 0.544, 1)
export const PAN_BASE = capa('pan-base', 1, 0.513, 0.5)

export const CAPAS_HAMBURGUESA = {
  // pan (tapa superior; la base siempre es PAN_BASE con el mismo filtro)
  brioche: PAN_DORADO,
  sesamo: capa('pan-sesamo', 1, 0.602, 1),
  integral: { ...PAN_DORADO, filtro: 'sepia(.55) brightness(.72) saturate(1.2)' },
  'sin-gluten': { ...PAN_DORADO, filtro: 'brightness(1.12) saturate(.7)' },
  papa: { ...PAN_DORADO, filtro: 'hue-rotate(-8deg) saturate(1.25)' },
  // carne
  res: capa('carne-res', 0.94, 0.613, 0.38),
  'doble-res': capa('carne-res', 0.94, 0.613, 0.38),
  // quesos (suizo y azul siguen dibujados con su color)
  cheddar: capa('queso-cheddar', 0.98, 0.562, 0.3),
  mozzarella: capa('queso-mozzarella', 0.98, 0.583, 0.3),
  // toppings
  tocineta: capa('tocino', 1.02, 0.662, 0.26),
  lechuga: capa('lechuga', 1.1, 0.598, 0.3),
  'cebolla-morada': capa('cebolla-morada', 0.96, 0.617, 0.26),
  'cebolla-caramelizada': capa('cebolla-caramelizada', 0.92, 0.613, 0.3),
  'papas-ripio': capa('papas-ripio', 0.94, 0.642, 0.3),
  pepinillos: capa('pepinillos', 0.9, 0.608, 0.26),
  tomate: capa('tomate-rodaja', 0.96, 0.974, 0.26, { aplastar: 0.34, estirar: true }),
  // salsas (salpicaduras anchas, del tamaño de la carne)
  ketchup: capa('ketchup', 1.4, 0.669, 0.3, { aplastar: 0.62 }),
  mostaza: capa('mostaza', 1.4, 0.66, 0.3, { aplastar: 0.62 }),
  rosada: capa('salsa-rosada', 1.4, 0.654, 0.3, { aplastar: 0.62 })
}

/**
 * Perro caliente. Se ve desde arriba: el pan abierto, la salchicha encima y los ingredientes a lo largo.
 * Todo se mide contra el ancho del pan; las salsas son cintas del largo de la salchicha.
 */
const LARGO_SALCHICHA = 0.9
const GIRAR = { transform: 'rotate(-28deg) scale(1.28)' }
export const PERRO_PAN = capa('perro-pan', 1, 0.516, 1)
export const PERRO_SALCHICHA = capa('perro-salchicha', LARGO_SALCHICHA, 0.208, 1, { chip: GIRAR })

export const CAPAS_PERRO = {
  clasico: PERRO_PAN,
  integral: { ...PERRO_PAN, filtro: 'sepia(.5) brightness(.74) saturate(1.2)' },
  frankfurt: PERRO_SALCHICHA,
  'doble-frankfurt': PERRO_SALCHICHA,
  // ingredientes sobre la salchicha
  'cheddar-rallado': capa('perro-cheddar', 0.86, 0.263, 1, { chip: GIRAR }),
  tocineta: capa('tocino', 0.5, 0.662, 1, { aplastar: 0.62 }),
  'cebolla-caramelizada': capa('cebolla-caramelizada', 0.78, 0.613, 1, { aplastar: 0.55 }),
  'papas-ripio': capa('papas-ripio', 0.78, 0.642, 1, { aplastar: 0.55 }),
  pepinillos: capa('pepinillos', 0.46, 0.608, 1, { aplastar: 0.62 }),
  // salsas: cintas del largo de la salchicha
  ketchup: capa('perro-ketchup', LARGO_SALCHICHA, 0.175, 1, { icono: ruta('ketchup') }),
  mostaza: capa('perro-mostaza', LARGO_SALCHICHA, 0.158, 1, { icono: ruta('mostaza') }),
  rosada: capa('salsa-rosada', LARGO_SALCHICHA, 0.654, 1, { aplastar: 0.3, icono: ruta('salsa-rosada') })
}

/** Foto de una opción según el constructor (los ids se repiten entre pizza, hamburguesa y perro). */
export function imagenDe(constructorId, id) {
  if (constructorId === 'hamburguesa') return CAPAS_HAMBURGUESA[id]
  if (constructorId === 'perro') return CAPAS_PERRO[id]
  if (constructorId === 'pizza') return IMAGENES_PIZZA[id]
  return undefined
}
