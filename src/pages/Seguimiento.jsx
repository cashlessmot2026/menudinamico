import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { consultarPedido, guardarPedidoLocal, leerPedidosLocales } from '../lib/api.js'
import { normalizarTelefono } from '../lib/phone.js'

export default function Seguimiento() {
  const navigate = useNavigate()
  const [telefono, setTelefono] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const mios = leerPedidosLocales()

  const consultar = async (e) => {
    e.preventDefault()
    const tel = normalizarTelefono(telefono)
    const cod = codigo.trim().toUpperCase()
    if (tel.length < 7 || !cod) {
      setError('Escribe tu teléfono y el código de tu pedido.')
      return
    }
    setCargando(true)
    setError('')
    try {
      const p = await consultarPedido(tel, cod)
      if (!p) {
        setError('No encontramos tu pedido. Revisa el teléfono y el código.')
      } else {
        guardarPedidoLocal(cod, tel)
        navigate(`/pedido/${cod}`, { state: { telefono: tel } })
      }
    } catch {
      setError('No pudimos consultar. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="page">
      <h1>Sigue tu <em>pedido</em></h1>
      <form className="card form" onSubmit={consultar} noValidate>
        <div className="field">
          <label htmlFor="s-tel">Teléfono</label>
          <input id="s-tel" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="s-cod">Código del pedido (DEM-XXXX)</label>
          <input id="s-cod" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={cargando}>{cargando ? 'Buscando…' : 'Consultar'}</button>
      </form>
      {mios.length > 0 && (
        <div className="card">
          <h3>Mis pedidos en este dispositivo</h3>
          <div className="cat-actions">
            {mios.map((p) => <Link key={p.codigo} className="btn" to={`/pedido/${p.codigo}`}>{p.codigo}</Link>)}
          </div>
        </div>
      )}
    </section>
  )
}
