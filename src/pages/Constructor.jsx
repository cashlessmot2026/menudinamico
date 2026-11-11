import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PlatoPreview from '../components/PlatoPreview.jsx'
import { useCatalogo } from '../lib/useCatalogo.js'
import { useCart } from '../store/CartContext.jsx'
import { buildersDesde, seleccionInicial, toggleOpcion, incrementarOpcion, precioBuilder, opcionesElegidas, resumenSeleccion } from '../lib/builder.js'
import { dentroDelCirculo } from '../lib/spread.js'
import { cop } from '../lib/format.js'

function Chip({ opcion, cantidad, onClick, onPointerDown, arrastrable }) {
  const activo = cantidad > 0
  return (
    <motion.button
      type="button"
      className={`chip-op ${activo ? 'on' : ''} ${arrastrable ? 'arrastrable' : ''}`}
      onPointerDown={onPointerDown}
      aria-pressed={activo}
      disabled={!opcion.disponible}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <span className="chip-circle">
        {opcion.imagen ? <img className="chip-img" src={opcion.imagen} alt="" draggable={false} /> : <span className="chip-emoji">{opcion.emoji}</span>}
        {activo && <span className="chip-badge">{cantidad > 1 ? `×${cantidad}` : '✓'}</span>}
      </span>
      <span className="chip-name">{opcion.nombre}</span>
      <span className="chip-price">{!opcion.disponible ? 'Agotado' : opcion.precio > 0 ? `+${cop(opcion.precio)}` : 'Gratis'}</span>
    </motion.button>
  )
}

