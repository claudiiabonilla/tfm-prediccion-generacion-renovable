# `PROYECTO:` Predicción de generación renovable y resiliencia del sistema eléctrico ante eventos meteorológicos extremos

> **Nota de revisión:** este documento actualiza el planteamiento inicial con las decisiones tomadas durante el desarrollo del proyecto. Los cambios respecto a la versión original se explican en cada sección; el motivo general es acotar el alcance a algo entregable con rigor metodológico dentro del tiempo disponible, dejando el resto como ampliaciones futuras explícitas.

## Idea seleccionada

La generación de energía renovable, especialmente la **solar fotovoltaica**, depende directamente de las condiciones meteorológicas, lo que provoca una elevada variabilidad en la producción eléctrica. Esta incertidumbre dificulta la planificación del sistema eléctrico y puede agravarse durante fenómenos meteorológicos extremos, aumentando el riesgo de desequilibrios entre generación y demanda. La motivación del proyecto surge tanto del interés por aplicar Machine Learning al sector energético como de acontecimientos recientes en España (DANA, borrasca Filomena, el gran apagón eléctrico) que evidencian la vulnerabilidad de las infraestructuras ante eventos climáticos.

**Cambio respecto al planteamiento inicial:** se descarta la energía **eólica** del alcance del MVP. El proyecto se centra en una única tecnología (solar fotovoltaica) y un único ámbito geográfico (España, agregado nacional), siguiendo el criterio de construir primero un modelo predictivo fiable y acotado antes de ampliar a otras tecnologías o desagregaciones territoriales.

## Objetivos

### Objetivo principal

Desarrollar un modelo predictivo basado en Machine Learning que estime la **generación solar fotovoltaica nacional del día siguiente**, a partir de la generación histórica y las condiciones meteorológicas disponibles antes del momento de la predicción.

### Objetivos específicos

Predecir la generación fotovoltaica con horizonte de un día (siguiente jornada).

- Analizar la relación entre variables meteorológicas y la generación observada, incluyendo los episodios de generación anormalmente baja.
- Facilitar la visualización y el análisis de la información mediante un dashboard interactivo.
- _(Ampliación futura, no incluida en el MVP)_ Analizar el impacto de eventos meteorológicos extremos y detectar situaciones de riesgo mediante un sistema de alertas.

**Cambio respecto al planteamiento inicial:** el "sistema de alertas ante situaciones de riesgo" pasa de objetivo específico del MVP a ampliación futura. La baja frecuencia de eventos extremos en el histórico disponible dificulta una validación estadística robusta en esta fase; el análisis de días de generación anormalmente baja sí se incluye, pero como caracterización descriptiva (comparación de condiciones meteorológicas), no como sistema de alertas operativo.

## Producto mínimo viable (MVP)

El proyecto final incluye:

- Predicción diaria de generación fotovoltaica para la siguiente jornada.
- Modelo de Regresión Lineal (seleccionado tras comparar con Random Forest, Gradient Boosting y un baseline histórico) con validación temporal y backtesting.
- Dashboard en Angular (Chart.js) con KPIs de predicción, comparación de modelos, estabilidad del backtesting y meteorología de referencia del día anterior.
- Informe complementario en Power BI para el análisis técnico detallado, enlazado desde la documentación del dashboard.
- Visualización de días de generación anormalmente baja y sus condiciones meteorológicas asociadas.
- Asistente conversacional (RAG con LangChain + Gemini) que explica el funcionamiento y las limitaciones del modelo a partir de la documentación del proyecto.

**Cambios respecto al planteamiento inicial:**

- La "comparación entre generación real y predicha" y los "gráficos interactivos" se mantienen, pero implementados como componentes Angular con Chart.js en vez de como parte de una única aplicación web genérica.
- El "sistema de alertas" no forma parte del MVP entregado (ver Objetivos).
- Se añade un asistente conversacional no contemplado en el planteamiento inicial, como capa de explicabilidad del modelo.
- Power BI se incorpora como herramienta de análisis técnico, complementaria al dashboard de Angular, no como sustituto de este.

# Datos necesarios

## Variables de generación eléctrica

| Variable                | Descripción                                    |
| ----------------------- | ---------------------------------------------- |
| Fecha                   | Marca temporal (granularidad diaria)           |
| Generación fotovoltaica | Energía generada (MWh/día)                     |
| Porcentaje sobre el mix | Peso de la fotovoltaica en la generación total |

**Cambio respecto al planteamiento inicial:** se elimina la columna "Tecnología" como variable libre (solar/eólica/hidráulica) — el proyecto usa una única tecnología, así que no hace falta esa dimensión. La granularidad pasa de horaria a **diaria** (ver más abajo).

## Variables meteorológicas

Variables finalmente utilizadas, procedentes de AEMET y agregadas a nivel nacional mediante ponderación por comunidad autónoma (proxy de potencia instalada, calculado a partir de la generación fotovoltaica real por CCAA):

| Variable                           |
| ---------------------------------- |
| Temperatura media, mínima y máxima |
| Precipitación                      |
| Velocidad media del viento y racha |
| Humedad relativa media             |
| Presión máxima y mínima            |
| Horas de sol (proxy de radiación)  |

**Cambio respecto al planteamiento inicial:** no se dispone de una variable de "radiación solar" directa en los datos climatológicos diarios de AEMET; se usa **horas de sol** como proxy, variable que en el análisis exploratorio mostró la correlación más alta con la generación fotovoltaica. Tampoco se incluye "dirección del viento" ni "nubosidad" como variables independientes, al no estar disponibles con calidad suficiente en la fuente diaria utilizada.

