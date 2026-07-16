# `PROYECTO:` Predicción de generación renovable y resiliencia del sistema eléctrico ante eventos meteorológicos extremos

## Resumen de la idea y datos del proyecto

El objetivo del proyecto es desarrollar un sistema capaz de predecir la generación de energía renovable en España utilizando datos históricos de producción eléctrica y variables meteorológicas. La finalidad es reducir la incertidumbre asociada a la generación renovable y analizar el impacto que los fenómenos meteorológicos extremos pueden tener sobre la estabilidad del sistema eléctrico.

La solución consistirá en desarrollar un modelo de Machine Learning que estime la generación renovable a partir de información meteorológica y datos históricos del sistema eléctrico. Posteriormente, los resultados se visualizarán mediante un dashboard interactivo que permitirá comparar la generación real con la predicha y analizar el efecto de diferentes variables climáticas.

Las principales fuentes de datos serán:

- **Red Eléctrica de España (REE):** datos históricos de generación eléctrica y demanda.
- **AEMET OpenData:** información meteorológica oficial y alertas por fenómenos adversos.

# Tecnología o formato de almacenamiento elegido

Se utilizará una combinación de formatos de almacenamiento en función de la fase del tratamiento de los datos.

**Capa Raw**

Los datos obtenidos desde las APIs se almacenarán inicialmente en formato **JSON**, ya que es el formato original proporcionado por las fuentes utilizadas.

**Capa Processed**

Tras el proceso de limpieza y transformación, los datos se almacenarán en formato **Parquet**, debido a que ofrece mayor rendimiento en lectura y escritura, reduce el espacio ocupado y conserva correctamente los tipos de datos.

**Capa Gold**

El dataset final también se almacenará en formato **Parquet**, ya que será consumido directamente por los modelos predictivos y el dashboard final.

# Estructura de capas de datos

```text
data/
│
├── raw/
│   ├── ree/
│   └── aemet/
│
├── processed/
│   ├── generacion_limpia.parquet
│   ├── meteorologia_limpia.parquet
│   └── dataset_unificado.parquet
│
└── gold/
    └── gold_prediccion_generacion.parquet
```

**Capa Raw**

Contendrá los datos originales descargados desde cada fuente sin modificaciones, excepto las necesarias para almacenarlos.

**Capa Processed**

Contendrá los datos limpios y normalizados. En esta capa se corregirán errores, se convertirán los tipos de datos, se eliminarán duplicados y se unificarán los formatos de fecha y hora.

**Capa Gold**

Contendrá el dataset definitivo preparado para ser utilizado por los modelos de Machine Learning, el análisis exploratorio y el dashboard final.

# Definición de la capa Gold

## Dataset principal

**Nombre**

`gold_prediccion_generacion.parquet`

**Descripción**

Dataset final preparado para entrenar el modelo de predicción de generación renovable.

**Granularidad**

Una fila representa un día.

**Número aproximado de registros**

Entre 2.000 y 4.000 registros, dependiendo del histórico finalmente utilizado.

### Campos principales

| Campo         | Tipo    | Fuente | Descripción                                                                        |
| ------------- | ------- | ------ | ---------------------------------------------------------------------------------- |
| fecha         | date    | AEMET  | Fecha del registro                                                                 |
| tmed          | float   | AEMET  | Temperatura media                                                                  |
| tmin          | float   | AEMET  | Temperatura mínima                                                                 |
| tmax          | float   | AEMET  | Temperatura máxima                                                                 |
| prec          | float   | AEMET  | Precipitación                                                                      |
| velmedia      | float   | AEMET  | Velocidad media del viento                                                         |
| racha         | float   | AEMET  | Racha máxima de viento                                                             |
| presMax       | float   | AEMET  | Presión máxima                                                                     |
| presMin       | float   | AEMET  | Presión mínima                                                                     |
| hrMedia       | float   | AEMET  | Humedad relativa media                                                             |
| alerta_activa | boolean | AEMET  | Indica si existe un aviso meteorológico activo en la fecha del registro            |
| tipo_fenomeno | string  | AEMET  | Tipo de fenómeno meteorológico (lluvia, nieve, viento, tormenta, calor, etc.)      |
| nivel_alerta  | string  | AEMET  | Nivel del aviso meteorológico (amarillo, naranja o rojo)                           |
| severidad     | int     | AEMET  | Nivel de severidad del aviso (0 = Sin alerta, 1 = Amarilla, 2 = Naranja, 3 = Roja) |
| value         | float   | REE    | Generación renovable                                                               |
| percentage    | float   | REE    | Porcentaje sobre el total de generación                                            |

**Clave primaria**

`fecha`

**Variable objetivo**

`value`

**Uso posterior**

- Análisis exploratorio (EDA).
- Entrenamiento del modelo.
- Evaluación del modelo.
- Dashboard interactivo.

# Relaciones entre datos

El proyecto utilizará dos conjuntos principales de datos.

## Dataset 1 - REE

Campos principales:

- datetime
- value
- percentage

## Dataset 2 - AEMET

La información obtenida de AEMET estará formada por dos tipos de datos:

