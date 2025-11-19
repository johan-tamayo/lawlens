"""Pydantic models for API request/response schemas."""

from pydantic import BaseModel


class Citation(BaseModel):
    """Citation model for API responses."""

    source: str
    text: str


class Output(BaseModel):
    """Output model for query responses."""

    query: str
    response: str
    citations: list[Citation]


class DocumentMetadata(BaseModel):
    """Document metadata model."""

    section: str
    main_section: str
    subsection_number: str


class DocumentDetail(BaseModel):
    """Detailed document model with full text."""

    id: str
    text: str
    metadata: DocumentMetadata


class DocumentSummary(BaseModel):
    """Summary document model for list view."""

    id: str
    section: str
    main_section: str
    subsection_number: str
    preview: str  # First 200 characters of text


class DocumentListResponse(BaseModel):
    """Response model for document list endpoint."""

    total: int
    documents: list[DocumentSummary]
