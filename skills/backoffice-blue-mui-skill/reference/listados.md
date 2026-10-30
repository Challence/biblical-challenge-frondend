# Listados: composición visual de referencia

## 9. Patrón visual obligatorio — pantallas de listado (referencia «Proyectos»)

> **Aplicación:** todos los listados administrativos (Usuarios, Proyectos, Tareas, Documentos, etc.) deben utilizar esta misma **composición visual y jerarquía**. Cambia únicamente los campos, filtros, estados y acciones que requiera el dominio. La imagen es referencia de apariencia, **no un contrato de datos ni una medida obtenida de Figma**. Las dimensiones son objetivos aproximados para desktop de 1536×1024; ajustarlas proporcionalmente según viewport.

### 9.1. Orden de bloques — NO ALTERAR

```text
┌─────────────────┬───────────────────────────────────────────────────────┐
│ SIDEBAR         │ TOPBAR (búsqueda global · notificación · perfil)       │
│ 264 px          ├───────────────────────────────────────────────────────┤
│                 │ Breadcrumb: Inicio › Proyectos                         │
│ Logo            │ Título + subtítulo            [ + Nuevo Proyecto ]   │
│ Navegación      ├───────────────────────────────────────────────────────┤
│ Proyectos ACTIVO│ BANDA DE FILTROS                                     │
│                 │ [Buscar...] [Estado] [Categoría] [Miembros]          │
│                 │ [Fecha de inicio]  Limpiar filtros                    │
│                 ├───────────────────────────────────────────────────────┤
│ Configuración   │ CARD DE LISTADO                                      │
│                 │ Total de proyectos: 36   [Exportar] [Vista] [Orden]  │
│                 │ [ ] Nombre | Estado | Categoría | Miembros | Fechas  │
│                 │ [ ] Fila con ícono, descripción, chips, barras ...   │
│                 │ ...                                                   │
│                 │ Mostrando 1–10 de 36       [‹] [1] [2] [3] [4] [›]   │
└─────────────────┴───────────────────────────────────────────────────────┘
```

**Regla de composición:** en una vista de listado NO usar el panel lateral de acciones y actividad propio del dashboard. Dedicar el ancho principal a filtros y tabla; conservar exactamente el mismo sidebar, topbar, fondo y superficies.

### 9.2. Layout y distancias

| Zona                       | Especificación desktop                                                                |
| -------------------------- | ------------------------------------------------------------------------------------- |
| Sidebar                    | `264px`; degradado azul existente; ítem activo translúcido, radio `10–12px`           |
| Topbar                     | `78px`; buscador global a la izquierda; notificaciones y usuario a la derecha         |
| Lienzo principal           | Gradiente azul muy pálido, padding horizontal `28–32px`                               |
| Breadcrumb                 | Sobre el título; tipografía de `13–14px`; separación inferior `8–12px`                |
| Encabezado de página       | H1 **Proyectos** `32–34px/700` navy; subtítulo `15–16px` azul grisáceo                |
| CTA «Nuevo Proyecto»       | Alineado a la derecha del encabezado, azul primario, alto `44–48px`, ícono `+`        |
| Separación entre secciones | `16–20px` (encabezado → filtros → tabla)                                              |
| Banda de filtros           | Sin `Card`/`Paper` envolvente; grilla responsive con separación del layout            |
| Card de tabla              | Blanca, mismo radio/sombra; toolbar interior; contenedor de tabla y pie de paginación |
| Controles                  | Alto objetivo `42–44px`, radios `10–12px`; labels de filtros visibles                 |

### 9.3. Banda superior de filtros

- Presentar **una sola banda horizontal de filtros** en desktop: búsqueda contextual al inicio (más ancha), seguida de Estado, Categoría, Miembros y rango de fechas. La grilla ocupa cinco columnas en desktop y tres en tablet; en móvil se adapta a una columna. «Limpiar filtros» es una acción de texto azul al extremo derecho.
- No integrar los filtros dentro de `Card` o `Paper`. En móvil mostrar únicamente el buscador y un botón de filtros cuando existan filtros adicionales; esos filtros adicionales se abren en un `Dialog`/`Drawer` accesible. Si el listado solo tiene búsqueda, no renderizar botón de filtros.
- Buscar global del topbar ≠ buscar registros: ambos deben tener ámbitos distintos. El buscador de lista afecta solamente a la lista mostrada.
- Cada `Select`/fecha tiene label visible arriba; inputs con fondo blanco, borde `#DCE8FA`, iconos finos azules.
- La banda de filtros NO debe contener estadísticas KPI, gráficos ni botones primarios adicionales.
- Usar MUI `TextField`, `FormControl`, `Select`/`Autocomplete` y date picker **solo si ya está instalado**; de lo contrario reutilizar control de fecha existente.
- Filtros funcionales, combinables, con estado visible, acción de limpiar y sincronización con paginación (volver a página 1 cuando cambien). Si hay URL state existente, respetarlo.

### 9.4. Card de listado y tabla

**Toolbar de tabla:** primera línea `Total de proyectos: N` a la izquierda. A la derecha: `Exportar` con ícono de descarga (outlined), selector/cambio de vista **solo si existe función real**, y orden predeterminado `Más recientes` (outlined). No mezclar estos controles con filtros superiores.

**Columnas de la referencia, en este orden:**

