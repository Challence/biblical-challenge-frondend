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

### Seguridad

No expongas `SECRET_KEY` ni `SERVICE_ROLE_KEY` al frontend. Estas claves son secretas y deben permanecer exclusivamente en servicios de servidor o en entornos seguros.

# biblical-challenge-frondend
