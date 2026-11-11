// Supabase simulado con estado para las pruebas e2e (las funciones SQL reales se prueban en supabase/tests.sql).
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }
const SIGUIENTE = { recibido: 'preparando', preparando: 'en_camino', en_camino: 'entregado' }

export async function fakeSupabase(context) {
  const db = { pedidos: [], seq: 1 }

  await context.route('https://tgioyejecmcbxrwcjuub.supabase.co/**', async (route) => {
    const req = route.request()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    const json = (body, status = 200) =>
      route.fulfill({ status, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(body) })
    const fallo = (message) => json({ message }, 400)
    const { pathname } = new URL(req.url())

    if (!pathname.startsWith('/rest/v1/rpc/')) return json([]) // tablas vacías -> catálogo local
    const fn = pathname.split('/').pop()
    const a = req.postDataJSON() || {}

    if (fn === 'crear_pedido') {
      const { cliente, items } = a.datos
      const id = db.seq++
      const pedido = {
        id, codigo: `DEM-E2E${id}`, estado: 'recibido', motivo_cancelacion: null, created_at: new Date().toISOString(),
        total: items.reduce((s, i) => s + 10000 * i.cantidad, 0), ...cliente,
        items: items.map((i) => ({ nombre: i.tipo === 'custom' ? 'Pizza personalizada' : i.id, detalle: null, cantidad: i.cantidad, precio_unit: 10000 })),
        historial: [{ estado: 'recibido', created_at: new Date().toISOString() }]
      }
      db.pedidos.push(pedido)
      return json({ codigo: pedido.codigo, id })
    }
    if (fn === 'consultar_pedido') {
      const p = db.pedidos.find((x) => x.codigo === a.p_codigo && x.telefono === a.p_telefono)
      return json(p || null)
    }
    if (fn === 'admin_login') return json(a.p_clave === '1234' ? 'tok' : null)
    if (a.p_token !== 'tok') return fallo('no_autorizado')
    if (fn === 'admin_listar_pedidos') return json(db.pedidos.filter((p) => !a.p_estado || p.estado === a.p_estado).slice().reverse())
    if (fn === 'admin_cambiar_estado') {
      const p = db.pedidos.find((x) => x.id === a.p_id)
      const ok = a.p_estado === 'cancelado' ? !['entregado', 'cancelado'].includes(p.estado) : SIGUIENTE[p.estado] === a.p_estado
      if (!ok) return fallo('transicion_invalida')
      p.estado = a.p_estado
      if (a.p_estado === 'cancelado') p.motivo_cancelacion = a.p_motivo
      p.historial.push({ estado: a.p_estado, created_at: new Date().toISOString() })
      return json({ id: p.id, estado: p.estado })
    }
    if (fn === 'admin_resumen') return json({ ventas_hoy: 0, pedidos_hoy: db.pedidos.length, por_estado: {}, mas_vendido: null })
    return json(null)
  })
  return db
}
