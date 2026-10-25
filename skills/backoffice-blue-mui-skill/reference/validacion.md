# Procedimiento y verificación de cambios

## 7. Proceso de trabajo obligatorio para la IA

**Antes de implementar**

1. Identifica los componentes, el tema, tokens y dependencias existentes.
2. Compara la vista actual con la composición descrita aquí.
3. Enumera brevemente qué se reutiliza y qué debe ajustarse; evita reescrituras innecesarias.

**Durante la implementación**

4. Centraliza los cambios globales en el tema y overrides; limita `sx` a layout y excepciones justificadas.
5. Implementa shell → layout responsive → dashboard → estados e interacciones.
6. Evita estilos arbitrarios y nuevas abstracciones si los componentes MUI existentes resuelven el caso.

**Al finalizar**

7. Ejecuta los chequeos disponibles del proyecto: TypeScript, lint, tests/build según corresponda.
8. Verifica desktop, tablet y móvil; loading/empty/error; navegación por teclado.
9. Informa **archivos modificados, decisiones visuales y comprobaciones ejecutadas**. No declares pruebas no realizadas.

## 8. Checklist de aceptación

- [ ] Existe una única fuente de verdad para los valores visuales (tokens o tema MUI).
- [ ] Sidebar con gradiente azul, selección visible y comportamiento móvil correcto.
- [ ] Topbar clara, buscador y acciones alineadas.
- [ ] Canvas azul pálido, cards blancas, radio 16px aprox. y sombras suaves.
- [ ] Jerarquía de tipografía y espaciado consistente.
- [ ] KPI, gráficos, tabla y panel lateral siguen la composición objetivo.
- [ ] Estados semánticos y datos sin inconsistencias; nada falsamente conectado.
- [ ] No hay desbordamiento horizontal global ni superposición en responsive.
- [ ] Keyboard/focus/labels/contraste revisados.
- [ ] Typecheck/lint/build/tests según disponibilidad, con resultados reportados.

## Formularios (solo cuando la tarea incluya campos)

Aplicar el checklist de `form-fields.md`, sin cargarlo para cambios ajenos a formularios. Verificar labels, estados, tipos correctos, foco, ayudas, validación y responsive.
