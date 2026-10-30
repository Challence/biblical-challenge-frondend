---
name: version-observer
description: 'Trigger: versionado por commit, version.json, versión desplegada, actualización de versión, service worker opcional. Automatiza SemVer patch y observa despliegues sin interrumpir la app.'
license: Apache-2.0
metadata:
  author: 'franchesca-project'
  version: '1.0'
---

## Activation Contract

Activa esta skill al diseñar, implementar o revisar versionado automático por commit, sincronización de `package.json`/`public/version.json` u observación de versiones desplegadas. Es agnóstica de framework y PWA.

## Hard Rules

- Incrementa exactamente SemVer `patch` en cada commit mediante hook y sincroniza el valor en `package.json` y `public/version.json`.
- El monitor web consulta `version.json` sin caché, compara con la versión compilada, notifica una versión nueva y recarga una sola vez.
- Los fallos de red son no bloqueantes: conserva la aplicación operativa y no conviertas el error en bucle de reintentos.
- Evita timers, listeners, notificaciones o recargas duplicados; limpia recursos al desmontar o detener el monitor.
- El service worker es opcional, nunca requisito, y no debe acoplar la solución a una PWA.
- No cambies runtime, configuración PWA ni dependencias fuera del alcance acordado.

## Decision Gates

| Condición                    | Decisión                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Existe hook de commits       | Compónlo sin duplicar incrementos; si no existe, crea el hook mínimo permitido.       |
| Hay versión remota distinta  | Notifica y programa una única recarga; marca la transición para impedir repeticiones. |
| Red, respuesta o JSON fallan | Registra/ignora el fallo y conserva la app; no recargues ni bloquees.                 |
| Se propone service worker    | Trátalo como mejora independiente y opcional; el monitor debe funcionar sin él.       |

## Execution Steps

1. Inspecciona hooks, scripts, empaquetado y fuente de versión; identifica consumidores y límites.
2. Define una única fuente SemVer y la sincronización atómica de ambos archivos.
3. Configura el hook para aplicar `patch` por commit sin bucles ni modificaciones ajenas.
4. Implementa el monitor con consulta `cache: "no-store"`, comparación contra la versión compilada y guardas de ciclo de vida.
5. Prueba versión nueva, versión igual, errores de red, respuesta inválida, desmontaje y ausencia de service worker.

## Output Contract

Reporta archivos modificados, fuente y sincronización de versión, comportamiento del monitor, decisiones sobre hook/service worker, pruebas ejecutadas y riesgos pendientes.

## References

Consulta la arquitectura, scripts y hooks del proyecto anfitrión antes de modificar cualquier integración.
