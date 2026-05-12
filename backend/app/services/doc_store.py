from typing import Dict, List, Optional

from pydantic import BaseModel, Field

from ..config import settings
from ..utils import load_json, save_json


class DocIndex(BaseModel):
    items: Dict[str, Dict] = Field(default_factory=dict)
    order: List[str] = Field(default_factory=list)


def _read_index() -> DocIndex:
    data = load_json(settings.docs_index_file, {"items": {}, "order": []})
    if isinstance(data, list):
        index = DocIndex()
        for doc in data:
            doc_id = doc.get("id") if isinstance(doc, dict) else None
            if doc_id:
                index.items[doc_id] = doc
                index.order.append(doc_id)
        return index
    try:
        index = DocIndex(**data)
    except Exception:
        index = DocIndex()
    return index


def _write_index(index: DocIndex) -> None:
    save_json(settings.docs_index_file, index.model_dump())


def list_docs() -> List[Dict]:
    index = _read_index()
    return [index.items[doc_id] for doc_id in index.order if doc_id in index.items]


def save_docs(docs: List[Dict]) -> None:
    index = DocIndex()
    for doc in docs:
        doc_id = doc.get("id")
        if doc_id:
            index.items[doc_id] = doc
            index.order.append(doc_id)
    _write_index(index)


def add_doc(doc: Dict) -> None:
    doc_id = doc.get("id")
    if not doc_id:
        return
    index = _read_index()
    index.items[doc_id] = doc
    if doc_id not in index.order:
        index.order.append(doc_id)
    _write_index(index)


def get_doc(doc_id: str) -> Optional[Dict]:
    index = _read_index()
    return index.items.get(doc_id)


def delete_doc(doc_id: str) -> Optional[Dict]:
    index = _read_index()
    removed = index.items.pop(doc_id, None)
    if removed is not None:
        index.order = [item for item in index.order if item != doc_id]
        _write_index(index)
    return removed
