import { useEffect, useState } from 'react'
import { adminCambiarClave, adminResumen } from '../../lib/api.js'
import { cop } from '../../lib/format.js'

export default function Resumen({ token, onError, onClaveCambiada }) {
  const [r, setR] = useState(null)
  const [error, setError] = useState('')
  const [nueva, setNueva] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    adminResumen(token).then(setR).catch((e) => { onError(e); setError('No pudimos cargar el resumen.') })
  }, [token, onError])

  const cambiarClave = async (e) => {
    e.preventDefault()
    setMsg('')
    if (nueva.trim().length < 4) {
      setMsg('La clave debe tener al menos 4 caracteres')
      return
    }
    try {
      await adminCambiarClave(token, nueva.trim())
      onClaveCambiada()
    } catch (err) {
      onError(err)
      setMsg('No se pudo cambiar la clave')
    }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      {r && (
        <div className="grid">
          <div className="card"><span className="muted">Ventas de hoy</span><h2>{cop(r.ventas_hoy)}</h2></div>
          <div className="card"><span className="muted">Pedidos de hoy</span><h2>{r.pedidos_hoy}</h2></div>
          <div className="card"><span className="muted">Más vendido hoy</span><h2>{r.mas_vendido || '—'}</h2></div>
          <div className="card">
            <span className="muted">Pedidos por estado</span>
            <ul className="pedido-items">
              {Object.entries(r.por_estado || {}).map(([k, v]) => <li key={k}><span>{k}</span><strong>{v}</strong></li>)}
            </ul>
          </div>
        </div>
      )}
      <form className="card form" style={{ marginTop: 18 }} onSubmit={cambiarClave}>
        <h3>Cambiar clave de admin</h3>
        <div className="field">
          <label htmlFor="nueva-clave">Nueva clave</label>
          <input id="nueva-clave" type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
        </div>
        {msg && <p className="error">{msg}</p>}
        <button className="btn" type="submit">Cambiar clave</button>
      </form>
    </div>
  )
}
