# `PROYECTO:` Predicción de generación renovable y resiliencia del sistema eléctrico ante eventos meteorológicos extremos

## Idea seleccionada

La generación de energía renovable, especialmente la **eólica** y la **solar**, depende directamente de las condiciones meteorológicas, lo que provoca una elevada variabilidad en la producción eléctrica. Esta incertidumbre dificulta la planificación del sistema eléctrico y puede agravarse durante fenómenos meteorológicos extremos, aumentando el riesgo de desequilibrios entre generación y demanda o incluso interrupciones del suministro. En un contexto de transición energética y creciente dependencia de las energías renovables, disponer de herramientas que permitan anticipar estos escenarios resulta de gran interés para operadores eléctricos, administraciones y empresas energéticas. La motivación para este proyecto surge tanto del interés por la aplicación de la inteligencia artificial al sector energético como de acontecimientos recientes en España, como la DANA, la borrasca Filomena o el gran apagón eléctrico, que han puesto de manifiesto la vulnerabilidad de las infraestructuras ante eventos climáticos extremos.

## Objetivos

### Objetivo principal

Desarrollar un modelo predictivo basado en Machine Learning que estime la generación de energía renovable a partir de datos meteorológicos e históricos de producción eléctrica. Además, se analizará la relación entre determinados eventos meteorológicos extremos y las posibles desviaciones en la generación esperada, permitiendo identificar situaciones de riesgo para el sistema eléctrico.

### Objetivos específicos

- Predecir la generación renovable con un horizonte temporal determinado.
- Analizar el impacto de fenómenos meteorológicos extremos sobre la producción eléctrica.
- Detectar situaciones de riesgo mediante un sistema de alertas.
- Facilitar la visualización y el análisis de la información mediante un dashboard interactivo.

---

## Producto mínimo viable (MVP)

El proyecto incluirá una aplicación web con las siguientes funcionalidades:

- Predicción de generación renovable.
- Visualización de datos históricos.
- Comparación entre generación real y predicha.
- Visualización de variables meteorológicas.
- Sistema de alertas ante posibles reducciones significativas de generación.
- Gráficos interactivos para explorar la evolución temporal.

# Datos necesarios

## Variables de generación eléctrica

| Variable         | Descripción                     |
| ---------------- | ------------------------------- |
| Fecha y hora     | Marca temporal                  |
| Tecnología       | Solar, eólica, hidráulica, etc. |
| Energía generada | Potencia generada (MW)          |

## Variables meteorológicas

| Variable             |
| -------------------- |
| Temperatura          |
| Radiación solar      |
| Velocidad del viento |
| Dirección del viento |
| Humedad              |
| Presión atmosférica  |
| Precipitación        |
| Nubosidad            |

## Eventos meteorológicos

| Variable                 |
| ------------------------ |
| Alertas meteorológicas   |
| Tipo de episodio extremo |
| Nivel de severidad       |

## Características del conjunto de datos

- **Granularidad:** horaria.
- **Histórico:** entre 2 y 5 años.
- **Volumen estimado:** varios cientos de miles de registros.

### Datos imprescindibles

- Producción eléctrica por tecnología.
- Variables meteorológicas horarias.

### Datos deseables

- Alertas meteorológicas oficiales.
- Incidencias en la red eléctrica.
- Demanda eléctrica.

# Fuentes de datos

## Red Eléctrica de España (REE)

https://www.ree.es/en/datos/apidata

**Información disponible**

- Producción eléctrica.
- Demanda.
- Mix energético.

**Formato**

- API REST
- JSON

## AEMET OpenData

https://opendata.aemet.es/centrodedescargas/inicio

**Información disponible**

- Variables meteorológicas.
- Alertas.
- Observaciones.

**Formato**

- API REST
- JSON

# Consideraciones de privacidad y protección de datos

El proyecto utilizará exclusivamente datos abiertos procedentes de organismos públicos y servicios meteorológicos.

No se emplearán datos personales ni información que permita identificar personas físicas, por lo que no será necesario aplicar procesos de anonimización.

Los datos pueden utilizarse de forma segura con fines académicos, respetando las licencias de uso de cada fuente.

Como medida adicional, se evitará utilizar cualquier información que pueda estar sujeta a restricciones legales o de confidencialidad.

# Viabilidad inicial del proyecto

El proyecto se considera viable porque existen numerosas fuentes de datos abiertas, oficiales y con suficiente histórico para entrenar modelos predictivos.

La información disponible presenta una granularidad adecuada y permite relacionar variables meteorológicas con la producción eléctrica.

El principal riesgo consiste en integrar correctamente datos procedentes de distintas fuentes y conseguir que todos ellos tengan la misma resolución temporal.

En caso de que alguna API deje de estar disponible, existen alternativas como Open-Meteo, Copernicus o conjuntos de datos publicados en Kaggle que permitirían continuar el desarrollo del proyecto sin modificar el objetivo principal.
