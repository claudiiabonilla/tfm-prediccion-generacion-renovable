# `PROYECTO:` Predicción de generación renovable y resiliencia del sistema eléctrico ante eventos meteorológicos extremos

> **Nota de revisión:** de los documentos de planteamiento, este es el que más fielmente se ha cumplido en la implementación final. Se mantiene la estructura y el contenido original, añadiendo notas donde el desarrollo confirmó, ajustó o descartó lo planteado.

# Problema que se busca resolver

El proyecto busca analizar y predecir la generación de energía solar fotovoltaica en España para la siguiente jornada, utilizando el histórico de generación y las condiciones meteorológicas disponibles antes de realizar la predicción.

El alcance se ha mantenido tal como se planteó: una única tecnología (**solar fotovoltaica**) y un único ámbito geográfico (**España**), sin incorporar finalmente las funcionalidades avanzadas de eventos meteorológicos extremos y resiliencia, que quedan como ampliación futura ("si sobra tiempo"), no como fase ya iniciada del MVP.

La pregunta principal del proyecto se mantiene sin cambios:

> **¿Podemos predecir la generación solar fotovoltaica de la siguiente jornada utilizando la generación histórica y las condiciones meteorológicas disponibles antes de realizar la predicción?**

**Respuesta obtenida:** sí, de forma consistente. El modelo final (Regresión Lineal) mejora al baseline histórico un +11,2 % en el conjunto de test y un +7,18 % de media en un backtesting de 18 ventanas temporales, con el 100 % de las ventanas superando al baseline.

**Cambio respecto al planteamiento inicial:** los **datos horarios de REE no llegaron a descargarse ni conservarse** en la implementación final — el proyecto trabajó únicamente con la generación fotovoltaica diaria y mensual por CCAA. La conservación de la granularidad horaria para el futuro análisis de resiliencia queda pendiente para cuando esa fase se aborde, no como algo ya conservado a la espera de uso.

# Análisis de datos planteado y utilidad esperada

El análisis exploratorio se realizó siguiendo fielmente lo planteado:

- **Calidad y cobertura de datos:** implementado (nulos, duplicados, valores anómalos, boxplots) en los notebooks de limpieza (`01`, `02`) y en el EDA (`00`).
- **Análisis temporal:** implementado — serie completa, boxplot por mes, generación media mensual por año. Se identificó además un hallazgo no anticipado explícitamente en el planteamiento: una **tendencia de crecimiento interanual** en la generación (no solo estacionalidad), atribuible al aumento de potencia fotovoltaica instalada en España durante 2021-2025.
- **Relación meteorología-generación:** implementado con matriz de correlación y scatter plots. Las variables más correlacionadas fueron horas de sol, temperatura máxima y humedad relativa — resultado coherente con lo esperado físicamente.
- **Periodos de generación anormalmente baja:** implementado mediante z-score mensual, con caracterización meteorológica de esos días (más precipitación, más humedad, menos horas de sol).
- **Importancia de variables y errores del modelo:** implementado (coeficientes estandarizados, backtesting), aunque solo se segmentaron los errores **por mes**, no por estación del año, nivel de generación o condiciones meteorológicas de forma sistemática, tal como se planteaba de forma más amplia en el documento original.

**Cambio respecto al planteamiento inicial:** el **análisis de resiliencia** (déficit de potencia, energía de respaldo) no se ha iniciado — queda íntegramente como ampliación futura, dado que depende de los datos horarios de REE que no se llegaron a incorporar. Las **alertas meteorológicas y eventos extremos** tampoco se incorporaron ni siquiera como "análisis complementario" tal como preveía el documento original; en su lugar, el análisis de días de baja generación cumple una función similar pero basada en desviación estadística de la propia serie, no en avisos oficiales de AEMET.

# Tipo de modelos que se van a plantear

Implementado exactamente como se planteó:

- **Baseline histórico** (generación del día anterior).
- **Regresión Lineal.**
- **Random Forest y Gradient Boosting.**

**Resultado, validando la regla de decisión definida en este mismo documento** ("seleccionar el modelo que consiga una mejora consistente respecto al baseline, manteniendo un comportamiento estable"): la **Regresión Lineal** fue el único modelo que superó al baseline de forma consistente. Random Forest y Gradient Boosting, con hiperparámetros por defecto, obtuvieron peor rendimiento que el propio baseline — resultado coherente con la limitación anticipada en este documento sobre la Regresión Lineal ("puede no representar relaciones no lineales"), que en la práctica no penalizó al modelo lineal porque la relación dominante entre las variables resultó ser mayoritariamente lineal.

La comparación se realizó con **MAE y RMSE**, validación temporal y backtesting, tal como se planteaba.

# Datos de entrada del análisis y los modelos

La estructura conceptual de la capa Gold se implementó con una diferencia relevante respecto a la tabla original:

**Cambio respecto al planteamiento inicial — campos no implementados:** `alerta_activa`, `tipo_fenomeno`, `nivel_alerta` y `severidad` no llegaron a incorporarse a la capa Gold final, al no integrarse ninguna fuente de alertas meteorológicas (ver sección anterior).

**Cambio respecto al planteamiento inicial — control de leakage, concretado:** el documento preveía usar "únicamente información disponible antes de realizar la predicción" sin especificar el mecanismo. En la implementación final, esto se concretó usando las variables meteorológicas con **retardo de 1 día** (`tmax_lag_1`, `sol_lag_1`, etc.) en vez de un forecast meteorológico real — decisión necesaria al no disponer de un histórico de forecasts con fecha de emisión, y documentada como limitación de diseño en el resto de la memoria.

