"""Query endpoint router."""

from fastapi import APIRouter, Query

from app.api.deps import QdrantServiceDep
from app.models import Output

router = APIRouter(prefix="", tags=["query"])


@router.get("/query", response_model=Output)
async def query_documents(
    q: str = Query(..., description="The query string to search for", min_length=1),
    qdrant_service: QdrantServiceDep = None,
) -> Output:
    """
    Query endpoint that accepts a query string as a URL parameter.

    Args:
        q: Query string parameter
        qdrant_service: Injected Qdrant service

    Returns:
        Output: Pydantic model containing query, response, and citations

    Example:
        GET /query?q=what happens if I steal from the Sept?
    """
    result = qdrant_service.query(q)
    return result
