# Alertas, notificaciones, popups y modales (MUI)

## Regla de decisión obligatoria

**Priorizar `Dialog` interactivo para errores y advertencias de alcance global que bloquean o requieren una decisión o acción explícita del usuario.** No usar un toast temporal como única explicación de un fallo bloqueante. Evitar sobreutilizar modales ante errores de validación local o notificaciones no críticas.

| Evento | Patrón MUI | Comportamiento esperado |
|---|---|---|
| Éxito de una operación | `Snackbar` + `Alert` | Breve, no bloquea, autoocultar cuando sea apropiado |
| Información no crítica | `Alert` inline o `Snackbar` | Contextual y discreta |
| Error de un campo | `TextField` `error` + `helperText` | Junto al campo, conservar valores y foco |
| Advertencia bloqueante / datos faltantes de varios campos | `Dialog` warning | Explicación clara, lista concreta y botón «Revisar» |
| Fallo global de guardado, carga o servidor que exige intervención | `Dialog` error | «Cerrar» y «Reintentar» cuando exista una acción segura |
| Eliminación o cambio irreversible | `Dialog` confirmación | Consecuencias claras, «Cancelar» y acción destructiva |
| Formulario extenso | `Dialog` formulario (si el flujo existente lo admite) | Campos con validación inline y footer fijo si hay scroll |
| Detalles de un registro | `Dialog` grande (si no corresponde navegación a página) | Tabs/secciones, máximo ancho, scroll interior |

## Estructura visual del Dialog

1. Backdrop azul oscuro semitransparente sobre página existente; no reemplazar el fondo del dashboard.
2. Contenedor blanco, radio **16px**, sombra elegante, ancho `min(100% - 32px, 440px)` para diálogos simples; `maxWidth="md"` o `lg` para detalles/formularios según contenido.
3. Encabezado con icono semántico en círculo suave: advertencia amarillo/naranja, error rojo, confirmación azul, información azul.
4. Título navy `#091A49` de **18–20px / 700**; descripción secundaria de **13–15px** legible.
5. Área de contenido con listas explícitas de campos faltantes, o detalles de error plegables mediante `Accordion` si aportan valor. No mostrar trazas técnicas ni secretos al usuario final.
6. Pie de acciones alineado a la derecha: acción secundaria outlined + principal contained. Borrado irreversible con color `error`.
7. Botones de alto ~44px y foco visible; separación entre acciones de 8–12px. Cerrar con Escape o X **solo cuando sea seguro**; no cerrar por backdrop si hay datos críticos sin guardar.

## Reglas de interacción

- Errores deben indicar **qué ocurrió, qué se afectó y cómo resolverlo**; no exponer stack traces o códigos sin traducción.
- «Reintentar» solo si existe callback real; bloquear doble envío, presentar estado loading y preservar datos del formulario.
- En confirmaciones, indicar el objeto concreto y consecuencias de la acción; no confirmar implícitamente al cerrar.
- `Dialog` debe ofrecer manejo de foco, navegación por teclado, título accesible y retorno de foco al origen.
- Uso sugerido: `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Alert`, `Snackbar`, `Button`, `CircularProgress`, `Accordion`; personalizar desde theme MUI, no crear CSS aislado incompatible.
- No usar `window.alert`, `window.confirm`, modales HTML improvisados ni toast de error que desaparezca antes de poder actuar cuando el error es bloqueante.

## Ejemplos de copy

**Warning:** «Datos incompletos» / «Faltan: nombre del proyecto, categoría y fecha de inicio.» / `[Cancelar] [Revisar]`.

**Error:** «No se pudo guardar» / «Hubo un problema al registrar los cambios. Comprueba tu conexión o inténtalo nuevamente.» / `[Cerrar] [Reintentar]`.

**Eliminar:** «¿Eliminar Proyecto Alfa?» / «Esta acción no se puede deshacer.» / `[Cancelar] [Eliminar]`.

## Checklist específico

- [ ] Error o warning global accionable abre Dialog, no solo Snackbar.
- [ ] Error de campo permanece inline, sin abrir modal en cada pulsación.
- [ ] Colores y tamaños heredan del tema MUI.
- [ ] Acciones son reales y accesibles; no se muestran callbacks ficticios.
- [ ] Loading, deshabilitado, error persistente, foco y cierre probados.
