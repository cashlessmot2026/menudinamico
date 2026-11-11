-- Pruebas de las funciones RPC. Ejecutar DESPUÉS de schema.sql y seed.sql.
-- Todo corre dentro de una transacción que se revierte al final (no deja datos ni bloqueos).
-- Si algo falla verás "ASSERT" o "FALLO: ..." en el error; si termina sin error, todo pasó.

begin;

do $$
declare
  r json; v_codigo text; v_total integer; v_token text; v_id bigint; msg text;
  cliente jsonb := '{"nombre":"Ana","telefono":"+57 300 123 4567","direccion":"Calle 1","barrio":"Centro","referencia":"Casa azul"}';
begin
  -- 1. precio manipulado por el cliente se ignora: Margarita vale 28000
  r := public.crear_pedido(jsonb_build_object('cliente', cliente,
        'items', jsonb_build_array(jsonb_build_object('tipo','producto','id','pizza-margarita','cantidad',2,'precio_unit',1))));
  v_codigo := r->>'codigo';
  select total into v_total from public.pedidos where codigo = v_codigo;
  assert v_total = 56000, 'FALLO: el servidor debía recalcular el precio (esperado 56000, obtuvo ' || v_total || ')';
  assert v_codigo ~ '^DEM-[A-HJ-NP-Z2-9]{4}$', 'FALLO: formato de código';

  -- 2. el teléfono se guardó normalizado y la consulta funciona con otros formatos
  assert (select telefono from public.pedidos where codigo = v_codigo) = '3001234567', 'FALLO: teléfono sin normalizar';
  assert public.consultar_pedido('300-123-4567', lower(v_codigo)) is not null, 'FALLO: consulta con formato distinto';
  assert public.consultar_pedido('3009999999', v_codigo) is null, 'FALLO: teléfono ajeno no debe ver el pedido';

  -- 3. pizza custom: Grande 34000 + masa gruesa 3000 + pasta de tomate 0 + rúgula 2500 + pepperoni x2 8000
  r := public.crear_pedido(jsonb_build_object('cliente', cliente, 'items', jsonb_build_array(jsonb_build_object(
        'tipo','custom','constructor','pizza','cantidad',1,'selecciones', jsonb_build_array(
          jsonb_build_object('paso','tamano','id','grande','cantidad',1),
          jsonb_build_object('paso','masa','id','gruesa','cantidad',1),
          jsonb_build_object('paso','salsa','id','pasta-tomate','cantidad',1),
          jsonb_build_object('paso','vegetales','id','rugula','cantidad',1),
          jsonb_build_object('paso','carnes','id','pepperoni','cantidad',2))))));
  select total into v_total from public.pedidos where codigo = r->>'codigo';
  assert v_total = 34000 + 3000 + 0 + 2500 + 8000, 'FALLO: precio de pizza custom (obtuvo ' || v_total || ')';

  -- 4. ítem no disponible se rechaza
  update public.opciones set disponible = false where constructor = 'pizza' and id = 'burrata';
  begin
    perform public.crear_pedido(jsonb_build_object('cliente', cliente, 'items', jsonb_build_array(jsonb_build_object(
        'tipo','custom','constructor','pizza','cantidad',1,'selecciones', jsonb_build_array(
          jsonb_build_object('paso','tamano','id','grande','cantidad',1),
          jsonb_build_object('paso','masa','id','clasica','cantidad',1),
          jsonb_build_object('paso','salsa','id','pasta-tomate','cantidad',1),
          jsonb_build_object('paso','quesos','id','burrata','cantidad',1))))));
    raise exception 'FALLO: debía rechazar opción no disponible';
  exception when others then
    get stacked diagnostics msg = message_text;
    assert msg = 'opcion_no_disponible', 'FALLO: mensaje inesperado: ' || msg;
  end;

  -- 5. datos obligatorios
  begin
    perform public.crear_pedido(jsonb_build_object('cliente', cliente - 'barrio',
        'items', jsonb_build_array(jsonb_build_object('tipo','producto','id','pizza-margarita','cantidad',1))));
    raise exception 'FALLO: debía exigir barrio';
  exception when others then
    get stacked diagnostics msg = message_text;
    assert msg = 'datos_incompletos', 'FALLO: mensaje inesperado: ' || msg;
  end;

  -- 6. paso único faltante en custom se rechaza
  begin
    perform public.crear_pedido(jsonb_build_object('cliente', cliente, 'items', jsonb_build_array(jsonb_build_object(
        'tipo','custom','constructor','pizza','cantidad',1,'selecciones', '[]'::jsonb))));
    raise exception 'FALLO: debía exigir pasos únicos';
  exception when others then
    get stacked diagnostics msg = message_text;
    assert msg = 'seleccion_invalida', 'FALLO: mensaje inesperado: ' || msg;
  end;

  -- 7. token falso
  begin
    perform public.admin_listar_pedidos('token-falso');
    raise exception 'FALLO: token falso debía ser rechazado';
  exception when others then
    get stacked diagnostics msg = message_text;
    assert msg = 'no_autorizado', 'FALLO: mensaje inesperado: ' || msg;
  end;

  -- 8. login correcto, transiciones y cancelación
  v_token := public.admin_login('1234');
  assert v_token is not null, 'FALLO: login con 1234';
  select id into v_id from public.pedidos where codigo = v_codigo;

  begin
    perform public.admin_cambiar_estado(v_token, v_id, 'entregado');
    raise exception 'FALLO: recibido -> entregado debía rechazarse';
  exception when others then
    get stacked diagnostics msg = message_text;
    assert msg = 'transicion_invalida', 'FALLO: mensaje inesperado: ' || msg;
  end;

  perform public.admin_cambiar_estado(v_token, v_id, 'preparando');
  assert (public.consultar_pedido('3001234567', v_codigo)->>'estado') = 'preparando', 'FALLO: estado no cambió';

  begin
    perform public.admin_cambiar_estado(v_token, v_id, 'cancelado');
    raise exception 'FALLO: cancelar sin motivo debía rechazarse';
  exception when others then
    get stacked diagnostics msg = message_text;
    assert msg = 'motivo_requerido', 'FALLO: mensaje inesperado: ' || msg;
  end;

  perform public.admin_cambiar_estado(v_token, v_id, 'cancelado', 'Sin ingredientes');
  r := public.consultar_pedido('3001234567', v_codigo)::json;
  assert r->>'estado' = 'cancelado' and r->>'motivo_cancelacion' = 'Sin ingredientes', 'FALLO: cancelación';
  assert json_array_length(r->'historial') = 3, 'FALLO: historial debía tener 3 registros';
  assert (select count(*) from public.pedidos where id = v_id) = 1, 'FALLO: el pedido cancelado debe seguir existiendo';

  begin
    perform public.admin_cambiar_estado(v_token, v_id, 'preparando');
    raise exception 'FALLO: un pedido cancelado es final';
  exception when others then
    get stacked diagnostics msg = message_text;
    assert msg = 'transicion_invalida', 'FALLO: mensaje inesperado: ' || msg;
  end;

  -- 9. bloqueo: 5 claves incorrectas, la sexta lanza 'bloqueado'
  for i in 1..5 loop
    assert public.admin_login('9999') is null, 'FALLO: clave incorrecta debía devolver null';
  end loop;
  begin
    perform public.admin_login('1234');
    raise exception 'FALLO: debía bloquear tras 5 intentos';
  exception when others then
    get stacked diagnostics msg = message_text;
    assert msg = 'bloqueado', 'FALLO: mensaje inesperado: ' || msg;
  end;

  raise notice 'TODAS LAS PRUEBAS PASARON';
end
$$;

rollback;
