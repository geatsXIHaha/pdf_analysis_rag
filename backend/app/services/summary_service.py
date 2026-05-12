import json
import re
from typing import Dict, List

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from ..config import settings
from ..utils import load_json, save_json


def _summary_path(doc_id: str) -> str:
    return f"{settings.summaries_dir}/{doc_id}.json"


def load_summary(doc_id: str) -> Dict | None:
    return load_json(_summary_path(doc_id), None)


def _extract_json(text: str) -> Dict:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("Summary response did not contain JSON")
    return json.loads(match.group(0))


def _combine_text(pages: List) -> str:
    content = "\n\n".join(page.page_content for page in pages)
    return content[:12000]


def generate_summary(doc_id: str, pages: List) -> Dict:
    existing = load_summary(doc_id)
    if existing:
        return existing

    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")

    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.groq_light_model,
        temperature=0.2,
    )

    prompt = (
        "You are an assistant that summarizes PDFs. Return JSON with keys: "
        "short_summary, detailed_summary, key_topics, keywords. "
        "key_topics and keywords must be arrays of strings."
    )
    text = _combine_text(pages)
    try:
        response = llm.invoke(
            [
                SystemMessage(content=prompt),
                HumanMessage(content=f"PDF content:\n{text}"),
            ]
        )
    except Exception as exc:
        raise RuntimeError("Summary request failed") from exc

    try:
        data = _extract_json(response.content)
    except Exception:
        # Fallback to a minimal summary if the model output is malformed.
        data = {
            "short_summary": text[:300].strip(),
            "detailed_summary": text[:1200].strip(),
            "key_topics": [],
            "keywords": [],
        }
    save_json(_summary_path(doc_id), data)
    return data
