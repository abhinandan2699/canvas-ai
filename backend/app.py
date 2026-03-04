import json
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

app = FastAPI(title="Canvas AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent
COURSES_DIR = BASE_DIR / "courses"
COURSES_JSON = COURSES_DIR / "courses.json"

openai_client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
)


def load_courses():
    with open(COURSES_JSON) as f:
        return json.load(f)["courses"]


# ---------------------------------------------------------------------------
# Text extraction helpers
# ---------------------------------------------------------------------------

def extract_text_from_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(path))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)
    except Exception as e:
        return f"[Could not extract text from {path.name}: {e}]"


def extract_text_from_pptx(path: Path) -> str:
    try:
        from pptx import Presentation
        prs = Presentation(str(path))
        slides = []
        for i, slide in enumerate(prs.slides, 1):
            texts = []
            for shape in slide.shapes:
                if shape.has_text_frame:
                    texts.append(shape.text_frame.text)
            slides.append(f"[Slide {i}]\n" + "\n".join(texts))
        return "\n\n".join(slides)
    except Exception as e:
        return f"[Could not extract text from {path.name}: {e}]"


def extract_lecture_context(course_id: str) -> str:
    courses = load_courses()
    course = next((c for c in courses if c["id"] == course_id), None)
    if not course:
        return ""

    lectures_dir = COURSES_DIR / course["folder"] / "lectures"
    if not lectures_dir.exists():
        return ""

    parts = []
    for f in sorted(lectures_dir.iterdir()):
        if not f.is_file() or f.name.startswith("."):
            continue
        ext = f.suffix.lower()
        parts.append(f"=== {f.name} ===")
        if ext == ".pdf":
            parts.append(extract_text_from_pdf(f))
        elif ext in (".pptx", ".ppt"):
            parts.append(extract_text_from_pptx(f))
        elif ext in (".txt", ".md"):
            parts.append(f.read_text(errors="ignore"))
        else:
            parts.append(f"[Binary file — content not extractable]")

    return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# Existing endpoints
# ---------------------------------------------------------------------------

@app.get("/api/courses")
def get_courses():
    return load_courses()


@app.get("/api/courses/{course_id}/files/{file_type}")
def list_files(course_id: str, file_type: str):
    if file_type not in ("lectures", "assignments"):
        raise HTTPException(status_code=400, detail="file_type must be 'lectures' or 'assignments'")

    courses = load_courses()
    course = next((c for c in courses if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    folder = COURSES_DIR / course["folder"] / file_type
    if not folder.exists():
        return []

    files = [
        f.name for f in folder.iterdir()
        if f.is_file() and not f.name.startswith(".")
    ]
    return sorted(files)


@app.get("/api/courses/{course_id}/files/{file_type}/{filename}")
def get_file(course_id: str, file_type: str, filename: str):
    if file_type not in ("lectures", "assignments"):
        raise HTTPException(status_code=400, detail="file_type must be 'lectures' or 'assignments'")

    courses = load_courses()
    course = next((c for c in courses if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    file_path = COURSES_DIR / course["folder"] / file_type / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    try:
        file_path.resolve().relative_to((COURSES_DIR / course["folder"] / file_type).resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")

    return FileResponse(file_path)


# ---------------------------------------------------------------------------
# StudyBuddy chat endpoint
# ---------------------------------------------------------------------------

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]


@app.post("/api/courses/{course_id}/studybuddy/chat")
def studybuddy_chat(course_id: str, body: ChatRequest):
    courses = load_courses()
    course = next((c for c in courses if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    context = extract_lecture_context(course_id)

    system_prompt = f"""You are StudyBuddy, a helpful AI tutor for the course "{course['name']}".
You have been given the full text of the course lecture slides below.
Answer student questions clearly and accurately based on this material.
If a question is not covered in the slides, say so honestly and help as best you can.

--- LECTURE CONTENT ---
{context if context else "No lecture files have been uploaded yet for this course."}
--- END OF LECTURE CONTENT ---"""

    def stream():
        response = openai_client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o"),
            max_tokens=2048,
            stream=True,
            messages=[
                {"role": "system", "content": system_prompt},
                *[{"role": m.role, "content": m.content} for m in body.messages],
            ],
        )
        for chunk in response:
            if not chunk.choices:
                continue
            text = chunk.choices[0].delta.content
            if text:
                yield f"data: {json.dumps(text)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
