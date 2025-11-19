"""Health check endpoint router."""

from fastapi import APIRouter

from app.api.deps import _qdrant_service

router = APIRouter(prefix="", tags=["health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns:
        dict: Service health status
    """
    return {
        "status": "healthy",
        "service_initialized": _qdrant_service is not None,
    }
