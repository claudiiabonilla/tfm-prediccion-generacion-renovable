# `PROYECTO:` Predicción de generación renovable

# Resumen de la solución y del usuario

El proyecto tiene como objetivo predecir la **generación solar fotovoltaica nacional de la siguiente jornada (24 horas)** utilizando información disponible antes del momento de realizar la predicción. La solución integra la generación histórica de REE con variables meteorológicas de AEMET y variables temporales.

El usuario principal será un **analista o profesional de planificación y seguimiento del sistema eléctrico,** que necesita anticipar la generación fotovoltaica esperada para el día siguiente y disponer de información suficiente para interpretar la predicción.

El producto se plantea como un **predictor con dashboard operativo**, cuya función principal será mostrar la generación estimada para la siguiente jornada junto con su contexto energético, meteorológico e histórico.
El resultado principal será una predicción en GWh/día, acompañada de una comparación con jornadas anteriores, un intervalo de predicción y una explicación resumida de los factores utilizados por el modelo.

# Imagen mockup del frontal

![Mockup del frontal](assets/05_mockup_frontal_MVP.png)

[Prototipo figma](https://www.figma.com/proto/mp7NUSAb3A5oYtRHj2JAPH/TFM---prediccion-generacion-renovable?node-id=1-3&p=f&t=5pS0oxNJUaRqda0a-0&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&device-frame=0)

El mockup representa la pantalla principal del MVP para la consulta de la predicción de generación fotovoltaica nacional para la siguiente jornada. a interfaz combina los principales indicadores energéticos con información histórica y meteorológica para facilitar la interpretación del resultado.

# Justificación del diseño

### Utilidad y valor de la solución

El frontal transforma el resultado del modelo predictivo en información útil para la **planificación y el seguimiento de la generación fotovoltaica.**

La interfaz prioriza cinco elementos:

1. **Predicción principal:** generación fotovoltaica estimada para la siguiente jornada, expresada en GWh/día.
2. **Contexto energético:** energía disponible y demanda eléctrica para interpretar la relevancia de la generación prevista.
3. **Comparación histórica:** evolución de la generación de los últimos días y comparación con la predicción.
4. **Evolución de la generación:** representación de la producción prevista a lo largo de la jornada.
5. **Contexto meteorológico:** variables como irradiación, temperatura, viento, humedad y precipitación, que permiten interpretar las condiciones previstas.

La pantalla principal evita mostrar directamente variables técnicas del modelo o métricas de evaluación, reservándolas para posibles vistas de detalle.

El objetivo es responder de forma rápida a tres preguntas:

> ¿Cuánta generación fotovoltaica se espera mañana?  
> ¿Cómo se compara con los días anteriores?  
> ¿En qué condiciones meteorológicas se producirá?

### Flujo de usuario

El flujo principal de interacción será el siguiente:

1. **Acceso:** el usuario accede al dashboard y visualiza la jornada seleccionada y los principales indicadores.
2. **Selección:** puede seleccionar la fecha o el contexto que desea analizar.
3. **Procesamiento:** el sistema utiliza los datos históricos de generación, las variables meteorológicas y las variables temporales para generar la predicción.
4. **Resultado:** se muestran la generación fotovoltaica prevista, la energía disponible y la demanda eléctrica.
5. **Comparación:** el usuario puede contrastar la predicción con jornadas anteriores y con los valores reales disponibles.
6. **Interpretación:** las visualizaciones meteorológicas y de generación ayudan a contextualizar el resultado.
7. **Avisos:** ante problemas de disponibilidad de datos, incidencias o eventos meteorológicos relevantes, el sistema mostrará mensajes informativos.

### Experiencia de usuario

El diseño se basa en los siguientes principios:

**Jerarquía visual.** Los KPI principales ocupan la zona superior y permiten obtener una visión rápida de la situación.

**Simplicidad.** La información se agrupa en bloques de indicadores, gráficos, meteorología y avisos.

**Legibilidad y consistencia.** Se utilizan nombres comprensibles, unidades explícitas y cifras fácilmente interpretables.

**Contextualización.** La predicción se acompaña de información histórica, meteorológica e indicadores de incertidumbre.

**Control.** El usuario puede seleccionar la jornada y consultar diferentes contextos de análisis.

**Feedback.** Se contemplan indicadores de actualización de datos y mensajes de aviso ante incidencias.

**Accesibilidad.** La información no depende exclusivamente del color y se priorizan etiquetas y valores explícitos.

**Transparencia de los datos.** Se identifican las fuentes de datos utilizadas **—REE y AEMET—** y la fecha de actualización.

# Presentación de resultados y explicabilidad

El resultado principal del sistema será la **predicción de generación solar fotovoltaica para la siguiente jornada**, expresada en GWh/día.

La pantalla principal contará inicialmente con tres KPI:

- **Predicción de generación fotovoltaica:** generación estimada para la siguiente jornada.
- **Energía disponible:** energía estimada disponible para la cobertura de la demanda.
- **Demanda eléctrica:** demanda estimada para la jornada analizada.

Estos indicadores se complementarán con visualizaciones destinadas a contextualizar el resultado:

- **Energía disponible y demanda:** permitirá comparar ambas magnitudes y observar si la generación prevista resulta suficiente para cubrir la demanda.
- **Predicción frente a días anteriores:** evolución reciente de la generación y comparación con la previsión.
- **Predicción a generación real:** comparación entre los valores previstos y observados para evaluar visualmente el comportamiento del modelo.
- **Mapa de irradiación media diaria prevista:** representación espacial de la irradiación cuando la disponibilidad y granularidad de los datos lo permitan.
- **Previsión meteorológica:** temperatura máxima y mínima, irradiación, viento y humedad.

La predicción no se presentará como un valor aislado. Se mostrará junto con referencias históricas, condiciones meteorológicas e información sobre su incertidumbre, permitiendo al usuario valorar tanto el resultado como su fiabilidad.

Las métricas técnicas del modelo, la importancia de las variables y el análisis detallado de errores quedarán reservados para una posible vista de análisis avanzado.

> **Nota de diseño:** algunos elementos, como el mapa de irradiación o determinadas visualizaciones avanzadas, podrán implementarse de forma progresiva en función de la disponibilidad de datos y del tiempo de desarrollo.

### IA generativa como capa de explicación

El sistema incorporará un **chatbot basado en IA generativa** como capa complementaria de interacción.

Su función será **explicar los resultados del modelo y facilitar su interpretación mediante lenguaje natural**, pero no realizar la predicción. La generación de la predicción seguirá siendo responsabilidad del modelo de Machine Learning.

El usuario podrá realizar preguntas como:

- ¿Cuánta generación fotovoltaica se espera mañana?
- ¿Cómo se compara con los días anteriores?
- ¿Qué condiciones meteorológicas se prevén?
- ¿Por qué la predicción es superior o inferior a otros días?
- ¿Qué diferencia existe entre la generación prevista y la demanda?
- ¿Qué indica el intervalo de predicción?

La arquitectura conceptual será:

**Datos REE + AEMET → modelo predictivo → resultados → dashboard Angular/Power BI → chatbot de explicación**

De esta forma, se mantienen separadas las funciones de predicción y explicación.

# Alcance del MVP

El MVP se centrará en ofrecer una solución funcional para **predecir y consultar la generación solar fotovoltaica nacional de la siguiente jornada**, proporcionando el contexto necesario para interpretar el resultado.

La parte funcional del MVP incluirá:

- Obtención y preparación de datos de REE y AEMET.
- Construcción de la capa Gold orientada al modelado.
- Desarrollo y validación del modelo predictivo.
- Generación de la predicción diaria de generación fotovoltaica.
- Integración de los resultados en un dashboard.
- KPI de generación fotovoltaica prevista.
- KPI de energía disponible.
- KPI de demanda eléctrica.
- Comparación de la predicción con jornadas anteriores.
- Comparación entre predicción y generación real.
- Visualización de las principales condiciones meteorológicas.

El modelo predictivo se desarrollará en **Python**, utilizando los datos preparados en la capa Gold. **Power BI** se utilizará para el análisis y la visualización de los datos, mientras que **Angular** se empleará para construir el frontal y la experiencia de usuario.

El diseño de Figma representa una propuesta más amplia que el núcleo funcional del MVP. Algunas funcionalidades podrán mantenerse inicialmente como representación visual y desarrollarse posteriormente.

Entre las posibles ampliaciones se encuentran:

- Análisis de eventos meteorológicos extremos.
- Análisis de resiliencia del sistema eléctrico.
- Estimación de necesidades de potencia y energía de respaldo.
- Análisis más detallado de déficit y cobertura de la demanda.
- Conservación y explotación de datos horarios de REE.
- Ampliación de las capacidades del chatbot.

La predicción diaria de generación fotovoltaica nacional constituye el núcleo del MVP. Las funcionalidades relacionadas con resiliencia, escenarios extremos y respaldo energético se consideran extensiones del proyecto.
