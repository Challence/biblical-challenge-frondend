---
name: frontend-developer-behavior
description: 'Trigger: constantes frontend, catálogos, configuración, modelos o ubicación de valores. Decide dónde ubicar y cómo reutilizar valores en aplicaciones frontend.'
license: Apache-2.0
metadata:
  author: 'mouseinyl'
  version: '1.0'
---

## Activation Contract

Activa esta skill al crear, mover o revisar constantes de dominio, catálogos o configuración reutilizable en frontend. Aplica antes de elegir archivo, carpeta o import.

## Hard Rules

- Ubica constantes de dominio, catálogos y configuración reutilizable en `models`, según su alcance.
- Usa `app/shared/models` cuando se compartan entre módulos y `features/<module>/models` cuando pertenezcan a un módulo.
- Mantén valores exclusivos de una operación junto a ella si no representan dominio.
- Distingue dominio/configuración de estilos locales, IDs temporales y valores estrictamente de render; estos últimos no se convierten en modelos compartidos.
- Evita duplicados: busca consumidores y fuentes de verdad existentes antes de crear o mover valores.
- Evita boilerplate estructural: no crees layouts, wrappers, hooks, componentes o archivos nuevos solo para reducir unas pocas líneas. Una extracción debe reducir la complejidad total, la duplicación o el acoplamiento del módulo.
- Antes de extraer, compara el costo de archivos, imports, props e indirección contra el beneficio observable. Mantén una estructura local cuando pertenece a una sola operación y no existe un consumidor real adicional.
- Justifica una extracción por al menos una frontera útil: varios consumidores, comportamiento complejo encapsulado, una fuente de verdad compartida o una convención de rutas que elimina duplicación real.
- Usa imports directos; no crees ni uses barrel files (`index.ts`, `index.tsx` o equivalentes).
- Antes de mover, revisa todos los consumidores y preserva tipado, contratos e inmutabilidad cuando corresponda.

## Decision Gates

| Tipo de valor | Ubicación |
| --- | --- |
| Dominio, catálogo o configuración usada por varios módulos | `app/shared/models` |
| Dominio, catálogo o configuración de un solo módulo | `features/<module>/models` |
| Valor exclusivo de una operación y no de dominio | Junto a la operación |
| Estilo local, ID temporal o valor solo de render | Mantener junto a su consumidor |

## Execution Steps

1. Identifica el tipo, alcance, consumidores y fuente de verdad del valor.
2. Inspecciona modelos y definiciones existentes; reutiliza antes de duplicar.
3. Elige la ubicación mínima según la tabla y verifica que no sea un valor local disfrazado de dominio.
4. Mueve o crea con tipos explícitos, inmutabilidad apropiada e imports directos.
5. Comprueba todos los consumidores, referencias y ausencia de barrel files o duplicados.
6. Revisa el balance de la extracción: si añade más piezas y coordinación que complejidad eliminada, conserva la lógica local.

## Validación escalonada

La estrategia siguiente aplica a toda tarea frontend y complementa los criterios específicos de cada skill:

1. **Iteración local:** ejecuta la prueba específica o una verificación observable del cambio; ejecuta lint y typecheck enfocados cuando sea posible; termina con `git diff --check`.
2. **Cierre de componente o flujo:** ejecuta las pruebas de componente o flujo correspondientes, además de lint y typecheck.
3. **Cierre de tarea o fase:** ejecuta `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `git diff --check`. El build es especialmente obligatorio cuando cambian rutas, configuración, dependencias, bundle o compilación.

No repitas la suite o el build si no hubo cambios relevantes desde una ejecución exitosa; si hubo cambios posteriores, revalida antes del cierre. La validación enfocada durante el desarrollo no sustituye la batería completa de cierre definida en `AGENTS.md`.

## Output Contract

Reporta archivos afectados, clasificación y alcance de cada valor, consumidores revisados, decisiones de ubicación, validaciones ejecutadas y riesgos pendientes.

## References

- `../../AGENTS.md` — convenciones de arquitectura y alcance del proyecto.
