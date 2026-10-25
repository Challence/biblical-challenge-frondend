# Responsive, estados y accesibilidad

## 5. Responsive

| Ancho | Comportamiento |
|---|---|
| `lg` y superior | Sidebar permanente, cuatro KPI en fila si caben, analítica + panel lateral |
| `md` | Sidebar colapsable/temporal según espacio, KPI en 2 columnas, panel derecho debajo |
| `sm` / `xs` | Sidebar en Drawer temporal, KPI en 1 columna (2 si caben), módulos apilados |

- Usar `theme.breakpoints` y `sx={{ ... }}` responsive, no detección manual del ancho.
- No causar scroll horizontal de la página: las tablas pueden tener scroll horizontal **dentro de su card**.
- Charts fluidos respecto al contenedor, con altura legible; tooltips accesibles o resumen textual de datos.
- El menú móvil debe abrirse/cerrarse realmente, admitir Escape y manejar el foco.

## 6. Estados, interacción y accesibilidad

- Implementar loading con `Skeleton`; empty con mensaje y acción pertinente; error con texto y recuperación; success con feedback discreto.
- Cada campo debe tener label real, helper text/error, y foco visible.
- Estado activo de navegación detectable sin depender solo del color.
- IconButtons con `aria-label`; menús con navegación por teclado; tarjetas no interactivas sin apariencia de botón.
- Contraste de texto de acuerdo con WCAG AA cuando corresponda; no usar pastel claro sobre fondo blanco para texto principal.
- No crear fechas o cifras estáticas de producción. Los filtros, búsqueda, paginación y acciones deben estar conectados a lógica real o permanecer explícitamente inactivos.
