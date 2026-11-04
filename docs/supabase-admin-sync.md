# Sincronizar administrador de Supabase

El comando `pnpm supabase:admin:sync` localiza un usuario por correo mediante
`auth.admin.listUsers` y fusiona `role: "admin"` en `raw_app_meta_data`.
Conserva el resto de `raw_app_meta_data`, la contraseña y `user_metadata`, y es
idempotente.

Requiere `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Se recomienda indicar
siempre `ADMIN_EMAIL`. Si se omite, solo se acepta un entorno explícito:

- `APP_ENV=local`: usa `test@123.com`.
- `APP_ENV=production`: usa `jacobo@gmail.com`.

Sin `ADMIN_EMAIL` y sin uno de esos valores explícitos de `APP_ENV`, el comando
falla. Producción nunca usa silenciosamente el correo local. También falla si
no encuentra exactamente un usuario. No muestra valores de secretos.

Ejemplo:

```sh
SUPABASE_URL="https://..." \
SUPABASE_SERVICE_ROLE_KEY="..." \
APP_ENV=production ADMIN_EMAIL="jacobo@gmail.com" \
pnpm supabase:admin:sync
```
