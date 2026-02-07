from pydantic import BaseModel
from typing import List


class EventInput(BaseModel):
    title: str
    datetime: str


class EventAnalysis(BaseModel):
    event_type: str
    category: str
    preparation_focus: List[str]
    risk_factors: List[str]
    advice: List[str]


class NoteInput(BaseModel):
    event_id: str
    note: str


class NoteAnalysis(BaseModel):
    category: str
    lesson: str
    severity: str
    emotion: str
