const precioDe = (lista = [], id) => lista.find((x) => x.id === id)?.precio ?? 0

export function precioPizza({ tamano, masa, salsa, ingredientes = [] }, catalogo) {
  const extras = ingredientes.reduce((sum, id) => {
    const ing = catalogo.ingredientes.find((i) => i.id === id)
    return ing && ing.disponible ? sum + ing.precio : sum
  }, 0)
  return precioDe(catalogo.tamanos, tamano) + precioDe(catalogo.masas, masa) + precioDe(catalogo.salsas, salsa) + extras
}

export function totalCarrito(items = []) {
  return items.reduce((sum, i) => sum + i.precioUnit * i.cantidad, 0)
}
