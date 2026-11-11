import { useCallback, useEffect, useState } from 'react'
import { adminCambiarEstado, adminListar } from '../../lib/api.js'
import { ESTADOS, puedeTransicionar } from '../../lib/orderStatus.js'
import { cop } from '../../lib/format.js'

const ETIQUETA = { recibido: 'Recibido', preparando: 'Preparando', en_camino: 'En camino', entregado: 'Entregado', cancelado: 'Cancelado' }
const SIGUIENTE = { recibido: 'preparando', preparando: 'en_camino', en_camino: 'entregado' }

function Tarjeta({ p, token, onCambio, onError }) {
  const [cancelando, setCancelando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const siguiente = SIGUIENTE[p.estado]

  const cambiar = async (estado, mot = null) => {
    if (ocupado) return
    setOcupado(true)
    setError('')
    try {
      await adminCambiarEstado(token, p.id, estado, mot)
      setCancelando(false)
      await onCambio()
    } catch (e) {
      onError(e)
      setError('No se pudo cambiar el estado. Inténtalo de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  const confirmarCancelacion = () => {
    if (!motivo.trim()) {
      setError('Escribe el motivo de la cancelación')
      return
    }
    cambiar('cancelado', motivo.trim())
  }

  return (
    <article className={`card ped ped-${p.estado}`}>
      <header>
        <h3>{p.codigo}</h3>
        <span className={`chip estado-${p.estado}`}>{ETIQUETA[p.estado]}</span>
      </header>
      <p className="small muted">{new Date(p.created_at).toLocaleString('es-CO')}</p>
      <p><strong>{p.nombre}</strong> · <a href={`tel:${p.telefono}`}>{p.telefono}</a></p>
      <p className="small">{p.direccion}, {p.barrio} — <span className="muted">{p.referencia}</span></p>
      <ul className="pedido-items">
        {p.items.map((i, k) => (
          <li key={k}>
            <span>{i.cantidad}× {i.nombre}{i.detalle ? <small className="muted"> — {i.detalle}</small> : null}</span>
            <strong>{cop(i.precio_unit * i.cantidad)}</strong>
          </li>
        ))}
      </ul>
      <p>Total: <strong className="price">{cop(p.total)}</strong></p>
      {p.estado === 'cancelado' && p.motivo_cancelacion && <p className="error">Motivo: {p.motivo_cancelacion}</p>}

      {siguiente && puedeTransicionar(p.estado, siguiente) && (
        <div className="cat-actions">
          <button className="btn btn-primary" disabled={ocupado} onClick={() => cambiar(siguiente)}>Pasar a {ETIQUETA[siguiente].toLowerCase()}</button>
          {!cancelando && <button className="btn" onClick={() => setCancelando(true)}>Cancelar pedido</button>}
        </div>
      )}
      {cancelando && (
        <div className="field">
          <label htmlFor={`m-${p.id}`}>Motivo de cancelación</label>
          <input id={`m-${p.id}`} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <div className="cat-actions">
            <button className="btn btn-primary" disabled={ocupado} onClick={confirmarCancelacion}>Confirmar cancelación</button>
            <button className="btn" onClick={() => { setCancelando(false); setError('') }}>Volver</button>
          </div>
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </article>
  )
}

export default function Pedidos({ token, onError }) {
  const [filtro, setFiltro] = useState('')
  const [lista, setLista] = useState(null)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    try {
      setLista(await adminListar(token, filtro || null))
      setError('')
    } catch (e) {
      onError(e)
      setError('No pudimos cargar los pedidos.')
    }
  }, [token, filtro, onError])

  useEffect(() => {
    cargar()
    const id = setInterval(cargar, 10000)
    return () => clearInterval(id)
  }, [cargar])

  return (
    <div className="admin-pedidos">
      <div className="field" style={{ maxWidth: 260 }}>
        <label htmlFor="f-estado">Estado</label>
        <select id="f-estado" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todos</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{ETIQUETA[e]}</option>)}
        </select>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {lista === null && !error && <p className="muted">Cargando…</p>}
      {lista?.length === 0 && <p className="muted">No hay pedidos con este filtro.</p>}
      <div className="grid">
        {(lista || []).map((p) => <Tarjeta key={p.id} p={p} token={token} onCambio={cargar} onError={onError} />)}
      </div>
    </div>
  )
}
