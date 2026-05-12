from typing import Dict
from uuid import uuid4

from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from ..config import settings


class ChatService:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore
        self.memories: Dict[str, ConversationBufferMemory] = {}

    def _get_memory(self, session_id: str) -> ConversationBufferMemory:
        if session_id not in self.memories:
            self.memories[session_id] = ConversationBufferMemory(
                memory_key="chat_history",
                input_key="question",
                output_key="answer",
                return_messages=True,
            )
        return self.memories[session_id]

    def ask(self, doc_id: str, question: str, session_id: str | None = None) -> Dict:
        session_id = session_id or str(uuid4())
        memory = self._get_memory(session_id)

        results = self.vectorstore.similarity_search_with_score(
            question,
            k=4,
            filter={"doc_id": doc_id},
        )
        print(f"[chat] retrieved {len(results)} chunks for doc_id={doc_id}")
        for idx, (doc, score) in enumerate(results, start=1):
            preview = doc.page_content.strip().replace("\n", " ")[:200]
            print(f"[chat] chunk {idx} score={score:.4f} preview={preview}")

        if not results:
            return {
                "answer": "No relevant content found in the uploaded PDF.",
                "session_id": session_id,
                "sources": [],
            }

        context = "\n\n".join(doc.page_content for doc, _ in results).strip()
        if not context:
            print("[chat] empty context after retrieval")
            return {
                "answer": "No relevant content found in the uploaded PDF.",
                "session_id": session_id,
                "sources": [],
            }
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not configured")

        llm = ChatGroq(
            groq_api_key=settings.groq_api_key,
            model_name=settings.groq_chat_model,
            temperature=0.2,
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a PDF assistant. Answer ONLY using the CONTEXT. "
                    "If the answer is not in the context, say 'Not found in document'.",
                ),
                ("human", "CONTEXT:\n{context}\n\nQUESTION: {question}"),
            ]
        )

        chain = LLMChain(llm=llm, prompt=prompt, memory=memory, output_key="answer")

        try:
            result = chain.invoke({"question": question, "context": context})
        except Exception as exc:
            raise RuntimeError("Chat request failed") from exc

        sources = []
        for doc, _score in results:
            page = doc.metadata.get("page", doc.metadata.get("page_number", 0)) + 1
            snippet = doc.page_content.strip().replace("\n", " ")[:240]
            sources.append({"page": page, "snippet": snippet})

        return {
            "answer": result.get("answer", ""),
            "session_id": session_id,
            "sources": sources,
        }
