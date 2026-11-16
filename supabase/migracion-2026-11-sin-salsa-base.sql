-- Quita la "salsa base" de las pizzas (noviembre 2026).
-- Ejecutar ANTES de publicar la versión de la app que ya no la ofrece: hoy el servidor exige una salsa por pizza
-- y, sin este cambio, los pedidos de pizza personalizada se rechazarían con 'seleccion_invalida'.
-- Se puede repetir sin problema. Los pedidos ya hechos no se tocan (guardan su propio detalle en texto).

update public.constructores set pasos_unicos = array['tamano', 'masa']::text[] where id = 'pizza';
delete from public.opciones where constructor = 'pizza' and paso = 'salsa';
