from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional


class SummaryResult(BaseModel):
    short_summary: str
    detailed_summary: str
    key_topics: List[str]
    keywords: List[str]


class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    pages: int
    summary: SummaryResult


class SourceCitation(BaseModel):
    page: int
    snippet: str
    file: str | None = None


class ChatRequest(BaseModel):
    doc_id: Optional[str] = None
    message: str
    session_id: Optional[str] = None
    strict_mode: bool = True


class ChatResponse(BaseModel):
    answer: str
    session_id: str
    sources: List[SourceCitation] = Field(default_factory=list)


class TranslateRequest(BaseModel):
    text: str
    target_language: str | None = Field(default=None, alias="targetLanguage")

    model_config = ConfigDict(populate_by_name=True)


class TranslateResponse(BaseModel):
    translation: str


class Rect(BaseModel):
    x: float
    y: float
    w: float
    h: float


class AnnotationIn(BaseModel):
    doc_id: str
    type: str
    page: int
    text: str
    rect: Rect
    created_at: Optional[str] = None


class Annotation(BaseModel):
    id: str
    doc_id: str
    type: str
    page: int
    text: str
    rect: Rect
    created_at: str


class AnnotationResponse(BaseModel):
    items: List[Annotation] = Field(default_factory=list)


class DocMeta(BaseModel):
    id: str
    filename: str
    pages: int
    created_at: str


class DocsResponse(BaseModel):
    items: List[DocMeta] = Field(default_factory=list)
