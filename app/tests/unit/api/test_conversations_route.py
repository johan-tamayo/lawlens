"""Unit tests for conversations API routes."""

from datetime import UTC, datetime
from unittest.mock import Mock

import pytest
from fastapi import HTTPException

from app.api.routes import conversations
from app.models import Conversation, Message


class TestListConversations:
    """Tests for list_conversations endpoint."""

    @pytest.mark.asyncio
    async def test_list_conversations_empty(self):
        """Test listing conversations when none exist."""
        mock_service = Mock()
        mock_service.get_all_conversations.return_value = []

        response = await conversations.list_conversations(
            conversation_service=mock_service
        )

        assert response.total == 0
        assert response.conversations == []
        mock_service.get_all_conversations.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_conversations_with_data(self):
        """Test listing conversations with existing data."""
        mock_service = Mock()
        conv1 = Conversation(
            id="1",
            title="First",
            messages=[],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
        conv2 = Conversation(
            id="2",
            title="Second",
            messages=[],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
        mock_service.get_all_conversations.return_value = [conv1, conv2]

        response = await conversations.list_conversations(
            conversation_service=mock_service
        )

        assert response.total == 2
        assert len(response.conversations) == 2
        assert response.conversations[0].id == "1"
        assert response.conversations[1].id == "2"


class TestCreateConversation:
    """Tests for create_conversation endpoint."""

    @pytest.mark.asyncio
    async def test_create_conversation_default_title(self):
        """Test creating a conversation with default title."""
        mock_service = Mock()
        expected_conv = Conversation(
            id="test-id",
            title="New Conversation",
            messages=[],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
        mock_service.create_conversation.return_value = expected_conv

        request = conversations.CreateConversationRequest()
        response = await conversations.create_conversation(
            request=request, conversation_service=mock_service
        )

        assert response.id == "test-id"
        assert response.title == "New Conversation"
        mock_service.create_conversation.assert_called_once_with(
            title="New Conversation"
        )

    @pytest.mark.asyncio
    async def test_create_conversation_custom_title(self):
        """Test creating a conversation with custom title."""
        mock_service = Mock()
        expected_conv = Conversation(
            id="test-id",
            title="Custom Title",
            messages=[],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
        mock_service.create_conversation.return_value = expected_conv

        request = conversations.CreateConversationRequest(title="Custom Title")
        response = await conversations.create_conversation(
            request=request, conversation_service=mock_service
        )

        assert response.title == "Custom Title"
        mock_service.create_conversation.assert_called_once_with(title="Custom Title")


class TestGetConversation:
    """Tests for get_conversation endpoint."""

    @pytest.mark.asyncio
    async def test_get_conversation_success(self):
        """Test getting an existing conversation."""
        mock_service = Mock()
        expected_conv = Conversation(
            id="test-id",
            title="Test",
            messages=[],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
        mock_service.get_conversation.return_value = expected_conv

        response = await conversations.get_conversation(
            conversation_id="test-id", conversation_service=mock_service
        )

        assert response.id == "test-id"
        assert response.title == "Test"
        mock_service.get_conversation.assert_called_once_with("test-id")

    @pytest.mark.asyncio
    async def test_get_conversation_not_found(self):
        """Test getting a non-existent conversation."""
        mock_service = Mock()
        mock_service.get_conversation.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            await conversations.get_conversation(
                conversation_id="non-existent", conversation_service=mock_service
            )

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Conversation not found"


class TestSendMessage:
    """Tests for send_message endpoint."""

    @pytest.mark.asyncio
    async def test_send_message_success(self):
        """Test sending a message and getting AI response."""
        mock_conv_service = Mock()
        mock_qdrant_service = Mock()

        # Setup conversation
        conv = Conversation(
            id="test-id",
            title="Test",
            messages=[],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
        mock_conv_service.get_conversation.return_value = conv

        # Setup AI response
        from app.models import Citation, Output

        mock_qdrant_service.query_with_history.return_value = Output(
            query="test question",
            response="test answer",
            citations=[Citation(source="Section 1", text="Test citation")],
        )

        request = conversations.SendMessageRequest(message="test question")
        response = await conversations.send_message(
            conversation_id="test-id",
            request=request,
            conversation_service=mock_conv_service,
            qdrant_service=mock_qdrant_service,
        )

        # Verify response
        assert response.role == "assistant"
        assert response.content == "test answer"
        assert len(response.citations) == 1

        # Verify services were called correctly
        mock_conv_service.get_conversation.assert_called_once_with("test-id")
        assert mock_conv_service.add_message.call_count == 2  # User + assistant
        mock_qdrant_service.query_with_history.assert_called_once()

    @pytest.mark.asyncio
    async def test_send_message_conversation_not_found(self):
        """Test sending message to non-existent conversation."""
        mock_conv_service = Mock()
        mock_qdrant_service = Mock()
        mock_conv_service.get_conversation.return_value = None

        request = conversations.SendMessageRequest(message="test")

        with pytest.raises(HTTPException) as exc_info:
            await conversations.send_message(
                conversation_id="non-existent",
                request=request,
                conversation_service=mock_conv_service,
                qdrant_service=mock_qdrant_service,
            )

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Conversation not found"

    @pytest.mark.asyncio
    async def test_send_message_with_history(self):
        """Test that query_with_history is called with conversation context."""
        mock_conv_service = Mock()
        mock_qdrant_service = Mock()

        # Setup conversation with existing messages
        existing_message = Message(
            role="user",
            content="previous question",
            citations=[],
            timestamp=datetime.now(UTC),
        )

        conv = Conversation(
            id="test-id",
            title="Test",
            messages=[existing_message],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )

        mock_conv_service.get_conversation.return_value = conv

        from app.models import Output

        mock_qdrant_service.query_with_history.return_value = Output(
            query="follow up",
            response="answer",
            citations=[],
        )

        request = conversations.SendMessageRequest(message="follow up")
        await conversations.send_message(
            conversation_id="test-id",
            request=request,
            conversation_service=mock_conv_service,
            qdrant_service=mock_qdrant_service,
        )

        # Verify query_with_history was called (the actual history logic is tested in integration tests)
        mock_qdrant_service.query_with_history.assert_called_once()
        call_args = mock_qdrant_service.query_with_history.call_args
        assert call_args[0][0] == "follow up"  # Query string should be passed


class TestDeleteConversation:
    """Tests for delete_conversation endpoint."""

    @pytest.mark.asyncio
    async def test_delete_conversation_success(self):
        """Test deleting an existing conversation."""
        mock_service = Mock()
        mock_service.delete_conversation.return_value = True

        response = await conversations.delete_conversation(
            conversation_id="test-id", conversation_service=mock_service
        )

        assert response == {"message": "Conversation deleted successfully"}
        mock_service.delete_conversation.assert_called_once_with("test-id")

    @pytest.mark.asyncio
    async def test_delete_conversation_not_found(self):
        """Test deleting a non-existent conversation."""
        mock_service = Mock()
        mock_service.delete_conversation.return_value = False

        with pytest.raises(HTTPException) as exc_info:
            await conversations.delete_conversation(
                conversation_id="non-existent", conversation_service=mock_service
            )

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Conversation not found"


class TestUpdateConversationTitle:
    """Tests for update_conversation_title endpoint."""

    @pytest.mark.asyncio
    async def test_update_title_success(self):
        """Test updating a conversation title."""
        mock_service = Mock()
        updated_conv = Conversation(
            id="test-id",
            title="New Title",
            messages=[],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
        mock_service.update_conversation_title.return_value = updated_conv

        response = await conversations.update_conversation_title(
            conversation_id="test-id",
            title="New Title",
            conversation_service=mock_service,
        )

        assert response.title == "New Title"
        mock_service.update_conversation_title.assert_called_once_with(
            "test-id", "New Title"
        )

    @pytest.mark.asyncio
    async def test_update_title_not_found(self):
        """Test updating title of non-existent conversation."""
        mock_service = Mock()
        mock_service.update_conversation_title.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            await conversations.update_conversation_title(
                conversation_id="non-existent",
                title="New Title",
                conversation_service=mock_service,
            )

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail == "Conversation not found"
