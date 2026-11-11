export const ESTADOS = ['recibido', 'preparando', 'en_camino', 'entregado', 'cancelado']
const FLUJO = ['recibido', 'preparando', 'en_camino', 'entregado']

export function puedeTransicionar(desde, hacia) {
  if (desde === 'entregado' || desde === 'cancelado') return false
  if (hacia === 'cancelado') return FLUJO.includes(desde) && desde !== 'entregado'
  const i = FLUJO.indexOf(desde)
  return i >= 0 && FLUJO[i + 1] === hacia
}
