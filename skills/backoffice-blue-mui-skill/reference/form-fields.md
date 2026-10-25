# Campos de formulario — composición y variantes MUI

## Alcance y activación

Leer este archivo **solo** al crear, modificar o revisar formularios, filtros editables, validación de campos, controles de fechas/horas, teléfono o dirección/mapa. Reutilizar los controles del proyecto y su tema. Esta referencia describe **el inventario visual que la skill debe soportar**, no obliga a construir componentes nuevos si ya existen.

**Referencia visual:** `material_ui_field_variants_showcase.png` de la conversación. El objetivo es respetar su jerarquía, alineación, densidad, tipografía y azul Ofices; la imagen es una maqueta y no garantiza pixel-perfect ni validez de todos los datos de ejemplo.

## 1. Anatomía de cada field (obligatoria)

```text
FormControl (fullWidth, minWidth: 0)
├── Label visible encima del control [requerido: * + texto accesible]
├── Input / Selector (misma altura, iconos consistentes)
├── HelperText (guía o error, espacio reservado cuando haga falta)
└── Estados: normal | filled | focused | error | disabled | readOnly
```

- Preferir **labels visibles arriba**, no placeholders como única etiqueta. Izquierda alineada; el campo se expande al ancho de su columna.
- Densidad: `size="small"`; altura visual de inputs simples **40–44 px**, mínimo táctil interactivo 44 px cuando aplique; padding horizontal 12–14 px; borde 1 px `divider`; radio 8–10 px. Overrides centralizados en tema/tokens.
- Espaciados visuales: label-control 6 px; control-helper 4–6 px; separación vertical entre grupos 16–20 px; horizontal 16 px. Tipografía label 12–13 px medium; texto/control 13–14 px; helper 11–12 px.
- Fondo `background.paper`, texto `text.primary`, placeholder `text.muted`; iconos azul grisáceo; `focus`: borde `primary.main` y foco discernible; `error`: borde `error.main` y texto/icono de error; `disabled`: fondo gris azulado y opacidad moderada manteniendo legibilidad.
- Estados visuales **básicos obligatorios** en el catálogo de referencia: `default` (vacío), `filled`, `focus`, `error`, `disabled`. Añadir `readOnly`, `loading`, `required` cuando la necesidad real lo amerite. Validación accesible con `aria-invalid`, `aria-describedby` y `FormHelperText`; no usar solo color.
- Iconos al principio/final según significado, con botones reales y `aria-label` para acciones (revelar contraseña, limpiar, abrir calendario).

## 2. Inventario de campos que deben estar cubiertos

| Tipo canónico | Composición visual requerida | Control MUI / dependencia |
|---|---|---|
| **Text field** (`field`) | Label + input de texto + placeholder/helper | `TextField` o `FormControl` + `OutlinedInput` |
| **Password field** | Label + input oculto + acción mostrar/ocultar a la derecha | `TextField` + `InputAdornment` + `IconButton`; `type=password/text` |
| **Phone field** | Label + selector país/código + bandera opcional + número, validación de formato | composición `FormControl` + `Select`/autocomplete país + `TextField`; no asumir máscara o lib preinstalada |
| **Select field box** | Label + select con flecha + opción seleccionada + placeholder | `Select` + `MenuItem` o `TextField select`; `Autocomplete` para searchable/multiple |
| **Date field** | Label + fecha + icono de calendario + picker | `DatePicker` de MUI X **solo si está instalado**; `TextField` nativo `type=date` como alternativa |
| **Time field** | Label + hora + icono de reloj + picker | MUI X `TimePicker` **si está instalado**, o `type=time` |
| **Range fields** | Dos campos con labels `Desde` / `Hasta`; rango numérico o de fechas | `Grid`/`Stack` + 2 `TextField`/`DatePicker`; `DateRangePicker` solo si existe/licencia disponible |
| **Map field** (`map`) | Label `Ubicación` + buscador/dirección + icono pin y acción limpiar + **vista previa del mapa** | input MUI + adaptador del mapa **existente**; no suponer API, key o servicio |
| **Map group** | Bloque cohesivo: Dirección, Ciudad, Estado/Provincia, Código postal y **mapa vinculado** | `Grid` + campos MUI + mapa existente; sincronización geocodificación solo con servicio disponible |

**Nombres:** en la guía usar `map` para campo único de ubicación y `map group` para conjunto de dirección. No confundir con `Map` de JavaScript. Los controles numéricos del rango deben admitir `min/max`, unidades y decimales según necesidad real.

## 3. Composición por familia (fidelidad visual)

### Básicos: text, password, phone y select

- Mostrar cada campo en **cinco columnas** en una lámina de variantes (Default / Filled / Focus / Error / Disabled). **En formularios reales no duplicar el campo cinco veces**; representar solo el estado actual.
- Password: `IconButton` ojo, alterna visibilidad sin perder foco; nunca revelar por defecto ni imprimir la contraseña en logs.
- Phone: prefijo de país visualmente integrado en una sola línea (separador sutil). Guardar/validar teléfono según requisitos del producto, preferiblemente formato internacional; respetar locales.
- Select: dropdown sobre el contenido, indicador `ChevronDown`, valor visible y soporte empty/loading/no options cuando aplique.

