// Fotos reales (WebP con transparencia). Los ingredientes sin foto usan su emoji como respaldo.
// Créditos: public/img/ing/CREDITS.md
const BASE = import.meta.env?.BASE_URL ?? '/'
const ruta = (archivo) => `${BASE}img/ing/${archivo}.webp`

/** Pizza: `tam` = ancho en px de cada pieza sobre una pizza de 280 px. */
const foto = (archivo, tam) => ({ src: ruta(archivo), tam })

export const IMAGENES_PIZZA = {
  rugula: foto('rugula', 62),
  'tomate-cherry': foto('tomate', 42),
  tocineta: foto('tocino', 52),
  'cebolla-morada': foto('cebolla-morada', 48)
}

/**
 * Hamburguesa: cada foto es una capa de la torre.
 * - ancho: fracción del ancho de la hamburguesa
 * - aspecto: alto/ancho de la foto recortada
 * - grosor: fracción de su alto que sigue a la vista cuando cae la capa siguiente encima
 * - aplastar: escala vertical (las salpicaduras de salsa se aplastan para verse untadas)
 * - filtro: CSS para variar el color del pan cuando no hay foto propia
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
  // toppings
  tocineta: capa('tocino', 1.02, 0.662, 0.26),
  lechuga: capa('lechuga', 1.1, 0.598, 0.3),
  'cebolla-morada': capa('cebolla-morada', 0.96, 0.617, 0.26),
  pepinillos: capa('pepinillos', 0.9, 0.608, 0.26),
  // salsas
  ketchup: capa('ketchup', 1.4, 0.669, 0.3, { aplastar: 0.62 }),
  mostaza: capa('mostaza', 1.4, 0.66, 0.3, { aplastar: 0.62 }),
  rosada: capa('salsa-rosada', 1.4, 0.654, 0.3, { aplastar: 0.62 })
}

/** Foto de una opción según el constructor (los ids se repiten entre pizza y hamburguesa). */
export function imagenDe(constructorId, id) {
  if (constructorId === 'hamburguesa') return CAPAS_HAMBURGUESA[id]
  if (constructorId === 'pizza') return IMAGENES_PIZZA[id]
  return undefined
}
