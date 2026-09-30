# `PROYECTO:` Predicción de generación renovable y resiliencia del sistema eléctrico ante eventos meteorológicos extremos

> **Nota de revisión:** este documento actualiza el modelo de datos inicial con la estructura y las decisiones realmente implementadas durante el desarrollo. Se mantiene la estructura original del documento, señalando en cada sección los cambios respecto al planteamiento.

## Resumen de la idea y datos del proyecto

El objetivo del proyecto es predecir la **generación solar fotovoltaica nacional** en España para la siguiente jornada, utilizando el histórico de generación de REE y variables meteorológicas de AEMET. Los resultados se visualizan mediante un dashboard interactivo (Angular) que permite comparar la generación real con la predicha, junto con un informe de análisis técnico en Power BI.

Las fuentes de datos finalmente utilizadas son:

- **Red Eléctrica de España (REE):** generación fotovoltaica diaria nacional y generación fotovoltaica mensual por comunidad autónoma (esta última usada para calcular pesos de agregación espacial, no como variable del modelo).
- **AEMET OpenData:** valores climatológicos diarios por estación meteorológica.

**Cambio respecto al planteamiento inicial:** se elimina del alcance la demanda eléctrica y las alertas meteorológicas oficiales como fuentes de datos activas — no se descargaron ni integraron en la capa Gold final (ver más abajo, sección de diccionario de datos).

# Tecnología o formato de almacenamiento elegido

Se utilizará una combinación de formatos de almacenamiento en función de la fase del tratamiento de los datos.

**Capa Raw**

Los datos se almacenan en **CSV**, formato en el que se obtuvieron finalmente de ambas APIs (REE y AEMET), en vez de JSON.

**Capa Processed**

Los datos limpios se almacenan en una combinación de **CSV y Parquet** según el caso: las tablas intermedias que solo alimentan cálculos posteriores (agregados meteorológicos por CCAA, pesos de ponderación) se guardan en Parquet; las series limpias que también se auditan visualmente se conservan además en CSV.

**Capa Gold**

El dataset final se almacena en **Parquet y CSV** en paralelo: Parquet como formato de trabajo para los notebooks de feature engineering y modelado, y CSV como formato de exportación para el dashboard (Angular) y el informe de Power BI.

# Estructura de capas de datos

```text
data/
│
├── raw/
│   ├── ree/
│   │   ├── ree_fotovoltaica_2021_2025.csv
│   │   └── ree_fotovoltaica_ccaa_2021_2025.csv
│   └── aemet/
│       └── aemet_todas_estaciones_2021_2025.csv
│
├── processed/
│   ├── aemet_limpio_2021_2025.csv
│   ├── aemet_media_ccaa_diaria.parquet
│   ├── ree_fotovoltaica_diario_limpio_2021_2025.csv
│   ├── ree_fotovoltaica_ccaa_mensual_limpio_2021_2025.csv
│   └── pesos_ccaa_por_año.parquet
│
└── gold/
    ├── gold_diario_2021_2025.parquet
    ├── gold_diario_2021_2025.csv
    ├── gold_features_2021_2025.parquet
    ├── train.parquet / val.parquet / test.parquet
    └── powerbi_*.csv (predicciones, métricas, backtesting, errores por mes, días de baja generación)
```

**Cambio respecto al planteamiento inicial:** la estructura real tiene más archivos intermedios de los previstos, porque el proceso de integración resultó más complejo de lo anticipado — en particular, la necesidad de una tabla de pesos de ponderación por comunidad autónoma (`pesos_ccaa_por_año`) para agregar correctamente la meteorología a nivel nacional, algo no contemplado en el planteamiento inicial (que asumía una única fuente meteorológica ya agregada). También se añaden los splits de modelado (`train`/`val`/`test`) y las tablas de salida específicas para Power BI, que no formaban parte del diseño original de capas.

**Capa Raw:** datos originales sin modificar, tal como se descargaron de cada API.

**Capa Processed:** datos limpios y normalizados por fuente, antes de integrarlos entre sí. Incluye la agregación meteorológica por CCAA y el cálculo de los pesos de ponderación, que en el planteamiento inicial no estaban previstos como paso intermedio propio.

**Capa Gold:** dataset diario integrado, con las variables derivadas (lags, medias móviles, variables temporales) ya incorporadas, y los splits de train/val/test ya definidos.

# Definición de la capa Gold

## Dataset principal

**Nombre**

`gold_diario_2021_2025.parquet` (equivalente en CSV: `gold_diario_2021_2025.csv`)

**Descripción**

Dataset final preparado para entrenar el modelo de predicción de generación fotovoltaica.

**Granularidad**

Una fila representa un día.

**Número de registros**

1.825 registros (2021-2025, granularidad diaria).

