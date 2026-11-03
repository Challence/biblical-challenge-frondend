# Desafío Bíblico

## Stack local de Supabase

### Prerrequisitos

- Docker instalado y en ejecución.
- Docker Compose disponible (incluido en Docker Desktop y en el plugin de Docker Compose).
- Node.js y pnpm instalados.

El stack oficial usa las imágenes Docker gestionadas por Supabase CLI. Para este setup no se debe ejecutar `docker compose` manualmente.

### Instalar dependencias

Desde la raíz del proyecto:

```bash
pnpm install
```

### Configurar variables locales

Copia el ejemplo y completa cada valor una sola vez:

```bash
cp .env.example .env
```

Vite traduce automáticamente `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` y `VAPID_PUBLIC_KEY` a los nombres públicos `VITE_*` que consume el frontend. Las variables privadas nunca se exponen mediante esa traducción.

### Iniciar el stack

```bash
pnpm supabase:start
```

Este comando inicia el stack local mediante Supabase CLI y Docker.

### Consultar el estado

```bash
pnpm supabase:status
```

URLs y puertos locales:

| Servicio        | URL/puerto             |
| --------------- | ---------------------- |
| API de Supabase | http://127.0.0.1:54321 |
| Postgres        | `127.0.0.1:54322`      |
| Studio          | http://127.0.0.1:54323 |
| Mailpit         | http://127.0.0.1:54324 |

### Detener el stack

```bash
pnpm supabase:stop
```

Para servir las Edge Functions con las mismas variables del `.env` local:

```bash
pnpm supabase:functions:serve
```

### Seguridad

No expongas `SECRET_KEY` ni `SERVICE_ROLE_KEY` al frontend. Estas claves son secretas y deben permanecer exclusivamente en servicios de servidor o en entornos seguros.

## Variables para desplegar en Vercel y Supabase

Vercel compila el frontend y solo necesita las variables públicas con prefijo `VITE_`. Las Supabase Edge Functions se ejecutan en otro entorno y reciben su configuración mediante los secretos de Supabase.

### 1. Generar las claves VAPID

Ejecuta una sola vez:

```bash
pnpm dlx web-push generate-vapid-keys
```

El comando devuelve una clave pública y una privada. Conserva ambas: la clave pública se reutiliza en Vercel y Supabase; la privada solo se configura en Supabase.

### 2. Configurar GitHub Actions

GitHub Actions es la fuente única del despliegue. Configura en **Settings → Secrets and variables → Actions**:

| Tipo     | Nombre                     | Valor                                                    |
| -------- | -------------------------- | -------------------------------------------------------- |
| Variable | `SUPABASE_PROJECT_REF`     | Identificador del proyecto remoto.                       |
| Variable | `SUPABASE_URL`             | URL de **Project Settings → API** en Supabase.           |
| Variable | `SUPABASE_PUBLISHABLE_KEY` | Publishable key de Supabase.                             |
| Variable | `VAPID_PUBLIC_KEY`         | Clave pública generada por `web-push`.                   |
| Variable | `VAPID_SUBJECT`            | Contacto, por ejemplo `mailto:correo@dominio.com`.       |
| Variable | `APP_ORIGINS`              | Orígenes web autorizados separados por comas.            |
| Secreto  | `VAPID_PRIVATE_KEY`        | Clave privada generada por `web-push`.                   |
| Secreto  | `PUSH_CRON_SECRET`         | Valor aleatorio usado por el cron.                       |
| Secreto  | `SUPABASE_ACCESS_TOKEN`    | Token scoped para vincular, migrar y desplegar Supabase. |
| Secreto  | `VERCEL_TOKEN`             | Token para desplegar en Vercel.                          |
| Variable | `VERCEL_ORG_ID`            | Identificador de la cuenta/equipo de Vercel.             |
| Variable | `VERCEL_PROJECT_ID`        | Identificador del proyecto Vercel.                       |

El workflow crea los alias `VITE_*` durante el build, previsualiza y aplica las migraciones pendientes con `supabase db push`, configura los secretos de las Edge Functions y despliega Vercel y Supabase. No es necesario duplicar esos valores en Vercel. Si una migración falla, no se despliegan las funciones ni el frontend.

GitHub Actions no ofrece conectividad IPv6. Antes de migrar, el workflow ejecuta `supabase link` para obtener la configuración del pooler IPv4. El token scoped requiere `project_admin_read`, lectura de API gateway keys, `database_pooling_config_read`, `database_write` y escritura de Edge Functions y sus secretos.

### 3. Generar el secreto del cron

Genera un valor aleatorio:

```bash
openssl rand -base64 48
```

El resultado será `PUSH_CRON_SECRET`. El mismo valor debe configurarse en los secretos de la Edge Function y en la autorización de la llamada programada del cron/Vault.

### 4. Configurar Supabase Edge Functions manualmente (opcional)

Prepara un archivo local que no se suba a Git, por ejemplo `.env.functions.local`:

```env
VAPID_SUBJECT=mailto:correo@dominio.com
APP_ORIGINS=https://tu-app.vercel.app,http://localhost:5173
VAPID_PUBLIC_KEY=<misma clave de VITE_VAPID_PUBLIC_KEY>
VAPID_PRIVATE_KEY=<clave privada generada por web-push>
PUSH_CRON_SECRET=<valor generado con openssl>
```

Carga los valores en el proyecto remoto:

```bash
pnpm exec supabase secrets set --env-file .env.functions.local
```

`APP_ORIGINS` acepta orígenes separados por comas, con protocolo y sin `/` final. Solo deben incluirse dominios autorizados para llamar a las Edge Functions desde un navegador.

El workflow realiza este paso automáticamente. El comando manual es útil para una configuración inicial o recuperación. Supabase proporciona automáticamente `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` a sus Edge Functions; no es necesario declararlas manualmente.

### Valores reutilizados

| Origen                               | Destino                                                                 | Regla                                                    |
| ------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `VAPID_PUBLIC_KEY` en GitHub         | `VITE_VAPID_PUBLIC_KEY` en el build y `VAPID_PUBLIC_KEY` en Supabase    | GitHub Actions crea ambos destinos desde un único valor. |
| `SUPABASE_URL` en GitHub             | `VITE_SUPABASE_URL` en el build y `SUPABASE_URL` automática en Supabase | La URL del mismo proyecto.                               |
| `SUPABASE_PUBLISHABLE_KEY` en GitHub | `VITE_SUPABASE_PUBLISHABLE_KEY` en el build                             | GitHub Actions crea el alias público.                    |
| `PUSH_CRON_SECRET` en Supabase       | Autorización del cron/Vault                                             | Exactamente el mismo secreto aleatorio.                  |

La clave pública VAPID puede exponerse. `VAPID_PRIVATE_KEY`, `PUSH_CRON_SECRET` y `SUPABASE_SERVICE_ROLE_KEY` son secretos y nunca deben incorporarse al frontend ni guardarse en Git.

# biblical-challenge-frondend
