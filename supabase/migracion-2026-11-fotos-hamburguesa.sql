-- Fotos reales de la hamburguesa (noviembre 2026).
-- Ejecutar UNA vez en Supabase > SQL Editor sobre una base que ya tenga seed.sql.
-- Renombra las opciones con el nombre de su foto (es lo que sale en el pedido y en el panel)
-- y agrega dos opciones nuevas: Pan con sésamo y Salsa rosada. Se puede repetir sin problema.

update public.opciones set nombre = 'Tocino crujiente'           where constructor = 'pizza'       and paso = 'carnes'    and id = 'tocineta';
update public.opciones set nombre = 'Aros de cebolla morada'     where constructor = 'pizza'       and paso = 'vegetales' and id = 'cebolla-morada';

update public.opciones set nombre = 'Pan dorado'                 where constructor = 'hamburguesa' and paso = 'pan'       and id = 'brioche';
update public.opciones set nombre = 'Carne de res a la parrilla' where constructor = 'hamburguesa' and paso = 'carne'     and id = 'res';
update public.opciones set nombre = 'Doble carne a la parrilla'  where constructor = 'hamburguesa' and paso = 'carne'     and id = 'doble-res';
update public.opciones set nombre = 'Tocino crujiente'           where constructor = 'hamburguesa' and paso = 'toppings'  and id = 'tocineta';
update public.opciones set nombre = 'Lechuga rizada'             where constructor = 'hamburguesa' and paso = 'toppings'  and id = 'lechuga';
update public.opciones set nombre = 'Aros de cebolla morada'     where constructor = 'hamburguesa' and paso = 'toppings'  and id = 'cebolla-morada';
update public.opciones set nombre = 'Pepinillos en escabeche'    where constructor = 'hamburguesa' and paso = 'toppings'  and id = 'pepinillos';
update public.opciones set nombre = 'Aros de cebolla apanados'   where constructor = 'hamburguesa' and paso = 'toppings'  and id = 'aros-cebolla';
update public.opciones set nombre = 'Mostaza dorada'             where constructor = 'hamburguesa' and paso = 'salsas'    and id = 'mostaza';
update public.opciones set nombre = 'Kétchup'                    where constructor = 'hamburguesa' and paso = 'salsas'    and id = 'ketchup';

insert into public.opciones (constructor, paso, id, nombre, precio, disponible, orden)
values ('hamburguesa', 'pan', 'sesamo', 'Pan con sésamo', 500, true, 0),
       ('hamburguesa', 'salsas', 'rosada', 'Salsa rosada', 0, true, 26)
on conflict (constructor, paso, id) do nothing;
