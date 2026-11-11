import { useEffect, useMemo, useState } from 'react'
import { adminGuardarOpcion, adminGuardarProducto, getCatalogo } from '../../lib/api.js'
import { catalogo as local } from '../../data/catalogo.js'
import { buildersDesde } from '../../lib/builder.js'

function Fila({ etiqueta, sub, valor, onGuardar }) {
  const [precio, setPrecio] = useState(valor.precio)
  const [disponible, setDisponible] = useState(valor.disponible)
  const [estado, setEstado] = useState('')
  const sucio = Number(precio) !== valor.precio || disponible !== valor.disponible

  const guardar = async () => {
    setEstado('Guardando…')
    try {
      await onGuardar({ precio: Math.max(0, Math.round(Number(precio) || 0)), disponible })
      setEstado('Guardado ✓')
    } catch {
      setEstado('Error al guardar')
    }
  }

  return (
    <div className="cat-row">
      <div>
        <strong>{etiqueta}</strong> {sub && <small className="muted">{sub}</small>}
      </div>
      <input aria-label={`Precio de ${etiqueta}`} type="number" min="0" step="500" value={precio} onChange={(e) => setPrecio(e.target.value)} />
      <label className="check">
        <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)} /> Disponible
      </label>
      <button className="btn" disabled={!sucio} onClick={guardar}>Guardar</button>
      <span className="small muted">{estado}</span>
    </div>
  )
}

export default function Catalogo({ token, onError }) {
  const [catalogo, setCatalogo] = useState(local)

  useEffect(() => {
    getCatalogo().then(setCatalogo)
  }, [])

  const builders = useMemo(() => buildersDesde(catalogo), [catalogo])

  const guardar = (fn) => async (...args) => {
    try {
      await fn(...args)
    } catch (e) {
      onError(e)
      throw e
    }
  }

  return (
    <div className="admin-catalogo">
      <h2>Productos</h2>
      {catalogo.productos.map((p, i) => (
        <Fila
          key={p.id}
          etiqueta={p.nombre}
          sub={p.categoria}
          valor={p}
          onGuardar={guardar((v) => adminGuardarProducto(token, { ...p, ...v, orden: p.orden ?? i }))}
        />
      ))}
      {Object.values(builders).map((b) => (
        <section key={b.id}>
          <h2>Opciones: {b.em}</h2>
          {b.pasos.map((paso, pi) => (
            <div key={paso.id}>
              <h3>{paso.titulo}</h3>
              {paso.opciones.map((o, oi) => (
                <Fila
                  key={o.id}
                  etiqueta={o.nombre}
                  valor={o}
                  onGuardar={guardar((v) => adminGuardarOpcion(token, { constructor: b.id, paso: paso.id, id: o.id, nombre: o.nombre, orden: pi * 100 + oi, ...v }))}
                />
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
