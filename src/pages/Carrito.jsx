import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../store/CartContext.jsx'
import { cop } from '../lib/format.js'

export default function Carrito() {
  const { items, cambiarCantidad, quitar, total } = useCart()

  if (items.length === 0) {
    return (
      <section className="page">
        <h1>Tu carrito está vacío</h1>
        <p className="muted">Agrega algo rico del menú.</p>
        <Link className="btn btn-primary" to="/menu/pizzas">Ver el menú</Link>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>Tu <em>pedido</em></h1>
      <div className="cart-list">
        <AnimatePresence>
          {items.map((i) => (
            <motion.div key={i.id} className="card cart-item" layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
              <div>
                <h3>{i.nombre}</h3>
                {i.detalle && <p className="muted small">{i.detalle}</p>}
                <strong className="price">{cop(i.precioUnit * i.cantidad)}</strong>
              </div>
              <div className="qty">
                <button className="btn" aria-label={`Menos ${i.nombre}`} onClick={() => cambiarCantidad(i.id, i.cantidad - 1)}>−</button>
                <span>{i.cantidad}</span>
                <button className="btn" aria-label={`Más ${i.nombre}`} onClick={() => cambiarCantidad(i.id, i.cantidad + 1)}>+</button>
                <button className="btn" aria-label={`Quitar ${i.nombre}`} onClick={() => quitar(i.id)}>🗑</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="cta-bar">
        <div>
          <span className="muted small">Total</span>
          <strong className="price total">{cop(total)}</strong>
        </div>
        <Link className="btn btn-primary btn-big" to="/checkout">Continuar con mis datos</Link>
      </div>
    </section>
  )
}
