import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Timeline from '../components/Timeline.jsx'
import { consultarPedido, guardarPedidoLocal, leerPedidosLocales, suscribirPedido } from '../lib/api.js'
import { normalizarTelefono } from '../lib/phone.js'
import { cop } from '../lib/format.js'

function Detalle({ codigo, telefono }) {
  const [pedido, setPedido] = useState(undefined) // undefined = cargando, null = no existe
  const [error, setError] = useState('')

  useEffect(() => {
    let vivo = true
    consultarPedido(telefono, codigo)
      .then((p) => vivo && setPedido(p))
      .catch(() => vivo && setError('No pudimos consultar tu pedido. Revisa tu conexión.'))
    const parar = suscribirPedido(telefono, codigo, (p) => vivo && p && setPedido(p))
    return () => { vivo = false; parar() }
  }, [codigo, telefono])

  if (error) return <p className="error" role="alert">{error}</p>
  if (pedido === undefined) return <p className="muted">Buscando tu pedido…</p>
  if (pedido === null) {
    return (
      <div className="card">
        <h3>No encontramos tu pedido</h3>
        <p className="muted">Verifica que el teléfono y el código sean los mismos con los que lo hiciste.</p>
        <Link className="btn" to="/seguimiento">Probar con otros datos</Link>
      </div>
    )
  }

  return (
    <div className="card pedido">
      <Timeline estado={pedido.estado} motivo={pedido.motivo_cancelacion} />
      <h3>Tu pedido</h3>
      <ul className="pedido-items">
        {(pedido.items || []).map((i, k) => (
          <li key={k}>
            <span>{i.cantidad}× {i.nombre}{i.detalle ? <small className="muted"> — {i.detalle}</small> : null}</span>
            <strong>{cop((i.precio_unit ?? 0) * i.cantidad)}</strong>
          </li>
        ))}
      </ul>
      <p>Total: <strong className="price">{cop(pedido.total)}</strong></p>
      <p className="muted small">Entrega en {pedido.direccion}, {pedido.barrio}</p>
    </div>
  )
}

export default function Pedido() {
  const { codigo } = useParams()
  const location = useLocation()
  const local = leerPedidosLocales().find((p) => p.codigo === codigo)
  const [telefono, setTelefono] = useState(location.state?.telefono || local?.telefono || '')
  const [input, setInput] = useState('')

  return (
    <section className="page">
      <h1>Pedido <em>{codigo}</em></h1>
      {telefono ? (
        <Detalle codigo={codigo} telefono={telefono} />
      ) : (
        <form
          className="card form"
          onSubmit={(e) => {
            e.preventDefault()
            const t = normalizarTelefono(input)
            if (t.length >= 7) {
              guardarPedidoLocal(codigo, t)
              setTelefono(t)
            }
          }}
        >
          <div className="field">
            <label htmlFor="tel">Teléfono con el que hiciste el pedido</label>
            <input id="tel" type="tel" value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit">Ver mi pedido</button>
        </form>
      )}
      <Link className="btn" to="/">Volver al inicio</Link>
    </section>
  )
}
