"""Application lifespan management."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.deps import set_document_storage_service, set_qdrant_service
from app.config import settings
from app.services import DocumentService, DocumentStorageService, QdrantService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifespan - initialize services on startup and cleanup on shutdown.

    Args:
        app: FastAPI application instance
    """
    print("🚀 Initializing services...")

    # Load documents
    doc_service = DocumentService(settings.documents_path)
    docs = doc_service.create_documents()
    print(f"📄 Loaded {len(docs)} document sections")

    # Initialize document storage service
    doc_storage_service = DocumentStorageService()
    doc_storage_service.store_documents(docs)
    set_document_storage_service(doc_storage_service)
    print("💾 DocumentStorageService initialized")

    # Initialize Qdrant service
    qdrant_service = QdrantService(k=settings.qdrant_similarity_top_k)
    qdrant_service.connect()
    qdrant_service.load(docs)
    print(f"🔍 QdrantService initialized (k={settings.qdrant_similarity_top_k})")

    # Set global service instance for dependency injection
    set_qdrant_service(qdrant_service)
    print("✅ Services ready!")

    yield

    # Cleanup (if needed)
    print("🛑 Shutting down services...")
