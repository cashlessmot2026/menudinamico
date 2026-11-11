import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import Tilt3D from '../components/Tilt3D.jsx'
import { categorias } from '../data/categorias.js'
import { leerPedidosLocales } from '../lib/api.js'

const PASOS = [
  ['1', 'Elige o arma', 'Escoge del menú o crea tu pizza, hamburguesa o pollo a tu gusto.'],
  ['2', 'Deja tus datos', 'Nombre, teléfono y dirección para el domicilio.'],
  ['3', 'Sigue tu pedido', 'Mira en vivo cuándo se prepara, sale y llega a tu puerta.']
]

export default function Landing() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, -80])
  const y2 = useTransform(scrollY, [0, 500], [0, 60])
  const rot = useTransform(scrollY, [0, 500], [0, 25])
  const mios = leerPedidosLocales()

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-text">
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Demo · domicilios</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Pide como te gusta, <em>a tu manera</em>
          </motion.h1>
          <p className="muted">Pizzas, hamburguesas y asados. Arma tu plato ingrediente por ingrediente y lo llevamos a tu casa.</p>
          <div className="hero-cta">
            <Link className="btn btn-primary" to="/armar/pizza">Armar mi pizza</Link>
            <Link className="btn" to="/menu/pizzas">Ver el menú</Link>
          </div>
          {mios.length > 0 && (
            <Link className="chip" to={`/pedido/${mios[0].codigo}`}>Ver mi último pedido ({mios[0].codigo})</Link>
          )}
        </div>
        <div className="hero-3d scene3d" aria-hidden="true">
          <motion.div className="plate" style={{ rotate: rot }} />
          <motion.span className="float f1" style={{ y: y1 }} animate={{ rotate: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 5 }}>🍕</motion.span>
          <motion.span className="float f2" style={{ y: y2 }} animate={{ rotate: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4 }}>🍔</motion.span>
          <motion.span className="float f3" style={{ y: y1 }} animate={{ rotate: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 6 }}>🍗</motion.span>
        </div>
      </section>

      <section className="section">
        <h2>Elige tu <em>antojo</em></h2>
        <div className="grid">
          {categorias.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Tilt3D className="card cat-card">
                <div className="cat-emoji" style={{ translateZ: 60 }}>{c.emoji}</div>
                <h3>{c.titulo}</h3>
                <p className="muted">{c.lema}</p>
                <div className="cat-actions">
                  <Link className="btn" to={`/menu/${c.id}`} aria-label={c.titulo}>Ver {c.titulo.toLowerCase()}</Link>
                  <Link className="btn btn-primary" to={c.constructor.ruta}>{c.constructor.texto}</Link>
                </div>
              </Tilt3D>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Cómo <em>funciona</em></h2>
        <div className="grid">
          {PASOS.map(([n, t, d]) => (
            <div className="card step" key={n}>
              <span className="step-n">{n}</span>
              <h3>{t}</h3>
              <p className="muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="section foot">
        <h2>Contacto</h2>
        <p className="muted">Demo · Atendemos todos los días de 11:00 a 22:00 · Pedidos por esta app</p>
        <Link className="btn" to="/seguimiento">Consultar mi pedido</Link>{' '}
        <Link className="btn" to="/admin">Admin</Link>
      </footer>
    </div>
  )
}
