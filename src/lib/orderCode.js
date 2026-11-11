const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generarCodigo(rand = Math.random) {
  let s = ''
  for (let i = 0; i < 4; i++) s += ALFABETO[Math.floor(rand() * ALFABETO.length)]
  return `DEM-${s}`
}
