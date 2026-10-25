# Pantallas de detalle — composición adaptable (React + MUI)

## Alcance y principio clave

Usar esta referencia al **consultar, visualizar o editar el detalle de una entidad** (proyecto, usuario, solicitud, propiedad, documento, etc.). La lámina de «Rediseño Web» es una **referencia de jerarquía visual y de bloques, NO un template obligatorio ni un contrato de datos**. No es necesario reproducir todos sus bloques, su orden exacto, número de columnas, nombres, tabs, tarjetas o acciones. Se debe conservar la identidad de la skill y organizar la página alrededor de la información y las tareas reales de esa entidad. No añadir información, acciones, tabs ni secciones vacías solo porque aparecen en la imagen.

## 1. Jerarquía recomendada (de arriba hacia abajo)

1. **Shell existente**: sidebar + topbar del producto, sin duplicarlas dentro del detalle. Consultar `layout-shell.md` solo si hay cambios en estas zonas.
2. **Contexto y retorno**: breadcrumb `Inicio / Módulo / Registro` y vuelta al listado mediante enlace o botón accesible. Mantener consistente el historial de navegación.
3. **Encabezado de entidad**: icono/avatar opcional, título identificable (nombre, código o ID), descripción corta opcional, `Chip` de estado si existe, metadatos clave y acciones según permisos. Acción principal visible; secundarias agrupadas, destructivas separadas y confirmadas mediante `Dialog`.
4. **Navegación interna (opcional)**: `Tabs` cuando existan varias áreas sustancialmente distintas (Resumen, Actividad, Archivos, Historial...). Evitar tabs para dos fragmentos pequeños que caben en un mismo resumen. No inventar pestañas.
5. **Resumen rápido (opcional)**: de 2 a 4 KPIs compactos cuando aporten contexto decisivo (progreso, responsable, fecha, saldo, miembros). No redundar con el cuerpo del detalle.
6. **Contenido principal**: bloques por significado y frecuencia de uso; información primaria con mayor prominencia. Dividir en secciones con un encabezado y contenido legible; evitar un único card enorme sin jerarquía.
7. **Contenido complementario (opcional)**: actividad, documentos, estado, hitos, timeline, enlaces, acciones relacionadas. Columna secundaria en desktop solo si hay suficiente contenido; en móvil se apila bajo lo principal.

## 2. Inventario de bloques referenciales

| Bloque | Cuándo usarlo | Contenido y composición | MUI sugerido |
|---|---|---|---|
| Información general | Datos descriptivos del registro | Título, pares label/valor agrupados, estado, responsables, fechas | `Card`, `CardContent`, `Typography`, `Stack`, `Grid`, `Divider`, `Chip` |
| Descripción | Texto largo o notas | Párrafos y saltos legibles, acciones si proceden | `Card`, `Typography` |
| Indicadores de resumen | Métricas útiles | Valor prioritario, etiqueta, icono y unidad; sin inventar cálculos | `Card`, `Stack`, `LinearProgress` |
| Estado y progreso | Entidades con flujo/avance | Estado, porcentaje, hitos y fechas; semántica real | `Chip`, `LinearProgress`, `Stepper` o timeline implementado con MUI disponible |
| Relaciones y participantes | Usuarios, equipo, cliente o entidades relacionadas | Avatares, nombre, rol, enlace según permisos | `Avatar`, `AvatarGroup`, `List`, `Link` |
| Documentos y adjuntos | Hay archivos reales | Nombre, tipo, fecha, tamaño disponible, acciones autorizadas | `List`, `ListItem`, `IconButton`, `Menu` |
| Actividad e historial | Existe trazabilidad | Evento, fecha, autor y cambios, orden cronológico | `List`, `Divider` o timeline si está instalado |
| Etiquetas y clasificación | Existen categorías/etiquetas | Valores agrupados sin exceso visual | `Chip`, `Stack` |
| Información geográfica | La entidad tiene dirección | Dirección legible, datos estructurados y mapa solo con integración real | `Card`, `Stack`; mapa según `form-fields.md` |
| Datos extensos | Muchos campos, tablas o relaciones | Secciones expandibles o tablas solo cuando aportan escaneo | `Accordion`, `Table`/`DataGrid` si existe |

**Selección de bloques:** mantener únicamente los que correspondan al caso y sustituir o agregar otros cuando el dominio lo requiera. No presentar cada bloque como obligatorio.

## 3. Composición visual MUI

