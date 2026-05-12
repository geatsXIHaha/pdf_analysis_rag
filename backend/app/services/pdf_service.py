import os
import re
from typing import List, Tuple

from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document

from ..config import settings


def _safe_filename(name: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9._-]+", "_", name).strip("_")
    return base or "document.pdf"


async def save_upload(file: UploadFile, doc_id: str) -> Tuple[str, str]:
    filename = _safe_filename(file.filename or f"{doc_id}.pdf")
    path = os.path.join(settings.upload_dir, f"{doc_id}-{filename}")
    contents = await file.read()
    with open(path, "wb") as handle:
        handle.write(contents)
    return path, filename


def load_pages(path: str) -> List[Document]:
    loader = PyPDFLoader(path)
    return loader.load()
