-- Perros calientes + nuevos ingredientes (noviembre 2026).
-- Ejecutar UNA vez en Supabase > SQL Editor sobre una base que ya tenga schema.sql y seed.sql.
-- Se puede repetir sin problema (no duplica ni pisa los precios que hayas cambiado en el panel).

-- 1. La base original solo aceptaba tres categorías y tres constructores: se amplía a perros calientes.
alter table public.productos     drop constraint if exists productos_categoria_check;
alter table public.productos     add  constraint productos_categoria_check check (categoria in ('pizzas','hamburguesas','perros','asados'));
alter table public.constructores drop constraint if exists constructores_id_check;
alter table public.constructores add  constraint constructores_id_check check (id in ('pizza','hamburguesa','perro','pollo'));

-- 2. Producto nuevo: perros calientes.
insert into public.productos (id, categoria, nombre, descripcion, precio, disponible, orden) values ('perro-clasico', 'perros', 'Perro clásico', 'Salchicha Frankfurt, kétchup y mostaza.', 12000, true, 15) on conflict (id) do nothing;
insert into public.productos (id, categoria, nombre, descripcion, precio, disponible, orden) values ('perro-cheddar', 'perros', 'Perro con cheddar', 'Salchicha Frankfurt, queso cheddar rallado y mostaza.', 14000, true, 16) on conflict (id) do nothing;
insert into public.productos (id, categoria, nombre, descripcion, precio, disponible, orden) values ('perro-ripio', 'perros', 'Perro con papas ripio', 'Salchicha Frankfurt, papas ripio, kétchup y salsa rosada.', 15000, true, 17) on conflict (id) do nothing;
insert into public.productos (id, categoria, nombre, descripcion, precio, disponible, orden) values ('perro-caramelizado', 'perros', 'Perro caramelizado', 'Salchicha Frankfurt, cebolla caramelizada, tocino crujiente y cheddar.', 16000, true, 18) on conflict (id) do nothing;

insert into public.constructores (id, base, pasos_unicos) values ('perro', 6000, array['pan', 'salchicha']::text[]) on conflict (id) do update set pasos_unicos = excluded.pasos_unicos;

-- 3. Ingredientes nuevos de la hamburguesa y del perro caliente.
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('hamburguesa', 'toppings', 'cebolla-caramelizada', 'Cebolla caramelizada', 1200, true, 29) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('hamburguesa', 'toppings', 'papas-ripio', 'Papas ripio', 1500, true, 30) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'pan', 'clasico', 'Pan de hot dog', 0, true, 40) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'pan', 'integral', 'Pan integral', 1000, true, 41) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'salchicha', 'frankfurt', 'Salchicha Frankfurt', 4000, true, 42) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'salchicha', 'doble-frankfurt', 'Doble salchicha Frankfurt', 7500, true, 43) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'toppings', 'cheddar-rallado', 'Queso cheddar rallado', 1500, true, 44) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'toppings', 'tocineta', 'Tocino crujiente', 2500, true, 45) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'toppings', 'cebolla-caramelizada', 'Cebolla caramelizada', 1200, true, 46) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'toppings', 'papas-ripio', 'Papas ripio', 1500, true, 47) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'toppings', 'pepinillos', 'Pepinillos en escabeche', 1000, true, 48) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'salsas', 'ketchup', 'Kétchup', 0, true, 49) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'salsas', 'mostaza', 'Mostaza dorada', 0, true, 50) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'salsas', 'rosada', 'Salsa rosada', 0, true, 51) on conflict (constructor, paso, id) do nothing;
insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden) values ('perro', 'salsas', 'bbq', 'BBQ', 0, true, 52) on conflict (constructor, paso, id) do nothing;

-- 4. Nombres que ahora llevan el de su foto (solo el nombre; no se tocan precios ni disponibilidad).
update public.opciones set nombre = 'Rodajas de pepperoni'  where constructor = 'pizza'       and paso = 'carnes' and id = 'pepperoni';
update public.opciones set nombre = 'Loncha de cheddar'     where constructor = 'hamburguesa' and paso = 'quesos' and id = 'cheddar';
update public.opciones set nombre = 'Lonchas de mozzarella' where constructor = 'hamburguesa' and paso = 'quesos' and id = 'mozzarella';
