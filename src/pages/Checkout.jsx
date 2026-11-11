import { useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '../store/CartContext.jsx'
import { crearPedido, guardarPedidoLocal } from '../lib/api.js'
import { normalizarTelefono } from '../lib/phone.js'
import { cop } from '../lib/format.js'

const CAMPOS = [
  ['nombre', 'Nombre completo', 'text', 'name'],
  ['telefono', 'Teléfono', 'tel', 'tel'],
  ['direccion', 'Dirección', 'text', 'street-address'],
  ['barrio', 'Barrio', 'text', 'address-level3'],
  ['referencia', 'Referencia (casa, color, punto cercano)', 'text', 'off']
]

export default function Checkout() {
  const { items, total, vaciar } = useCart()
  const navigate = useNavigate()
  const [datos, setDatos] = useState({ nombre: '', telefono: '', direccion: '', barrio: '', referencia: '' })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [fallo, setFallo] = useState('')
  const bloqueo = useRef(false)
  const terminado = useRef(false)

  if (items.length === 0 && !terminado.current) return <Navigate to="/carrito" replace />

  const validar = () => {
    const e = {}
    for (const [k] of CAMPOS) if (!String(datos[k]).trim()) e[k] = 'Este campo es obligatorio'
    if (datos.telefono.trim() && normalizarTelefono(datos.telefono).length < 7) e.telefono = 'Teléfono no válido (obligatorio, mínimo 7 dígitos)'
    return e
  }

  const confirmar = async (ev) => {
    ev.preventDefault()
    if (bloqueo.current) return
    const e = validar()
    setErrores(e)
    if (Object.keys(e).length) return
    bloqueo.current = true
    setEnviando(true)
    setFallo('')
    const cliente = { ...datos, nombre: datos.nombre.trim(), direccion: datos.direccion.trim(), barrio: datos.barrio.trim(), referencia: datos.referencia.trim(), telefono: normalizarTelefono(datos.telefono) }
    try {
      const res = await crearPedido({
        cliente,
        items: items.map((i) => ({ tipo: i.tipo, id: i.id, constructor: i.constructor, selecciones: i.selecciones, cantidad: i.cantidad }))
      })
      terminado.current = true
      guardarPedidoLocal(res.codigo, cliente.telefono)
      navigate(`/pedido/${res.codigo}`)
      vaciar()
    } catch {
      setFallo('No pudimos crear tu pedido. Revisa tu conexión e inténtalo de nuevo.')
      bloqueo.current = false
      setEnviando(false)
    }
  }

  return (
    <section className="page">
      <h1>Tus <em>datos</em> para el domicilio</h1>
      <form className="card form" onSubmit={confirmar} noValidate>
        {CAMPOS.map(([k, etiqueta, tipo, auto]) => (
          <div className="field" key={k}>
            <label htmlFor={k}>{etiqueta}</label>
            <input id={k} type={tipo} autoComplete={auto} value={datos[k]} aria-invalid={!!errores[k]} onChange={(e) => setDatos({ ...datos, [k]: e.target.value })} />
            {errores[k] && <span className="error">{errores[k]}</span>}
          </div>
        ))}
        <p className="muted">Total a pagar al recibir: <strong className="price">{cop(total)}</strong></p>
        {fallo && <p className="error" role="alert">{fallo}</p>}
        <button className="btn btn-primary btn-big" type="submit" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Confirmar pedido'}
        </button>
      </form>
    </section>
  )
}
