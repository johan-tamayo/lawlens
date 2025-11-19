"""FastAPI dependencies for dependency injection."""

from typing import Annotated

from fastapi import Depends, HTTPException

from app.services import DocumentStorageService, QdrantService

# Global service instances (initialized in lifespan)
_qdrant_service: QdrantService | None = None
_document_storage_service: DocumentStorageService | None = None


def set_qdrant_service(service: QdrantService) -> None:
    """Set the global Qdrant service instance."""
    global _qdrant_service
    _qdrant_service = service


def get_qdrant_service() -> QdrantService:
    """
    Dependency to get the Qdrant service instance.

    Raises:
        HTTPException: If service is not initialized.
    """
    if _qdrant_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    return _qdrant_service


def set_document_storage_service(service: DocumentStorageService) -> None:
    """Set the global document storage service instance."""
    global _document_storage_service
    _document_storage_service = service


def get_document_storage_service() -> DocumentStorageService:
    """
    Dependency to get the document storage service instance.

    Raises:
        HTTPException: If service is not initialized.
    """
    if _document_storage_service is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    return _document_storage_service


# Type aliases for cleaner dependency injection
QdrantServiceDep = Annotated[QdrantService, Depends(get_qdrant_service)]
DocumentStorageServiceDep = Annotated[
    DocumentStorageService, Depends(get_document_storage_service)
]
