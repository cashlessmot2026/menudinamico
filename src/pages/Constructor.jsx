import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PlatoPreview from '../components/PlatoPreview.jsx'
import { useCatalogo } from '../lib/useCatalogo.js'
import { useCart } from '../store/CartContext.jsx'
import { buildersDesde, seleccionInicial, toggleOpcion, precioBuilder, opcionesElegidas, resumenSeleccion } from '../lib/builder.js'
import { cop } from '../lib/format.js'

function Chip({ opcion, cantidad, onClick }) {
  const activo = cantidad > 0
  return (
    <motion.button
      type="button"
      className={`chip-op ${activo ? 'on' : ''}`}
      aria-pressed={activo}
      disabled={!opcion.disponible}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <span className="chip-circle">
        {opcion.imagen ? <img src={opcion.imagen} alt="" /> : <span className="chip-emoji">{opcion.emoji}</span>}
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
  const pasoActivo = builder.pasos.find((p) => p.id === tab)
  const segmentado = builder.pasos.find((p) => p.segmentado)

  const elegir = (pasoId, opId) => {
    setAgregado(false)
    setSel((s) => toggleOpcion(builder, s, pasoId, opId))
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

      <PlatoPreview builder={builder} sel={sel} />

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
          <Chip key={o.id} opcion={o} cantidad={sel[pasoActivo.id]?.[o.id] || 0} onClick={() => elegir(pasoActivo.id, o.id)} />
        ))}
      </div>

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
