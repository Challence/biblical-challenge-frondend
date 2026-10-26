# Guía de trabajo del proyecto

Estas reglas son obligatorias para toda actividad del proyecto.

## Skills de proyecto

- `./.agents/skills/react-behavior-implementation/SKILL.md`: comportamiento e implementación general para proyectos React.
- `./skills/version-observer/SKILL.md`: versionado SemVer por commit y observación no bloqueante de versiones desplegadas.

## 1. Precedencia, ámbitos y planificación

### Jerarquía

- Las instrucciones del sistema y del harness prevalecen sobre esta guía y nunca quedan invalidadas por ella.
- Esta guía es obligatoria después de ellas; una instrucción específica puede restringir, pero nunca relajar, sus mandatos.
- Toda labor de UI/UX debe cargar y seguir `backoffice-blue-mui` **antes** de planificar o modificar interfaces. Si no está disponible, la labor queda bloqueada.
- El plan y la validación deben demostrar el cumplimiento de la jerarquía y de las reglas aplicables.

### Web y API

- Web y API son ámbitos separados: cada plan, fase y tarea declara `Web`, `API` o `Web/API` (solo cuando sea inevitable).
- No se mezclan cambios Web/API en una microtarea. Si una funcionalidad afecta ambos, se crean tareas independientes con dependencias explícitas, manteniendo separadas estructura, convenciones y responsabilidades.

### Evaluación y fases (antes de implementar)

1. Evaluar estado actual y contexto.
2. Identificar objetivo, alcance, restricciones, riesgos y dependencias.
3. Revisar elementos reutilizables.
4. Definir pasos concretos.
5. Organizarlos en fases verificables.
6. Presentar el plan al usuario.

Cada fase declara propósito, resultado comprobable y criterios de término. No comienza una fase dependiente hasta validar su requisito previo. Cuando el trabajo lo permita, el plan usa como máximo dos subagentes; cada uno recibe una tarea puntual, independiente y sin solapamiento de archivos o responsabilidades. Dependencias o conflictos obligan a ejecución secuencial.

### Granularidad

- No se implementa una funcionalidad como una sola tarea grande: se divide en microtareas independientes, pequeñas, comprensibles y verificables.
- Cada microtarea describe un único resultado observable; explicita dependencias y orden; no se cierra sin implementar y verificar ese resultado.

## 2. `todo.md`: contrato y estados

Todas las tareas y microtareas acordadas se registran en `todo.md` antes de implementarse y cada entrada declara su ámbito (`Web`, `API` o `Web/API`). Web y API siempre son tareas separadas. Una tarea se marca inmediatamente tras implementar y verificar su objetivo; las completadas se conservan durante el flujo y solo el usuario puede eliminarlas al final. Los subagentes nunca modifican `todo.md`; el orquestador es el único que marca completadas.

Cada tarea debe ser independiente, no ambigua ni mezclar implementación con refactorización, documentación o correcciones ajenas; incluir resultado observable, alcance, dependencias, criterios verificables y pruebas/comandos aplicables. Si afecta un componente Web global, incluye actualizar catálogo; si elimina API, archivo o componente, incluye migración y verificación de todos sus consumidores. Identificadores: `WEB-###`, `API-###`, `TRV-###`.

```md
- [ ] **WEB-001 — Resultado observable**
  - Ámbito: Web
  - Objetivo: qué debe quedar funcionando.
  - Alcance: módulos/archivos permitidos.
  - Fuera de alcance: cambios prohibidos.
  - Dependencias: tareas previas.
  - Criterios de aceptación: comportamientos observables.
  - Validación: comandos, pruebas y comportamientos.
  - Responsable: Orquestador o subagente.
  - Evidencia: pendiente hasta validación del orquestador.
```

Estados: `[ ]` significa pendiente, bloqueada o en ejecución; `[x]`, completada y verificada por el orquestador. Una bloqueada permanece `[ ]` y documenta causa:

```md
- [ ] **WEB-002 — Nombre** 🚫 Bloqueada
  - Ámbito: Web
  - Bloqueada por: causa concreta.
  - Evidencia: error, comando o dependencia pendiente.
```

Solo se marca `[x]` al cumplir criterios de aceptación, no solo por escribir código. Solo se eliminan tareas completadas del flujo autorizado por el usuario.

## 3. Subagentes: delegación, límites y validación

### Delegación obligatoria

