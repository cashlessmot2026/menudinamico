import { Routes, Route } from 'react-router-dom'
import { CartProvider, useCart } from './store/CartContext.jsx'
import Navbar from './components/Navbar.jsx'
import Landing from './pages/Landing.jsx'
import Menu from './pages/Menu.jsx'
import Constructor from './pages/Constructor.jsx'
import Carrito from './pages/Carrito.jsx'
import Checkout from './pages/Checkout.jsx'
import Pedido from './pages/Pedido.jsx'
import Seguimiento from './pages/Seguimiento.jsx'
import Admin from './pages/Admin.jsx'

function Layout({ children }) {
  const { cantidad } = useCart()
  return (
    <div className="layout">
      <Navbar count={cantidad} />
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/menu/:categoria" element={<Menu />} />
          <Route path="/armar/:tipo" element={<Constructor />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedido/:codigo" element={<Pedido />} />
          <Route path="/seguimiento" element={<Seguimiento />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </CartProvider>
  )
}
