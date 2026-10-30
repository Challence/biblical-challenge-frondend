# Layout global del backoffice

## 4. Composición obligatoria del backoffice

### Shell

- **Desktop:** `Drawer` permanente de **264px** a la izquierda; `AppBar`/topbar clara de aprox. **78px**; área principal fluida con padding **28–32px** y máximo de contenido **1600px**.
- **Sidebar:** logo/nombre arriba; navegación Dashboard, Usuarios, Proyectos, Tareas, Calendario, Documentos, Reportes y Configuración al final. Item activo con fondo blanco translúcido; iconografía consistente; scroll interno si es necesario.
- **Topbar:** búsqueda a la izquierda, notificaciones y avatar/perfil a la derecha. Sin sombras fuertes; acciones con al menos 44×44px de área interactiva.
- **Main:** saludo y fecha dinámica; tarjetas de métricas; gráficos; proyectos recientes; panel derecho de acciones rápidas y actividad reciente.

### Jerarquía y densidad

| Elemento                 | Regla                         |
| ------------------------ | ----------------------------- |
| Título de página         | 30–34px, 700, navy            |
| Título de sección        | 17–20px, 700                  |
| Valor KPI                | 28–32px, 700                  |
| Texto habitual           | 14–15px                       |
| Labels/metadatos         | 12–14px, nunca ilegibles      |
| Separación entre módulos | 16–20px                       |
| Padding interior de card | 20–24px                       |
| Inputs y botones         | ~44px alto mínimo interactivo |
