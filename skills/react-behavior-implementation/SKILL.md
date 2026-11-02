---
name: react-behavior-implementation
description: 'Trigger: React, componente React, hook, UI React, comportamiento React. Diseñar e implementar features React con comportamiento verificable, composición y calidad.'
license: Apache-2.0
metadata:
  author: 'mouseinyl'
  version: '1.0'
---

## Activation Contract

Activa esta skill al crear, modificar, revisar o depurar componentes, hooks, páginas, formularios o flujos de una aplicación React. Es agnóstica de framework, librería visual y gestor de estado.

Antes de diseñar componentes, carga `../component-composition/SKILL.md` y `../atomic-design/SKILL.md`; si el formulario usa React Hook Form, carga también `../react-hook-form-composition/SKILL.md`.

Para decidir módulos, submódulos, dependencias y movimientos, carga `../frontend-module-architecture/SKILL.md`; esta skill conserva únicamente reglas de comportamiento y composición React.

## Hard Rules

- Define primero estados, eventos, reglas y resultados observables; después el JSX.
- Inspecciona componentes, hooks, utilidades y fuente de verdad existentes antes de crear abstracciones.
- Divide componentes y páginas por responsabilidad y dominio cuando la división reduzca complejidad, acoplamiento o superficie de prueba; no extraigas por tamaño de archivo solamente.
- Cada sección extraída debe tener una responsabilidad clara, entradas y salidas explícitas, ser individualmente testeable y funcionar de forma autosuficiente dentro de su contrato.
- Mantén componentes y Hooks puros durante el render; no mutar props, estado, contexto ni datos recibidos.
- Cuando una página contenga secciones complejas con lógica propia (por ejemplo tarjetas de información, calendarios o editores), extráelas como componentes `specialized` del módulo. Deben consumir el contexto/formulario cercano y mantener internamente su interacción, estados locales y validación visual; la página conserva únicamente carga, submit, navegación y composición.
- Una tarjeta especializada no ejecuta persistencia ni navegación de página. Expone solo los contratos mínimos del módulo y evita trasladar su lógica al padre mediante prop drilling.
- Usa la jerarquía de estado de menor alcance: valor derivado → estado local (afecta un componente) → Context cercano (afecta varios componentes cercanos) → estado de feature/módulo (afecta varias páginas o componentes del módulo) → estado global (cruza módulos).
- Permite que componentes consuman datos y acciones desde Context cuando sea el contrato apropiado, para evitar prop drilling; coloca el Provider lo más cerca posible de todos sus consumidores y no uses Context por defecto.
- No eleves estado ni crees Context/store si los consumidores pueden coordinarse mediante props, composición o estado local; no conviertas un estado de feature en global sin consumidores que crucen módulos.
- Usa `useEffect` únicamente para sincronizar sistemas externos; no para valores derivados ni acciones de eventos.
- Conserva accesibilidad, tipado, responsive y estados aplicables: loading, success, empty, error, disabled y permisos.
- No añadas dependencias ni refactors ajenos al objetivo.

## Decision Gates

| Necesidad             | Decisión                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| Sección compleja      | Divide por responsabilidad y dominio solo si cada sección queda individual, testeable y autosuficiente.         |
| UI repetida           | Reutiliza componente existente; luego compón o adapta; crea solo si no resuelve.                                |
| Lógica repetida       | Extrae un Hook solo con comportamiento compartido real.                                                         |
| Prop drilling         | Evalúa composición o props primero; usa Context solo para varios consumidores cercanos y ubícalo junto a ellos. |
| Estado de un elemento | Usa estado local si afecta un solo componente.                                                                  |
| Estado de feature     | Usa estado de feature/módulo si afecta varias páginas o componentes de ese módulo.                              |
| Estado transversal    | Usa estado global únicamente si los consumidores cruzan módulos.                                                |
| Datos remotos         | Mantén estados de carga, error, vacío y cancelación según la infraestructura existente.                         |
| Efecto                | Comprueba primero si puede resolverse durante render o en un handler.                                           |

## Execution Steps

1. Inspecciona el código afectado y documenta alcance, dependencias y reutilización encontrada.
2. Especifica entradas, salidas, eventos, transiciones y estados límite.
3. Identifica responsabilidades y dominios; decide si dividir reduce complejidad. Define para cada sección un contrato explícito, autosuficiencia y estrategia de prueba.
4. Diseña la composición y el propietario de cada estado. Clasifica cada estado como local, Context cercano, feature/módulo o global; justifica cualquier Context y verifica que el Provider cubra solo a sus consumidores.
5. Implementa el cambio mínimo con contratos explícitos y sin duplicar lógica.
6. Si refactorizas, captura primero el comportamiento actual con pruebas o verificaciones observables; extrae una sección por vez, conserva API, estados, eventos, accesibilidad y orden de efectos, y valida tras cada extracción.
7. Prueba comportamiento, accesibilidad y estados relevantes de cada sección y del flujo completo; ejecuta las comprobaciones disponibles del proyecto.
8. Revisa regresiones, consumidores, límites de estado, compatibilidad y que no haya prop drilling innecesario antes de cerrar.

## Output Contract

Reporta: archivos modificados, comportamiento implementado, decisiones de estado/composición, pruebas y comandos ejecutados, y riesgos o validaciones pendientes.

## References

- `../frontend-developer-behavior/SKILL.md` — estrategia común de validación escalonada para frontend.
- `../frontend-module-architecture/SKILL.md` — arquitectura normativa de módulos y submódulos.
- `../component-composition/SKILL.md`
- `../atomic-design/SKILL.md`
- `../react-hook-form-composition/SKILL.md`
