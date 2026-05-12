import json
import os
from typing import Any

from .config import settings


def ensure_dirs() -> None:
    for path in [
        settings.data_dir,
        settings.upload_dir,
        settings.chroma_persist_dir,
        settings.summaries_dir,
        settings.annotations_dir,
    ]:
        os.makedirs(path, exist_ok=True)


def load_json(path: str, default: Any) -> Any:
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def save_json(path: str, data: Any) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2)
