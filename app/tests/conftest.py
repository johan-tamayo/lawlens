"""Pytest fixtures and configuration."""

import sys
from collections.abc import Generator
from pathlib import Path
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient
from llama_index.core.schema import Document

# Add parent directory to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.api.deps import set_qdrant_service
from app.main import app
from app.models import Citation, Output
from app.services import DocumentService, QdrantService


@pytest.fixture
def mock_openai_key(monkeypatch):
    """Mock OpenAI API key."""
    monkeypatch.setenv("OPENAI_API_KEY", "test-api-key-12345")
    return "test-api-key-12345"


@pytest.fixture
def sample_pdf_text() -> str:
    """Sample PDF text for testing."""
    return """
    1. Thievery1.1. 
    1.1. It is customary for a thief to be punished by losing a finger or a hand.
    1.2. Those who steal from a sept can be considered to have stolen from the gods.
    """


@pytest.fixture
def sample_documents() -> list[Document]:
    """Sample Document objects for testing."""
    return [
        Document(
            text="It is customary for a thief to be punished by losing a finger or a hand.",
            metadata={
                "Section": "Thievery 1.1",
                "MainSection": "Thievery",
                "SubsectionNumber": "1.1",
            },
        ),
        Document(
            text="Those who steal from a sept can be considered to have stolen from the gods.",
            metadata={
                "Section": "Thievery 1.2",
                "MainSection": "Thievery",
                "SubsectionNumber": "1.2",
            },
        ),
    ]


@pytest.fixture
def sample_citations() -> list[Citation]:
    """Sample Citation objects for testing."""
    return [
        Citation(
            source="Thievery 1.1",
            text="It is customary for a thief to be punished by losing a finger or a hand.",
        ),
        Citation(
            source="Thievery 1.2",
            text="Those who steal from a sept can be considered to have stolen from the gods.",
        ),
    ]


@pytest.fixture
def sample_output(sample_citations) -> Output:
    """Sample Output object for testing."""
    return Output(
        query="what happens if I steal?",
        response="If you steal, you will be punished by losing a finger or a hand.",
        citations=sample_citations,
    )


@pytest.fixture
def mock_qdrant_service(sample_output) -> Mock:
    """Mock QdrantService for testing."""
    mock_service = Mock(spec=QdrantService)
    mock_service.k = 3
    mock_service.index = Mock()
    mock_service.query.return_value = sample_output
    return mock_service


@pytest.fixture
def mock_document_service(sample_documents) -> Mock:
    """Mock DocumentService for testing."""
    mock_service = Mock(spec=DocumentService)
    mock_service.file_path = "test.pdf"
    mock_service.create_documents.return_value = sample_documents
    return mock_service


@pytest.fixture
def client_with_mock_service(mock_qdrant_service) -> Generator[TestClient, None, None]:
    """TestClient with mocked QdrantService."""
    # Set the mock service before creating client
    set_qdrant_service(mock_qdrant_service)

    # Create client without lifespan (to avoid initialization)
    client = TestClient(app, raise_server_exceptions=True)

    yield client

    # Cleanup
    set_qdrant_service(None)


@pytest.fixture
def mock_pdf_reader(sample_pdf_text, monkeypatch):
    """Mock PyPDF reader."""
    mock_page = Mock()
    mock_page.extract_text.return_value = sample_pdf_text

    mock_reader = Mock()
    mock_reader.pages = [mock_page]

    def mock_pdf_reader_init(*args, **kwargs):
        return mock_reader

    monkeypatch.setattr("pypdf.PdfReader", mock_pdf_reader_init)
    return mock_reader


@pytest.fixture
def temp_pdf_file(tmp_path):
    """Create a temporary PDF file for testing."""
    pdf_file = tmp_path / "test.pdf"
    pdf_file.write_bytes(b"%PDF-1.4\ntest content")
    return str(pdf_file)
