from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4

from schemas import EventInput, NoteInput
from agent import analyze_event, analyze_note, prepare_event_agents, prepare_reflection_agents
from memory import EVENT_DB, NOTE_DB

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/events")
async def create_event(event: EventInput):
    reflection_runner, USER_ID, SESSION_ID = await prepare_event_agents()
    analysis = await analyze_event(event.title, reflection_runner, USER_ID, SESSION_ID )

    event_id = str(uuid4())

    EVENT_DB[event_id] = {
        "title": event.title,
        "datetime": event.datetime,
        "analysis": analysis,
    }
    print(f"analysis:\n {analysis}")
    return {
        "event_id": event_id,
        "analysis": analysis,
    }


@app.get("/events")
async def list_events():
    return EVENT_DB


@app.post("/notes")
async def add_note(note: NoteInput):
    reflection_runner, USER_ID, SESSION_ID = await prepare_reflection_agents()
    reflection = await analyze_note(note.note, reflection_runner, USER_ID, SESSION_ID)

    NOTE_DB[note.event_id] =reflection
    print(f"reflection:\n {reflection}")

    return reflection


@app.get("/notes")
async def get_notes():
    return NOTE_DB
