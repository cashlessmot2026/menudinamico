import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCard from '../components/ProductCard.jsx'
import { useCart } from '../store/CartContext.jsx'
import { useCatalogo } from '../lib/useCatalogo.js'
import { categoriaPorId } from '../data/categorias.js'

export default function Menu() {
  const { categoria } = useParams()
  const cat = categoriaPorId(categoria)
  const { catalogo, cargando } = useCatalogo()
  const { agregar } = useCart()

  if (!cat) {
    return (
      <section className="page">
        <h2>Categoría no encontrada</h2>
        <Link className="btn btn-primary" to="/">Volver al inicio</Link>
      </section>
    )
  }

  const lista = catalogo.productos.filter((p) => p.categoria === cat.id)

  return (
    <section className="page">
      <motion.h1 initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        {cat.emoji} Nuestras <em>{cat.titulo.toLowerCase()}</em>
      </motion.h1>
      <p className="muted">{cat.lema}</p>
      <Link className="btn btn-primary" to={cat.constructor.ruta}>{cat.constructor.texto} →</Link>
      {cargando && <p className="muted">Cargando…</p>}
      <div className="grid" style={{ marginTop: 20 }}>
        {lista.map((p) => (
          <ProductCard
            key={p.id}
            producto={p}
            onAdd={(x) => agregar({ id: x.id, tipo: 'producto', nombre: x.nombre, precioUnit: x.precio, cantidad: 1, disponible: x.disponible })}
          />
        ))}
      </div>
    </section>
  )
}
