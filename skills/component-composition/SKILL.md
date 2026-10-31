---
name: component-composition
description: 'Trigger: composición de componentes, base, composed, specialized, variantes o diseño por capas. Define decisiones agnósticas de framework para reutilizar y especializar componentes.'
license: Apache-2.0
metadata:
  author: 'mouseinyl'
  version: '1.0'
---

## Activation Contract

Activa esta skill al diseñar, implementar o revisar componentes reutilizables, composiciones, wrappers, variantes o especializaciones, sin asumir un framework concreto.

## Hard Rules

- Clasifica cada componente como `base`, `composed` o `specialized` antes de implementarlo.
- `base` define una capacidad mínima y estable; no incorpora reglas de una pantalla o dominio.
- `composed` combina bases existentes y coordina comportamiento; no duplica su markup ni contratos.
- `specialized` resuelve un caso concreto componiendo capas inferiores; no convierte reglas locales en base global.
- Prefiere composición sobre duplicación, herencia, flags booleanos acumulativos o variantes implícitas.
- Mantén una única responsabilidad, API explícita y estados observables; no introduzcas una abstracción sin consumidor real.
- No cambies la responsabilidad de una capa para evitar una decisión de diseño; registra el impacto y los consumidores.

## Decision Gates

| Condición                                         | Decisión                                                       |
| ------------------------------------------------- | -------------------------------------------------------------- |
| Existe un componente con la misma responsabilidad | Reutilízalo o compónlo; no crees otro equivalente.             |
| Solo cambia presentación o configuración          | Usa una variante explícita mediante props, tema o composición. |
| Cambia comportamiento y reglas del caso           | Crea `specialized` sobre una base o `composed` existente.      |
| Se necesitan muchos flags o excepciones           | Divide responsabilidades y revisa la frontera entre capas.     |
| No hay consumidor concreto                        | No crees la abstracción todavía.                               |

## Execution Steps

1. Inspecciona componentes, contratos, consumidores y estados existentes.
2. Define responsabilidad, capa (`base`/`composed`/`specialized`) y API pública.
3. Elige reutilización, composición o nueva pieza según los decision gates.
4. Implementa variantes explícitas sin duplicar estructura ni reglas.
5. Verifica estados, accesibilidad, consumidores y ausencia de regresiones.

## Output Contract

Reporta clasificación de cada pieza, decisiones de composición y variantes, archivos afectados, consumidores verificados, validaciones ejecutadas y riesgos pendientes.

## References

Consulta las convenciones locales del proyecto anfitrión antes de elegir nombres, APIs o ubicación.
