# Resumen analítico por periodo (API-223)

`get_analytics_summary_period(period, reference, timezone)` calcula en servidor
los límites exclusivos de `day`, `week`, `month` o `year`. La semana comienza
el lunes (ISO). `reference` se interpreta en la zona IANA indicada y el periodo
anterior usa la misma unidad calendario, por lo que los cambios DST no alteran
los límites de hora local. La respuesta contiene solo `current` y `previous`,
sus rangos y métricas agregadas; nunca eventos individuales.

La función exige un JWT autenticado con `app_metadata.role = admin`. Valida el
periodo, la referencia y que la zona exista en `pg_timezone_names`; el fin de
cada rango se aplica con `<`.

`get_analytics_rankings(period, reference, timezone)` y
`get_analytics_audience_distribution(period, reference, timezone)` usan los
mismos límites de servidor. Los tres contratos usan `[start, end)` y conservan
las sobrecargas históricas con `start/end` para no romper consumidores durante
la migración. Ningún cliente debe calcular límites calendario para las nuevas
sobrecargas.
