# Distribución de audiencia (API-225)

`get_analytics_audience_distribution(period, reference, timezone)` es el RPC
administrativo vigente: el servidor calcula el intervalo semiabierto `[start,
end)` para día, semana ISO, mes o año. La sobrecarga histórica
`get_analytics_audience_distribution(start, end)` se conserva temporalmente
para los consumidores existentes. Ambas variantes
devuelve únicamente agregados de dispositivos distintos (`anonymous_id`) dentro
del intervalo semiabierto. Cada dispositivo se cuenta una vez y
se clasifica por los valores de su último evento del intervalo. La respuesta
incluye `total`, totales y porcentajes de `platform` (`android`, `ios`, `other`)
y `displayMode` (`standalone`, `browser`). Los porcentajes se expresan con
cuatro decimales y cada conjunto suma 100 (o 0 cuando no hay dispositivos).

La autorización exige un JWT autenticado con `app_metadata.role = admin`;
`anon` no puede ejecutar el RPC. No se exponen eventos individuales.

`location` es explícitamente `null` y `locationStatus` es `unavailable`: no hay
una fuente de ubicación aprobada. `locale` y `timezone` no se convierten en
país o región, y no se almacenan IP ni GPS. Si se incorpora posteriormente una
fuente aprobada, los grupos de ubicación deben aplicar un umbral mínimo de **5
dispositivos**; los grupos menores se suprimen y no se publican.
