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
