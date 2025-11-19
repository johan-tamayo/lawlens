"""Unit tests for Pydantic schemas."""

from datetime import UTC, datetime

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


class TestConversationModels:
    """Tests for Conversation-related models."""

    def test_message_creation(self):
        """Test Message creation."""
        from app.models import Message

        message = Message(
            role="user",
            content="Test message",
            citations=[],
            timestamp=datetime.now(UTC),
        )

        assert message.role == "user"
        assert message.content == "Test message"
        assert message.citations == []
        assert isinstance(message.timestamp, datetime)

    def test_message_with_citations(self):
        """Test Message with citations."""
        from app.models import Message

        citations = [Citation(source="S1", text="T1")]
        message = Message(
            role="assistant",
            content="Response",
            citations=citations,
            timestamp=datetime.now(UTC),
        )

        assert len(message.citations) == 1
        assert message.citations[0].source == "S1"

    def test_message_default_timestamp(self):
        """Test Message default timestamp creation."""
        from app.models import Message

        message = Message(role="user", content="Test")

        assert isinstance(message.timestamp, datetime)
        assert message.timestamp.tzinfo is not None  # Should have timezone

    def test_message_serialization(self):
        """Test Message serialization."""
        from app.models import Message

        message = Message(
            role="user",
            content="Test",
            citations=[],
            timestamp=datetime.now(UTC),
        )

        data = message.model_dump()
        assert data["role"] == "user"
        assert data["content"] == "Test"
        assert data["citations"] == []

    def test_conversation_creation(self):
        """Test Conversation creation."""
        from app.models import Conversation

        conv = Conversation(
            id="test-id",
            title="Test Conversation",
            messages=[],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )

        assert conv.id == "test-id"
        assert conv.title == "Test Conversation"
        assert conv.messages == []
        assert isinstance(conv.created_at, datetime)
        assert isinstance(conv.updated_at, datetime)

    def test_conversation_with_messages(self):
        """Test Conversation with messages."""
        from app.models import Conversation, Message

        messages = [
            Message(role="user", content="Q1"),
            Message(role="assistant", content="A1"),
        ]

        conv = Conversation(
            id="test-id",
            title="Test",
            messages=messages,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )

        assert len(conv.messages) == 2
        assert conv.messages[0].role == "user"
        assert conv.messages[1].role == "assistant"

    def test_conversation_default_timestamps(self):
        """Test Conversation default timestamp creation."""
        from app.models import Conversation

        conv = Conversation(id="test-id", title="Test")

        assert isinstance(conv.created_at, datetime)
        assert isinstance(conv.updated_at, datetime)
        assert conv.created_at.tzinfo is not None

    def test_conversation_serialization(self):
        """Test Conversation serialization."""
        from app.models import Conversation

        conv = Conversation(
            id="test-id",
            title="Test",
            messages=[],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )

        data = conv.model_dump()
        assert data["id"] == "test-id"
        assert data["title"] == "Test"
        assert data["messages"] == []

    def test_create_conversation_request(self):
        """Test CreateConversationRequest."""
        from app.models import CreateConversationRequest

        request = CreateConversationRequest(title="Custom Title")
        assert request.title == "Custom Title"

    def test_create_conversation_request_default(self):
        """Test CreateConversationRequest default title."""
        from app.models import CreateConversationRequest

        request = CreateConversationRequest()
        assert request.title == "New Conversation"

    def test_send_message_request(self):
        """Test SendMessageRequest."""
        from app.models import SendMessageRequest

        request = SendMessageRequest(message="Test message")
        assert request.message == "Test message"

    def test_send_message_request_validation(self):
        """Test SendMessageRequest validation."""
        from app.models import SendMessageRequest

        with pytest.raises(ValidationError):
            SendMessageRequest()  # Missing message field

    def test_conversation_list_response(self):
        """Test ConversationListResponse."""
        from app.models import Conversation, ConversationListResponse

        conversations = [
            Conversation(id="1", title="First"),
            Conversation(id="2", title="Second"),
        ]

        response = ConversationListResponse(
            total=2,
            conversations=conversations,
        )

        assert response.total == 2
        assert len(response.conversations) == 2
        assert response.conversations[0].id == "1"

    def test_conversation_list_response_empty(self):
        """Test ConversationListResponse with no conversations."""
        from app.models import ConversationListResponse

        response = ConversationListResponse(total=0, conversations=[])
        assert response.total == 0
        assert response.conversations == []

    def test_conversation_json_serialization(self):
        """Test full conversation serialization to JSON."""
        from app.models import Conversation, Message

        messages = [
            Message(
                role="user",
                content="Question",
                citations=[],
                timestamp=datetime.now(UTC),
            ),
            Message(
                role="assistant",
                content="Answer",
                citations=[Citation(source="S1", text="T1")],
                timestamp=datetime.now(UTC),
            ),
        ]

        conv = Conversation(
            id="test-id",
            title="Test",
            messages=messages,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )

        json_str = conv.model_dump_json()
        assert "test-id" in json_str
        assert "Question" in json_str
        assert "Answer" in json_str
        assert "S1" in json_str
