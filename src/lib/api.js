import { supabase } from './supabase.js'
import { catalogo as catalogoLocal } from '../data/catalogo.js'
import { normalizarTelefono } from './phone.js'

const LS_KEY = 'demo_pedidos'

export function leerPedidosLocales() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function guardarPedidoLocal(codigo, telefono) {
  try {
    const lista = leerPedidosLocales().filter((p) => p.codigo !== codigo)
    lista.unshift({ codigo, telefono })
    localStorage.setItem(LS_KEY, JSON.stringify(lista))
  } catch {
    /* sin almacenamiento: el pedido se sigue consultando con telefono + codigo */
  }
}

export async function getCatalogo() {
  if (!supabase) return catalogoLocal
  try {
    const [p, o, c] = await Promise.all([
      supabase.from('productos').select('*').order('orden'),
      supabase.from('opciones').select('*').order('orden'),
      supabase.from('constructores').select('*')
    ])
    if (p.error || o.error || !p.data?.length) return catalogoLocal
    return { ...catalogoLocal, productos: p.data, opciones: o.data || [], constructores: c.data || [] }
  } catch {
    return catalogoLocal
  }
}

export async function rpc(nombre, args) {
  if (!supabase) throw new Error('sin_conexion')
  const { data, error } = await supabase.rpc(nombre, args)
  if (error) throw new Error(error.message)
  return data
}

export const crearPedido = (payload) => rpc('crear_pedido', { datos: payload })

export const consultarPedido = (telefono, codigo) =>
  rpc('consultar_pedido', {
    p_telefono: normalizarTelefono(telefono),
    p_codigo: String(codigo).trim().toUpperCase()
  })

/** Polling cada 8 s (la tabla de pedidos no es publica). Devuelve la funcion para cancelar. */
export function suscribirPedido(telefono, codigo, cb, intervaloMs = 8000) {
  let activo = true
  const tick = async () => {
    try {
      const p = await consultarPedido(telefono, codigo)
      if (activo) cb(p)
    } catch {
      /* se reintenta en el siguiente ciclo */
    }
  }
  const id = setInterval(tick, intervaloMs)
  return () => {
    activo = false
    clearInterval(id)
  }
}

// ---------------------------------------------------------------- admin
/** Devuelve el token, o null si la clave es incorrecta. Lanza Error('bloqueado') tras 5 fallos. */
export const adminLogin = (clave) => rpc('admin_login', { p_clave: clave })
export const adminListar = (token, estado = null) => rpc('admin_listar_pedidos', { p_token: token, p_estado: estado })
export const adminCambiarEstado = (token, id, estado, motivo = null) =>
  rpc('admin_cambiar_estado', { p_token: token, p_id: id, p_estado: estado, p_motivo: motivo })
export const adminResumen = (token) => rpc('admin_resumen', { p_token: token })
export const adminGuardarProducto = (token, datos) => rpc('admin_guardar_producto', { p_token: token, datos })
export const adminGuardarOpcion = (token, datos) => rpc('admin_guardar_opcion', { p_token: token, datos })
export const adminCambiarClave = (token, nueva) => rpc('admin_cambiar_clave', { p_token: token, p_nueva: nueva })
