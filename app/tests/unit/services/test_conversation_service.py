"""Unit tests for ConversationService."""

from datetime import UTC, datetime

from app.models import Message
from app.services import ConversationService


class TestConversationService:
    """Tests for ConversationService."""

    def test_init(self):
        """Test ConversationService initialization."""
        service = ConversationService()
        assert service.conversations == {}

    def test_create_conversation_default_title(self):
        """Test creating a conversation with default title."""
        service = ConversationService()
        conversation = service.create_conversation()

        assert conversation.id is not None
        assert conversation.title == "New Conversation"
        assert conversation.messages == []
        assert isinstance(conversation.created_at, datetime)
        assert isinstance(conversation.updated_at, datetime)
        assert conversation.id in service.conversations

    def test_create_conversation_custom_title(self):
        """Test creating a conversation with custom title."""
        service = ConversationService()
        title = "Custom Title"
        conversation = service.create_conversation(title=title)

        assert conversation.title == title
        assert conversation.id in service.conversations

    def test_create_multiple_conversations(self):
        """Test creating multiple conversations."""
        service = ConversationService()
        conv1 = service.create_conversation("First")
        conv2 = service.create_conversation("Second")

        assert conv1.id != conv2.id
        assert len(service.conversations) == 2

    def test_get_conversation_exists(self):
        """Test getting an existing conversation."""
        service = ConversationService()
        created = service.create_conversation("Test")
        retrieved = service.get_conversation(created.id)

        assert retrieved is not None
        assert retrieved.id == created.id
        assert retrieved.title == "Test"

    def test_get_conversation_not_exists(self):
        """Test getting a non-existent conversation."""
        service = ConversationService()
        result = service.get_conversation("non-existent-id")

        assert result is None

    def test_get_all_conversations_empty(self):
        """Test getting all conversations when empty."""
        service = ConversationService()
        conversations = service.get_all_conversations()

        assert conversations == []

    def test_get_all_conversations_sorted(self):
        """Test getting all conversations sorted by updated_at."""
        service = ConversationService()
        conv1 = service.create_conversation("First")
        conv2 = service.create_conversation("Second")

        # Add message to conv1 to update its updated_at
        message = Message(
            role="user",
            content="Test",
            citations=[],
            timestamp=datetime.now(UTC),
        )
        service.add_message(conv1.id, message)

        conversations = service.get_all_conversations()

        assert len(conversations) == 2
        # conv1 should be first (most recently updated)
        assert conversations[0].id == conv1.id
        assert conversations[1].id == conv2.id

    def test_add_message_success(self):
        """Test adding a message to a conversation."""
        service = ConversationService()
        conversation = service.create_conversation()
        message = Message(
            role="user",
            content="Hello",
            citations=[],
            timestamp=datetime.now(UTC),
        )

        result = service.add_message(conversation.id, message)

        assert result is not None
        assert len(result.messages) == 1
        assert result.messages[0].content == "Hello"
        assert result.messages[0].role == "user"

    def test_add_message_conversation_not_found(self):
        """Test adding a message to non-existent conversation."""
        service = ConversationService()
        message = Message(
            role="user",
            content="Hello",
            citations=[],
            timestamp=datetime.now(UTC),
        )

        result = service.add_message("non-existent-id", message)

        assert result is None

    def test_add_message_updates_timestamp(self):
        """Test that adding a message updates the conversation timestamp."""
        service = ConversationService()
        conversation = service.create_conversation()
        original_timestamp = conversation.updated_at

        message = Message(
            role="user",
            content="Test",
            citations=[],
            timestamp=datetime.now(UTC),
        )
        updated = service.add_message(conversation.id, message)

        assert updated.updated_at > original_timestamp

    def test_add_message_auto_generates_title(self):
        """Test that first user message auto-generates title."""
        service = ConversationService()
        conversation = service.create_conversation()  # Uses default title

        message = Message(
            role="user",
            content="What is the punishment for theft?",
            citations=[],
            timestamp=datetime.now(UTC),
        )
        updated = service.add_message(conversation.id, message)

        assert updated.title == "What is the punishment for theft?"
        assert updated.title != "New Conversation"

    def test_add_message_auto_generates_title_truncates_long_message(self):
        """Test that long messages are truncated in auto-generated title."""
        service = ConversationService()
        conversation = service.create_conversation()

        long_message = "A" * 100  # 100 characters
        message = Message(
            role="user",
            content=long_message,
            citations=[],
            timestamp=datetime.now(UTC),
        )
        updated = service.add_message(conversation.id, message)

        assert len(updated.title) == 53  # 50 chars + "..."
        assert updated.title.endswith("...")

    def test_add_message_does_not_override_custom_title(self):
        """Test that custom titles are not overridden by auto-generation."""
        service = ConversationService()
        conversation = service.create_conversation("Custom Title")

        message = Message(
            role="user",
            content="Test message",
            citations=[],
            timestamp=datetime.now(UTC),
        )
        updated = service.add_message(conversation.id, message)

        assert updated.title == "Custom Title"

    def test_add_message_assistant_does_not_generate_title(self):
        """Test that assistant messages don't trigger title generation."""
        service = ConversationService()
        conversation = service.create_conversation()

        message = Message(
            role="assistant",
            content="Hello, how can I help?",
            citations=[],
            timestamp=datetime.now(UTC),
        )
        updated = service.add_message(conversation.id, message)

        assert updated.title == "New Conversation"

    def test_delete_conversation_success(self):
        """Test deleting an existing conversation."""
        service = ConversationService()
        conversation = service.create_conversation()

        result = service.delete_conversation(conversation.id)

        assert result is True
        assert conversation.id not in service.conversations

    def test_delete_conversation_not_found(self):
        """Test deleting a non-existent conversation."""
        service = ConversationService()

        result = service.delete_conversation("non-existent-id")

        assert result is False

    def test_update_conversation_title_success(self):
        """Test updating a conversation title."""
        service = ConversationService()
        conversation = service.create_conversation("Old Title")
        original_timestamp = conversation.updated_at

        result = service.update_conversation_title(conversation.id, "New Title")

        assert result is not None
        assert result.title == "New Title"
        assert result.updated_at > original_timestamp

    def test_update_conversation_title_not_found(self):
        """Test updating title of non-existent conversation."""
        service = ConversationService()

        result = service.update_conversation_title("non-existent-id", "New Title")

        assert result is None

    def test_multiple_messages_in_conversation(self):
        """Test adding multiple messages to a conversation."""
        service = ConversationService()
        conversation = service.create_conversation()

        user_msg = Message(
            role="user",
            content="Question",
            citations=[],
            timestamp=datetime.now(UTC),
        )
        service.add_message(conversation.id, user_msg)

        assistant_msg = Message(
            role="assistant",
            content="Answer",
            citations=[],
            timestamp=datetime.now(UTC),
        )
        result = service.add_message(conversation.id, assistant_msg)

        assert len(result.messages) == 2
        assert result.messages[0].role == "user"
        assert result.messages[1].role == "assistant"
