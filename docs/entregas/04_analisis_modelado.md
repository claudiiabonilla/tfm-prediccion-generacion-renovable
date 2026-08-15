# `PROYECTO:` Predicción de generación renovable y resiliencia del sistema eléctrico ante eventos meteorológicos extremos

# Problema que se busca resolver

El proyecto busca analizar y predecir la generación de energía solar fotovoltaica en España para la siguiente jornada, utilizando el histórico de generación y las condiciones meteorológicas disponibles antes de realizar la predicción.

El alcance inicial se limitará a una única tecnología renovable, la **solar fotovoltaica**, y a un único ámbito geográfico, **España**, con el objetivo de construir primero un modelo predictivo fiable antes de incorporar funcionalidades más avanzadas relacionadas con eventos meteorológicos extremos y resiliencia del sistema eléctrico.

La pregunta principal del proyecto será:

> **¿Podemos predecir la generación solar fotovoltaica de la siguiente jornada utilizando la generación histórica y las condiciones meteorológicas disponibles antes de realizar la predicción?**

La predicción obtenida se utilizará posteriormente como base para analizar escenarios de baja generación y estudiar posibles necesidades de potencia y energía de respaldo ante situaciones meteorológicas adversas.

El forecasting tendrá una **granularidad diaria**, debido a que los datos meteorológicos de AEMET utilizados presentan esta granularidad. Los datos horarios de REE se conservarán para realizar posteriormente el análisis de resiliencia y estudiar la evolución intradiaria de la demanda y la generación.

# Análisis de datos planteado y utilidad esperada

Antes del modelado se realizará un análisis exploratorio de los datos de generación fotovoltaica de REE y de las variables meteorológicas de AEMET. El objetivo será comprender el comportamiento de la generación solar, comprobar la calidad de los datos y detectar los factores meteorológicos relacionados con una mayor o menor producción.

En primer lugar se analizará la **calidad y cobertura de los datos**, comprobando valores ausentes, duplicados, valores anómalos y diferencias entre las fuentes. Se utilizarán tablas de valores nulos, histogramas y boxplots. Este análisis permitirá determinar qué variables pueden utilizarse de forma fiable.

Se realizará posteriormente un **análisis temporal** de la generación fotovoltaica para estudiar tendencias y estacionalidad. Se utilizarán series temporales, gráficos de líneas y boxplots por mes para analizar la evolución anual y estacional. También se analizará la generación media por día y por periodo temporal para identificar patrones recurrentes.

Se estudiará la **relación entre meteorología y generación fotovoltaica**, utilizando gráficos de dispersión y matrices de correlación. Se buscará identificar qué variables presentan una relación más relevante con la producción solar y qué condiciones meteorológicas están asociadas a reducciones de generación.

También se analizarán los periodos de **generación fotovoltaica anormalmente baja**, especialmente aquellos coincidentes con condiciones meteorológicas adversas. Se utilizarán series temporales, boxplots y gráficos de dispersión para identificar patrones asociados a estos escenarios.

Durante el modelado se analizarán las variables más relevantes y los errores de predicción mediante gráficos de importancia de variables, predicción frente a valor real, histogramas de errores y series temporales. Los errores podrán segmentarse por mes, periodo y condiciones meteorológicas para identificar situaciones en las que el modelo tenga un peor comportamiento.

Después del modelado se utilizarán las predicciones para realizar un **análisis de resiliencia**. En esta fase se conservará la granularidad horaria de REE para analizar posibles situaciones de déficit de potencia y energía. Se podrán calcular indicadores como déficit máximo de potencia (MW), duración del déficit y energía de respaldo necesaria (MWh).

Las alertas meteorológicas y los eventos extremos se incorporarán inicialmente como un análisis complementario, ya que su baja frecuencia puede dificultar una validación estadística robusta.

Los principales resultados que podrán incorporarse al MVP serán:

- Evolución y predicción de la generación fotovoltaica.
- Patrones temporales y estacionales.
- Relación entre meteorología y generación.
- Importancia de las variables utilizadas.
- Errores y estabilidad del modelo.
- Escenarios de baja generación.
- Estimación de posibles déficits y necesidades de respaldo energético.

# Tipo de modelos que se van a plantear

