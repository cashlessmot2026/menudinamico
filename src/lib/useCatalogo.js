import { useEffect, useState } from 'react'
import { getCatalogo } from './api.js'
import { catalogo as local } from '../data/catalogo.js'

/** Devuelve { catalogo, cargando }. Empieza con el catálogo local y se actualiza con la BD. */
export function useCatalogo() {
  const [catalogo, setCatalogo] = useState(local)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let vivo = true
    getCatalogo()
      .then((c) => vivo && setCatalogo(c))
      .finally(() => vivo && setCargando(false))
    return () => { vivo = false }
  }, [])

  return { catalogo, cargando }
}
