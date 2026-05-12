from typing import Iterable

from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

from ..config import settings

_vectorstore = None


def get_vectorstore() -> Chroma:
    global _vectorstore
    if _vectorstore is None:
        embeddings = HuggingFaceEmbeddings(model_name=settings.embedding_model)
        _vectorstore = Chroma(
            collection_name="pdfs",
            persist_directory=settings.chroma_persist_dir,
            embedding_function=embeddings,
        )
    return _vectorstore


def add_documents(documents: Iterable[Document]) -> None:
    vectorstore = get_vectorstore()
    vectorstore.add_documents(list(documents))
    vectorstore.persist()


def delete_documents(doc_id: str) -> None:
    vectorstore = get_vectorstore()
    vectorstore.delete(where={"doc_id": doc_id})
    vectorstore.persist()