El proyecto se abordará como un problema de **forecasting y regresión temporal**, cuyo objetivo será predecir la generación fotovoltaica nacional de la siguiente jornada a partir de su comportamiento histórico y de las variables meteorológicas disponibles antes de realizar la predicción.

Como **baseline** se utilizará una predicción basada en valores históricos equivalentes, como la generación del día anterior o del mismo día de la semana anterior. Este modelo permitirá comprobar si los modelos de Machine Learning aportan una mejora real.

Como modelos candidatos se plantea inicialmente utilizar:

- **Regresión Lineal**, como modelo sencillo e interpretable.
- **Random Forest o Gradient Boosting**, para capturar relaciones no lineales e interacciones entre variables meteorológicas y temporales.

La Regresión Lineal permitirá establecer una referencia sencilla y analizar relaciones aproximadamente lineales. Su principal limitación es que puede no representar adecuadamente las relaciones no lineales existentes entre meteorología y generación fotovoltaica.

Los modelos basados en árboles podrán representar relaciones no lineales y trabajar adecuadamente con datos tabulares y variables derivadas. Como inconvenientes presentan una mayor complejidad y menor interpretabilidad.

La comparación se realizará mediante validación temporal y métricas como **MAE y RMSE**, teniendo en cuenta no solo la precisión sino también la estabilidad temporal, interpretabilidad y complejidad.

La estimación posterior de déficit y necesidades de respaldo no constituirá un segundo modelo predictivo, sino una **capa analítica derivada de las predicciones obtenidas**.

# Datos de entrada del análisis y los modelos

La capa Gold estará orientada al análisis y predicción de la generación solar fotovoltaica en España, integrando los datos de generación eléctrica de REE con las variables meteorológicas de AEMET.

La **unidad de análisis del modelo será el día**, de forma que cada fila represente una jornada concreta de generación fotovoltaica nacional junto con las variables meteorológicas y temporales correspondientes.

La clave principal será `fecha`, que identificará de forma única cada jornada.

La variable objetivo será:

`generacion_fotovoltaica`

Esta variable representará la generación solar fotovoltaica nacional correspondiente al día analizado.

Las principales variables predictoras serán:

- Generación fotovoltaica histórica mediante variables retardadas como `lag_1`, `lag_7` o equivalentes temporales.
- Variables meteorológicas de AEMET seleccionadas según su calidad y relación con la generación.
- Variables temporales como día de la semana, mes y día del año.
- Variables derivadas como medias móviles y otras transformaciones temporales.

Las variables meteorológicas candidatas se seleccionarán después del análisis exploratorio. Se priorizarán aquellas que presenten una relación física y estadística justificable con la generación fotovoltaica y una calidad suficiente.

Debido a que REE representa la generación nacional y AEMET dispone de múltiples estaciones, las observaciones meteorológicas no se asociarán directamente a una única estación. Se analizará la distribución y cobertura de las estaciones y se establecerá una estrategia de agregación espacial que permita obtener variables representativas del ámbito nacional.

La meteorología y la generación utilizada como entrada deberán representar únicamente información disponible antes de realizar la predicción. Se evitará utilizar observaciones futuras o variables derivadas que incorporen información posterior al momento de predicción.

### Estructura conceptual de la capa Gold

