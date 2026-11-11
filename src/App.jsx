import { Routes, Route } from 'react-router-dom'
import { CartProvider, useCart } from './store/CartContext.jsx'
import Navbar from './components/Navbar.jsx'
import Landing from './pages/Landing.jsx'
import Menu from './pages/Menu.jsx'

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
        </Routes>
      </Layout>
    </CartProvider>
  )
}
