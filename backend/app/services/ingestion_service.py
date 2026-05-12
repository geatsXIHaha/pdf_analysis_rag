import os
from datetime import datetime
from typing import Dict, Tuple

from fastapi import UploadFile
from langchain_text_splitters import RecursiveCharacterTextSplitter

from ..config import settings
from ..services.doc_store import add_doc
from ..services.pdf_service import load_pages, save_upload
from ..services.summary_service import generate_summary
from ..vectorstore.chroma_store import add_documents, delete_documents


async def ingest_pdf(doc_id: str, file: UploadFile) -> Tuple[Dict, Dict]:
    path = None
    filename = None
    try:
        path, filename = await _save_file(doc_id, file)
        pages = _load_pages(path)
        chunks = _chunk_pages(doc_id, pages)
        add_documents(chunks)
        summary = generate_summary(doc_id, pages)

        meta = {
            "id": doc_id,
            "filename": filename,
            "path": path,
            "pages": len(pages),
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
        add_doc(meta)
        return meta, summary
    except Exception:
        _cleanup_partial(doc_id, path)
        raise


async def _save_file(doc_id: str, file: UploadFile) -> Tuple[str, str]:
    path, filename = await save_upload(file, doc_id)
    return path, filename


def _load_pages(path: str):
    try:
        return load_pages(path)
    except Exception as exc:
        raise ValueError("Failed to read PDF") from exc


def _chunk_pages(doc_id: str, pages):
    for page in pages:
        page.metadata["doc_id"] = doc_id
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    return splitter.split_documents(pages)


def _cleanup_partial(doc_id: str, path: str | None) -> None:
    if path and os.path.exists(path):
        os.remove(path)

    summary_path = os.path.join(settings.summaries_dir, f"{doc_id}.json")
    if os.path.exists(summary_path):
        os.remove(summary_path)

    annotation_path = os.path.join(settings.annotations_dir, f"{doc_id}.json")
    if os.path.exists(annotation_path):
        os.remove(annotation_path)

    try:
        delete_documents(doc_id)
    except Exception:
        pass
