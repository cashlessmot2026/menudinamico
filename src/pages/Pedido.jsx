import { useParams } from 'react-router-dom'

// Versión mínima; la Task 8 añade consulta, línea de tiempo y seguimiento en vivo.
export default function Pedido() {
  const { codigo } = useParams()
  return (
    <section className="page">
      <h1>Pedido <em>{codigo}</em></h1>
    </section>
  )
}
