from datetime import datetime
from typing import List
from uuid import uuid4

from ..config import settings
from ..models import Annotation, AnnotationIn
from ..utils import load_json, save_json


def _path(doc_id: str) -> str:
    return f"{settings.annotations_dir}/{doc_id}.json"


def list_annotations(doc_id: str) -> List[Annotation]:
    items = load_json(_path(doc_id), [])
    pins = [item for item in items if item.get("type") == "pin"]
    return [Annotation(**item) for item in pins]


def add_annotation(payload: AnnotationIn) -> List[Annotation]:
    items = load_json(_path(payload.doc_id), [])
    record = {
        "id": str(uuid4()),
        "doc_id": payload.doc_id,
        "type": payload.type,
        "page": payload.page,
        "text": payload.text,
        "rect": payload.rect.model_dump(),
        "created_at": payload.created_at or datetime.utcnow().isoformat() + "Z",
    }
    items.append(record)
    save_json(_path(payload.doc_id), items)
    return [Annotation(**item) for item in items]


def delete_annotation(doc_id: str, annotation_id: str) -> List[Annotation] | None:
    items = load_json(_path(doc_id), [])
    remaining = []
    removed = False
    for item in items:
        if item.get("id") == annotation_id:
            removed = True
        else:
            remaining.append(item)
    if not removed:
        return None
    save_json(_path(doc_id), remaining)
    return [Annotation(**item) for item in remaining]
