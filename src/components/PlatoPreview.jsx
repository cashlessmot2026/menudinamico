import { AnimatePresence, motion } from 'framer-motion'
import { opcionesElegidas } from '../lib/builder.js'
import { repartir } from '../lib/spread.js'
import { PAN_BASE } from '../data/imagenes.js'

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

const ANCHO_BURGER = 230
const ALTO_MAX = 286
const QUESO = { cheddar: '#f6a823', suizo: '#f2d77e', mozzarella: '#f8f3e3', azul: '#e3e9e4' }

/**
 * Convierte lo elegido en capas apiladas de abajo hacia arriba: base del pan, carne, quesos, toppings,
 * salsas y tapa. Cada capa cae sobre la anterior y la tapa solo en parte: de la anterior queda a la vista
 * una franja (`grosor`), como en el video de referencia.
 * @returns {{key:string, tipo:'foto'|'queso'|'emoji', alto:number, ancho:number, visible:number, y:number}[]}
 */
export function capasHamburguesa(elegidas, ancho = ANCHO_BURGER, altoMax = ALTO_MAX) {
  const pan = elegidas.find((o) => o.paso === 'pan')
  const filtroPan = pan?.capa?.filtro
  const capas = [{ key: 'pan-base', tipo: 'foto', foto: PAN_BASE, filtro: filtroPan, nombre: 'Base de pan' }]
  for (const o of elegidas) {
    if (o.paso === 'pan') continue
    const veces = o.id === 'doble-res' ? 2 : o.cantidad
    for (let i = 0; i < veces; i++) {
      const key = `${o.paso}-${o.id}-${i}`
      if (o.capa) capas.push({ key, tipo: 'foto', foto: o.capa, filtro: o.capa.filtro, nombre: o.nombre })
      else if (o.paso === 'quesos') capas.push({ key, tipo: 'queso', color: QUESO[o.id] || '#f6c453', nombre: o.nombre })
      else capas.push({ key, tipo: 'emoji', emoji: o.emoji, nombre: o.nombre })
    }
  }
  capas.push({ key: 'pan-tapa', tipo: 'foto', foto: pan?.capa || PAN_BASE, filtro: filtroPan, nombre: pan?.nombre || 'Pan' })

  for (const c of capas) {
    if (c.tipo === 'foto') {
      c.ancho = ancho * c.foto.ancho
      c.alto = c.ancho * c.foto.aspecto * (c.foto.aplastar || 1)
      c.visible = c.alto * c.foto.grosor
    } else if (c.tipo === 'queso') {
      c.ancho = ancho * 0.9
      c.alto = 34
      c.visible = 9
    } else {
      c.ancho = ancho * 0.86
      c.alto = 34
      c.visible = 16
    }
  }
  // Si la torre no cabe, se comprimen las franjas visibles (nunca el tamaño de las fotos).
  const tapa = capas[capas.length - 1]
  const franjas = capas.slice(0, -1).reduce((s, c) => s + c.visible, 0)
  const factor = franjas + tapa.alto > altoMax ? Math.max(0.05, (altoMax - tapa.alto) / franjas) : 1
  let y = 0
  for (const c of capas) {
    c.y = y
    y += c.visible * factor
  }
  return capas
}

function Capa({ c, i }) {
  const style = { width: c.ancho, height: c.alto, marginLeft: -c.ancho / 2, zIndex: i + 1 }
  const anim = {
    initial: { y: -c.y - 190, opacity: 0, scale: 1.08 },
    animate: { y: -c.y, opacity: 1, scale: 1 },
    exit: { y: -c.y - 70, opacity: 0, transition: { duration: 0.2 } },
    transition: { type: 'spring', stiffness: 210, damping: 18, mass: 0.9 }
  }
  if (c.tipo === 'foto') {
    return (
      <motion.img
        className="capa capa-foto"
        data-capa={c.key}
        src={c.foto.src}
        alt={c.nombre}
        draggable={false}
        style={{ ...style, filter: [c.filtro, 'drop-shadow(0 5px 4px rgba(0,0,0,.45))'].filter(Boolean).join(' ') }}
        {...anim}
      />
    )
  }
  if (c.tipo === 'queso') {
    return <motion.div className="capa capa-queso" data-capa={c.key} title={c.nombre} style={{ ...style, background: c.color }} {...anim} />
  }
  return (
    <motion.div className="capa capa-emoji" data-capa={c.key} title={c.nombre} style={style} {...anim}>
      {c.emoji} {c.emoji} {c.emoji}
    </motion.div>
  )
}

function Hamburguesa({ elegidas }) {
  const capas = capasHamburguesa(elegidas)
  return (
    <div className="burger-stack" data-testid="burger-stack">
      <div className="burger-plato" />
      <AnimatePresence>
        {capas.map((c, i) => <Capa key={c.key} c={c} i={i} />)}
      </AnimatePresence>
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