**Limitación importante identificada durante el desarrollo:** las variables meteorológicas utilizadas por el modelo corresponden al **día anterior** a la predicción, no a un forecast del día objetivo. Esto se decidió así para evitar _data leakage_ (usar observaciones que en un escenario real no estarían disponibles en el momento de predecir), a falta de un histórico de forecasts meteorológicos con fecha de emisión. Se documenta como limitación conocida y como línea de mejora futura.

## Eventos meteorológicos

_(Ampliación futura, no incluida en el MVP)_

| Variable                 |
| ------------------------ |
| Alertas meteorológicas   |
| Tipo de episodio extremo |
| Nivel de severidad       |

**Cambio respecto al planteamiento inicial:** estas variables no se han incorporado al modelo ni al dashboard. En su lugar, el proyecto incluye un análisis descriptivo de los días con generación anormalmente baja (identificados por desviación estadística respecto a la media mensual), caracterizados por su patrón meteorológico asociado (más precipitación, más humedad, menos horas de sol), sin llegar a integrar un sistema de alertas basado en avisos oficiales.

## Características del conjunto de datos

- **Granularidad:** diaria.
- **Histórico:** 2021-2025 (5 años).
- **Volumen:** ~1.825 registros diarios a nivel nacional (capa Gold), construidos a partir de un volumen mayor de datos horarios/mensuales de origen (REE) y diarios por estación (AEMET).

**Cambio respecto al planteamiento inicial:** la granularidad pasa de horaria a **diaria**, por dos motivos: los datos climatológicos diarios de AEMET utilizados no tienen resolución horaria, y trabajar a nivel diario simplifica la construcción de un primer modelo fiable, dejando la explotación de los datos horarios de REE (que sí se conservan) para una futura fase de análisis de resiliencia.

### Datos imprescindibles

- Generación fotovoltaica diaria nacional (REE).
- Generación fotovoltaica mensual por CCAA (REE), usada para calcular los pesos de agregación espacial de la meteorología.
- Variables meteorológicas diarias por estación (AEMET), agregadas a nivel nacional.

### Datos deseables

- Forecast meteorológico con fecha de emisión (para eliminar la limitación de usar meteorología del día anterior).
- Demanda eléctrica.
- Alertas meteorológicas oficiales.
- Datos horarios de REE explotados para el análisis de resiliencia (déficit de potencia, energía de respaldo).

# Fuentes de datos

## Red Eléctrica de España (REE)

https://www.ree.es/en/datos/apidata

**Información disponible**

- Generación fotovoltaica diaria nacional (`estructura-generacion`).
- Generación fotovoltaica mensual por comunidad autónoma (`estructura-generacion`, con `geo_trunc`/`geo_limit`/`geo_ids`).

**Formato**

- API REST (REData)
- JSON

**Incidencias encontradas durante la integración:** los identificadores de comunidad autónoma (`geo_ids`) no están documentados de forma completa y hubo que verificarlos de forma empírica; la API solo permite consultar rangos de hasta 6 meses por petición, lo que exige un script de descarga por tramos con reintentos; algunas comunidades (Ceuta) presentaron periodos sin generación fotovoltaica reportada en años iniciales, tratados como generación nula tras confirmarlo contra la propia API.

## AEMET OpenData

https://opendata.aemet.es/centrodedescargas/inicio

**Información disponible**

Valores climatológicos diarios por estación (temperatura, precipitación, viento, humedad, presión, horas de sol).

**Formato**

- API REST
- JSON / CSV

**Incidencias encontradas durante la integración:** fue necesario mapear cada estación a su comunidad autónoma (vía provincia) para poder agregar la meteorología con la ponderación adecuada; se detectaron y corrigieron valores anómalos puntuales (p. ej. codificaciones de error como ±50°C)

# Consideraciones de privacidad y protección de datos

Sin cambios respecto al planteamiento inicial: el proyecto utiliza exclusivamente datos abiertos de organismos públicos (REE, AEMET), sin datos personales ni información identificable, por lo que no aplica ningún proceso de anonimización.

# Viabilidad inicial del proyecto

El proyecto ha resultado viable dentro del alcance acotado (solar fotovoltaica, España, horizonte diario). Los principales riesgos anticipados en el planteamiento inicial se materializaron parcialmente y se resolvieron durante el desarrollo:

- **Integración de fuentes con distinta resolución temporal:** resuelto trabajando a granularidad diaria y agregando la meteorología mediante ponderación por comunidad autónoma.
- **Disponibilidad de las APIs:** ambas fuentes (REE, AEMET) estuvieron disponibles durante todo el desarrollo; no fue necesario recurrir a las alternativas contempladas inicialmente (Open-Meteo, Copernicus, Kaggle).
- **Riesgo no anticipado en el planteamiento inicial:** la necesidad de evitar _data leakage_ meteorológico (usar solo información disponible antes del momento de predicción) resultó ser una limitación de diseño central, resuelta usando meteorología del día anterior en vez de un forecast real, que queda documentada como línea de mejora futura.

El modelo final (Regresión Lineal) mejora de forma consistente al baseline histórico tanto en el conjunto de test (+11,2 %) como en un backtesting de 18 ventanas temporales entre 2022 y 2024 (mejora media +7,18 %, positiva en el 100 % de las ventanas evaluadas), lo que valida la viabilidad técnica del enfoque dentro del alcance definido.
