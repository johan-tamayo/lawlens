"""Service for managing conversations in memory."""

import uuid
from datetime import UTC, datetime

from app.models import Conversation, Message


class ConversationService:
    """Service for managing conversations stored in memory."""

    def __init__(self):
        """Initialize with empty conversations list."""
        self.conversations: dict[str, Conversation] = {}

    def create_conversation(self, title: str = "New Conversation") -> Conversation:
        """Create a new conversation."""
        conversation_id = str(uuid.uuid4())
        conversation = Conversation(
            id=conversation_id,
            title=title,
            messages=[],
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
        self.conversations[conversation_id] = conversation
        return conversation

    def get_conversation(self, conversation_id: str) -> Conversation | None:
        """Get a conversation by ID."""
        return self.conversations.get(conversation_id)

    def get_all_conversations(self) -> list[Conversation]:
        """Get all conversations sorted by updated_at descending."""
        conversations = list(self.conversations.values())
        return sorted(conversations, key=lambda c: c.updated_at, reverse=True)

    def add_message(
        self, conversation_id: str, message: Message
    ) -> Conversation | None:
        """Add a message to a conversation."""
        conversation = self.conversations.get(conversation_id)
        if not conversation:
            return None

        conversation.messages.append(message)
        conversation.updated_at = datetime.now(UTC)

        # Auto-generate title from first user message if still default
        if conversation.title == "New Conversation" and message.role == "user":
            # Use first 50 chars of first user message as title
            conversation.title = message.content[:50] + (
                "..." if len(message.content) > 50 else ""
            )

        return conversation

    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation."""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            return True
        return False

    def update_conversation_title(
        self, conversation_id: str, title: str
    ) -> Conversation | None:
        """Update conversation title."""
        conversation = self.conversations.get(conversation_id)
        if not conversation:
            return None

        conversation.title = title
        conversation.updated_at = datetime.now(UTC)
        return conversation
