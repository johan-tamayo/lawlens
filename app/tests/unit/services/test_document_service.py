"""Unit tests for DocumentService."""


from app.services import DocumentService


class TestDocumentService:
    """Tests for DocumentService."""

    def test_init(self):
        """Test DocumentService initialization."""
        service = DocumentService("test.pdf")
        assert service.file_path == "test.pdf"

    def test_add_spaces_to_text(self):
        """Test _add_spaces_to_text method."""
        # Test camelCase
        result = DocumentService._add_spaces_to_text("thisIsTest")
        assert result == "this Is Test"

        # Test punctuation without space
        result = DocumentService._add_spaces_to_text("Hello.World")
        assert result == "Hello. World"

        # Test letter-number
        result = DocumentService._add_spaces_to_text("test123abc")
        assert result == "test 123 abc"

        # Test multiple spaces
        result = DocumentService._add_spaces_to_text("test    multiple")
        assert result == "test multiple"

    def test_extract_section_titles(self):
        """Test _extract_section_titles method."""
        service = DocumentService("test.pdf")

        text = "1. Thievery1.1. Some text here"
        titles = service._extract_section_titles(text)

        assert "1" in titles
        assert titles["1"] == "Thievery"

    def test_extract_section_titles_multiple(self):
        """Test extracting multiple section titles."""
        service = DocumentService("test.pdf")

        text = """
        1. Thievery1.1. Text
        2. Marriage2.1. Text
        3. Inheritance3.1. Text
        """
        titles = service._extract_section_titles(text)

        assert len(titles) >= 3
        assert titles.get("1") == "Thievery"
        assert titles.get("2") == "Marriage"
        assert titles.get("3") == "Inheritance"

    def test_extract_section_titles_no_match(self):
        """Test extract_section_titles with no matches."""
        service = DocumentService("test.pdf")
        text = "This is just plain text with no sections"
        titles = service._extract_section_titles(text)
        assert titles == {}

    def test_create_documents_with_mock_pdf(self, mock_pdf_reader, temp_pdf_file):
        """Test create_documents with mocked PDF reader."""
        service = DocumentService(temp_pdf_file)

        # Mock the PDF content
        mock_pdf_reader.pages[
            0
        ].extract_text.return_value = """
        1. Thievery1.1. 
        1.1. It is customary for a thief to be punished.
        1.2. Those who steal from a sept.
        """

        docs = service.create_documents()

        # Should create documents
        assert isinstance(docs, list)
        # Documents should have metadata
        if docs:
            assert hasattr(docs[0], "metadata")
            assert hasattr(docs[0], "text")

    def test_create_documents_empty_sections(self, mock_pdf_reader, temp_pdf_file):
        """Test create_documents filters empty sections."""
        service = DocumentService(temp_pdf_file)

        mock_pdf_reader.pages[
            0
        ].extract_text.return_value = """
        1. Test1.1.
        1.1.    
        1.2. Valid content here.
        """

        docs = service.create_documents()

        # Empty sections should be filtered out
        for doc in docs:
            assert doc.text.strip() != ""

    def test_create_documents_metadata_structure(self, mock_pdf_reader, temp_pdf_file):
        """Test that created documents have correct metadata structure."""
        service = DocumentService(temp_pdf_file)

        mock_pdf_reader.pages[
            0
        ].extract_text.return_value = """
        1. Thievery1.1.
        1.1. Punishment for theft.
        """

        docs = service.create_documents()

        if docs:
            doc = docs[0]
            assert "Section" in doc.metadata
            assert "MainSection" in doc.metadata
            assert "SubsectionNumber" in doc.metadata
