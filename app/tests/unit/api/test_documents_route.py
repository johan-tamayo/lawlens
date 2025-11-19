"""Unit tests for documents route."""

from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.api.deps import set_document_storage_service
from app.main import app
from app.models import (
    DocumentDetail,
    DocumentListResponse,
    DocumentMetadata,
    DocumentSummary,
)
from app.services import DocumentStorageService


@pytest.fixture
def mock_document_storage_service():
    """Mock DocumentStorageService."""
    service = Mock(spec=DocumentStorageService)

    # Mock document list response
    summaries = [
        DocumentSummary(
            id="0",
            section="Thievery 1.1",
            main_section="Thievery",
            subsection_number="1.1",
            preview="It is customary for a thief to be punished by losing a finger or a hand.",
        ),
        DocumentSummary(
            id="1",
            section="Thievery 1.2",
            main_section="Thievery",
            subsection_number="1.2",
            preview="Those who steal from a sept can be considered to have stolen from the gods.",
        ),
    ]
    service.get_all_documents.return_value = DocumentListResponse(
        total=2,
        documents=summaries,
    )

    # Mock get_document_by_id
    def mock_get_by_id(doc_id):
        if doc_id == "0":
            return DocumentDetail(
                id="0",
                text="It is customary for a thief to be punished by losing a finger or a hand.",
                metadata=DocumentMetadata(
                    section="Thievery 1.1",
                    main_section="Thievery",
                    subsection_number="1.1",
                ),
            )
        return None

    service.get_document_by_id.side_effect = mock_get_by_id

    # Mock get_document_by_section
    def mock_get_by_section(section_num):
        if section_num == "1.1":
            return DocumentDetail(
                id="0",
                text="It is customary for a thief to be punished by losing a finger or a hand.",
                metadata=DocumentMetadata(
                    section="Thievery 1.1",
                    main_section="Thievery",
                    subsection_number="1.1",
                ),
            )
        return None

    service.get_document_by_section.side_effect = mock_get_by_section

    return service


@pytest.fixture
def client_with_mock_doc_service(mock_document_storage_service):
    """TestClient with mocked DocumentStorageService."""
    set_document_storage_service(mock_document_storage_service)
    client = TestClient(app, raise_server_exceptions=True)
    yield client
    set_document_storage_service(None)


class TestDocumentsListRoute:
    """Tests for GET /documents endpoint."""

    def test_get_documents_success(self, client_with_mock_doc_service):
        """Test successful retrieval of all documents."""
        response = client_with_mock_doc_service.get("/documents")

        assert response.status_code == 200
        data = response.json()

        assert "total" in data
        assert "documents" in data
        assert data["total"] == 2
        assert len(data["documents"]) == 2

    def test_get_documents_structure(self, client_with_mock_doc_service):
        """Test response structure of document list."""
        response = client_with_mock_doc_service.get("/documents")

        assert response.status_code == 200
        data = response.json()

        # Check document summary structure
        doc = data["documents"][0]
        assert "id" in doc
        assert "section" in doc
        assert "main_section" in doc
        assert "subsection_number" in doc
        assert "preview" in doc

    def test_get_documents_content(self, client_with_mock_doc_service):
        """Test content of document list."""
        response = client_with_mock_doc_service.get("/documents")

        assert response.status_code == 200
        data = response.json()

        first_doc = data["documents"][0]
        assert first_doc["id"] == "0"
        assert first_doc["section"] == "Thievery 1.1"
        assert first_doc["main_section"] == "Thievery"
        assert first_doc["subsection_number"] == "1.1"
        assert "punished" in first_doc["preview"]

    def test_get_documents_returns_json(self, client_with_mock_doc_service):
        """Test that response is JSON."""
        response = client_with_mock_doc_service.get("/documents")

        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"