Cuando exista un subagente disponible, toda tarea de implementación se delega tras la evaluación del orquestador: revisar estado/cambios, confirmar registro en `todo.md`, verificar dependencias, reservar archivos/módulos permitidos, detectar trabajo ajeno y fijar aceptación/validación. El subagente recibe una sola responsabilidad sin solapamiento e incluye directorio, resultado, alcance, comportamiento esperado, fuera de alcance, prohibición de modificar `todo.md`, comandos y formato de reporte.

```text
Trabaja en <directorio>.
Implementa únicamente: <resultado observable>.
Alcance permitido: <archivos o módulo>.
Fuera de alcance: <cambios prohibidos>.
No modifiques todo.md. No corrijas fallos ajenos.
Ejecuta: pnpm lint; pnpm typecheck; pruebas específicas.
Reporta: archivos; decisiones; validaciones/resultados; riesgos/bloqueos.
```

### Límites

- Máximo cuatro subagentes simultáneos; solo se paralelizan tareas independientes.
- No comparten archivos. Antes de paralelizar se comparan archivos, módulos, contratos, migraciones, configuración y pruebas; cada compartido queda reservado a uno.
- Contrato compartido modificado por ambas tareas, dependencia directa, conflicto o comportamiento/validación no independientes implica secuencia. La falta de archivos comunes no basta.
- El subagente no amplía alcance ni corrige problemas no solicitados; reporta fallos ajenos.

Antes de lanzar más de uno se registra o comunica:

```md
| Tarea | Responsable | Archivos/módulos reservados | Contratos | Dependencias | ¿Paralela? |
|---|---|---|---|---|---|
| WEB-001 | Subagente Web | `apps/web/...` | TRV-001 | TRV-001 | Sí |
| API-001 | Subagente API | `apps/api/...` | TRV-001 | TRV-001 | Sí |
```

Si no se justifica independencia, la ejecución es secuencial.

### Verificación del orquestador

El reporte no es evidencia suficiente. Después de cada delegación, el orquestador personalmente revisa archivos y alcance, trabajo ajeno, validaciones críticas, criterios de aceptación y, cuando aplique, arquitectura, accesibilidad, catálogo y pruebas; solo entonces marca `todo.md`. Si falla: la tarea sigue pendiente, se documenta evidencia, se conserva el mismo subagente cuando aporte contexto y no se avanza a dependientes.

Una microtarea se cierra solo si: resultado implementado; alcance respetado; pruebas específicas, lint y typecheck pasan; build pasa cuando afecta compilación, rutas o bundle; catálogo actualizado si corresponde; no quedan consumidores de APIs eliminadas; y el orquestador verificó personalmente. Una fase se cierra solo con todas sus microtareas verificadas, validaciones completas del ámbito y sin dependencias bloqueadas. El subagente aporta implementación/evidencia; el orquestador conserva contexto, revisa, valida y autoriza.

## 4. Contrato transversal Web/API

Una funcionalidad de ambos ámbitos se divide en tareas independientes: `TRV-###` define/aprueba contrato; `API-###` implementa/valida API; `WEB-###` implementa/valida Web; `TRV-###` valida integración. La tarea transversal coordina contrato e integración, no absorbe implementaciones.

Web/API solo pueden paralelizarse si el contrato está aprobado, ambas tareas lo consumen sin modificarlo, no se solapan archivos/módulos/migraciones/pruebas, ninguna depende del resultado de la otra y ambas tienen dobles, fixtures o ejemplos para validación aislada.

El contrato especifica cuando aplique: operación, método, ruta, autenticación/permisos, entrada y restricciones, respuesta exitosa, errores/estados, responsabilidades exclusivas de cada ámbito, compatibilidad/versionado/migración y ejemplos/fixtures.

```md
- [ ] **TRV-001 — Contrato de <funcionalidad> definido**
  - Ámbito: Web/API
  - Objetivo: contrato estable para trabajo independiente.
  - Alcance: entrada, respuesta, errores, permisos y ejemplos.
  - Fuera de alcance: implementación Web/API.
  - Dependencias: ninguna.
  - Criterios: API sin decisiones pendientes; Web prueba con fixtures/dobles.
  - Validación: coherencia, éxito/error y aprobación antes de consumidores.
```

