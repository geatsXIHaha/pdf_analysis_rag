from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router
from .config import settings
from .utils import ensure_dirs

app = FastAPI(title="PDF Assistant API")

origins = [origin.strip() for origin in settings.api_cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

ensure_dirs()
app.include_router(router, prefix="/api")
