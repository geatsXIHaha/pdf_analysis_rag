from uuid import uuid4

import traceback

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from ..config import settings
from ..models import (
    AnnotationIn,
    AnnotationResponse,
    ChatRequest,
    ChatResponse,
    DocsResponse,
    DocMeta,
    SummaryResult,
    TranslateRequest,
    TranslateResponse,
    UploadResponse,
)
from ..services.annotation_store import add_annotation, delete_annotation, list_annotations
from ..services.chat_service import ChatService
from ..services.doc_store import get_doc, list_docs
from ..services.delete_service import delete_document
from ..services.ingestion_service import ingest_pdf
from ..services.summary_service import load_summary
from ..services.translation_service import translate_text
from ..vectorstore.chroma_store import get_vectorstore

router = APIRouter()
chat_service = ChatService(get_vectorstore())


@router.get("/docs", response_model=DocsResponse)
def docs_list() -> DocsResponse:
    return DocsResponse(items=[DocMeta(**doc) for doc in list_docs()])


@router.get("/docs/{doc_id}", response_model=DocMeta)
def docs_get(doc_id: str) -> DocMeta:
    doc = get_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocMeta(**doc)


@router.get("/docs/{doc_id}/file")
def docs_file(doc_id: str) -> FileResponse:
    doc = get_doc(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(doc["path"], media_type="application/pdf", filename=doc["filename"])


@router.delete("/docs/{doc_id}", status_code=204)
def docs_delete(doc_id: str) -> None:
    deleted = delete_document(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)) -> UploadResponse:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    doc_id = str(uuid4())
    try:
        meta, summary = await ingest_pdf(doc_id, file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to ingest PDF") from exc

    return UploadResponse(
        doc_id=meta["id"],
        filename=meta["filename"],
        pages=meta["pages"],
        summary=SummaryResult(**summary),
    )


@router.get("/summary/{doc_id}", response_model=SummaryResult)
def summary_get(doc_id: str) -> SummaryResult:
    summary = load_summary(doc_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return SummaryResult(**summary)


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        response = chat_service.ask(
            doc_id=request.doc_id,
            question=request.message,
            session_id=request.session_id,
        )
        return ChatResponse(**response)
    except RuntimeError as exc:
        trace = traceback.format_exc()
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={"error": str(exc), "trace": trace},
        ) from exc


@router.get("/annotations/{doc_id}", response_model=AnnotationResponse)
def annotations_get(doc_id: str) -> AnnotationResponse:
    return AnnotationResponse(items=list_annotations(doc_id))


@router.post("/annotations", response_model=AnnotationResponse)
def annotations_post(payload: AnnotationIn) -> AnnotationResponse:
    if payload.type != "pin":
        raise HTTPException(status_code=400, detail="Only pin annotations are supported")
    items = add_annotation(payload)
    return AnnotationResponse(items=items)


@router.delete("/annotations/{doc_id}/{annotation_id}", response_model=AnnotationResponse)
def annotations_delete(doc_id: str, annotation_id: str) -> AnnotationResponse:
    items = delete_annotation(doc_id, annotation_id)
    if items is None:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return AnnotationResponse(items=items)


@router.post("/translate", response_model=TranslateResponse)
def translate(payload: TranslateRequest) -> TranslateResponse:
    translation = translate_text(payload.text)
    return TranslateResponse(translation=translation)