- **Fondo:** canvas azul pálido del shell; secciones en `Paper`/`Card` blancas, radios y sombras desde el tema; títulos navy y acciones primarias azules.
- **Espaciado:** utilizar `theme.spacing` y `Grid`/`Stack`; separación constante entre breadcrumb, encabezado, navegación y paneles. Usar `sx` solo para layout local; evitar colores y medidas duplicados en cada pantalla.
- **Desktop:** contenido principal flexible (~65–75%) y columna auxiliar (~25–35%) **solo si** hay contenido secundario real; posibilidad de una columna completa para registros simples. Grid de KPIs de 2 a 4 según espacio.
- **Tablet:** ajustar columnas y reducir tarjetas por fila sin comprimir labels; panel auxiliar puede desplazarse abajo.
- **Móvil:** una columna, datos label/valor apilados, tabs desplazables si son necesarios, acciones accesibles en menú, sin overflow horizontal global.
- **Bloques:** encabezado de sección (título e icono opcional) + acción contextual solo si existe + cuerpo. Dividir visualmente grupos internos; evitar cards anidadas sin motivo.
- **Datos de lectura:** mostrar label con menor contraste y valor con mayor énfasis. Fechas, importes y estados con formatos consistentes; vacíos como «No disponible» o `—`, nunca rellenados inventando datos.
- **Estados de carga:** `Skeleton` alineado con secciones reales; error general con recuperación; registro inexistente y permisos denegados con vista clara; contenido vacío con explicación y acción útil si corresponde.

## 4. Acciones y edición

- Respetar capacidades y permisos reales. Botón principal (`Button contained`) al extremo derecho del encabezado si aplica; secundarias (`outlined`/`text`) y `Menu` para overflow.
- Edición breve y acotada: `Dialog` accesible; edición extensa: página o flujo dedicado cuando un modal resulte incómodo. Usar los campos de `form-fields.md` únicamente si realmente hay formularios.
- Acciones destructivas o de riesgo: `Dialog` con consecuencias claras y botones Cancelar/Confirmar; errores/warnings globales accionables en `Dialog`, errores por campo inline; consultar `alertas-modales.md` solo para esas tareas.
- Toda acción necesita feedback, loading, disabled cuando corresponda y manejo de errores. No simular funcionamiento de enlaces, descargas o botones.

## 5. Criterios para elegir la disposición (sin imponer plantilla)

1. Identificar el objetivo del usuario al abrir el registro: consultar, validar, decidir, editar o auditar.
2. Priorizar la información crítica para ese objetivo antes de contenido complementario.
3. Agrupar por significado: identidad y datos básicos; estado o progreso; participantes; documentos; seguimiento o historial.
4. Elegir **una columna** para detalles cortos o lectura lineal, **dos columnas** si el panel auxiliar aporta contexto constante, y **tabs** si hay varias áreas extensas que conviene separar.
5. Omitir KPIs, progreso, timeline, tabs, sidebar auxiliar o mapas cuando no existan datos o casos de uso reales.
6. Asegurar coherencia con el listado de origen: mismo nombre, estado, acciones y formatos; no cambiar la semántica del registro.

## 6. Ejemplos de adaptación

- **Detalle de proyecto:** identidad, estado, progreso, información, tareas/documentos, hitos; tabs solo con módulos funcionales.
- **Detalle de usuario:** identidad, roles/estado, contacto, permisos y actividad; no mostrar progreso artificial.
- **Detalle de solicitud:** identidad, estado de trámite, información declarada, documentos, evaluaciones y bitácora; priorizar decisiones y evidencias.
- **Detalle de propiedad:** resumen, ubicación, atributos, fotos, documentos e historial; mapa únicamente con proveedor disponible.

Estos son **ejemplos de selección de bloques**, no requisitos obligatorios para todos los productos.

## 7. Checklist para agentes

- [ ] Se eligieron los bloques por los datos y objetivos reales, no copiando literalmente la lámina.
- [ ] Se mantiene el shell y el tema MUI existentes sin duplicados.
- [ ] Breadcrumb, título, identidad/estado y acciones visibles si aplican.
- [ ] El contenido está agrupado semánticamente y el primer bloque contiene lo más relevante.
- [ ] No se crearon KPIs, tabs, mapas, timeline, botones o valores ficticios.
- [ ] Acciones y permisos correctos; advertencias importantes usan diálogos interactivos.
- [ ] Loading, vacío, error, responsive, foco y navegación por teclado contemplados.
- [ ] Consistencia con los valores y estados del listado; verificaciones ejecutadas documentadas.
