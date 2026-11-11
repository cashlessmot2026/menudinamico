import { motion } from 'framer-motion'

const PASOS = [
  ['recibido', 'Recibido', '📝'],
  ['preparando', 'Preparando', '👨‍🍳'],
  ['en_camino', 'En camino', '🛵'],
  ['entregado', 'Entregado', '🏠']
]

export default function Timeline({ estado, motivo }) {
  const cancelado = estado === 'cancelado'
  const idx = cancelado ? 0 : PASOS.findIndex(([k]) => k === estado)
  return (
    <ol className="timeline">
      {PASOS.map(([k, etiqueta, emoji], i) => {
        const hecho = i <= idx
        const actual = !cancelado && i === idx
        return (
          <motion.li key={k} data-done={hecho ? 'true' : 'false'} className={`${hecho ? 'done' : ''} ${actual ? 'current' : ''}`} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
            <span className="tl-dot">{hecho ? emoji : '•'}</span>
            <span className="tl-label">{etiqueta}</span>
            {actual && estado !== 'entregado' && <motion.span className="tl-pulse" animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }} transition={{ repeat: Infinity, duration: 1.8 }} />}
          </motion.li>
        )
      })}
      {cancelado && (
        <li data-done="true" className="cancelado">
          <span className="tl-dot">✖</span>
          <span className="tl-label">Cancelado{motivo ? `: ${motivo}` : ''}</span>
        </li>
      )}
    </ol>
  )
}
