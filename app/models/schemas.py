"""Pydantic models for API request/response schemas."""

from datetime import UTC, datetime

from pydantic import BaseModel, Field


def utc_now() -> datetime:
    """Return current UTC time with timezone info."""
    return datetime.now(UTC)


class Citation(BaseModel):
    """Citation model for API responses."""

    source: str
    text: str


class Output(BaseModel):
    """Output model for query responses."""

    query: str
    response: str
    citations: list[Citation]


class Message(BaseModel):
    """Chat message model."""

    role: str  # 'user' or 'assistant'
    content: str
    citations: list[Citation] = []
    timestamp: datetime = Field(default_factory=utc_now)


class CreateConversationRequest(BaseModel):
    """Request to create a new conversation."""

    title: str = "New Conversation"


class SendMessageRequest(BaseModel):
    """Request to send a message in a conversation."""

    message: str


class Conversation(BaseModel):
    """Conversation model."""

    id: str
    title: str
    messages: list[Message] = []
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class ConversationListResponse(BaseModel):
    """Response model for conversation list endpoint."""

    total: int
    conversations: list[Conversation]


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