1. Checkbox de selección (cabecera y por fila).
2. Nombre con ícono circular pastel, título en navy **semibold**, subtítulo de una línea en azul grisáceo.
3. Estado como `Chip` de fondo pastel y texto semántico: **En proceso** azul, **Completado** verde, **Pendiente** violeta, **En pausa** naranja.
4. Categoría como chip neutro o de acento tenue.
5. Miembros como avatares circulares solapados (`AvatarGroup`) y contador `+N` de sobrantes.
6. Fecha de inicio con formato local claro.
7. Fecha de fin.
8. Progreso: barra horizontal fina y valor porcentual a la derecha (azul, verde, violeta o naranja según estado).
9. Acciones: `IconButton` de tres puntos verticales; menú contextual anclado a la fila.

**Reglas visuales estrictas:**

- Header de tabla azul muy pálido `#F4F8FF`; tipografía de `12–13px`, semibold y texto secundario.
- Filas blancas de altura objetivo `48–56px` (aumentar cuando la densidad de contenido lo exija); líneas separadoras `#E7EFFB`. No usar zebra-striping de colores fuertes.
- Texto primario de celdas `13–14px` navy, descripciones `11–12px` solo si siguen siendo legibles y accesibles; preferir `12–13px`.
- Chips compactos (alto objetivo `24px`, radio `7–8px`) y progresos de `8px` con track `#E1E9F5`.
- Progreso y estado deben provenir de los datos reales y ser coherentes: no colorear arbitrariamente ni asumir que un progreso de 100% equivale a estado completado salvo que la regla de negocio lo indique.
- Ordenamiento solo en columnas soportadas; `TableSortLabel` con indicador de dirección y `aria-sort` adecuado.
- Checkbox «seleccionar todo» funciona sobre el conjunto definido por producto (página actual o todos filtrados); comunicar su alcance. Las operaciones masivas aparecen únicamente cuando hay seleccionados.
- Los tres puntos deben abrir acciones reales como Ver, Editar o Eliminar **si están permitidas**; confirmar acciones destructivas.
- No inventar avatares, estadísticas, fechas, categorías o proyectos en producción. Usar placeholders adecuados cuando falte información.

### 9.5. Pie y paginación

- Dentro de la misma card, en el pie: `Mostrando X–Y de N proyectos` alineado a la izquierda y paginación compacta alineada a la derecha.
- Página activa como botón azul sólido con texto blanco; demás páginas blancas con borde claro y texto navy. Flechas anterior/siguiente.
- Mantener filtros y orden al cambiar de página. Soportar total `0`, última página parcial y páginas inválidas después de filtrar.
- Preferir `TablePagination`/`Pagination` MUI según la UX existente, con estilos del tema. Nunca duplicar controles de paginación.

### 9.6. Mapeo a MUI y tema global

| Fragmento visual    | MUI preferido                                                                         |
| ------------------- | ------------------------------------------------------------------------------------- |
| Shell               | `Drawer`, `AppBar`, `Toolbar`, `Box`                                                  |
| Breadcrumb y header | `Breadcrumbs`, `Typography`, `Stack`, `Button`                                        |
| Filtros             | `Box`/grilla, `TextField`, `FormControl`, `Select`, `Autocomplete`, `Button`          |
| Tabla               | `Paper`, `TableContainer`, `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell` |
| Orden y selección   | `TableSortLabel`, `Checkbox`                                                          |
| Contenido de filas  | `Avatar`, `AvatarGroup`, `Chip`, `LinearProgress`, `Typography`                       |
| Acciones            | `IconButton`, `Menu`, `MenuItem`                                                      |
| Paginación          | `Pagination` o `TablePagination`                                                      |
| Estados             | `Skeleton`, `Alert`, `Typography`, `Button`                                           |

**Principio obligatorio:** editar el `theme.ts` / tokens para aspecto repetido de tablas, inputs, chips, botones y cards; usar `sx` solo para la ubicación, anchura y responsividad específica. No aplicar estilos generales con selectores frágiles ni crear un nuevo design system.

### 9.7. Responsive del listado

- **Desktop ≥1200px:** filtros en cinco columnas y tabla de ancho completo. La captura es la referencia principal.
- **Tablet 768–1199px:** filtros en tres columnas, acción «Nuevo» junto al título si cabe y tabla con scroll horizontal **interno** (`TableContainer`); no comprimir columnas hasta volverlas ilegibles.
- **Móvil <768px:** sidebar en drawer temporal; título y CTA apilables; mostrar solo el buscador y, únicamente si existen filtros adicionales, un botón «Filtros» que abre un `Dialog`/`Drawer` accesible; tabla con scroll horizontal interno o presentación móvil alternativa solo cuando ya exista patrón de producto. Paginación usable y accesible.
- Nunca introducir scroll horizontal a toda la página ni dejar botones fuera del viewport.

### 9.8. Checklist de fidelidad para agentes

- [ ] El sidebar y la topbar son idénticos a los de dashboard (no nuevas variantes improvisadas).
- [ ] Breadcrumb → header/CTA → banda de filtros → card tabla → paginación respetan exactamente ese orden.
- [ ] La búsqueda de listado es distinta de búsqueda global.
- [ ] Filtros en banda sin `Card`/`Paper`; toolbar de tabla dentro de su superficie propia.
- [ ] Header de tabla azul tenue, filas blancas, divisores discretos.
- [ ] Celdas conservan jerarquía visual: icono, nombre, descripción, chips, avatares, fechas, progreso y menú.
- [ ] Acciones y ordenamiento funcionan según permisos/capacidades reales.
- [ ] Paginación dentro de la card, resumen a la izquierda y páginas a la derecha.
- [ ] Datos y estados de carga, vacío y error conectados correctamente.
- [ ] Responsive probado en desktop/tablet/móvil, sin desbordamiento global.
