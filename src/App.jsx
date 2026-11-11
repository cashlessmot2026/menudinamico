import { Routes, Route } from 'react-router-dom'
import { CartProvider, useCart } from './store/CartContext.jsx'
import Navbar from './components/Navbar.jsx'

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
          <Route path="/" element={<h1>Demo</h1>} />
        </Routes>
      </Layout>
    </CartProvider>
  )
}
