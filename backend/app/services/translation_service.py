from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from ..config import settings


_TRADITIONAL_TO_SIMPLIFIED = {
    "臺": "台",
    "灣": "湾",
    "國": "国",
    "與": "与",
    "體": "体",
    "學": "学",
    "為": "为",
    "應": "应",
    "個": "个",
    "說": "说",
    "這": "这",
    "來": "来",
    "點": "点",
    "對": "对",
    "時": "时",
    "們": "们",
    "裡": "里",
    "後": "后",
    "見": "见",
    "開": "开",
    "話": "话",
    "關": "关",
    "進": "进",
    "發": "发",
    "務": "务",
    "張": "张",
    "讀": "读",
    "寫": "写",
    "記": "记",
    "實": "实",
}


def _looks_traditional(text: str) -> bool:
    return any(char in _TRADITIONAL_TO_SIMPLIFIED for char in text)


def _to_simplified(text: str) -> str:
    return "".join(_TRADITIONAL_TO_SIMPLIFIED.get(char, char) for char in text)


def translate_text(text: str, target_language: str | None = None) -> str:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")

    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.groq_light_model,
        temperature=0.0,
        max_tokens=200,
    )
    language = "zh-CN"
    try:
        response = llm.invoke(
            [
                SystemMessage(
                    content=(
                        "You are a professional translation engine. Translate the user's text "
                        "into Simplified Chinese (简体中文) only. Return ONLY the translated "
                        "text. Do not explain, summarize, expand, or add formatting."
                    )
                ),
                HumanMessage(content=text),
            ]
        )
    except Exception as exc:
        raise RuntimeError("Translation request failed") from exc
    translated = response.content.strip()
    if _looks_traditional(translated):
        translated = _to_simplified(translated)
    return translated
