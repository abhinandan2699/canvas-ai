# Canvas AI

An AI-powered study assistant that integrates with course materials (PDFs, PowerPoints) to provide flashcards, quizzes, chat tutoring, learning maps, and AI-generated video summaries.

## Prerequisites

- Python 3.10+
- Node.js 18+
- An [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) resource with a GPT-4o deployment
- An [OpenAI](https://platform.openai.com/) API key (for Whisper, TTS, and DALL-E 3)

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd canvas-ai
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your API keys:

| Variable | Description |
|---|---|
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key |
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI endpoint URL |
| `AZURE_OPENAI_DEPLOYMENT` | Your deployment name (e.g. `gpt-4o`) |
| `AZURE_OPENAI_API_VERSION` | API version (default: `2024-02-01`) |
| `OPENAI_API_KEY` | Standard OpenAI API key (for Whisper, TTS, DALL-E 3) |

### 3. Set up the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Set up the frontend

```bash
cd frontend
npm install
```

## Running the App

Open two terminals:

**Terminal 1 — Backend**
```bash
cd backend
source .venv/bin/activate        # On Windows: .venv\Scripts\activate
uvicorn app:app --reload
```
The API will be available at `http://localhost:8000`.

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```
The app will be available at `http://localhost:5173`.

## Project Structure

```
canvas-ai/
├── backend/
│   ├── app.py                  # FastAPI server
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Your local env vars (not committed)
│   ├── .env.example            # Template for env vars
│   ├── courses/
│   │   ├── courses.json        # Course metadata
│   │   └── <course-folder>/
│   │       ├── lectures/       # Upload lecture PDFs/PPTXs here
│   │       └── assignments/    # Upload assignment files here
│   ├── conversations/          # Saved chat conversations (auto-created)
│   └── progress/               # Quiz progress tracking (auto-created)
└── frontend/
    ├── src/
    │   ├── App.jsx             # Router setup
    │   ├── pages/              # Page components
    │   └── components/         # Shared UI components
    └── vite.config.js          # Proxies /api to localhost:8000
```

## Adding Courses

Edit `backend/courses/courses.json` to add a course entry, then create the corresponding folder under `backend/courses/` with `lectures/` and `assignments/` subdirectories. Drop lecture files (PDF or PPTX) into the `lectures/` folder and they will automatically be available in the app.
