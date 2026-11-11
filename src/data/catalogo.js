const ing = (id, grupo, nombre, precio, imagen) => ({ id, grupo, nombre, precio, disponible: true, ...(imagen ? { imagen } : {}) })

export const tamanos = [
  { id: 'personal', nombre: 'Personal (4 porciones)', precio: 16000 },
  { id: 'mediana', nombre: 'Mediana (6 porciones)', precio: 26000 },
  { id: 'grande', nombre: 'Grande (8 porciones)', precio: 34000 },
  { id: 'familiar', nombre: 'Familiar (12 porciones)', precio: 48000 }
]

export const masas = [
  { id: 'clasica', nombre: 'Clásica', precio: 0 },
  { id: 'delgada', nombre: 'Delgada y crocante', precio: 0 },
  { id: 'gruesa', nombre: 'Gruesa estilo pan', precio: 3000 },
  { id: 'integral', nombre: 'Integral', precio: 3500 },
  { id: 'sin-gluten', nombre: 'Sin gluten', precio: 6000 },
  { id: 'rellena-queso', nombre: 'Rellena de queso', precio: 7000 }
]

export const salsas = [
  { id: 'pasta-tomate', nombre: 'Pasta de tomate', precio: 0 },
  { id: 'pesto', nombre: 'Pesto de albahaca', precio: 2500 },
  { id: 'bbq', nombre: 'BBQ ahumada', precio: 2000 },
  { id: 'blanca', nombre: 'Salsa blanca (crema)', precio: 2000 },
  { id: 'ajo-aceite', nombre: 'Ajo y aceite de oliva', precio: 1500 }
]

export const ingredientes = [
  ing('mozzarella', 'queso', 'Mozzarella', 3000),
  ing('parmesano', 'queso', 'Parmesano', 3500),
  ing('provolone', 'queso', 'Provolone', 3500),
  ing('cheddar', 'queso', 'Cheddar', 3000),
  ing('queso-azul', 'queso', 'Queso azul', 4500),
  ing('burrata', 'queso', 'Burrata', 6500),
  ing('pepperoni', 'carne', 'Pepperoni', 4000),
  ing('jamon', 'carne', 'Jamón', 3500),
  ing('tocineta', 'carne', 'Tocineta', 4000),
  ing('salami', 'carne', 'Salami', 4000),
  ing('pollo', 'carne', 'Pollo desmechado', 4000),
  ing('carne-molida', 'carne', 'Carne molida', 4000),
  ing('chorizo', 'carne', 'Chorizo', 4000),
  ing('rugula', 'vegetal', 'Rúgula', 2500, '/img/rugula.jpg'),
  ing('lechuga', 'vegetal', 'Lechuga fresca', 1500),
  ing('aceituna-verde', 'vegetal', 'Aceitunas verdes', 2000, '/img/aceituna-verde.jpeg'),
  ing('aceituna-morada', 'vegetal', 'Aceitunas moradas (kalamata)', 2500),
  ing('cebolla-blanca', 'vegetal', 'Cebolla blanca', 1500),
  ing('cebolla-morada', 'vegetal', 'Cebolla morada', 1500),
  ing('cebolla-caramelizada', 'vegetal', 'Cebolla caramelizada', 2500),
  ing('champinones', 'vegetal', 'Champiñones', 2500),
  ing('pimenton', 'vegetal', 'Pimentón', 1500),
  ing('tomate-cherry', 'vegetal', 'Tomate cherry', 2000, '/img/tomate.jpeg'),
  ing('maiz', 'vegetal', 'Maíz tierno', 1500),
  ing('espinaca', 'vegetal', 'Espinaca', 2000),
  ing('alcachofa', 'vegetal', 'Alcachofa', 3000),
  ing('jalapeno', 'vegetal', 'Jalapeño', 1500),
  ing('albahaca', 'vegetal', 'Albahaca fresca', 1500),
  ing('pina', 'extra', 'Piña', 2000),
  ing('oregano', 'extra', 'Orégano', 500),
  ing('borde-queso', 'extra', 'Borde de queso', 5000)
]

const prod = (id, categoria, nombre, descripcion, precio) => ({ id, categoria, nombre, descripcion, precio, disponible: true })

export const productos = [
  prod('pizza-margarita', 'pizzas', 'Margarita', 'Pasta de tomate, mozzarella y albahaca fresca.', 28000),
  prod('pizza-pepperoni', 'pizzas', 'Pepperoni', 'Doble pepperoni y mozzarella gratinada.', 32000),
  prod('pizza-hawaiana', 'pizzas', 'Hawaiana', 'Jamón, piña y mozzarella.', 31000),
  prod('pizza-cuatro-quesos', 'pizzas', 'Cuatro quesos', 'Mozzarella, parmesano, provolone y queso azul.', 36000),
  prod('pizza-bbq-pollo', 'pizzas', 'BBQ Pollo', 'Pollo desmechado, salsa BBQ y cebolla morada.', 34000),
  prod('hamb-clasica', 'hamburguesas', 'Clásica', 'Carne 150 g, lechuga, tomate, cebolla y salsa de la casa.', 18000),
  prod('hamb-doble', 'hamburguesas', 'Doble carne', 'Doble carne, doble queso cheddar y pepinillos.', 26000),
  prod('hamb-bbq-bacon', 'hamburguesas', 'BBQ Bacon', 'Carne, tocineta crocante, aros de cebolla y BBQ.', 24000),
  prod('hamb-pollo-crispy', 'hamburguesas', 'Pollo crispy', 'Pechuga apanada, lechuga y mayonesa de ajo.', 22000),
  prod('hamb-veggie', 'hamburguesas', 'Veggie', 'Medallón de garbanzo, rúgula y tomate.', 20000),
  prod('asado-pollo-entero', 'asados', 'Pollo asado entero', 'Pollo al carbón con papas criollas y ensalada.', 42000),
  prod('asado-medio-pollo', 'asados', 'Medio pollo asado', 'Medio pollo al carbón con papa y arepa.', 24000),
  prod('asado-costillas', 'asados', 'Costillas BBQ', 'Costillas de cerdo glaseadas con BBQ.', 38000),
  prod('asado-chuzos', 'asados', 'Chuzos mixtos', 'Res, pollo y chorizo con papa y yuca.', 28000),
  prod('asado-churrasco', 'asados', 'Churrasco', 'Corte de res 300 g con chimichurri.', 40000)
]

export const catalogo = { productos, ingredientes, tamanos, masas, salsas }
