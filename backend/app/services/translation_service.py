from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from ..config import settings


def translate_text(text: str) -> str:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")

    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.groq_light_model,
        temperature=0.0,
    )
    try:
        response = llm.invoke(
            [
                SystemMessage(
                    content="Translate to Simplified Chinese. Output only the translation."
                ),
                HumanMessage(content=text),
            ]
        )
    except Exception as exc:
        raise RuntimeError("Translation request failed") from exc
    return response.content.strip()