Ningún subagente cambia unilateralmente un contrato aprobado. Ante cambio: detener consumidores afectados; evaluar impacto Web/API; actualizar contrato, dependencias y aceptación; comunicar a ambos responsables; reanudar y revalidar. La validación transversal no sustituye las de cada ámbito: primero Web y API por separado, después integración.

## 5. Reglas Web

### Alcance, arquitectura y dependencias

Cada elemento se ubica en el ámbito mínimo correcto: global solo con consumidores demostrados en más de un módulo; módulo si solo se comparte allí; junto al elemento si es exclusivo, cuando la estructura lo permita. Antes de crear/mover se justifica el alcance por consumidores actuales/previsibles. Esto aplica a componentes, páginas, layouts, hooks, utilidades, modelos, interfaces y tipos.

```text
root/app/
├── router.tsx
├── shared/{components,models,utils,hooks}
└── features/<module>/
    ├── routes
    ├── shared/{components,models,utils,hooks}
    └── pages/
        ├── shared/{components,models,utils,hooks}
        └── edit/{shared/{components,models,utils,hooks},EditPage.tsx}
```

- No crear `src/features`, `src/pages`, `src/entities` ni `src/shared` fuera de `src/app`.
- `app/features/dashboard` posee `/`; no crear módulo global `pages` para ella.
- `app/router.tsx` solo compone rutas de módulos, composición global y estados de navegación; no contiene presentación de feature.
- `app/shared` solo sirve a varios módulos; una feature puede depender de él, nunca al revés. Una feature no importa internals de otra: usa contratos públicos.
- `routes` define rutas del módulo; su `shared` sirve al módulo; `pages/shared`, a sus páginas; cada página mantiene su componente principal y `shared` interno. La estructura puede ampliarse respetando alcance.
- Layouts transversales van en `app/layouts`, no en una página. Los barrel files (`index.ts`, `index.tsx` y equivalentes) están prohibidos: usar imports directos.

### Componentes: única jerarquía normativa

La selección obligatoria, sin saltar niveles, es: **1) componente propio existente → 2) adaptar, componer o envolver uno propio en el ámbito mínimo → 3) MUI directo (vanilla) solo sin alternativa propia → 4) componente nuevo solo si nada anterior resuelve**.

Antes de implementar UI se buscan/revisan componentes propios y se registran en el plan los descartados y motivos. No se reemplaza, duplica ni elude uno propio con MUI, HTML/CSS/JSX manual u otra implementación. El uso directo de MUI exige justificar en el plan la ausencia de una alternativa propia; un componente nuevo exige además justificar por qué no sirven propio/adaptación/MUI. Un componente genérico nuevo requiere informar al usuario antes, con propósito y ubicación; solo es genérico si prevé uso en varias pantallas/flujos/módulos. No se generaliza lo exclusivo de un módulo.

Se respetan capas: un base no incorpora variante/estilo/regla de módulo; una variante exclusiva compone un especializado/wrapper en el módulo, con solo personalización y comportamiento propios, sin duplicar markup/estilos/lógica; no se globaliza sin consumidores reales en más de un módulo. Un nuevo base solo procede si ningún existente se adapta sin perjudicar su responsabilidad.

Los componentes base representan comportamientos reutilizables; casos puntuales usan especializados que los componen. Se comprueba composición antes de crear; se expresan responsabilidades y se evita duplicación. Deben ser pequeños, especializados, manejables y testeables; se fragmentan responsabilidades independientes con entradas/resultados claros, sin abstracciones artificiales.

### Estado y composición React

Elegir siempre el mecanismo de menor alcance: estado local para una instancia; hooks personalizados para comportamiento/lógica reutilizable; Context para un conjunto cercano que comparte datos; Redux para información coordinada entre módulos/páginas. `useEffect` solo sincroniza con sistemas externos (browser API, suscripción, widget o servicio); valores derivados se calculan al render y acciones en eventos. No elevar a Context/Redux si cabe en componente, página o módulo.

### Componentes globales y catálogo

Todo componente nuevo en `app/shared/components` entra al catálogo, con propósito, variantes, API, estados aplicables y ejemplos. Cuando aplique, documenta normal, hover, focus visible, active, disabled, loading, error, vacío y sin permisos. Componente global, catálogo y pruebas son obligatorios; la tarea no termina sin los tres. El catálogo es de desarrollo/revisión visual, no navegación productiva; no se globaliza solo para catalogarlo.

### Fields

```text
app/shared/components/fields/{base,rhf}/
```

