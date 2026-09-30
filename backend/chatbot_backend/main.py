"""
API del asistente del modelo de prediccion de generacion fotovoltaica.

FastAPI con la base documental y el system_prompt cambiados para que hablen del proyecto de prediccion de generacion fotovoltaica (REE + AEMET).
"""

import os

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import InMemorySaver

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

DATA_RUTA_PDF = "../data"
DATA_RUTA_CSV = "../data/gold"

# 1. Modelo Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite",
    temperature=0.7,
    google_api_key=API_KEY,
)

# 2. Cargar y unificar los PDFs de la carpeta data/
pdf_files = [
    os.path.join(DATA_RUTA_PDF, f)
    for f in os.listdir(DATA_RUTA_PDF)
    if f.endswith(".pdf")
]

documentos = []
for pdf_file in pdf_files:
    loader = PyPDFLoader(pdf_file)
    documentos.extend(loader.load())

print(f"PDFs cargados: {len(pdf_files)} | Paginas totales: {len(documentos)}")

predicciones = pd.read_csv(
    os.path.join(DATA_RUTA_CSV, "predicciones_test_2021_2025.csv")
)

metricas = pd.read_csv(
    os.path.join(DATA_RUTA_CSV, "powerbi_metricas_modelos.csv")
)

backtesting = pd.read_csv(
    os.path.join(DATA_RUTA_CSV, "powerbi_backtesting.csv")
)

gold = pd.read_csv(
    os.path.join(DATA_RUTA_CSV, "gold_diario_2021_2025.csv")
)

# 3. Chunking + embeddings + ChromaDB
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = text_splitter.split_documents(documentos)

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    collection_name="prediccion_fotovoltaica",
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

# 4. System prompt
system_prompt = """
Eres el asistente experto del dashboard de un proyecto de predicción de
generación solar fotovoltaica nacional en España.

El proyecto tiene como objetivo predecir la generación fotovoltaica nacional
de la siguiente jornada, con granularidad diaria, utilizando información
disponible antes del día objetivo.

El proyecto combina:
- Datos históricos de generación fotovoltaica de REE.
- Variables meteorológicas de AEMET.
- Un modelo de Regresión Lineal como modelo predictivo.
- Evaluación mediante MAE y RMSE.
- Validación temporal mediante backtesting.
- Una interfaz Angular para visualizar las predicciones, resultados y
  condiciones meteorológicas.

IMPORTANTE SOBRE LA PREDICCIÓN:
La fecha mostrada como "fecha objetivo" corresponde al día que se quiere
predecir, es decir, la siguiente jornada respecto al momento en que se realiza
la predicción.

El modelo utiliza información histórica y variables meteorológicas disponibles
antes del día objetivo. No debe utilizar datos meteorológicos observados del
propio día que se está prediciendo como variables de entrada.

FUENTES DE INFORMACIÓN:

1. DOCUMENTACIÓN PDF
Los documentos PDF contienen información sobre:
- Objetivo del proyecto.
- Metodología.
- Preparación e integración de los datos.
- Variables utilizadas.
- Funcionamiento del modelo.
- Evaluación.
- Limitaciones.
- Diseño y funcionamiento del dashboard.

Cuando el usuario pregunte por aspectos metodológicos, conceptuales o técnicos
del proyecto, utiliza la herramienta `buscar_documentacion`.

2. CSV DE PREDICCIONES
El CSV de predicciones contiene, entre otros campos:
- fecha
- generacion_real
- generacion_predicha
- error
- modelo

Cuando el usuario pregunte por la predicción de una fecha concreta, por la
generación real, la generación predicha o el error de predicción, utiliza la
herramienta `consultar_predicciones`.

3. CSV DE MÉTRICAS
El CSV de métricas contiene los resultados de evaluación de los modelos,
incluyendo MAE y RMSE.

Cuando el usuario pregunte qué modelo funciona mejor, por MAE, RMSE o por la
comparación entre modelos, utiliza la información correspondiente de los
datos de métricas.

4. CSV DE BACKTESTING
El CSV de backtesting contiene los resultados de validación temporal y la
mejora respecto al baseline.

Cuando el usuario pregunte por la estabilidad del modelo, backtesting,
comparación con el baseline o mejora porcentual, utiliza la información
correspondiente de los datos de backtesting.

5. CSV GOLD
El dataset Gold contiene la información diaria integrada de generación
fotovoltaica y variables meteorológicas.

Puede utilizarse para responder preguntas sobre:
- Generación fotovoltaica histórica.
- Temperatura.
- Precipitación.
- Horas de sol.
- Humedad relativa.
- Otras variables meteorológicas disponibles en el dataset.

REGLAS DE RESPUESTA:

- Responde siempre en español.
- Sé claro, conciso y fácil de entender.
- No inventes datos.
- No completes información específica del proyecto utilizando conocimientos
  externos.
- Cuando la pregunta requiera un dato concreto de los CSV, utiliza la
  herramienta correspondiente.
- Cuando la pregunta sea sobre metodología o documentación, utiliza
  `buscar_documentacion`.
- Si una pregunta requiere combinar documentación y datos, utiliza las
  herramientas necesarias.
- Si la información solicitada no está disponible en la documentación o en los
  datos, indícalo claramente.
- No confundas la generación real con la generación predicha.
- No confundas el día anterior con el día objetivo.
- Cuando hables de la predicción, deja claro que corresponde a la siguiente
  jornada.
- Si el usuario pregunta por una fecha concreta, utiliza el formato de fecha
  disponible en los datos.
- Si el usuario pregunta por una métrica, indica qué representa y, si procede,
  su valor.
- No presentes una predicción histórica como si fuera una predicción realizada
  en tiempo real.

LIMITACIONES DEL PROYECTO:

El modelo actual utiliza información histórica y variables meteorológicas
disponibles antes del día objetivo. No utiliza una predicción meteorológica
real de AEMET para anticipar las condiciones del día futuro.

Por tanto, esta es una limitación importante del sistema y debe mencionarse
cuando sea relevante.

El proyecto tampoco incluye actualmente:
- Predicción de demanda eléctrica.
- Otras tecnologías renovables dentro del modelo principal.
- Un análisis completo de resiliencia del sistema eléctrico.
- Cálculo de potencia de respaldo ante eventos meteorológicos extremos.

Si el usuario pregunta por estas cuestiones, explica que quedan fuera del
alcance del MVP actual.

CONVERSACIÓN:

Si el usuario saluda, se despide o realiza una conversación general, responde
de forma natural y no es necesario utilizar las herramientas.

Si el usuario pregunta por el proyecto, el modelo, los datos, las
predicciones, las métricas, el backtesting o el funcionamiento del dashboard,
utiliza las herramientas disponibles para obtener información antes de
responder.

Tu objetivo es ayudar al usuario a interpretar correctamente el modelo y los
resultados mostrados en el dashboard, no sustituir la documentación técnica.
"""


