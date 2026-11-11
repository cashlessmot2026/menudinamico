import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { totalCarrito } from '../lib/price.js'

const LS_KEY = 'demo_carrito'
const CartCtx = createContext(null)

function leer() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(leer)

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items))
    } catch {
      /* modo privado: el carrito vive solo en memoria */
    }
  }, [items])

  const agregar = useCallback((item) => {
    if (item.disponible === false) return false
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === item.id)
      if (i >= 0) return prev.map((x, k) => (k === i ? { ...x, cantidad: x.cantidad + (item.cantidad || 1) } : x))
      return [...prev, { ...item, cantidad: item.cantidad || 1 }]
    })
    return true
  }, [])

  const quitar = useCallback((id) => setItems((p) => p.filter((x) => x.id !== id)), [])
  const cambiarCantidad = useCallback(
    (id, n) => setItems((p) => (n <= 0 ? p.filter((x) => x.id !== id) : p.map((x) => (x.id === id ? { ...x, cantidad: n } : x)))),
    []
  )
  const vaciar = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({ items, agregar, quitar, cambiarCantidad, vaciar, total: totalCarrito(items), cantidad: items.reduce((s, i) => s + i.cantidad, 0) }),
    [items, agregar, quitar, cambiarCantidad, vaciar]
  )
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
