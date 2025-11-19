"""Unit tests for Pydantic schemas."""

import pytest
from pydantic import ValidationError

from app.models import Citation, Output


class TestCitation:
    """Tests for Citation model."""

    def test_citation_creation(self):
        """Test creating a valid Citation."""
        citation = Citation(
            source="Thievery 1.1",
            text="It is customary for a thief to be punished.",
        )
        assert citation.source == "Thievery 1.1"
        assert citation.text == "It is customary for a thief to be punished."

    def test_citation_dict(self):
        """Test Citation serialization to dict."""
        citation = Citation(source="Test Source", text="Test text")
        result = citation.model_dump()
        assert result == {"source": "Test Source", "text": "Test text"}

    def test_citation_json(self):
        """Test Citation serialization to JSON."""
        citation = Citation(source="Test", text="Content")
        json_str = citation.model_dump_json()
        assert "Test" in json_str
        assert "Content" in json_str

    def test_citation_missing_fields(self):
        """Test Citation validation with missing fields."""
        with pytest.raises(ValidationError) as exc_info:
            Citation(source="Test")  # Missing text
        assert "text" in str(exc_info.value)

    def test_citation_empty_strings(self):
        """Test Citation with empty strings."""
        citation = Citation(source="", text="")
        assert citation.source == ""
        assert citation.text == ""


class TestOutput:
    """Tests for Output model."""

    def test_output_creation(self):
        """Test creating a valid Output."""
        citations = [
            Citation(source="Source 1", text="Text 1"),
            Citation(source="Source 2", text="Text 2"),
        ]
        output = Output(
            query="test query",
            response="test response",
            citations=citations,
        )
        assert output.query == "test query"
        assert output.response == "test response"
        assert len(output.citations) == 2

    def test_output_with_sample_fixture(self, sample_output):
        """Test Output with fixture."""
        assert sample_output.query == "what happens if I steal?"
        assert "punished" in sample_output.response
        assert len(sample_output.citations) == 2

    def test_output_empty_citations(self):
        """Test Output with empty citations list."""
        output = Output(
            query="test",
            response="response",
            citations=[],
        )
        assert output.citations == []

    def test_output_dict(self):
        """Test Output serialization to dict."""
        citations = [Citation(source="S1", text="T1")]
        output = Output(query="q", response="r", citations=citations)
        result = output.model_dump()

        assert result["query"] == "q"
        assert result["response"] == "r"
        assert len(result["citations"]) == 1
        assert result["citations"][0]["source"] == "S1"

    def test_output_json(self):
        """Test Output serialization to JSON."""
        citations = [Citation(source="Source", text="Text")]
        output = Output(query="query", response="resp", citations=citations)
        json_str = output.model_dump_json()

        assert "query" in json_str
        assert "resp" in json_str
        assert "Source" in json_str

    def test_output_missing_fields(self):
        """Test Output validation with missing fields."""
        with pytest.raises(ValidationError) as exc_info:
            Output(query="test", response="test")  # Missing citations
        assert "citations" in str(exc_info.value)

    def test_output_invalid_citations_type(self):
        """Test Output with invalid citations type."""
        with pytest.raises(ValidationError):
            Output(
                query="test",
                response="test",
                citations="not a list",  # Should be list
            )

    def test_output_nested_validation(self):
        """Test Output validates nested Citation objects."""
        with pytest.raises(ValidationError):
            Output(
                query="test",
                response="test",
                citations=[{"source": "test"}],  # Missing 'text' field
            )

    def test_output_citation_ordering(self):
        """Test that citations maintain order."""
        citations = [
            Citation(source="First", text="1"),
            Citation(source="Second", text="2"),
            Citation(source="Third", text="3"),
        ]
        output = Output(query="q", response="r", citations=citations)

        assert output.citations[0].source == "First"
        assert output.citations[1].source == "Second"
        assert output.citations[2].source == "Third"


class TestDocumentModels:
    """Tests for Document-related models."""

    def test_document_metadata_creation(self):
        """Test DocumentMetadata creation."""
        from app.models import DocumentMetadata

        metadata = DocumentMetadata(
            section="Thievery 1.1",
            main_section="Thievery",
            subsection_number="1.1",
        )

        assert metadata.section == "Thievery 1.1"
        assert metadata.main_section == "Thievery"
        assert metadata.subsection_number == "1.1"

    def test_document_detail_creation(self):
        """Test DocumentDetail creation."""
        from app.models import DocumentDetail, DocumentMetadata

        metadata = DocumentMetadata(
            section="Test 1.1",
            main_section="Test",
            subsection_number="1.1",
        )

        detail = DocumentDetail(
            id="0",
            text="Test document text",
            metadata=metadata,
        )

        assert detail.id == "0"
        assert detail.text == "Test document text"
        assert detail.metadata.section == "Test 1.1"

    def test_document_summary_creation(self):
        """Test DocumentSummary creation."""
        from app.models import DocumentSummary

        summary = DocumentSummary(
            id="0",
            section="Test 1.1",
            main_section="Test",
            subsection_number="1.1",
            preview="Preview text",
        )

        assert summary.id == "0"
        assert summary.section == "Test 1.1"
        assert summary.preview == "Preview text"

    def test_document_list_response_creation(self):
        """Test DocumentListResponse creation."""
        from app.models import DocumentListResponse, DocumentSummary

        summaries = [
            DocumentSummary(
                id="0",
                section="Test 1.1",
                main_section="Test",
                subsection_number="1.1",
                preview="Preview 1",
            ),
            DocumentSummary(
                id="1",
                section="Test 1.2",
                main_section="Test",
                subsection_number="1.2",
                preview="Preview 2",
            ),
        ]

        response = DocumentListResponse(total=2, documents=summaries)

        assert response.total == 2
        assert len(response.documents) == 2
        assert response.documents[0].id == "0"

    def test_document_models_serialization(self):
        """Test document models serialize to JSON."""
        from app.models import (
            DocumentDetail,
            DocumentMetadata,
        )

        metadata = DocumentMetadata(
            section="Test 1.1", main_section="Test", subsection_number="1.1"
        )

        detail = DocumentDetail(id="0", text="Text", metadata=metadata)

        json_str = detail.model_dump_json()
        assert "Test 1.1" in json_str
        assert "Text" in json_str