@tool
def buscar_documentacion(query: str) -> str:
    """Busca informacion relevante sobre el modelo de prediccion de
    generacion fotovoltaica: variables, metricas, metodologia, limitaciones.
    """
    docs = retriever.invoke(query)
    if not docs:
        return "No encuentro esa informacion en la documentacion del proyecto."

    resultados = []
    for doc in docs:
        pagina = doc.metadata.get("page", "desconocida")
        fuente = doc.metadata.get("source", "desconocida")
        resultados.append(f"[Fuente: {fuente} | Pagina: {pagina}]\n{doc.page_content}")

    return "\n\n".join(resultados)

@tool
def consultar_predicciones(fecha: str) -> str:
    """Consulta la predicción fotovoltaica para una fecha concreta."""

    fila = predicciones[
        predicciones["fecha"] == fecha
    ]

    if fila.empty:
        return f"No hay datos para la fecha {fecha}."

    return fila.to_string(index=False)

@tool
def consultar_metricas(fecha: str) -> str:
    """Consulta las métricas de evaluación de los modelos."""

    fila = metricas[metricas["fecha"] == fecha]

    if fila.empty:
        return "No hay datos de métricas disponibles."

    return fila.to_string(index=False)


@tool
def consultar_backtesting(fecha: str) -> str:
    """Consulta los resultados del backtesting y la mejora respecto al baseline."""

    fila = backtesting[backtesting["fecha"] == fecha]

    if fila.empty:
        return "No hay datos de backtesting disponibles."

    return fila.to_string(index=False)


@tool
def consultar_datos_meteorologicos(fecha: str) -> str:
    """Consulta las condiciones meteorológicas y generación de una fecha concreta."""

    fila = gold[gold["fecha"] == fecha]

    if fila.empty:
        return f"No hay datos meteorológicos para la fecha {fecha}."

    return fila.to_string(index=False)


# 5. Agente RAG con memoria
checkpointer = InMemorySaver()

agente_rag = create_agent(
    model=llm,
    tools=[
        buscar_documentacion,
        consultar_predicciones,
        consultar_metricas,
        consultar_backtesting,
        consultar_datos_meteorologicos
    ],
    system_prompt=system_prompt,
    checkpointer=checkpointer,
)


def preguntar_agente(pregunta: str, thread_id: str) -> str:
    respuesta = agente_rag.invoke(
        {"messages": [HumanMessage(content=pregunta)]},
        config={"configurable": {"thread_id": thread_id}},
    )
    contenido = respuesta["messages"][-1].content

    # El contenido puede venir como string simple o como lista de bloques
    # (segun el modelo); normalizamos siempre a texto plano.
    if isinstance(contenido, list):
        return "".join(
            bloque.get("text", "") for bloque in contenido if isinstance(bloque, dict)
        )
    return contenido


# 6. API FastAPI
app = FastAPI(title="API asistente - prediccion generacion fotovoltaica")

# CORS: permite que Angular (ng serve, normalmente en localhost:4200) llame
# a esta API sin ser bloqueado por el navegador. Ajusta el origen cuando
# despliegues Angular a un dominio real.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PreguntaRequest(BaseModel):
    pregunta: str
    thread_id: str = "chat_1"


class RespuestaResponse(BaseModel):
    respuesta: str


@app.post("/chat", response_model=RespuestaResponse)
def chat(payload: PreguntaRequest):
    respuesta = preguntar_agente(payload.pregunta, payload.thread_id)
    return RespuestaResponse(respuesta=respuesta)


@app.get("/health")
def health():
    return {"status": "ok", "pdfs_cargados": len(pdf_files)}
