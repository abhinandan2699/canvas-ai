import json
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

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


def load_courses():
    with open(COURSES_JSON) as f:
        return json.load(f)["courses"]


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

    # Security: ensure file is within the expected directory
    try:
        file_path.resolve().relative_to((COURSES_DIR / course["folder"] / file_type).resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")

    return FileResponse(file_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