**Cambio respecto al planteamiento inicial:** el rango previsto ("entre 2.000 y 4.000 registros") se ajusta al que finalmente ha dado el histórico real utilizado (5 años en diario).

### Campos principales

| Campo                   | Tipo  | Fuente         | Descripción                                                 |
| ----------------------- | ----- | -------------- | ----------------------------------------------------------- |
| fecha                   | date  | AEMET / REE    | Fecha del registro (clave primaria)                         |
| tmed                    | float | AEMET          | Temperatura media agregada (ponderada por CCAA)             |
| tmin                    | float | AEMET          | Temperatura mínima agregada                                 |
| tmax                    | float | AEMET          | Temperatura máxima agregada                                 |
| prec                    | float | AEMET          | Precipitación agregada                                      |
| velmedia                | float | AEMET          | Velocidad media del viento agregada                         |
| racha                   | float | AEMET          | Racha máxima de viento agregada                             |
| presMax                 | float | AEMET          | Presión máxima agregada                                     |
| presMin                 | float | AEMET          | Presión mínima agregada                                     |
| hrMedia                 | float | AEMET          | Humedad relativa media agregada                             |
| sol                     | float | AEMET          | Horas de sol agregadas (proxy de radiación)                 |
| generacion_fotovoltaica | float | REE            | Generación fotovoltaica nacional diaria (variable objetivo) |
| porcentaje_fotovoltaica | float | REE            | Porcentaje sobre el total de generación                     |
| dia_semana              | int   | Derivada       | Día de la semana (0 = lunes)                                |
| mes                     | int   | Derivada       | Mes del año                                                 |
| dia_año                 | int   | Derivada       | Día del año                                                 |
| generacion_lag_1        | float | Derivada (REE) | Generación del día anterior                                 |
| generacion_lag_7        | float | Derivada (REE) | Generación de hace 7 días                                   |
| generacion_media_7d     | float | Derivada (REE) | Media móvil de generación de los 7 días anteriores          |

**Clave primaria**

**Clave primaria**

`fecha`

**Variable objetivo**

`generacion_fotovoltaica`

**Uso posterior**

- Análisis exploratorio (EDA).
- Entrenamiento del modelo (con las columnas `_lag_1`, no las meteorológicas base).
- Evaluación del modelo (test + backtesting).
- Dashboard interactivo y asistente conversacional.

# Relaciones entre datos

**Cambio respecto al planteamiento inicial:** la relación real entre REE y AEMET no es un `JOIN 1-1` directo por fecha, como se planteaba inicialmente — requiere un paso intermedio de agregación espacial ponderada, descrito a continuación.

## Dataset 1 - REE (generación nacional diaria)

Campos: `fecha`, `generacion_fotovoltaica`, `porcentaje_fotovoltaica`.

## Dataset 2 — REE (generación mensual por CCAA)

Campos: `fecha`, `ccaa`, `generacion_fotovoltaica_ccaa`. Se usa exclusivamente para calcular, por año, el **peso relativo de cada CCAA** sobre el total nacional (proxy de potencia instalada), no entra directamente en el dataset de modelado.

## Dataset 3 — AEMET (meteorología diaria por estación)

Campos: `fecha`, `indicativo` (estación), `provincia`, variables meteorológicas.

## Proceso de integración real

```text
AEMET (por estación)
   │  mapeo provincia → CCAA
   ▼
Media diaria por CCAA
   │  join por (ccaa, año) con los pesos de REE-CCAA
   ▼
Media ponderada nacional (por día)
   │  join por fecha con REE nacional diario
   ▼
Capa Gold diaria
```

Este proceso en dos pasos (media simple dentro de cada CCAA, y después media ponderada entre CCAA) fue necesario porque una media directa de todas las estaciones de AEMET sin ponderar sobrerrepresenta a las comunidades con más estaciones meteorológicas, que no tienen por qué coincidir con las que más potencia fotovoltaica tienen instalada.

# Diccionario de datos inicial

| Campo                             | Descripción                                                 | Tipo  | Fuente         | Obligatorio |
| --------------------------------- | ----------------------------------------------------------- | ----- | -------------- | ----------- |
| fecha                             | Fecha del registro                                          | date  | AEMET / REE    | Sí          |
| tmed, tmin, tmax                  | Temperatura media/mín/máx agregada                          | float | AEMET          | Sí          |
| prec                              | Precipitación agregada                                      | float | AEMET          | No          |
| velmedia, racha                   | Viento medio y racha máxima agregados                       | float | AEMET          | No          |
| presMax, presMin                  | Presión máxima y mínima agregadas                           | float | AEMET          | No          |
| hrMedia                           | Humedad relativa media agregada                             | float | AEMET          | No          |
| sol                               | Horas de sol agregadas                                      | float | AEMET          | No          |
| generacion_fotovoltaica           | Generación fotovoltaica nacional diaria (variable objetivo) | float | REE            | Sí          |
| porcentaje_fotovoltaica           | Porcentaje sobre el total de generación                     | float | REE            | No          |
| dia_semana, mes, dia_año          | Variables temporales de calendario                          | int   | Derivada       | Sí          |
| generacion_lag_1, lag_7, media_7d | Retardos y media móvil de generación                        | float | Derivada (REE) | Sí          |