| Campo                     | Descripción                                                | Tipo    | Fuente          | Obligatorio |
| ------------------------- | ---------------------------------------------------------- | ------- | --------------- | ----------- |
| `fecha`                   | Fecha de referencia de la jornada                          | date    | AEMET / REE     | Sí          |
| `tmed`                    | Temperatura media agregada de las estaciones seleccionadas | float   | AEMET           | No          |
| `tmin`                    | Temperatura mínima agregada                                | float   | AEMET           | No          |
| `tmax`                    | Temperatura máxima agregada                                | float   | AEMET           | No          |
| `prec`                    | Precipitación agregada                                     | float   | AEMET           | No          |
| `velmedia`                | Velocidad media del viento agregada                        | float   | AEMET           | No          |
| `racha`                   | Racha máxima de viento agregada                            | float   | AEMET           | No          |
| `presMax`                 | Presión máxima agregada                                    | float   | AEMET           | No          |
| `presMin`                 | Presión mínima agregada                                    | float   | AEMET           | No          |
| `hrMedia`                 | Humedad relativa media agregada                            | float   | AEMET           | No          |
| `generacion_fotovoltaica` | Generación fotovoltaica nacional diaria                    | float   | REE             | Sí          |
| `percentage_fotovoltaica` | Porcentaje correspondiente a la generación fotovoltaica    | float   | REE             | No          |
| `alerta_activa`           | Indica si existe un aviso meteorológico activo             | boolean | AEMET           | No          |
| `tipo_fenomeno`           | Tipo de fenómeno meteorológico                             | string  | AEMET           | No          |
| `nivel_alerta`            | Nivel del aviso: amarillo, naranja o rojo                  | string  | AEMET           | No          |
| `severidad`               | Nivel numérico del aviso                                   | int     | AEMET           | No          |
| `dia_semana`              | Día de la semana                                           | int     | Derivada        | Sí          |
| `mes`                     | Mes del año                                                | int     | Derivada        | Sí          |
| `dia_año`                 | Día del año                                                | int     | Derivada        | Sí          |
| `generacion_lag_1`        | Generación fotovoltaica del día anterior                   | float   | Derivada de REE | Sí          |
| `generacion_lag_7`        | Generación fotovoltaica de hace 7 días                     | float   | Derivada de REE | Sí          |
| `generacion_media_7d`     | Media móvil de generación de los últimos 7 días            | float   | Derivada de REE | No          |

> Cada fila de la capa Gold representa una jornada concreta de generación fotovoltaica nacional en España, acompañada de las condiciones meteorológicas agregadas y de la información histórica disponible hasta ese momento.

**Variable objetivo:** `generacion_fotovoltaica`

**Granularidad del modelo:** diaria.

**Ámbito geográfico:** España.

**Clave principal:** `fecha`.

**Tecnología:** solar fotovoltaica.

**Horizonte:** siguiente jornada.

**Control de leakage:** únicamente información disponible antes de realizar la predicción.

# Datos de salida y forma de consumo

El modelo producirá una **predicción de generación fotovoltaica nacional para la siguiente jornada**, expresada en la misma unidad utilizada por la variable objetivo.

La salida principal será:

`prediccion_generacion_fotovoltaica`

| Campo                 | Descripción                              | Tipo   |
| --------------------- | ---------------------------------------- | ------ |
| `fecha`               | Jornada predicha                         | date   |
| `generacion_real`     | Generación fotovoltaica observada        | float  |
| `generacion_predicha` | Generación fotovoltaica estimada         | float  |
| `error`               | Diferencia entre valor real y predicción | float  |
| `modelo`              | Modelo utilizado                         | string |

La salida tendrá **granularidad diaria y ámbito nacional**.

Se almacenará inicialmente en un fichero CSV o Parquet y podrá integrarse posteriormente en una tabla o vista de la capa Gold/serving.

En el MVP se mostrará mediante un dashboard la generación real frente a la predicha, la evolución temporal, los errores y los principales indicadores de rendimiento.

Como información adicional se mostrarán métricas como MAE y RMSE y, cuando sea posible, intervalos de predicción o información sobre la incertidumbre.

La predicción se utilizará posteriormente para identificar escenarios de baja generación y analizar sus posibles implicaciones sobre la cobertura de la demanda.

# Estrategia para diseñar y seleccionar el modelo

El dataset de modelado se construirá a partir de la capa Gold diaria, definiendo como variable objetivo `generacion_fotovoltaica`.

Antes de entrenar los modelos se realizará el tratamiento de valores nulos, detección de valores anómalos y creación de variables temporales y retardadas. Las transformaciones se realizarán respetando el orden temporal para evitar incorporar información futura.

Se construirá inicialmente un **baseline histórico**, que servirá como referencia para determinar si los modelos de Machine Learning aportan una mejora real.

Posteriormente se entrenarán pocos modelos candidatos:

1. Regresión Lineal.
2. Random Forest o Gradient Boosting.

La comparación tendrá en cuenta:

- MAE y RMSE.
- Estabilidad en distintos periodos.
- Comportamiento en periodos de baja generación.
- Interpretabilidad.
- Complejidad.
- Coste computacional.
- Utilidad para el MVP.

No se seleccionará un modelo únicamente por obtener la mejor métrica en un único periodo.

La regla de decisión será seleccionar el modelo que consiga una mejora consistente respecto al baseline, manteniendo un comportamiento estable y una complejidad razonable para el objetivo del proyecto.

# Estrategia de validación y evaluación