`base` es independiente de RHF, Context, Redux, HTTP y negocio; gestiona presentación, interacción, accesibilidad y estados por props explícitas, con pruebas propias. `rhf` compone un base existente, sin duplicar markup/estilos/comportamiento, y solo conecta `name`/`control`, valor/eventos y validaciones/errores. Si falta base, se crea y valida antes del adaptador. Lógica remota, búsqueda, transformación y reglas específicas van en hooks/componentes especializados, no en base. No coexisten dos APIs globales para el mismo field; consumidores usan `fields/base` y `fields/rhf`.

### Espaciado y UI/UX

- Usar tokens del tema y escala 4/8: `0, 4, 8, 16, 24, 32, 40, 48, 64`; en MUI preferir `p`, `m`, `gap`, `Stack`, grid y breakpoints/tokens frente a píxeles/media queries duplicados.
- Valores fuera de escala requieren justificación técnica/visual. Preferir `gap`/`Stack`/grid; componente sin márgenes externos: el layout separa, componente conserva espacio interno.
- Priorizar claridad, consistencia, accesibilidad y respuesta visible. Cada interactivo define cuando aplique hover, focus visible, active, disabled y loading; el color no es el único indicador.
- Cada control tiene nombre accesible y label, descripción y error asociados. Foco visible y orden lógico; al cerrar menú/diálogo se restaura al activador cuando corresponda. Menús/diálogos gestionan teclado, Escape y foco.
- Área táctil mínima procurada: `44 × 44 px`. Formularios muestran error junto al campo y conservan datos cuando sea posible.
- Definir explícitamente carga, vacío, error, sin permisos y no disponible cuando aplique. Destructivas: distinción visual y confirmación si irreversibles.
- Verificar móvil y escritorio sin scroll horizontal/cortes. Animaciones breves/funcionales y respetan `prefers-reduced-motion`. Cambios visuales globales se revisan en catálogo.
- En listados, los filtros no se integran dentro de `Card`/`Paper`: ocupan cinco columnas en desktop y tres en tablet. En móvil se muestra solo el buscador y un botón de filtros si existen filtros adicionales; esos filtros se presentan en un `Dialog`/`Drawer` accesible. Si solo existe búsqueda, no se renderiza botón de filtros.

### Cierre de UI Web

Una tarea UI no termina hasta verificar, cuando aplique: búsqueda y selección según la jerarquía de componentes; no duplicación/elusión; justificación de MUI/nuevo; alcance y reutilización correctos; tema/spacing; teclado/foco; nombres/relaciones accesibles; estados loading/error/vacío/disabled/permisos; responsive; pruebas de componente/flujo; catálogo global; y `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` exitosos.

## 6. Reglas API

### Responsabilidades y alcance

Handlers/controladores solo reciben, validan entrada, delegan y construyen respuesta. Negocio va en servicios/casos de uso; acceso/persistencia, en repositorios o capa arquitectónica existente; contratos de entrada, salida y dominio no se mezclan cuando tienen responsabilidades distintas. Antes de crear abstracción se busca una reutilizable existente; no se crean capas genéricas por necesidad futura hipotética.

Esto aplica a handlers/controladores, servicios/casos de uso, repositorios, modelos/entidades, validadores/esquemas, utilidades y tipos. Elementos de toda API van al directorio global; compartidos por módulo, al módulo; exclusivos de operación, junto a ella cuando la arquitectura lo permita.

### Endpoints de listados

Todo endpoint que retorna listado acepta paginación servidor con `page` y `pageSize` validados y `search`; búsqueda, filtros y ordenamiento se ejecutan en API, nunca solo Web. Responde paginado con `items`, `page`, `pageSize`, `total`, `totalPages`. Web envía consultas y representa paginación remota: no descarga toda la colección para filtrar/paginar localmente. Contratos, fixtures y pruebas cubren búsqueda, página vacía, límites de tamaño y cero resultados.

## 7. Iconos Web

- Todo icono de interfaz proviene exclusivamente de `@tabler/icons-react`.
- Se prohíben SVG manual, Unicode, emojis y otras librerías de iconos.
- El icono conserva nombre accesible, estados visuales, tamaño y contraste adecuados.
- Logotipo, isotipo e ilustración de marca no son iconos de interfaz y pueden conservar implementación propia.
- Antes de crear icono propio se verifica que Tabler no tenga alternativa adecuada.
