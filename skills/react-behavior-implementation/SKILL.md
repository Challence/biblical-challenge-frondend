---
name: react-behavior-implementation
description: 'Trigger: React, componente React, hook, UI React, comportamiento React. Diseñar e implementar features React con comportamiento verificable, composición y calidad.'
license: Apache-2.0
metadata:
  author: 'franchesca-project'
  version: '1.0'
---

## Activation Contract

Activa esta skill al crear, modificar, revisar o depurar componentes, hooks, páginas, formularios o flujos de una aplicación React. Es agnóstica de framework, librería visual y gestor de estado.

## Hard Rules

- Define primero estados, eventos, reglas y resultados observables; después el JSX.
- Inspecciona arquitectura, componentes, hooks, utilidades y fuente de verdad existentes antes de crear abstracciones.
- Mantén componentes y Hooks puros durante el render; no mutar props, estado, contexto ni datos recibidos.
- Usa el mecanismo de menor alcance: valor derivado → estado local → hook compartido → Context → store global.
- Usa `useEffect` únicamente para sincronizar sistemas externos; no para valores derivados ni acciones de eventos.
- Conserva accesibilidad, tipado, responsive y estados aplicables: loading, success, empty, error, disabled y permisos.
- No añadas dependencias, arquitectura ni refactors ajenos al objetivo.

## Decision Gates

| Necesidad         | Decisión                                                                                |
| ----------------- | --------------------------------------------------------------------------------------- |
| UI repetida       | Reutiliza componente existente; luego compón o adapta; crea solo si no resuelve.        |
| Lógica repetida   | Extrae un Hook solo con comportamiento compartido real.                                 |
| Datos remotos     | Mantén estados de carga, error, vacío y cancelación según la infraestructura existente. |
| Estado compartido | Elige el propietario más cercano que cubra todos los consumidores.                      |
| Efecto            | Comprueba primero si puede resolverse durante render o en un handler.                   |

## Execution Steps

1. Inspecciona el código afectado y documenta alcance, dependencias y reutilización encontrada.
2. Especifica entradas, salidas, eventos, transiciones y estados límite.
3. Diseña la composición y el propietario de cada estado.
4. Implementa el cambio mínimo con contratos explícitos y sin duplicar lógica.
5. Prueba comportamiento, accesibilidad y estados relevantes; ejecuta las comprobaciones disponibles del proyecto.
6. Revisa regresiones, consumidores y compatibilidad antes de cerrar.

## Output Contract

Reporta: archivos modificados, comportamiento implementado, decisiones de estado/composición, pruebas y comandos ejecutados, y riesgos o validaciones pendientes.

## References

No requiere referencias adicionales; adapta las decisiones a la arquitectura y convenciones del proyecto anfitrión.
