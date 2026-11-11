// Fotos reales (WebP con transparencia) por id de opción. `tam` = ancho en px sobre una pizza de 280 px.
// Los ingredientes sin foto usan su emoji como respaldo. Créditos: public/img/ing/CREDITS.md
const BASE = import.meta.env?.BASE_URL ?? '/'
const foto = (archivo, tam) => ({ src: `${BASE}img/ing/${archivo}.webp`, tam })

export const IMAGENES = {
  rugula: foto('rugula', 62),
  'tomate-cherry': foto('tomate', 42),
  tomate: foto('tomate', 42)
}

export const imagenDe = (id) => IMAGENES[id]
