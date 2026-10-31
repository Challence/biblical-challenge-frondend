---
name: atomic-design
description: 'Trigger: Atomic Design, átomos, moléculas, organismos, layouts o jerarquías de componentes. Traduce la jerarquía a una estructura técnica base/composed/specialized/layouts/pages.'
license: Apache-2.0
metadata:
  author: 'mouseinyl'
  version: '1.0'
---

## Activation Contract

Activa esta skill al planificar, implementar o revisar una interfaz organizada con Atomic Design, especialmente su estructura técnica, composición, layouts, páginas o variantes.

## Hard Rules

- Carga `../component-composition/SKILL.md` y aplica sus reglas antes de clasificar o crear componentes.
- Usa la estructura técnica `base`, `composed`, `specialized`, `layouts` y `pages`; no confundas nombres de carpetas con niveles visuales.
- `base` contiene capacidades mínimas; `composed` combina bases; `specialized` adapta composición a un caso de módulo o flujo.
- `layouts` compone estructura de navegación y regiones; no contiene reglas exclusivas de una página.
- `pages` orquesta datos, estados y composición de pantalla; no duplica componentes inferiores.
- Define variantes explícitas y acotadas; no uses variantes para ocultar responsabilidades distintas ni acumules flags incompatibles.
- Respeta el alcance mínimo: no eleves una pieza a global sin consumidores reales en más de un contexto.

## Decision Gates

| Condición                                        | Ubicación técnica                       |
| ------------------------------------------------ | --------------------------------------- |
| Capacidad visual/interactiva mínima reutilizable | `base`                                  |
| Combinación estable de bases                     | `composed`                              |
| Regla o contexto concreto de módulo/flujo        | `specialized`                           |
| Estructura compartida entre páginas              | `layouts`                               |
| Orquestación de una ruta o pantalla              | `pages`                                 |
| Solo cambia apariencia/configuración             | Variante explícita de la capa existente |

## Execution Steps

1. Carga la skill de composición y mapea consumidores, rutas, estados y componentes existentes.
2. Clasifica cada pieza en la estructura técnica, justificando su nivel.
3. Diseña variantes y contratos antes de implementar; conserva composición entre niveles.
4. Implementa de abajo arriba: `base`, `composed`, `specialized`, `layouts`, `pages`.
5. Verifica responsive, accesibilidad, estados, dependencias y ausencia de duplicación.

## Output Contract

Reporta el mapa de capas, variantes y consumidores, decisiones de ubicación, archivos afectados, validaciones ejecutadas y riesgos pendientes.

## References

- `../component-composition/SKILL.md`
