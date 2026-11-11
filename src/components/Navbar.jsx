import { Link, NavLink } from 'react-router-dom'
import InstallButton from './InstallButton.jsx'

export default function Navbar({ count = 0 }) {
  return (
    <header className="topbar">
      <Link to="/" className="logo">Demo</Link>
      <nav className="nav">
        <NavLink to="/menu/pizzas">Pizzas</NavLink>
        <NavLink to="/menu/hamburguesas">Hamburguesas</NavLink>
        <NavLink to="/menu/asados">Asados</NavLink>
        <NavLink to="/armar/pizza">Arma tu plato</NavLink>
        <NavLink to="/seguimiento">Mi pedido</NavLink>
      </nav>
      <div className="nav-actions">
        <InstallButton />
        <Link to="/carrito" aria-label="Carrito" className="btn btn-primary cart-btn">
          🛒 <span>{count}</span>
        </Link>
      </div>
    </header>
  )
}