# Problemas de calidad esperados

- **Separador decimal:** los CSV exportados con punto decimal se interpretaron erróneamente como millares al importarlos en herramientas con configuración regional en español (Power BI), multiplicando algunos valores por 1.000 — detectado y corregido especificando la configuración regional de origen.
- **Zona horaria:** las fechas de la API de REE incluían offset variable (+01:00 / +02:00 según horario de verano/invierno), lo que rompía el parseo directo a fecha; resuelto forzando UTC y convirtiendo después a hora local antes de quedarse solo con la fecha civil.
- **Identificadores de comunidad autónoma (`geo_ids`) no documentados** en la API de REData, verificados de forma empírica.
- **Límite de la API de REE a rangos de 6 meses por petición**, que exigió un script de descarga por tramos con reintentos.
- **Datos faltantes por comunidad autónoma en años concretos** (Extremadura y Ceuta sin generación fotovoltaica reportada en 2020-2022), confirmado contra la propia API como ausencia real de la tecnología en esas fechas, no como error de descarga.
- **Valores anómalos codificados** en AEMET (p. ej. `tmin = 50.0` y `tmax = -50.0` simultáneos, usados como marca de dato inválido).
- **Saltos de línea `\r\n` (estilo Windows)** en los CSV exportados, que provocaban que la última columna de cada fila arrastrara un carácter de retorno de carro invisible al parsearla en JavaScript.

**Cambio respecto al planteamiento inicial:** los problemas anticipados (nulos, duplicados, formatos de fecha, unidades) sí aparecieron, pero los más costosos de resolver en la práctica fueron otros no anticipados explícitamente (separador decimal, zona horaria, límites de la API, retorno de carro en CSV).

# Decisiones de limpieza y transformación previstas

- Conversión de fechas a UTC y posterior normalización a fecha civil española.
- Corrección del separador decimal en la importación a herramientas de análisis.
- Mapeo de estaciones AEMET a comunidad autónoma (vía provincia) para la agregación ponderada.
- Cálculo de pesos de ponderación por CCAA y año, usando la generación fotovoltaica real como proxy de potencia instalada (no se dispuso de datos de potencia instalada real).
- Relleno con generación nula, documentado explícitamente, para los periodos confirmados sin generación fotovoltaica reportada (Ceuta 2020-2022).
- Eliminación de registros con valores claramente erróneos (codificaciones de anomalía en AEMET).
- Construcción de variables derivadas: `dia_semana`, `mes`, `dia_año`, `generacion_lag_1`, `generacion_lag_7`, `generacion_media_7d`, y retardo de 1 día de cada variable meteorológica.
- División cronológica en train/validación/test, sin mezclar información futura en el entrenamiento.

**Cambio respecto al planteamiento inicial:** no se implementaron "estación del año", "indicador de fin de semana" ni "velocidad media móvil del viento" como variables derivadas — se priorizaron los lags y medias móviles de generación, que resultaron ser las variables con mayor peso en el modelo final. Tampoco se aplicó interpolación de nulos; los pocos casos de datos faltantes se trataron de forma explícita y documentada (relleno a cero justificado, o exclusión), en vez de interpolar valores no observados.

# Riesgos del modelo de datos

Los riesgos anticipados sobre la integración de fuentes (formatos, resolución temporal, disponibilidad histórica) se confirmaron como el principal foco de esfuerzo del proyecto, tal como se preveía. AEMET no presentó los problemas de autenticación anticipados; el mayor coste de integración vino, en cambio, de la API de REE (identificadores no documentados, límite de rango por petición) y de aspectos no anticipados en el planteamiento inicial (separador decimal, zonas horarias).

El riesgo no previsto de mayor impacto en el diseño del modelo fue el de **data leakage meteorológico**: usar variables del día que se pretende predecir constituiría información no disponible en un escenario real de uso. Se resolvió limitando las variables meteorológicas del modelo a su valor del día anterior, documentado como limitación de diseño y línea de mejora futura (forecast meteorológico con fecha de emisión).

La simplificación prevista como plan de contingencia ("variables meteorológicas imprescindibles y generación agregada por fecha") no llegó a ser necesaria — se consiguió construir la capa Gold con el nivel de detalle planteado, incluyendo las variables derivadas adicionales que finalmente demostraron ser las más relevantes para el modelo.
