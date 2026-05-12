PDF Assistant

Overview
This repository contains a full-stack AI-powered PDF assistant. Users can upload PDFs, view them in the browser, chat with a retrieval-augmented assistant, and create highlights or pins with translations.

Folder Structure
- frontend: Next.js App Router + React + Tailwind UI
   - src/app: App Router pages and layout
   - src/components: UI components (PDF viewer, chat, sidebar)
   - src/lib: API client and shared types
   - public: Static assets (PDF.js worker)
- backend: FastAPI + LangChain + ChromaDB API
   - app/api: FastAPI routes
   - app/services: PDF processing, chat, summary, translation, annotations
   - app/vectorstore: ChromaDB integration
   - data: Runtime storage (uploads, vector DB, summaries)

Storage and Database
- Database: ChromaDB (local, file-backed vector database)
   - Location: backend/data/chroma
- PDF files: stored locally on upload
   - Location: backend/data/uploads
- Summaries: cached JSON per document
   - Location: backend/data/summaries
- Annotations: highlights and pins per document
   - Location: backend/data/annotations
- Document index (metadata)
   - Location: backend/data/docs.json

Setup

Backend
1. Create a virtual environment and activate it.
    cd backend
    python -m venv venv
    pip install -r requirements.txt
    venv\Scripts\activate
    
2. From the backend folder, install dependencies:
   - pip install -r requirements.txt
3. Create a backend/.env file with your Groq API key:
   - GROQ_API_KEY=your_key_here
   - GROQ_CHAT_MODEL=llama-3.1-70b-versatile
   - GROQ_LIGHT_MODEL=llama-3.1-8b-instant
   - EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
   - API_CORS_ORIGINS=http://localhost:3000
4. From the backend folder, run the API server:
   - uvicorn app.main:app --reload --port 8000

Frontend
1. From the frontend folder, install dependencies:
   - npm install
2. Create a frontend/.env file:
   - NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
3. From the frontend folder, run the web app:
   - npm run dev

Notes
- Uploaded PDFs and vector data are stored under backend/data.
- The app supports highlights, pins, and translation for selected text.
- Citations reference PDF page numbers where possible.
- Groq API keys can be generated at https://console.groq.com/keys
