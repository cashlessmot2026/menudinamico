import { useState } from 'react'
import { adminLogin } from '../lib/api.js'
import Pedidos from './admin/Pedidos.jsx'
import Catalogo from './admin/Catalogo.jsx'
import Resumen from './admin/Resumen.jsx'

const KEY = 'demo_admin_token'
const leerToken = () => { try { return sessionStorage.getItem(KEY) } catch { return null } }
const guardarToken = (t) => { try { sessionStorage.setItem(KEY, t) } catch { /* solo memoria */ } }
const borrarToken = () => { try { sessionStorage.removeItem(KEY) } catch { /* nada */ } }

function Login({ onToken }) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const entrar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const token = await adminLogin(clave)
      if (!token) setError('Clave incorrecta')
      else {
        guardarToken(token)
        onToken(token)
      }
    } catch (err) {
      setError(err.message === 'bloqueado' ? 'Demasiados intentos, espera 10 minutos' : 'No pudimos conectar. Inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="page">
      <h1>Panel <em>admin</em></h1>
      <form className="card form" onSubmit={entrar}>
        <div className="field">
          <label htmlFor="clave">Clave</label>
          <input id="clave" type="password" inputMode="numeric" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={cargando}>{cargando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </section>
  )
}

export default function Admin() {
  const [token, setToken] = useState(leerToken)
  const [tab, setTab] = useState('pedidos')

  const salir = () => {
    borrarToken()
    setToken(null)
  }
  // Cualquier pantalla del panel llama a esto con el error de la API.
  const manejar = (err) => {
    if (err?.message === 'no_autorizado') salir()
  }

  if (!token) return <Login onToken={setToken} />

  return (
    <section className="page admin">
      <div className="admin-head">
        <h1>Panel <em>admin</em></h1>
        <button className="btn" onClick={salir}>Salir</button>
      </div>
      <div className="tabs" role="tablist">
        {[['pedidos', 'Pedidos'], ['catalogo', 'Catálogo'], ['resumen', 'Resumen']].map(([k, t]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>
        ))}
      </div>
      {tab === 'pedidos' && <Pedidos token={token} onError={manejar} />}
      {tab === 'catalogo' && <Catalogo token={token} onError={manejar} />}
      {tab === 'resumen' && <Resumen token={token} onError={manejar} onClaveCambiada={salir} />}
    </section>
  )
}