Al tratarse de una serie temporal, la validación será **temporal** y no se realizará una división aleatoria de los datos.

Los datos se dividirán cronológicamente en entrenamiento, validación y prueba. El conjunto de prueba permanecerá aislado hasta la evaluación final.

De forma conceptual:

```text
Pasado ───────────────────────────────► Futuro

[ Entrenamiento ] [ Validación ] [ Prueba ]

```

También se podrá utilizar **backtesting temporal** para comprobar la estabilidad del modelo en diferentes periodos.

Para evitar **data leakage**:

- No se utilizarán datos futuros en las variables predictoras.
- Los retardos se calcularán únicamente con información histórica.
- Las medias móviles no incluirán el día que se pretende predecir.
- La meteorología utilizada deberá representar la información disponible antes de la predicción.
- El conjunto de prueba será posterior temporalmente al entrenamiento.

Las principales métricas serán:

- **MAE:** permite interpretar directamente el error medio de predicción.
- **RMSE:** penaliza más los errores grandes y permite detectar predicciones especialmente alejadas del valor real.

Los modelos se compararán siempre con el **baseline**.

Además de las métricas globales, se analizarán los errores por:

- Mes.
- Estación del año.
- Nivel de generación.
- Condiciones meteorológicas.
- Periodos de generación excepcionalmente baja.

Se considerará aceptable un modelo cuando mejore de forma consistente al baseline y mantenga un comportamiento estable en el conjunto de prueba y en los distintos periodos analizados.

Si ningún modelo supera al baseline, se revisará la calidad de las variables y se considerará mantener el baseline o utilizar un modelo estadístico de forecasting más sencillo.

# Riesgos y alternativas

Uno de los principales riesgos es la **calidad y disponibilidad de los datos**. La generación fotovoltaica de REE representa adecuadamente la variable objetivo, pero el modelo trabajará a nivel diario para mantener la coherencia con los datos meteorológicos de AEMET. Esto supone perder información intradiaria, aunque los datos horarios de REE se conservarán para el análisis posterior de resiliencia.

Existe también un riesgo importante de **data leakage**. Las variables predictoras, retardos y medias móviles deberán construirse únicamente con información disponible antes de realizar la predicción.

La **cobertura espacial de AEMET** puede limitar la capacidad del modelo, ya que las estaciones meteorológicas no representan necesariamente de forma uniforme todo el territorio nacional. Se analizará su distribución y se establecerá una estrategia de agregación adecuada.

Los **eventos meteorológicos extremos** pueden presentar pocos casos en el histórico disponible. Por este motivo, inicialmente se tratarán como un análisis complementario y no como el núcleo del modelo.

La mayor incertidumbre estará en determinar hasta qué punto las variables meteorológicas agregadas a nivel nacional permiten explicar correctamente la generación fotovoltaica nacional.

Si ningún modelo supera de forma consistente al baseline, se revisarán las variables y la estrategia de agregación. Si el problema persiste, se mantendrá el baseline o se probará un modelo estadístico más sencillo.

Si los datos meteorológicos disponibles resultan insuficientes, se podrá ampliar el histórico o incorporar fuentes meteorológicas con mayor resolución temporal.

Los principales riesgos y sus medidas de control son:

| Riesgo                                | Medida                                                         |
| ------------------------------------- | -------------------------------------------------------------- |
| Pérdida de información intradiaria    | Mantener datos horarios de REE para el análisis de resiliencia |
| Data leakage                          | Validación temporal y uso exclusivo de información disponible  |
| Datos insuficientes o de baja calidad | Control de nulos, anomalías y cobertura                        |
| Cobertura espacial de AEMET           | Agregación de las estaciones seleccionadas                     |
| Pocos eventos extremos                | Tratarlos como análisis complementario                         |
| El modelo no supera al baseline       | Mantener baseline o probar modelos estadísticos                |
| Meteorología insuficiente             | Ampliar fuentes o histórico                                    |

En conjunto, el proyecto priorizará la **calidad de los datos, la ausencia de leakage y una validación temporal rigurosa** antes que la complejidad del modelo.

La **predicción diaria de generación fotovoltaica** constituirá el núcleo del MVP. Posteriormente, los **datos horarios de REE** podrán utilizarse para analizar escenarios de déficit y estimar las necesidades de potencia y energía de respaldo.