### Fecha, hora y rangos

- Date / Time: presentar dos bloques equilibrados sobre desktop, cada uno con sus cinco estados en referencia; **formatos legibles según localización**; no hardcodear una fecha inválida en el producto (la lámina de error es solo ilustrativa).
- Range: `Desde` y `Hasta` juntos, ancho equivalente; error si `desde > hasta`; ajustar `minDate/maxDate` según dominio. En móvil apilar verticalmente.
- Fecha y hora deben ofrecer entrada por teclado cuando el componente lo permita; no depender solo del popup.

### Map y Map group

- Map individual: **input de ubicación a la izquierda, mini mapa a la derecha** en desktop; pantalla pequeña apilada. El pin del mapa debe corresponder a una coordenada real resuelta o a la selección explícita; ningún marcador inventado.
- Map group: **formulario de dirección 60% aprox. / vista del mapa 40% aprox.** desktop. Dirección en ancho completo de la columna; debajo, Ciudad / Estado / Código postal en tres columnas cuando haya espacio. Vista del mapa alineada a la altura del grupo.
- Sin integración de mapas configurada: representar estado vacío con texto claro («Selecciona una ubicación para visualizarla») o placeholder explícito de desarrollo; **no simular mapa activo ni afirmar geocodificación**.
- Si se permite elegir punto del mapa, reflejar coordenadas y dirección solo tras resolver los datos; mostrar loading/error apropiados.

## 4. Cómo diseñar formularios reales

```text
Card / sección de formulario
├── Título + explicación opcional
├── Grid responsive: desktop 2 columnas; tablet 2/1 según ancho; mobile 1
│   ├── FormControl (label, control, helper/error)
│   └── FormControl (label, control, helper/error)
├── Campo compuesto map/map group o range ocupa ancho necesario
└── Acciones alineadas a la derecha: Cancelar (secondary) · Guardar (primary)
```

- Reutilizar `Grid`, `Stack`, `FormControl`, `TextField`, `Select`, `InputAdornment`, `IconButton`, `FormHelperText`; preservar API de los componentes actuales.
- Formulario dentro de `Dialog`: usar `DialogTitle`, `DialogContent`, `DialogActions`, scroll interno cuando sea necesario y foco inicial correcto. Errores de cada campo **inline**; error de guardado global o advertencia que exige decisión → modal interactivo, siguiendo `alertas-modales.md` cuando corresponda.
- Acciones principales al final, evitar submit por doble clic mientras loading; no perder datos del formulario en errores.
- Soportar teclado, tabulación coherente, elementos con nombre accesible, foco visible y errores anunciados.

## 5. Integración correcta en el tema MUI

- Colores, tamaño, bordes, background y estados se ajustan en la fuente de tokens y `theme.ts` vía `MuiTextField`, `MuiOutlinedInput`, `MuiFormLabel`, `MuiFormHelperText`, `MuiSelect`, `MuiInputBase`, `MuiIconButton` y controles de MUI X **únicamente cuando se usen**.
- `MuiTextField` puede establecer `defaultProps: { size: 'small', fullWidth: true, variant: 'outlined' }`; confirmar que no rompe los componentes existentes.
- No fijar colores `#hex` repetidos en cada pantalla ni mezclar `filled` de MUI (`variant="filled"`) con el **estado filled** del catálogo (campo con valor). El estilo general de la UI es `outlined`.
- Componentes `DatePicker`/`TimePicker` necesitan `LocalizationProvider` y adaptador instalado; no instalar paquete ni activar servicios sin requisito expreso.
- No establecer estilos directamente sobre todos los `input` HTML sin considerar efectos colaterales; preferir overrides acotados.

## 6. Criterios de aceptación por la IA

- [ ] Hay cobertura visual/funcional para los **9 tipos**: text, password, phone, select, date, time, range, map, map group.
- [ ] Cada tipo soporta estados relevantes; la **guía visual** documenta default, filled, focus, error, disabled.
- [ ] Todos muestran label visible y helper/error accesible; foco y error distinguibles.
- [ ] Contraseñas pueden ocultarse/revelarse; teléfono incluye prefijo; select indica desplegable.
- [ ] Campos date/time respetan localización; rangos verifican consistencia.
- [ ] Mapas solo activados si hay infraestructura real; mapa y dirección se mantienen consistentes.
- [ ] Los campos ocupan el ancho de su celda, respetan el grid y no desbordan en móvil.
- [ ] Preferencia por tema MUI y reutilización sobre nuevos componentes.
- [ ] Errores de campo se muestran inline; warnings/errores de operación que requieren acción se manejan en `Dialog`.

> Prioridad: requerimiento funcional → implementación existente y tokens → este patrón visual → defaults de MUI.