El resto de la sección se cumple sin cambios: unidad de análisis diaria, clave `fecha`, variable objetivo `generacion_fotovoltaica`, variables predictoras (lags de generación, meteorología, variables temporales), y la estrategia de agregación espacial de AEMET (finalmente implementada como ponderación por comunidad autónoma usando generación real como proxy de potencia instalada, al no disponer de datos de potencia instalada real).

# Datos de salida y forma de consumo

Implementado exactamente como se planteó: la tabla de salida (`fecha`, `generacion_real`, `generacion_predicha`, `error`, `modelo`) coincide con el esquema final de `predicciones_test_2021_2025.csv`, almacenado en CSV y Parquet.

El dashboard muestra generación real frente a predicha, evolución temporal, errores y KPIs de rendimiento, tal como se planteaba.

**Cambio respecto al planteamiento inicial:** los **intervalos de predicción / información de incertidumbre**, mencionados como algo a mostrar "cuando sea posible", finalmente no se implementaron — el modelo de Regresión Lineal usado (`scikit-learn`) no proporciona intervalos de confianza de forma nativa, y no se llegó a calcular una estimación empírica alternativa a partir de la distribución de errores del backtesting. Queda como ampliación futura si se quiere enriquecer el dashboard con esa información.

# Estrategia para diseñar y seleccionar el modelo

Implementada sin cambios respecto al planteamiento: tratamiento de nulos y anomalías antes del modelado, baseline histórico, comparación de los mismos criterios (MAE/RMSE, estabilidad, comportamiento en baja generación, interpretabilidad, complejidad, coste computacional, utilidad para el MVP), y la misma regla de decisión, que fue la que efectivamente determinó la elección final de la Regresión Lineal frente a los modelos de árboles.

# Estrategia de validación y evaluación

Implementada sin cambios respecto al planteamiento: validación temporal (sin división aleatoria), backtesting temporal (finalmente con 18 ventanas deslizantes de 60 días entre 2022 y 2024, exigiendo al menos un año de histórico de entrenamiento antes de la primera ventana), y control de _data leakage_ mediante retardos calculados solo con información histórica.

**Cambio respecto al planteamiento inicial:** la segmentación de errores prevista "por mes, estación del año, nivel de generación y condiciones meteorológicas" se implementó únicamente **por mes** de forma sistemática. La caracterización meteorológica de los días de peor rendimiento se cubrió de forma indirecta a través del análisis de días de baja generación (EDA), pero no como un análisis de errores del modelo segmentado explícitamente por esas variables.

El criterio final de aceptación del modelo (mejora consistente sobre el baseline, comportamiento estable en test y en las distintas ventanas del backtesting) se cumplió, por lo que no fue necesario activar la alternativa prevista ("mantener el baseline o utilizar un modelo estadístico más sencillo").

# Riesgos y alternativas — balance final

| Riesgo (planteamiento inicial)        | Resultado final                                                                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pérdida de información intradiaria    | Se mantiene como riesgo/pendiente: los datos horarios de REE no llegaron a descargarse; la medida prevista (conservarlos) no se ejecutó                                                                            |
| Data leakage                          | Controlado — resuelto mediante retardos de 1 día en todas las variables meteorológicas y de generación                                                                                                             |
| Datos insuficientes o de baja calidad | Controlado — nulos, anomalías y cobertura revisados en los notebooks de limpieza; incidencias adicionales no previstas (separador decimal, zona horaria, límites de la API de REE) resueltas durante el desarrollo |
| Cobertura espacial de AEMET           | Controlado — agregación por CCAA ponderada por generación real, en vez de una media simple de estaciones                                                                                                           |
| Pocos eventos extremos                | No llegó a evaluarse — las alertas meteorológicas no se incorporaron ni como análisis complementario                                                                                                               |
| El modelo no supera al baseline       | No se materializó — la Regresión Lineal superó al baseline de forma consistente en test y backtesting                                                                                                              |
| Meteorología insuficiente             | No se materializó — las variables de AEMET disponibles resultaron suficientes para un modelo con mejora consistente                                                                                                |

**Riesgo no anticipado en el planteamiento inicial, y que resultó ser el de mayor impacto en el diseño final:** la necesidad de trabajar con meteorología retardada (día anterior) en vez de un forecast real, al no disponer de un histórico de previsiones con fecha de emisión. Este riesgo no aparecía en la tabla original y se descubrió durante el desarrollo del feature engineering, condicionando una parte central del diseño del modelo y del dashboard (que muestra "meteorología de referencia del día anterior" en vez de "previsión para mañana").

En conjunto, la prioridad declarada en el planteamiento inicial — **calidad de los datos, ausencia de leakage y validación temporal rigurosa antes que complejidad del modelo** — se mantuvo como criterio rector durante todo el desarrollo, y los resultados finales (mejora consistente sobre el baseline, estabilidad en el backtesting) validan que fue la prioridad correcta para el alcance del MVP.

La predicción diaria de generación fotovoltaica constituye el núcleo entregado del MVP. El análisis de resiliencia, la estimación de déficit y las necesidades de potencia y energía de respaldo permanecen, tal como se preveía, como extensión futura del proyecto.