class TestDocumentByIdRoute:
    """Tests for GET /documents/{document_id} endpoint."""

    def test_get_document_by_id_success(self, client_with_mock_doc_service):
        """Test successful retrieval of document by ID."""
        response = client_with_mock_doc_service.get("/documents/0")

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == "0"
        assert data["text"]
        assert "metadata" in data

    def test_get_document_by_id_structure(self, client_with_mock_doc_service):
        """Test response structure of document detail."""
        response = client_with_mock_doc_service.get("/documents/0")

        assert response.status_code == 200
        data = response.json()

        assert "id" in data
        assert "text" in data
        assert "metadata" in data

        metadata = data["metadata"]
        assert "section" in metadata
        assert "main_section" in metadata
        assert "subsection_number" in metadata

    def test_get_document_by_id_content(self, client_with_mock_doc_service):
        """Test content of document detail."""
        response = client_with_mock_doc_service.get("/documents/0")

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == "0"
        assert "punished" in data["text"]
        assert data["metadata"]["section"] == "Thievery 1.1"
        assert data["metadata"]["main_section"] == "Thievery"
        assert data["metadata"]["subsection_number"] == "1.1"

    def test_get_document_by_id_not_found(self, client_with_mock_doc_service):
        """Test 404 for non-existent document ID."""
        response = client_with_mock_doc_service.get("/documents/999")

        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "999" in data["detail"]

    def test_get_document_by_id_invalid_format(self, client_with_mock_doc_service):
        """Test 404 for invalid ID format."""
        response = client_with_mock_doc_service.get("/documents/invalid")

        assert response.status_code == 404


class TestDocumentBySectionRoute:
    """Tests for GET /documents/section/{section_number} endpoint."""

    def test_get_document_by_section_success(self, client_with_mock_doc_service):
        """Test successful retrieval of document by section number."""
        response = client_with_mock_doc_service.get("/documents/section/1.1")

        assert response.status_code == 200
        data = response.json()

        assert data["metadata"]["subsection_number"] == "1.1"

    def test_get_document_by_section_structure(self, client_with_mock_doc_service):
        """Test response structure."""
        response = client_with_mock_doc_service.get("/documents/section/1.1")

        assert response.status_code == 200
        data = response.json()

        assert "id" in data
        assert "text" in data
        assert "metadata" in data

    def test_get_document_by_section_content(self, client_with_mock_doc_service):
        """Test content of document."""
        response = client_with_mock_doc_service.get("/documents/section/1.1")

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == "0"
        assert "punished" in data["text"]
        assert data["metadata"]["subsection_number"] == "1.1"

    def test_get_document_by_section_not_found(self, client_with_mock_doc_service):
        """Test 404 for non-existent section number."""
        response = client_with_mock_doc_service.get("/documents/section/99.99")

        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "99.99" in data["detail"]

    def test_get_document_by_section_complex_number(self, client_with_mock_doc_service):
        """Test with complex section number format."""
        # This will return 404 since our mock only handles "1.1"
        response = client_with_mock_doc_service.get("/documents/section/1.2.3")

        assert response.status_code == 404

    def test_get_document_by_section_url_encoding(self, client_with_mock_doc_service):
        """Test that URL encoding works for section numbers."""
        response = client_with_mock_doc_service.get("/documents/section/1.1")

        assert response.status_code == 200


class TestDocumentsIntegration:
    """Integration tests for document endpoints."""

    def test_list_then_detail_consistency(self, client_with_mock_doc_service):
        """Test that list and detail endpoints return consistent data."""
        # Get list
        list_response = client_with_mock_doc_service.get("/documents")
        assert list_response.status_code == 200
        list_data = list_response.json()

        first_doc_id = list_data["documents"][0]["id"]

        # Get detail
        detail_response = client_with_mock_doc_service.get(f"/documents/{first_doc_id}")
        assert detail_response.status_code == 200
        detail_data = detail_response.json()

        # Check consistency
        assert detail_data["id"] == first_doc_id
        assert (
            detail_data["metadata"]["section"] == list_data["documents"][0]["section"]
        )

    def test_document_endpoints_return_json(self, client_with_mock_doc_service):
        """Test that all document endpoints return JSON."""
        endpoints = [
            "/documents",
            "/documents/0",
            "/documents/section/1.1",
        ]

        for endpoint in endpoints:
            response = client_with_mock_doc_service.get(endpoint)
            if response.status_code == 200:
                assert response.headers["content-type"] == "application/json"
