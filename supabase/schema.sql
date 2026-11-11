-- =====================================================================
-- Demo - Menú Dinámico · esquema de Supabase
-- Ejecutar completo en: Supabase > SQL Editor. Es idempotente.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- tablas
create table if not exists public.productos (
  id          text primary key,
  categoria   text not null check (categoria in ('pizzas','hamburguesas','asados')),
  nombre      text not null,
  descripcion text not null default '',
  precio      integer not null check (precio >= 0),
  disponible  boolean not null default true,
  orden       integer not null default 0
);

create table if not exists public.constructores (
  id            text primary key check (id in ('pizza','hamburguesa','pollo')),
  base          integer not null default 0 check (base >= 0),
  pasos_unicos  text[] not null default '{}'   -- pasos donde se elige exactamente una opción
);

create table if not exists public.opciones (
  constructor text not null references public.constructores(id),
  paso        text not null,
  id          text not null,
  nombre      text not null,
  precio      integer not null default 0 check (precio >= 0),
  disponible  boolean not null default true,
  orden       integer not null default 0,
  primary key (constructor, paso, id)
);

create table if not exists public.pedidos (
  id                  bigint generated always as identity primary key,
  codigo              text not null unique,
  nombre              text not null check (length(btrim(nombre)) > 0),
  telefono            text not null check (length(telefono) >= 7),
  direccion           text not null check (length(btrim(direccion)) > 0),
  barrio              text not null check (length(btrim(barrio)) > 0),
  referencia          text not null check (length(btrim(referencia)) > 0),
  total               integer not null check (total >= 0),
  estado              text not null default 'recibido'
                      check (estado in ('recibido','preparando','en_camino','entregado','cancelado')),
  motivo_cancelacion  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists pedidos_telefono_idx on public.pedidos (telefono);
create index if not exists pedidos_created_idx on public.pedidos (created_at desc);

create table if not exists public.pedido_items (
  id          bigint generated always as identity primary key,
  pedido_id   bigint not null references public.pedidos(id),   -- sin ON DELETE: los pedidos no se borran
  tipo        text not null,
  nombre      text not null,
  detalle     text,
  cantidad    integer not null check (cantidad > 0),
  precio_unit integer not null check (precio_unit >= 0)
);

create table if not exists public.pedido_historial (
  id         bigint generated always as identity primary key,
  pedido_id  bigint not null references public.pedidos(id),
  estado     text not null,
  motivo     text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_config (
  id          integer primary key check (id = 1),
  clave_hash  text not null
);

create table if not exists public.admin_sesiones (
  token  text primary key,
  expira timestamptz not null
);

create table if not exists public.admin_intentos (
  id     bigint generated always as identity primary key,
  creado timestamptz not null default now()
);

-- Clave inicial 1234 (se guarda con bcrypt; cámbiala con admin_cambiar_clave)
insert into public.admin_config (id, clave_hash)
values (1, extensions.crypt('1234', extensions.gen_salt('bf')))
on conflict (id) do nothing;

-- ---------------------------------------------------------------- seguridad (RLS)
alter table public.productos         enable row level security;
alter table public.constructores     enable row level security;
alter table public.opciones          enable row level security;
alter table public.pedidos           enable row level security;
alter table public.pedido_items      enable row level security;
alter table public.pedido_historial  enable row level security;
alter table public.admin_config      enable row level security;
alter table public.admin_sesiones    enable row level security;
alter table public.admin_intentos    enable row level security;

drop policy if exists "catalogo publico" on public.productos;
drop policy if exists "catalogo publico" on public.constructores;
drop policy if exists "catalogo publico" on public.opciones;
create policy "catalogo publico" on public.productos     for select to anon, authenticated using (true);
create policy "catalogo publico" on public.constructores for select to anon, authenticated using (true);
create policy "catalogo publico" on public.opciones      for select to anon, authenticated using (true);

-- Las tablas sensibles no tienen policies: solo se tocan vía funciones security definer.
revoke all on public.pedidos, public.pedido_items, public.pedido_historial,
              public.admin_config, public.admin_sesiones, public.admin_intentos
  from anon, authenticated;
revoke insert, update, delete on public.productos, public.constructores, public.opciones from anon, authenticated;

-- ---------------------------------------------------------------- utilidades internas
create or replace function public.normalizar_telefono(p text)
returns text language sql immutable set search_path = public as $$
  select case
    when length(regexp_replace(coalesce(p,''), '\D', '', 'g')) = 12
         and regexp_replace(coalesce(p,''), '\D', '', 'g') like '57%'
      then substr(regexp_replace(p, '\D', '', 'g'), 3)
    else regexp_replace(coalesce(p,''), '\D', '', 'g')
  end;
$$;

create or replace function public.transicion_valida(desde text, hacia text)
returns boolean language sql immutable set search_path = public as $$
  select case
    when desde in ('entregado','cancelado') then false
    when hacia = 'cancelado' then desde in ('recibido','preparando','en_camino')
    else (desde, hacia) in (('recibido','preparando'),('preparando','en_camino'),('en_camino','entregado'))
  end;
$$;

create or replace function public.admin_verificar(p_token text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if p_token is null or not exists (select 1 from public.admin_sesiones where token = p_token and expira > now()) then
    raise exception 'no_autorizado';
  end if;
end;
$$;
revoke execute on function public.admin_verificar(text) from public, anon, authenticated;

-- ---------------------------------------------------------------- RPC cliente
-- El servidor recalcula TODOS los precios desde la BD; los precios del cliente se ignoran.
create or replace function public.crear_pedido(datos jsonb)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare
  c        jsonb := datos->'cliente';
  it       jsonb;
  sel      jsonb;
  v_nombre text; v_tel text; v_dir text; v_barrio text; v_ref text;
  v_total  integer := 0;
  v_cant   integer;
  v_unit   integer;
  v_det    text;
  v_nom    text;
  v_cons   public.constructores%rowtype;
  v_op     public.opciones%rowtype;
  v_prod   public.productos%rowtype;
  v_qty    integer;
  v_codigo text;
  v_id     bigint;
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  lineas   jsonb := '[]'::jsonb;
  intentos integer := 0;
begin
  v_nombre := btrim(coalesce(c->>'nombre',''));
  v_tel    := public.normalizar_telefono(c->>'telefono');
  v_dir    := btrim(coalesce(c->>'direccion',''));
  v_barrio := btrim(coalesce(c->>'barrio',''));
  v_ref    := btrim(coalesce(c->>'referencia',''));
  if v_nombre = '' or length(v_tel) < 7 or v_dir = '' or v_barrio = '' or v_ref = '' then
    raise exception 'datos_incompletos';
  end if;
  if jsonb_typeof(datos->'items') is distinct from 'array' or jsonb_array_length(datos->'items') = 0 then
    raise exception 'carrito_vacio';
  end if;

  for it in select * from jsonb_array_elements(datos->'items') loop
    v_cant := coalesce((it->>'cantidad')::integer, 0);
    if v_cant < 1 or v_cant > 20 then raise exception 'cantidad_invalida'; end if;

    if it->>'tipo' = 'producto' then
      select * into v_prod from public.productos where id = it->>'id';
      if not found or not v_prod.disponible then raise exception 'producto_no_disponible'; end if;
      v_unit := v_prod.precio; v_nom := v_prod.nombre; v_det := null;

    elsif it->>'tipo' = 'custom' then
      select * into v_cons from public.constructores where id = it->>'constructor';
      if not found then raise exception 'constructor_invalido'; end if;
      if jsonb_typeof(it->'selecciones') is distinct from 'array' then raise exception 'seleccion_invalida'; end if;
      v_unit := v_cons.base; v_det := null;
      for sel in select * from jsonb_array_elements(it->'selecciones') loop
        select * into v_op from public.opciones
          where constructor = v_cons.id and paso = sel->>'paso' and id = sel->>'id';
        if not found or not v_op.disponible then raise exception 'opcion_no_disponible'; end if;
        v_qty := coalesce((sel->>'cantidad')::integer, 0);
        if v_qty < 1 or v_qty > 2 then raise exception 'cantidad_invalida'; end if;
        if v_op.paso = any (v_cons.pasos_unicos) and v_qty <> 1 then raise exception 'seleccion_invalida'; end if;
        v_unit := v_unit + v_op.precio * v_qty;
        v_det  := concat_ws(', ', v_det, v_op.nombre || case when v_qty > 1 then ' x' || v_qty else '' end);
      end loop;
      -- cada paso único debe tener exactamente una opción
      if exists (
        select 1 from unnest(v_cons.pasos_unicos) as paso
        where (select count(*) from jsonb_array_elements(it->'selecciones') s where s->>'paso' = paso) <> 1
      ) then raise exception 'seleccion_invalida'; end if;
      v_nom := initcap(v_cons.id) || ' personalizada';
    else
      raise exception 'tipo_invalido';
    end if;

    v_total := v_total + v_unit * v_cant;
    lineas := lineas || jsonb_build_object('tipo', it->>'tipo', 'nombre', v_nom, 'detalle', v_det, 'cantidad', v_cant, 'precio_unit', v_unit);
  end loop;

  loop
    v_codigo := 'DEM-' || (
      select string_agg(substr(alfabeto, 1 + floor(random() * 32)::integer, 1), '') from generate_series(1, 4)
    );
    begin
      insert into public.pedidos (codigo, nombre, telefono, direccion, barrio, referencia, total)
      values (v_codigo, v_nombre, v_tel, v_dir, v_barrio, v_ref, v_total)
      returning id into v_id;
      exit;
    exception when unique_violation then
      intentos := intentos + 1;
      if intentos > 10 then raise exception 'sin_codigo'; end if;
    end;
  end loop;

  insert into public.pedido_items (pedido_id, tipo, nombre, detalle, cantidad, precio_unit)
  select v_id, l->>'tipo', l->>'nombre', l->>'detalle', (l->>'cantidad')::integer, (l->>'precio_unit')::integer
  from jsonb_array_elements(lineas) l;

  insert into public.pedido_historial (pedido_id, estado) values (v_id, 'recibido');

  return json_build_object('codigo', v_codigo, 'id', v_id);
end;
$$;

create or replace function public.consultar_pedido(p_telefono text, p_codigo text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare p public.pedidos%rowtype;
begin
  select * into p from public.pedidos
   where codigo = upper(btrim(coalesce(p_codigo,''))) and telefono = public.normalizar_telefono(p_telefono);
  if not found then return null; end if;
  return json_build_object(
    'codigo', p.codigo, 'estado', p.estado, 'motivo_cancelacion', p.motivo_cancelacion,
    'total', p.total, 'nombre', p.nombre, 'direccion', p.direccion, 'barrio', p.barrio,
    'created_at', p.created_at,
    'items', (select coalesce(json_agg(json_build_object('nombre', i.nombre, 'detalle', i.detalle, 'cantidad', i.cantidad, 'precio_unit', i.precio_unit) order by i.id), '[]'::json)
              from public.pedido_items i where i.pedido_id = p.id),
    'historial', (select coalesce(json_agg(json_build_object('estado', h.estado, 'motivo', h.motivo, 'created_at', h.created_at) order by h.id), '[]'::json)
                  from public.pedido_historial h where h.pedido_id = p.id)
  );
end;
$$;

-- ---------------------------------------------------------------- RPC admin
-- Devuelve el token, o NULL si la clave es incorrecta (un "raise" revertiría el registro del intento).
-- Lanza 'bloqueado' tras 5 intentos fallidos en 10 minutos.
create or replace function public.admin_login(p_clave text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare v_hash text; v_token text;
begin
  delete from public.admin_intentos where creado < now() - interval '10 minutes';
  if (select count(*) from public.admin_intentos) >= 5 then raise exception 'bloqueado'; end if;
  select clave_hash into v_hash from public.admin_config where id = 1;
  if v_hash is not null and extensions.crypt(coalesce(p_clave,''), v_hash) = v_hash then
    v_token := encode(extensions.gen_random_bytes(24), 'hex');
    delete from public.admin_sesiones where expira < now();
    insert into public.admin_sesiones (token, expira) values (v_token, now() + interval '12 hours');
    return v_token;
  end if;
  insert into public.admin_intentos default values;
  return null;
end;
$$;

create or replace function public.admin_listar_pedidos(p_token text, p_estado text default null)
returns json language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.admin_verificar(p_token);
  return (
    select coalesce(json_agg(x order by x.created_at desc), '[]'::json) from (
      select p.id, p.codigo, p.estado, p.motivo_cancelacion, p.total, p.nombre, p.telefono, p.direccion, p.barrio, p.referencia, p.created_at,
        (select coalesce(json_agg(json_build_object('nombre', i.nombre, 'detalle', i.detalle, 'cantidad', i.cantidad, 'precio_unit', i.precio_unit) order by i.id), '[]'::json)
           from public.pedido_items i where i.pedido_id = p.id) as items,
        (select coalesce(json_agg(json_build_object('estado', h.estado, 'motivo', h.motivo, 'created_at', h.created_at) order by h.id), '[]'::json)
           from public.pedido_historial h where h.pedido_id = p.id) as historial
      from public.pedidos p
      where p_estado is null or p_estado = '' or p.estado = p_estado
      order by p.created_at desc limit 300
    ) x
  );
end;
$$;

create or replace function public.admin_cambiar_estado(p_token text, p_id bigint, p_estado text, p_motivo text default null)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare p public.pedidos%rowtype; v_motivo text := nullif(btrim(coalesce(p_motivo,'')), '');
begin
  perform public.admin_verificar(p_token);
  select * into p from public.pedidos where id = p_id for update;
  if not found then raise exception 'pedido_no_existe'; end if;
  if not public.transicion_valida(p.estado, p_estado) then raise exception 'transicion_invalida'; end if;
  if p_estado = 'cancelado' and v_motivo is null then raise exception 'motivo_requerido'; end if;
  update public.pedidos
     set estado = p_estado,
         motivo_cancelacion = case when p_estado = 'cancelado' then v_motivo else motivo_cancelacion end,
         updated_at = now()
   where id = p_id;
  insert into public.pedido_historial (pedido_id, estado, motivo) values (p_id, p_estado, v_motivo);
  return json_build_object('id', p_id, 'estado', p_estado);
end;
$$;

create or replace function public.admin_resumen(p_token text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare hoy date := (now() at time zone 'America/Bogota')::date;
begin
  perform public.admin_verificar(p_token);
  return json_build_object(
    'ventas_hoy', (select coalesce(sum(total), 0) from public.pedidos where estado <> 'cancelado' and (created_at at time zone 'America/Bogota')::date = hoy),
    'pedidos_hoy', (select count(*) from public.pedidos where (created_at at time zone 'America/Bogota')::date = hoy),
    'por_estado', (select coalesce(json_object_agg(estado, n), '{}'::json) from (select estado, count(*) n from public.pedidos group by estado) e),
    'mas_vendido', (select i.nombre from public.pedido_items i join public.pedidos p on p.id = i.pedido_id
                    where p.estado <> 'cancelado' and (p.created_at at time zone 'America/Bogota')::date = hoy
                    group by i.nombre order by sum(i.cantidad) desc limit 1)
  );
end;
$$;

create or replace function public.admin_guardar_producto(p_token text, datos jsonb)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.admin_verificar(p_token);
  insert into public.productos (id, categoria, nombre, descripcion, precio, disponible, orden)
  values (datos->>'id', datos->>'categoria', datos->>'nombre', coalesce(datos->>'descripcion',''),
          (datos->>'precio')::integer, coalesce((datos->>'disponible')::boolean, true), coalesce((datos->>'orden')::integer, 0))
  on conflict (id) do update
    set categoria = excluded.categoria, nombre = excluded.nombre, descripcion = excluded.descripcion,
        precio = excluded.precio, disponible = excluded.disponible, orden = excluded.orden;
end;
$$;

create or replace function public.admin_guardar_opcion(p_token text, datos jsonb)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.admin_verificar(p_token);
  insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden)
  values (datos->>'constructor', datos->>'paso', datos->>'id', datos->>'nombre',
          (datos->>'precio')::integer, coalesce((datos->>'disponible')::boolean, true), coalesce((datos->>'orden')::integer, 0))
  on conflict (constructor, paso, id) do update
    set nombre = excluded.nombre, precio = excluded.precio, disponible = excluded.disponible, orden = excluded.orden;
end;
$$;

create or replace function public.admin_cambiar_clave(p_token text, p_nueva text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform public.admin_verificar(p_token);
  if length(coalesce(p_nueva,'')) < 4 then raise exception 'clave_corta'; end if;
  update public.admin_config set clave_hash = extensions.crypt(p_nueva, extensions.gen_salt('bf')) where id = 1;
  delete from public.admin_sesiones;
end;
$$;

grant execute on function
  public.crear_pedido(jsonb), public.consultar_pedido(text, text), public.admin_login(text),
  public.admin_listar_pedidos(text, text), public.admin_cambiar_estado(text, bigint, text, text),
  public.admin_resumen(text), public.admin_guardar_producto(text, jsonb), public.admin_guardar_opcion(text, jsonb),
  public.admin_cambiar_clave(text, text)
to anon, authenticated;
