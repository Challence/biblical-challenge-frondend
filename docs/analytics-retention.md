# Retención de analítica

`public.analytics_events` conserva eventos crudos durante **24 meses**, medidos
por `occurred_at`. La limpieza es idempotente: `purge_expired_analytics_events()`
solo elimina filas fuera de esa ventana y devuelve el número eliminado. La
operación está protegida por RLS y por una comprobación de
`auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'`; no se usa `user_metadata`.
No existe DELETE general para usuarios autenticados.

## Programación

Programa una llamada periódica (diaria suele ser suficiente) como usuario
autenticado con `app_metadata.role=admin`:

```sql
select public.purge_expired_analytics_events();
```

En Supabase, un Scheduler/Edge Function puede invocar el RPC con las
credenciales de un usuario administrador dedicado. No se deben incluir
credenciales en `pg_cron` ni ejecutar un `DELETE` directo: el cron SQL local no
dispone de un JWT con `app_metadata`, por lo que la función rechazará la
llamada. Si se usa `pg_cron`, úsalo únicamente para disparar un mecanismo
externo que haga la llamada autenticada (o para registrar el trabajo), sin
eliminar directamente de la tabla.

Procedimiento operativo manual (si no hay Scheduler): una vez al día, iniciar
sesión como el usuario administrador dedicado y ejecutar el RPC anterior. La
salida es el número de filas eliminadas; repetir la llamada es seguro y debe
devolver `0` si no aparecieron nuevos eventos expirados. Validar que el usuario
tenga `app_metadata.role=admin`; `user_metadata` no autoriza la operación.

La purga usa `analytics_events_occurred_idx` sobre `occurred_at`. Los informes
que filtran por tipo y periodo usan `analytics_events_type_occurred_idx`.
El fixture `supabase/fixtures/analytics-retention.sql` comprueba la purga,
conservación del límite de 24 meses, idempotencia y presencia de ambos índices.
