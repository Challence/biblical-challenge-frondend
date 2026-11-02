---
name: frontend-module-architecture
description: 'Trigger: arquitectura de módulos frontend, features, submódulos, reestructuración o límites entre módulos. Diseña, mueve y valida la arquitectura modular de aplicaciones frontend.'
license: Apache-2.0
metadata:
  author: 'mouseinyl'
  version: '1.0'
---

## Activation Contract

Activa esta skill antes de crear, mover, dividir o revisar módulos y submódulos frontend. Es normativa para ubicación, dependencias, contratos públicos y reestructuraciones.

## Hard Rules

- Crea un módulo cuando exista un dominio, ruta o flujo con responsabilidades, consumidores o ciclo de evolución propios. Crea un submódulo solo cuando una parte del módulo tenga frontera, rutas o estado claramente cohesionados; no crees carpetas por tamaño.
- Usa `src/app/features/<module>/features/<submodule>/` para submódulos. Dentro de cada feature, usa solo lo necesario: `pages`, `components/shared`, `hooks`, `models`, `requests` y `services`.
- El padre posee composición transversal, navegación y contratos compartidos entre sus hijos; el hijo posee su dominio, UI, estado y acceso a datos. El padre no absorbe reglas internas ni el hijo depende de otro hijo.
- Permite dependencias hacia `app/shared` y de padre a hijo mediante contratos públicos. Prohíbe imports entre features hermanas, imports a internals de otra feature y dependencias circulares; mueve un contrato común a la frontera adecuada.
- Expón únicamente archivos públicos explícitos e importa archivos directamente. No crees ni uses barrels (`index.ts`, `index.tsx` o equivalentes).
- No mezcles reestructuración con cambios funcionales. Antes de mover, inventaría rutas, consumidores, imports, contratos, estado y pruebas; preserva comportamiento y actualiza todos los consumidores.

## Decision Gates

| Señal | Decisión |
| --- | --- |
| Dominio/ruta con frontera propia | Módulo |
| Cohesión interna con frontera y ciclo propio | Submódulo |
| Uso transversal real | `app/shared` |
| Una sola operación | Mantener junto a la operación |

## Execution Steps

1. Mapea dominios, rutas, consumidores, dependencias y contratos actuales.
2. Decide módulo/submódulo y asigna cada archivo a su ubicación mínima.
3. Define la API pública, dependencias permitidas y migración de imports antes de mover.
4. Reestructura en pasos pequeños, sin cambiar comportamiento; elimina referencias antiguas solo tras migrar consumidores.
5. Verifica límites, ciclos, barrels, rutas, pruebas y regresiones.

## Output Contract

Reporta módulos afectados, mapa antes/después, contratos públicos, consumidores migrados, dependencias prohibidas detectadas, validaciones ejecutadas y riesgos pendientes.

## References

- `../../AGENTS.md` — alcance, estructura `app` y reglas de imports.
- `../frontend-developer-behavior/SKILL.md` — ubicación de modelos y valores por alcance.
- `../atomic-design/SKILL.md` — capas de componentes dentro de la ubicación arquitectónica.