function ConstructorInner({ builder }) {
  const { agregar } = useCart()
  const [sel, setSel] = useState(() => seleccionInicial(builder))
  const pasosTab = builder.pasos.filter((p) => !p.segmentado)
  const [tab, setTab] = useState(pasosTab[0].id)
  const [agregado, setAgregado] = useState(false)
  const total = precioBuilder(builder, sel)
  const pizzaRef = useRef(null)
  const arrastrando = useRef(false)
  const limpiar = useRef(null)
  const [drag, setDrag] = useState(null) // { opcion, x, y, sobre }
  const [impacto, setImpacto] = useState(null) // { x, y, id } donde se soltó el ingrediente
  const esPizza = builder.id === 'pizza'
  const pasoActivo = builder.pasos.find((p) => p.id === tab)
  const segmentado = builder.pasos.find((p) => p.segmentado)

  const elegir = (pasoId, opId) => {
    setAgregado(false)
    setSel((s) => toggleOpcion(builder, s, pasoId, opId))
  }

  useEffect(() => () => limpiar.current?.(), []) // al salir de la página se quitan los listeners

  const sobrePizza = (x, y) => !!pizzaRef.current && dentroDelCirculo(x, y, pizzaRef.current.getBoundingClientRect())

  // Arrastre: la foto del ingrediente se pega al puntero; al soltarla sobre la pizza se reparte por toda ella.
  const empezarArrastre = (e, pasoId, opcion) => {
    if (!esPizza || (e.pointerType === 'mouse' && e.button !== 0)) return
    const inicio = { x: e.clientX, y: e.clientY }
    let activo = false
    const mover = (ev) => {
      if (!activo && Math.hypot(ev.clientX - inicio.x, ev.clientY - inicio.y) > 8) {
        activo = true
        arrastrando.current = true
      }
      if (activo) setDrag({ opcion, x: ev.clientX, y: ev.clientY, sobre: sobrePizza(ev.clientX, ev.clientY) })
    }
    const parar = () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
      window.removeEventListener('pointercancel', cancelar)
      limpiar.current = null
    }
    const soltar = (ev) => {
      parar()
      if (!activo) return
      setDrag(null)
      if (sobrePizza(ev.clientX, ev.clientY)) {
        setAgregado(false)
        setSel((s) => incrementarOpcion(builder, s, pasoId, opcion.id))
        setImpacto({ x: ev.clientX, y: ev.clientY, id: Date.now() })
      }
      setTimeout(() => { arrastrando.current = false }, 0) // evita que el "click" posterior vuelva a sumar
    }
    const cancelar = () => {
      parar()
      setDrag(null)
      setTimeout(() => { arrastrando.current = false }, 0)
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
    window.addEventListener('pointercancel', cancelar)
    limpiar.current = parar
  }

  const agregarAlPedido = () => {
    const elegidas = opcionesElegidas(builder, sel)
    agregar({
      id: `custom-${builder.id}-${Date.now()}`,
      tipo: 'custom',
      constructor: builder.id,
      nombre: `${builder.em.charAt(0).toUpperCase()}${builder.em.slice(1)} personalizada`,
      precioUnit: total,
      cantidad: 1,
      detalle: resumenSeleccion(builder, sel),
      selecciones: elegidas.map(({ paso, id, cantidad }) => ({ paso, id, cantidad }))
    })
    setAgregado(true)
  }

  return (
    <section className="builder">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        {builder.titulo} <em>{builder.em}</em>
      </motion.h1>
      <p className="muted">{builder.subtitulo}</p>

      {segmentado && (
        <div className="segmented" role="group" aria-label={segmentado.titulo}>
          {segmentado.opciones.map((o) => (
            <button key={o.id} type="button" className={sel[segmentado.id]?.[o.id] ? 'on' : ''} disabled={!o.disponible} onClick={() => elegir(segmentado.id, o.id)}>
              {o.nombre}
            </button>
          ))}
        </div>
      )}

      <PlatoPreview builder={builder} sel={sel} pizzaRef={pizzaRef} sobre={!!drag?.sobre} impacto={impacto} />

      <div className="tabs" role="tablist">
        {pasosTab.map((p) => {
          const n = Object.values(sel[p.id] || {}).reduce((a, b) => a + b, 0)
          return (
            <button key={p.id} role="tab" aria-selected={tab === p.id} className={tab === p.id ? 'on' : ''} onClick={() => setTab(p.id)}>
              {p.titulo} {p.tipo === 'multi' && n > 0 && <span className="tab-count">{n}</span>}
            </button>
          )
        })}
      </div>
      <p className="muted small">{pasoActivo.tipo === 'single' ? 'Elige una opción' : 'Toca para agregar; toca de nuevo para ×2'}</p>

      <div className="chips">
        {pasoActivo.opciones.map((o) => (
          <Chip
            key={o.id}
            opcion={o}
            cantidad={sel[pasoActivo.id]?.[o.id] || 0}
            arrastrable={esPizza && pasoActivo.tipo === 'multi' && o.disponible}
            onPointerDown={pasoActivo.tipo === 'multi' && o.disponible ? (e) => empezarArrastre(e, pasoActivo.id, o) : undefined}
            onClick={() => { if (!arrastrando.current) elegir(pasoActivo.id, o.id) }}
          />
        ))}
      </div>

      {drag && (
        <motion.div
          data-testid="ghost"
          className="ghost"
          style={{ left: drag.x, top: drag.y }}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: drag.sobre ? 1.35 : 1.05, opacity: 1, rotate: drag.sobre ? [0, -8, 8, 0] : 0 }}
          transition={{ duration: 0.25 }}
        >
          {drag.opcion.imagen ? <img src={drag.opcion.imagen} alt="" draggable={false} /> : <span>{drag.opcion.emoji}</span>}
        </motion.div>
      )}

      <div className="cta-bar">
        <div>
          <span className="muted small">Total</span>
          <strong data-testid="total" className="price total">{cop(total)}</strong>
        </div>
        <motion.button className="btn btn-primary btn-big" whileTap={{ scale: 0.95 }} onClick={agregarAlPedido}>
          {agregado ? '✓ Agregado, agregar otro' : 'Agregar al pedido'}
        </motion.button>
        {agregado && <Link className="btn" to="/carrito">Ir al carrito</Link>}
      </div>
    </section>
  )
}

export default function Constructor() {
  const { tipo } = useParams()
  const { catalogo } = useCatalogo()
  const builders = useMemo(() => buildersDesde(catalogo), [catalogo])
  const builder = builders[tipo]

  if (!builder) {
    return (
      <section className="page">
        <h2>Este constructor no existe</h2>
        <Link className="btn btn-primary" to="/">Volver al inicio</Link>
      </section>
    )
  }
  return <ConstructorInner key={`${tipo}-${catalogo.ingredientes?.length}`} builder={builder} />
}
