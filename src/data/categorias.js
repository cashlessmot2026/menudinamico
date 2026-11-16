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
    id: 'perros',
    titulo: 'Perros calientes',
    emoji: '🌭',
    lema: 'Al carbón, con todo lo que quieras encima',
    constructor: { ruta: '/armar/perro', texto: 'Arma tu perro caliente' }
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
