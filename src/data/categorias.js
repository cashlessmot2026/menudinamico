export const categorias = [
  {
    id: 'pizzas',
    titulo: 'Pizzas',
    emoji: '🍕',
    lema: 'Horno de leña, a tu gusto',
    constructor: { ruta: '/armar/pizza', texto: 'Arma tu pizza' }
  },
  {
    id: 'hamburguesas',
    titulo: 'Hamburguesas',
    emoji: '🍔',
    lema: 'Jugosas, con lo que tú elijas',
    constructor: { ruta: '/armar/hamburguesa', texto: 'Arma tu hamburguesa' }
  },
  {
    id: 'asados',
    titulo: 'Asados',
    emoji: '🍗',
    lema: 'Pollo a la brasa y parrilla',
    constructor: { ruta: '/armar/pollo', texto: 'Arma tu pollo a la brasa' }
  }
]

export const categoriaPorId = (id) => categorias.find((c) => c.id === id)
