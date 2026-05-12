import os

from ..config import settings
from ..services.doc_store import delete_doc
from ..vectorstore.chroma_store import delete_documents


def delete_document(doc_id: str) -> bool:
    doc = delete_doc(doc_id)
    if not doc:
        return False

    file_path = doc.get("path")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    summary_path = os.path.join(settings.summaries_dir, f"{doc_id}.json")
    if os.path.exists(summary_path):
        os.remove(summary_path)

    annotation_path = os.path.join(settings.annotations_dir, f"{doc_id}.json")
    if os.path.exists(annotation_path):
        os.remove(annotation_path)

    delete_documents(doc_id)

    return True
