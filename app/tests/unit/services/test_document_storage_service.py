"""Unit tests for DocumentStorageService."""

from llama_index.core.schema import Document

from app.services import DocumentStorageService


class TestDocumentStorageService:
    """Tests for DocumentStorageService."""

    def test_init(self):
        """Test DocumentStorageService initialization."""
        service = DocumentStorageService()
        assert service.documents == []

    def test_store_documents(self, sample_documents):
        """Test storing documents."""
        service = DocumentStorageService()
        service.store_documents(sample_documents)

        assert len(service.documents) == len(sample_documents)
        assert service.documents == sample_documents

    def test_get_all_documents_empty(self):
        """Test get_all_documents with no documents."""
        service = DocumentStorageService()
        result = service.get_all_documents()

        assert result.total == 0
        assert result.documents == []

    def test_get_all_documents(self, sample_documents):
        """Test get_all_documents returns all documents as summaries."""
        service = DocumentStorageService()
        service.store_documents(sample_documents)

        result = service.get_all_documents()

        assert result.total == 2
        assert len(result.documents) == 2

        # Check first document summary
        summary = result.documents[0]
        assert summary.id == "0"
        assert summary.section == "Thievery 1.1"
        assert summary.main_section == "Thievery"
        assert summary.subsection_number == "1.1"
        assert "punished" in summary.preview

    def test_get_all_documents_preview_truncation(self):
        """Test that long documents are truncated in preview."""
        long_text = "A" * 300
        doc = Document(
            text=long_text,
            metadata={
                "Section": "Test 1.1",
                "MainSection": "Test",
                "SubsectionNumber": "1.1",
            },
        )

        service = DocumentStorageService()
        service.store_documents([doc])

        result = service.get_all_documents()

        assert len(result.documents[0].preview) == 203  # 200 + "..."
        assert result.documents[0].preview.endswith("...")

    def test_get_document_by_id_valid(self, sample_documents):
        """Test get_document_by_id with valid ID."""
        service = DocumentStorageService()
        service.store_documents(sample_documents)

        document = service.get_document_by_id("0")

        assert document is not None
        assert document.id == "0"
        assert document.text == sample_documents[0].text
        assert document.metadata.section == "Thievery 1.1"
        assert document.metadata.main_section == "Thievery"
        assert document.metadata.subsection_number == "1.1"

    def test_get_document_by_id_invalid(self, sample_documents):
        """Test get_document_by_id with invalid ID."""
        service = DocumentStorageService()
        service.store_documents(sample_documents)

        document = service.get_document_by_id("999")
        assert document is None

    def test_get_document_by_id_negative(self, sample_documents):
        """Test get_document_by_id with negative ID."""
        service = DocumentStorageService()
        service.store_documents(sample_documents)

        document = service.get_document_by_id("-1")
        assert document is None

    def test_get_document_by_id_non_numeric(self, sample_documents):
        """Test get_document_by_id with non-numeric ID."""
        service = DocumentStorageService()
        service.store_documents(sample_documents)

        document = service.get_document_by_id("abc")
        assert document is None

    def test_get_document_by_section_valid(self, sample_documents):
        """Test get_document_by_section with valid section number."""
        service = DocumentStorageService()
        service.store_documents(sample_documents)

        document = service.get_document_by_section("1.1")

        assert document is not None
        assert document.id == "0"
        assert document.text == sample_documents[0].text
        assert document.metadata.subsection_number == "1.1"

    def test_get_document_by_section_invalid(self, sample_documents):
        """Test get_document_by_section with invalid section number."""
        service = DocumentStorageService()
        service.store_documents(sample_documents)

        document = service.get_document_by_section("99.99")
        assert document is None

    def test_get_document_by_section_returns_first_match(self):
        """Test that get_document_by_section returns first matching document."""
        docs = [
            Document(
                text="First document",
                metadata={
                    "Section": "Test 1.1",
                    "MainSection": "Test",
                    "SubsectionNumber": "1.1",
                },
            ),
            Document(
                text="Second document",
                metadata={
                    "Section": "Test 1.1",
                    "MainSection": "Test",
                    "SubsectionNumber": "1.1",
                },
            ),
        ]

        service = DocumentStorageService()
        service.store_documents(docs)

        document = service.get_document_by_section("1.1")

        assert document is not None
        assert document.text == "First document"
        assert document.id == "0"

    def test_get_document_with_missing_metadata(self):
        """Test get_document with documents that have missing metadata fields."""
        doc = Document(
            text="Test text",
            metadata={},  # Missing all metadata fields
        )

        service = DocumentStorageService()
        service.store_documents([doc])

        # Test get_all_documents
        result = service.get_all_documents()
        assert result.documents[0].section == "Unknown"
        assert result.documents[0].main_section == "Unknown"
        assert result.documents[0].subsection_number == ""

        # Test get_document_by_id
        document = service.get_document_by_id("0")
        assert document is not None
        assert document.metadata.section == "Unknown"
        assert document.metadata.main_section == "Unknown"
