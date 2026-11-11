import { AnimatePresence, motion } from 'framer-motion'
import { opcionesElegidas } from '../lib/builder.js'
import { repartir } from '../lib/spread.js'

const cae = { initial: { y: -120, opacity: 0, scale: 1.6 }, animate: { y: 0, opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.4 } }

/** Una pieza de ingrediente: foto real si existe, emoji si no. Cae con rebote, en cascada desde el centro hacia afuera. */
function Pieza({ o, p, i }) {
  const delay = 0.12 * Math.hypot(p.x, p.y) + i * 0.012
  const base = { left: `${50 + p.x * 50}%`, top: `${50 + p.y * 50}%` }
  const entrada = {
    initial: { y: -170, opacity: 0, scale: 1.9, rotate: p.rot + 70 },
    animate: { y: 0, opacity: 1, scale: p.scale, rotate: p.rot },
    exit: { opacity: 0, scale: 0.2, transition: { duration: 0.18 } },
    transition: { delay, type: 'spring', stiffness: 260, damping: 13, mass: 0.8 }
  }
  if (o.imagen) {
    const lado = (o.tam || 40) * 1
    return (
      <motion.img
        className="topping-img"
        data-ing={o.id}
        src={o.imagen}
        alt=""
        draggable={false}
        style={{ ...base, width: lado, marginLeft: -lado / 2, marginTop: -lado / 2 }}
        {...entrada}
      />
    )
  }
  return (
    <motion.span className="topping" style={base} {...entrada}>
      {o.emoji}
    </motion.span>
  )
}

function Pizza({ elegidas, sel, builder, pizzaRef, sobre, impacto }) {
  const tamIdx = Math.max(0, builder.pasos[0].opciones.findIndex((o) => sel.tamano?.[o.id]))
  const escala = 0.72 + tamIdx * 0.09
  const toppings = elegidas.filter((o) => !['tamano', 'masa', 'salsa'].includes(o.paso))
  const salsa = Object.keys(sel.salsa || {})[0]
  const colorSalsa = { 'pasta-tomate': '#d62828', pesto: '#5a9a3a', bbq: '#6b3a1e', blanca: '#f1e6c8', 'ajo-aceite': '#e8c872' }[salsa] || '#d62828'
  const r = impacto && pizzaRef?.current ? pizzaRef.current.getBoundingClientRect() : null
  return (
    <motion.div
      ref={pizzaRef}
      data-testid="pizza-drop"
      className={`pizza-base ${sobre ? 'sobre' : ''}`}
      animate={{ scale: escala, rotate: [0, 2, 0] }}
      transition={{ rotate: { repeat: Infinity, duration: 8 }, scale: { type: 'spring' } }}
    >
      <div className="pizza-crust" />
      <div className="pizza-sauce" style={{ background: colorSalsa }} />
      <AnimatePresence>
        {toppings.flatMap((o) => repartir(o.id, o.cantidad).map((p, i) => <Pieza key={`${o.id}-${i}`} o={o} p={p} i={i} />))}
      </AnimatePresence>
      {r && impacto && (
        <motion.span
          key={impacto.id}
          className="onda"
          style={{ left: impacto.x - r.left, top: impacto.y - r.top }}
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 3.2, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      )}
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

export default function PlatoPreview({ builder, sel, pizzaRef, sobre = false, impacto = null }) {
  const elegidas = opcionesElegidas(builder, sel)
  return (
    <div className="preview scene3d">
      <div className="preview-stage">
        {builder.id === 'pizza' && <Pizza elegidas={elegidas} sel={sel} builder={builder} pizzaRef={pizzaRef} sobre={sobre} impacto={impacto} />}
        {builder.id === 'hamburguesa' && <Hamburguesa elegidas={elegidas} />}
        {builder.id === 'pollo' && <Pollo elegidas={elegidas} />}
      </div>
    </div>
  )
}
