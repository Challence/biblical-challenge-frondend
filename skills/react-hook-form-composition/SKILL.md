---
name: react-hook-form-composition
description: 'Trigger: React Hook Form, RHF, FormProvider, useController o campos con formularios. Define adaptadores RHF composables sobre componentes visuales existentes.'
license: Apache-2.0
metadata:
  author: 'mouseinyl'
  version: '1.0'
---

## Activation Contract

Activa esta skill al diseñar, implementar o revisar campos, formularios o adaptadores que integren React Hook Form con componentes React por capas.

## Hard Rules

- Carga `../component-composition/SKILL.md` y `../atomic-design/SKILL.md`; clasifica y conserva las capas `base`, `composed` y `specialized`.
- Define `rhf` como composición/adaptador: reutiliza una pieza visual existente y no duplica su markup, estilos ni comportamiento.
- El formulario proveedor debe usar `FormProvider`; los adaptadores deben leerlo con `useFormContext`.
- Conecta cada campo mediante `useController` o `Controller`; obtiene del contexto `value`, `onChange`, `onBlur`, `ref`, `error`, `touched` y `dirty`.
- El adaptador recibe `name` y las props visuales necesarias; no recibe ni implementa reglas de negocio de validación.
- Prohíbe `rules` y validación inline. Usa exclusivamente schemas Zod con `zodResolver`.
- Mantén los schemas fuera de `fields/rhf`; la página, feature o módulo dueño configura el schema y el `FormProvider`.

## Decision Gates

| Condición | Decisión |
| --- | --- |
| Existe `base`, `composed` o `specialized` visual compatible | Compónlo desde `rhf`; no crees otro campo visual. |
| Falta una capacidad visual reutilizable | Revisa las skills de composición y crea/adapta la capa mínima antes del adaptador. |
| El campo necesita validación | Declárala en un schema Zod externo y conecta `zodResolver`; nunca uses `rules`. |
| No existe `FormProvider` o `useFormContext` | Detén la implementación y corrige el contexto del formulario. |

## Execution Steps

1. Inspecciona el campo visual, sus estados y consumidores; carga las referencias locales.
2. Define la capa visual, la API pública y el contrato `rhf` (`name` más props de presentación).
3. Configura `useForm` con schema Zod y `zodResolver`, y envuelve el árbol con `FormProvider`.
4. Implementa el adaptador con `useFormContext` y `useController` o `Controller`, mapeando todos los estados del campo.
5. Verifica accesibilidad, errores, touched/dirty, foco, estados y ausencia de validación inline o schemas en `fields/rhf`.

## Output Contract

Reporta la pieza visual reutilizada y su capa, API del adaptador, ubicación del schema, configuración de contexto/resolver, archivos afectados, validaciones ejecutadas y riesgos pendientes.

## References

- `../component-composition/SKILL.md`
- `../atomic-design/SKILL.md`
