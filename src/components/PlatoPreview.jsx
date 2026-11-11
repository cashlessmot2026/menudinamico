import { AnimatePresence, motion } from 'framer-motion'
import { opcionesElegidas } from '../lib/builder.js'

// Posición pseudo-aleatoria pero estable para cada ingrediente (no salta entre renders).
function pos(id, i) {
  let h = 2166136261
  const s = `${id}-${i}`
  for (let k = 0; k < s.length; k++) h = Math.imul(h ^ s.charCodeAt(k), 16777619)
  const a = ((h >>> 0) % 360) * (Math.PI / 180)
  const r = 14 + (((h >>> 8) >>> 0) % 30)
  return { left: `${50 + Math.cos(a) * r}%`, top: `${50 + Math.sin(a) * r}%`, rot: ((h >>> 16) % 60) - 30 }
}

const cae = { initial: { y: -120, opacity: 0, scale: 1.6 }, animate: { y: 0, opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.4 } }

function Pizza({ elegidas, sel, builder }) {
  const tamIdx = Math.max(0, builder.pasos[0].opciones.findIndex((o) => sel.tamano?.[o.id]))
  const escala = 0.72 + tamIdx * 0.09
  const toppings = elegidas.filter((o) => !['tamano', 'masa', 'salsa'].includes(o.paso))
  const salsa = Object.keys(sel.salsa || {})[0]
  const colorSalsa = { 'pasta-tomate': '#d62828', pesto: '#5a9a3a', bbq: '#6b3a1e', blanca: '#f1e6c8', 'ajo-aceite': '#e8c872' }[salsa] || '#d62828'
  return (
    <motion.div className="pizza-base" animate={{ scale: escala, rotate: [0, 2, 0] }} transition={{ rotate: { repeat: Infinity, duration: 8 }, scale: { type: 'spring' } }}>
      <div className="pizza-crust" />
      <div className="pizza-sauce" style={{ background: colorSalsa }} />
      <AnimatePresence>
        {toppings.flatMap((o) =>
          Array.from({ length: o.cantidad * 3 }, (_, i) => {
            const p = pos(o.id, i)
            return (
              <motion.span key={`${o.id}-${i}`} className="topping" style={{ left: p.left, top: p.top, rotate: p.rot }} {...cae} transition={{ delay: i * 0.04, type: 'spring', stiffness: 220, damping: 16 }}>
                {o.emoji}
              </motion.span>
            )
          })
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Hamburguesa({ elegidas }) {
  const capas = elegidas.filter((o) => o.paso !== 'pan')
  return (
    <div className="burger-stack">
      <div className="bun bun-top" />
      <AnimatePresence>
        {capas.map((o) => (
          <motion.div key={o.id + o.paso} className="burger-layer" layout {...cae}>
            {Array.from({ length: o.cantidad }, () => o.emoji).join(' ')} <small>{o.nombre}</small>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="bun bun-bottom" />
    </div>
  )
}

function Pollo({ elegidas }) {
  return (
    <div className="pollo-plato">
      <AnimatePresence>
        {elegidas.map((o, i) => (
          <motion.span key={o.paso + o.id} className="pollo-item" style={{ fontSize: o.paso === 'plato' ? '4.5rem' : '2.2rem' }} {...cae} transition={{ delay: i * 0.03, type: 'spring' }}>
            {Array.from({ length: o.cantidad }, () => o.emoji).join('')}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function PlatoPreview({ builder, sel }) {
  const elegidas = opcionesElegidas(builder, sel)
  return (
    <div className="preview scene3d">
      <div className="preview-stage">
        {builder.id === 'pizza' && <Pizza elegidas={elegidas} sel={sel} builder={builder} />}
        {builder.id === 'hamburguesa' && <Hamburguesa elegidas={elegidas} />}
        {builder.id === 'pollo' && <Pollo elegidas={elegidas} />}
      </div>
    </div>
  )
}
