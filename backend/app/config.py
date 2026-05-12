from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    groq_api_key: str | None = None
    groq_chat_model: str = "llama-3.1-70b-versatile"
    groq_light_model: str = "llama-3.1-8b-instant"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    api_cors_origins: str = "http://localhost:3000"
    data_dir: str = "data"
    upload_dir: str = "data/uploads"
    chroma_persist_dir: str = "data/chroma"
    summaries_dir: str = "data/summaries"
    annotations_dir: str = "data/annotations"
    docs_index_file: str = "data/docs.json"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
