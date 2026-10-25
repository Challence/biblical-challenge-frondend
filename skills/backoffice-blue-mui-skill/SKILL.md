---
name: backoffice-blue-mui
description: Mantener la identidad visual azul del backoffice en React + Material UI; activar al crear o modificar layouts, dashboards, listados, detalles, formularios, autenticación, alertas y modales.
---

# Backoffice azul — Skill compacta para agentes IA

## Objetivo

Aplicar coherentemente la interfaz de referencia **Ofices**: sidebar azul degradado, topbar clara, fondo azul tenue, cards blancas, tipografía navy y Material UI tematizado. Preservar lógica, permisos, rutas, datos y componentes reales del proyecto.

## Reglas no negociables

1. Inspeccionar primero el proyecto y sus versiones: tema MUI, `tokens.json`, componentes, rutas y estilos existentes. **No sobrescribir** una arquitectura vigente.
2. Una sola fuente de estilos: reutilizar `tokens.json` si existe; si no, `theme.ts` y `createTheme`/`ThemeProvider` con overrides. `sx` para composición local, no para replicar tokens.
3. No inventar APIs, datos, permisos, acciones o dependencias. Mock únicamente explícito.
4. Conservar la identidad visual y jerarquía del patrón seleccionado, adaptando sus bloques a la entidad y al contexto. **Las pantallas de detalle son referencias modulares, no layouts rígidos**; ajustar medidas aproximadas a la pantalla.
5. **Errores y warnings globales accionables → `Dialog` interactivo**. Errores de campo → validación inline. Éxitos/info no crítica → `Snackbar`/`Alert`.
6. Responsive, navegación con teclado, accesibilidad y estados loading/empty/error obligatorios.
7. **Carga progresiva del contexto:** abrir únicamente las referencias que requiere la tarea. No leer todo `reference/` por defecto.
8. No introducir una nueva arquitectura de carpetas ni la antigua sección «Sistema de componentes».

## Backoffice con viewport fijo

En el backoffice, el shell debe ocupar el viewport sin generar scroll global:

- El shell usa `height: 100dvh` y `min-height: 0`.
- `html` y `body` no deben tener scroll global; el desbordamiento vertical se resuelve dentro del shell.
- Sidebar, topbar, appbar y bottombar permanecen fijas dentro del shell y no se desplazan con el contenido central.
- Solo el contenedor central de contenido tiene `overflow-y: auto`, `min-height: 0`, `overflow-x: hidden` y `overscroll-behavior: contain`.
- El layout reserva explícitamente el espacio ocupado por `BottomBar` para que el contenido no quede oculto detrás de ella.
- La navegación/sidebar puede tener scroll interno cuando sus elementos excedan el viewport, sin habilitar scroll global.
- Verificar el comportamiento, sin cortes ni scroll horizontal, en viewports de `375`, `768`, `1024` y `1440` px.

## Enrutamiento de referencias: leer solo lo necesario

| Tarea detectada | Referencia mínima |
|---|---|
| Cambiar paleta, tipografía, gradientes, cards u overrides MUI | [`reference/theme-mui.md`](reference/theme-mui.md) |
| Ajustar sidebar, topbar y shell | [`reference/layout-shell.md`](reference/layout-shell.md) |
| Crear o ajustar Dashboard/KPI/gráficos | [`reference/dashboard.md`](reference/dashboard.md) + layout-shell si cambia el shell |
| Crear o ajustar listados, filtros, tablas y paginación | [`reference/listados.md`](reference/listados.md) |
| Crear o ajustar pantallas de detalle, fichas de registros, vista de entidad, descripción e historial | [`reference/detail-pages.md`](reference/detail-pages.md) |
| Crear o modificar Login, Register, Forgot Password o Reset Password | [`reference/authentication.md`](reference/authentication.md) |
| Diseñar o ajustar formularios, inputs, select, password, teléfono, fechas, rangos y mapas | [`reference/form-fields.md`](reference/form-fields.md) |
| Implementar warnings, errores, confirmaciones, toast o modal | [`reference/alertas-modales.md`](reference/alertas-modales.md) |
| Resolver responsive, estados y accesibilidad | [`reference/responsive-accesibilidad.md`](reference/responsive-accesibilidad.md) |
| Revisar entrega y pruebas | [`reference/validacion.md`](reference/validacion.md) |

En autenticación, cargar `authentication.md` y complementar con `form-fields.md` o `alertas-modales.md` solo para cambios que lo requieran. El AuthShell es independiente del shell administrativo. En detalles, cargar `detail-pages.md` y otras referencias solo para funciones implicadas. En formularios, cargar `form-fields.md`; añadir `alertas-modales.md` solo si existen diálogos o validaciones globales accionables. Si hay un problema de color **más** un listado, leer `theme-mui.md` y `listados.md`; no cargar las otras guías salvo que intervengan. Si la tarea involucra más contextos, añadir **solo** sus referencias.

## Flujo de trabajo

1. Clasificar la pantalla/cambio y elegir referencias por la tabla.
2. Revisar implementación actual, fuente de tokens y referencias seleccionadas.
3. Editar lo mínimo indispensable, preferiblemente estilos globales desde el theme.
4. Verificar fidelidad visual, comportamiento, responsive, permisos, estados e interacciones.
5. Ejecutar comprobaciones disponibles (typecheck, lint, tests/build) y reportar únicamente lo ejecutado, archivos cambiados y limitaciones.

### Checklist adicional de validación del shell

- [ ] El shell ocupa `100dvh` y conserva `min-height: 0`.
- [ ] `html` y `body` no presentan scroll global.
- [ ] Sidebar, topbar/appbar y bottombar permanecen fijas mientras se desplaza el contenido.
- [ ] Solo el contenedor central desplaza verticalmente y tiene `overflow-y: auto`, `min-height: 0`, `overflow-x: hidden` y `overscroll-behavior: contain`.
- [ ] El contenido reserva espacio suficiente para `BottomBar` y ningún elemento queda oculto detrás de ella.
- [ ] La navegación/sidebar puede desplazarse internamente cuando excede el viewport.
- [ ] El shell se valida en `375`, `768`, `1024` y `1440` px, sin scroll horizontal ni cortes.

## Prioridad en conflictos

Requerimiento del usuario → tema/tokens y patrones existentes del proyecto → referencia de esta skill → defaults MUI. Mantener invariantes de negocio y seguridad.

> Los diseños compartidos son referencias visuales; algunos tamaños son aproximaciones, no medidas exactas de Figma.
