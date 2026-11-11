export const PIEZAS_POR_UNIDAD = 9
const RADIO_MAX = 0.8 // fracción del radio de la pizza: deja libre el borde de la masa

const frac = (n) => n - Math.floor(n)

function semilla(clave) {
  let h = 2166136261
  for (let i = 0; i < clave.length; i++) h = Math.imul(h ^ clave.charCodeAt(i), 16777619)
  return [(h >>> 0) / 4294967296, ((h >>> 8) & 0xffff) / 65536, ((h >>> 16) & 0xffff) / 65536]
}

/**
 * Reparte las piezas de un ingrediente por toda la pizza (círculo unitario).
 * Usa la secuencia R2 (baja discrepancia): cubre bien el círculo y, como cada pieza depende solo de
 * su índice, pasar de x1 a x2 no mueve las piezas que ya estaban.
 * @returns {{x:number,y:number,rot:number,scale:number}[]} x,y en [-1,1]
 */
export function repartir(clave, cantidad) {
  const total = PIEZAS_POR_UNIDAD * Math.max(0, cantidad)
  const [s1, s2, s3] = semilla(clave)
  const piezas = []
  for (let j = 0; j < total; j++) {
    const u = frac(s1 + (j + 1) * 0.7548776662466927)
    const v = frac(s2 + (j + 1) * 0.5698402909980532)
    const r = RADIO_MAX * Math.sqrt(u)
    const a = 2 * Math.PI * v
    piezas.push({
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      rot: Math.round(frac(s3 + j * 0.618) * 360 - 180),
      scale: 0.85 + frac(s1 + j * 0.31) * 0.4
    })
  }
  return piezas
}

/** ¿El punto (px, py) de pantalla cae sobre la pizza (círculo inscrito en rect)? */
export function dentroDelCirculo(px, py, rect) {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  return Math.hypot(px - cx, py - cy) <= Math.min(rect.width, rect.height) / 2
}
