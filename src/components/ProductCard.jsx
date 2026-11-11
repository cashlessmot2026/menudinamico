import { motion } from 'framer-motion'
import Tilt3D from './Tilt3D.jsx'
import { cop } from '../lib/format.js'

const EMOJI = { pizzas: '🍕', hamburguesas: '🍔', asados: '🍗' }

export default function ProductCard({ producto, onAdd }) {
  const agotado = !producto.disponible
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
      <Tilt3D className="card product-card">
        <motion.div
          className="product-emoji"
          style={{ translateZ: 50 }}
          animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        >
          {EMOJI[producto.categoria] || '🍽️'}
        </motion.div>
        <h3 style={{ translateZ: 30 }}>{producto.nombre}</h3>
        <p className="muted">{producto.descripcion}</p>
        <div className="product-foot">
          <strong className="price">{cop(producto.precio)}</strong>
          {agotado && <span className="chip chip-off">Agotado</span>}
          <motion.button
            className="btn btn-primary"
            whileTap={{ scale: 0.92 }}
            disabled={agotado}
            onClick={() => onAdd(producto)}
          >
            Agregar
          </motion.button>
        </div>
      </Tilt3D>
    </motion.div>
  )
}
