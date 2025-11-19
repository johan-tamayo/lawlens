"""FastAPI dependencies for dependency injection."""

from typing import Annotated

from fastapi import Depends, HTTPException

from app.services import QdrantService

# Global service instance (initialized in lifespan)
_qdrant_service: QdrantService | None = None


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


# Type alias for cleaner dependency injection
QdrantServiceDep = Annotated[QdrantService, Depends(get_qdrant_service)]
