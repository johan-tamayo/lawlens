"""Service for storing and retrieving documents."""

from llama_index.core.schema import Document

from app.models import (
    DocumentDetail,
    DocumentListResponse,
    DocumentMetadata,
    DocumentSummary,
)


class DocumentStorageService:
    """Service for managing document storage and retrieval."""

    def __init__(self):
        self.documents: list[Document] = []

    def store_documents(self, documents: list[Document]) -> None:
        """Store documents in memory."""
        self.documents = documents

    def get_all_documents(self) -> DocumentListResponse:
        """
        Get all documents as summaries.

        Returns:
            DocumentListResponse with all documents
        """
        summaries = []
        for idx, doc in enumerate(self.documents):
            metadata = doc.metadata
            summary = DocumentSummary(
                id=str(idx),
                section=metadata.get("Section", "Unknown"),
                main_section=metadata.get("MainSection", "Unknown"),
                subsection_number=metadata.get("SubsectionNumber", ""),
                preview=doc.text[:200] + "..." if len(doc.text) > 200 else doc.text,
            )
            summaries.append(summary)

        return DocumentListResponse(total=len(summaries), documents=summaries)

    def get_document_by_id(self, document_id: str) -> DocumentDetail | None:
        """
        Get a document by its ID.

        Args:
            document_id: The document ID (index)

        Returns:
            DocumentDetail if found, None otherwise
        """
        try:
            idx = int(document_id)
            if idx < 0 or idx >= len(self.documents):
                return None

            doc = self.documents[idx]
            metadata = doc.metadata

            return DocumentDetail(
                id=document_id,
                text=doc.text,
                metadata=DocumentMetadata(
                    section=metadata.get("Section", "Unknown"),
                    main_section=metadata.get("MainSection", "Unknown"),
                    subsection_number=metadata.get("SubsectionNumber", ""),
                ),
            )
        except (ValueError, IndexError):
            return None

    def get_document_by_section(self, section_number: str) -> DocumentDetail | None:
        """
        Get a document by its section number.

        Args:
            section_number: The subsection number (e.g., "1.1")

        Returns:
            DocumentDetail if found, None otherwise
        """
        for idx, doc in enumerate(self.documents):
            if doc.metadata.get("SubsectionNumber") == section_number:
                metadata = doc.metadata
                return DocumentDetail(
                    id=str(idx),
                    text=doc.text,
                    metadata=DocumentMetadata(
                        section=metadata.get("Section", "Unknown"),
                        main_section=metadata.get("MainSection", "Unknown"),
                        subsection_number=metadata.get("SubsectionNumber", ""),
                    ),
                )
        return None
