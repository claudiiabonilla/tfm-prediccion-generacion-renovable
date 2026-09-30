# Predicción de generación fotovoltaica — Guía de arranque

Este proyecto tiene dos partes independientes que se ejecutan por separado:

- **`chatbot_backend/`** — API en FastAPI que sirve el asistente RAG (LangChain + Gemini) consultado por el dashboard.
- **`frontend/`** — dashboard en Angular (Chart.js) que consume los CSV de predicciones y el backend del chatbot.

Los notebooks de datos (`00` a `05`) son un tercer entorno aparte, independiente de estos dos, y no hace falta tenerlos activos para levantar el dashboard.

---

## 1. Backend del chatbot (FastAPI)

### 1.1 Activar el entorno virtual

Si el entorno aún no existe, créalo una vez:

```bash
cd chatbot_backend
python -m venv .venv
```

Actívalo cada vez que vayas a trabajar en el backend:

**Windows (PowerShell):**

```bash
.venv\Scripts\Activate.ps1
```

**Windows (CMD):**

```bash
.venv\Scripts\activate.bat
```

**Mac / Linux:**

```bash
source .venv/bin/activate
```

Verás el prefijo `(.venv)` en la terminal cuando esté activo.

### 1.2 Instalar dependencias (solo la primera vez, o si cambia `requirements.txt`)

```bash
pip install -r requirements.txt
```

### 1.3 Configurar la clave de API

crea un archivo nuevo llamado `.env` (con el punto delante, sin extensión) dentro de chatbot_backend/, y escribe dentro:

```
GOOGLE_API_KEY=tu_clave_real_aqui
```

### 1.4 Colocar la documentación del proyecto

Asegúrate de que la carpeta `chatbot_backend/data/` contiene los PDF que forman la base de conocimiento del asistente (ficha del modelo). Sin PDFs ahí, el asistente no tendrá nada que consultar.

### 1.5 Arrancar el servidor

```bash
uvicorn main:app --reload --port 8000
```

Comprueba que responde:

```
http://localhost:8000/health
```

Debe devolver algo como `{"status": "ok", "pdfs_cargados": N}`. Deja esta terminal abierta mientras trabajes con el dashboard.

---

## 2. Frontend (Angular)

Abre una **segunda terminal** (deja la del backend corriendo en la primera).

### 2.1 Instalar dependencias (solo la primera vez, o si cambia `package.json`)

```bash
cd frontend
npm install
```

### 2.2 Arrancar el servidor de desarrollo

```bash
ng serve
```

Abre en el navegador:

```
http://localhost:4200
```

El dashboard carga los CSV desde `public/data/` de forma estática y llama al backend del chatbot en `http://localhost:8000/chat` cuando se usa el asistente — por eso el backend debe estar arrancado **antes** de abrir el chat.

---

## 3. Orden de arranque resumido

1. Terminal 1 → activar `.venv` y `chatbot_backend/` → `uvicorn main:app --reload --port 8000`
2. Terminal 2 → `cd frontend` → `ng serve`
3. Navegador → `http://localhost:4200`

Para parar cualquiera de los dos servidores: `Ctrl + C` en su terminal correspondiente.

---

## 4. Notebooks de datos (aparte, no necesarios para el día a día del dashboard)

Los notebooks `00_eda` a `05_modelado` tienen su propio entorno virtual, separado de `chatbot_backend`. Solo hace falta ejecutarlos de nuevo si se actualizan los datos de origen (AEMET/REE) o se reentrena el modelo — no forman parte del arranque habitual del dashboard.

```bash
cd notebooks
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
jupyter notebook
```

Tras ejecutarlos, los CSV de salida (`data/gold/*.csv`) deben copiarse a `frontend/public/data/` para que el dashboard los recoja.