**Datos meteorológicos**

- fecha
- tmed
- tmin
- tmax
- prec
- velmedia
- racha
- presMax
- presMin
- hrMedia

**Avisos meteorológicos**

- alerta_activa
- tipo_fenomeno
- nivel_alerta
- severidad

Ambos conjuntos de datos se relacionarán mediante la fecha del registro.

Como los datos meteorológicos tienen granularidad diaria y los datos de generación eléctrica pueden obtenerse con una resolución temporal mayor, será necesario realizar una agregación previa de los datos de REE para obtener un único valor diario.

La relación entre ambos datasets será:

```text
AEMET                     REE
---------                 ----------------
fecha        1 ───── 1    fecha
tmed                      value
tmax                      percentage
tmin
prec
velmedia
alerta_activa
tipo_fenomeno
nivel_alerta
severidad
```

Una vez agregados los datos de REE por fecha, ambos datasets podrán unirse mediante un **JOIN** sobre el campo `fecha`.

# Diccionario de datos inicial

| Campo         | Descripción                                                                    | Tipo    | Fuente | Obligatorio |
| ------------- | ------------------------------------------------------------------------------ | ------- | ------ | ----------- |
| fecha         | Fecha del registro                                                             | date    | AEMET  | Sí          |
| tmed          | Temperatura media                                                              | float   | AEMET  | Sí          |
| tmin          | Temperatura mínima                                                             | float   | AEMET  | Sí          |
| tmax          | Temperatura máxima                                                             | float   | AEMET  | Sí          |
| prec          | Precipitación                                                                  | float   | AEMET  | No          |
| velmedia      | Velocidad media del viento                                                     | float   | AEMET  | Sí          |
| racha         | Racha máxima                                                                   | float   | AEMET  | No          |
| presMax       | Presión máxima                                                                 | float   | AEMET  | No          |
| presMin       | Presión mínima                                                                 | float   | AEMET  | No          |
| hrMedia       | Humedad relativa media                                                         | float   | AEMET  | No          |
| alerta_activa | Indica si existe un aviso meteorológico activo                                 | boolean | AEMET  | No          |
| tipo_fenomeno | Tipo de fenómeno meteorológico (lluvia, nieve, viento, tormenta, calor, etc.)  | string  | AEMET  | No          |
| nivel_alerta  | Nivel del aviso meteorológico (amarillo, naranja o rojo)                       | string  | AEMET  | No          |
| severidad     | Nivel de severidad del aviso (0: sin alerta, 1: amarilla, 2: naranja, 3: roja) | int     | AEMET  | No          |
| value         | Generación renovable                                                           | float   | REE    | Sí          |
| percentage    | Porcentaje de generación                                                       | float   | REE    | No          |

# Problemas de calidad esperados

Se prevén los siguientes problemas durante el tratamiento de los datos:

- Valores nulos en algunas variables meteorológicas.
- Registros duplicados tras varias descargas de las APIs.
- Diferencias entre los formatos de fecha utilizados por las distintas fuentes.
- Diferencias de huso horario entre APIs.
- Variables expresadas en unidades diferentes.
- Cambios en la estructura de alguna API.
- Datos faltantes durante determinados periodos.
- Valores extremos producidos por fenómenos meteorológicos excepcionales.
- Diferencias en la granularidad temporal entre las distintas fuentes.

# Decisiones de limpieza y transformación previstas

Para preparar los datos se realizarán las siguientes transformaciones:

- Eliminación de registros duplicados.
- Conversión de todas las fechas al mismo formato.
- Unificación del huso horario.
- Conversión de todas las unidades de medida a un formato común.
- Conversión de tipos de datos numéricos.
- Tratamiento de valores nulos mediante interpolación o eliminación cuando sea necesario.
- Eliminación de registros claramente erróneos.
- Agregación de los datos horarios de REE a nivel diario.
- Unión de los datasets mediante el campo `fecha`.

Además, se crearán nuevas variables derivadas que podrán mejorar el rendimiento del modelo:

- Día de la semana.
- Mes.
- Estación del año.
- Indicador de fin de semana.
- Temperatura media móvil.
- Velocidad media móvil del viento.

Una vez realizada la agregación temporal, ambos datasets se unirán mediante el campo **fecha**, obteniendo un único conjunto de datos preparado para el análisis y el entrenamiento del modelo predictivo.

# Riesgos del modelo de datos

La parte más sólida del modelo es la disponibilidad de datos históricos de generación eléctrica y datos meteorológicos, ya que ambas fuentes son públicas y ofrecen información de calidad.

La mayor incertidumbre se encuentra en la integración de ambas fuentes, debido a posibles diferencias en formatos, resolución temporal y disponibilidad histórica.

La fuente que podría presentar más problemas es AEMET, ya que algunas funcionalidades requieren autenticación y pueden existir limitaciones de uso.

En caso de que no fuera posible construir la capa Gold exactamente como se ha definido, el proyecto se simplificaría utilizando únicamente las variables meteorológicas imprescindibles y la generación eléctrica agregada por fecha, manteniendo el objetivo de desarrollar un modelo predictivo de generación renovable.
