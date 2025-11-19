"""Document endpoints router."""

from fastapi import APIRouter, HTTPException, Path

from app.api.deps import DocumentStorageServiceDep
from app.models import DocumentDetail, DocumentListResponse

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=DocumentListResponse)
async def get_documents(
    storage_service: DocumentStorageServiceDep = None,
) -> DocumentListResponse:
    """
    Get all documents as a list with summaries.

    Returns:
        DocumentListResponse: List of document summaries with total count

    Example:
        GET /documents
    """
    return storage_service.get_all_documents()


@router.get("/{document_id}", response_model=DocumentDetail)
async def get_document_by_id(
    document_id: str = Path(..., description="Document ID (numeric index)"),
    storage_service: DocumentStorageServiceDep = None,
) -> DocumentDetail:
    """
    Get a specific document by its ID.

    Args:
        document_id: The document ID (index starting from 0)
        storage_service: Injected document storage service

    Returns:
        DocumentDetail: Full document details with metadata

    Raises:
        HTTPException: 404 if document not found

    Example:
        GET /documents/0
        GET /documents/5
    """
    document = storage_service.get_document_by_id(document_id)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail=f"Document with ID '{document_id}' not found",
        )

    return document


@router.get("/section/{section_number}", response_model=DocumentDetail)
async def get_document_by_section(
    section_number: str = Path(..., description="Section number (e.g., '1.1')"),
    storage_service: DocumentStorageServiceDep = None,
) -> DocumentDetail:
    """
    Get a specific document by its section number.

    Args:
        section_number: The subsection number (e.g., "1.1", "2.3.1")
        storage_service: Injected document storage service

    Returns:
        DocumentDetail: Full document details with metadata

    Raises:
        HTTPException: 404 if document not found

    Example:
        GET /documents/section/1.1
        GET /documents/section/6.2.3
    """
    document = storage_service.get_document_by_section(section_number)

    if document is None:
        raise HTTPException(
            status_code=404,
            detail=f"Document with section number '{section_number}' not found",
        )

    return document
