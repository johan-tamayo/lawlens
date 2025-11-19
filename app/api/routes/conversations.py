"""Conversations endpoint router."""

from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException

from app.api.deps import ConversationServiceDep, QdrantServiceDep
from app.models import (
    Conversation,
    ConversationListResponse,
    CreateConversationRequest,
    Message,
    SendMessageRequest,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    conversation_service: ConversationServiceDep = None,
) -> ConversationListResponse:
    """
    Get all conversations sorted by most recently updated.

    Returns:
        ConversationListResponse: List of all conversations
    """
    conversations = conversation_service.get_all_conversations()
    return ConversationListResponse(
        total=len(conversations), conversations=conversations
    )


@router.post("", response_model=Conversation)
async def create_conversation(
    request: CreateConversationRequest,
    conversation_service: ConversationServiceDep = None,
) -> Conversation:
    """
    Create a new conversation.

    Args:
        request: Request body with optional title
        conversation_service: Injected conversation service

    Returns:
        Conversation: The newly created conversation
    """
    conversation = conversation_service.create_conversation(title=request.title)
    return conversation


@router.get("/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: str,
    conversation_service: ConversationServiceDep = None,
) -> Conversation:
    """
    Get a specific conversation by ID.

    Args:
        conversation_id: The conversation ID
        conversation_service: Injected conversation service

    Returns:
        Conversation: The requested conversation

    Raises:
        HTTPException: If conversation not found
    """
    conversation = conversation_service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.post("/{conversation_id}/messages", response_model=Message)
async def send_message(
    conversation_id: str,
    request: SendMessageRequest,
    conversation_service: ConversationServiceDep = None,
    qdrant_service: QdrantServiceDep = None,
) -> Message:
    """
    Send a message in a conversation and get AI response.

    Args:
        conversation_id: The conversation ID
        request: Request body with message content
        conversation_service: Injected conversation service
        qdrant_service: Injected Qdrant service

    Returns:
        Message: The AI's response message

    Raises:
        HTTPException: If conversation not found
    """
    # Get the conversation
    conversation = conversation_service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Add user message
    user_message = Message(
        role="user",
        content=request.message,
        citations=[],
        timestamp=datetime.now(UTC),
    )
    conversation_service.add_message(conversation_id, user_message)

    # Get AI response with conversation history
    # Pass only the messages before the current user message
    chat_history = conversation.messages[:-1]  # Exclude the just-added user message
    result = qdrant_service.query_with_history(request.message, chat_history)

    # Create assistant message with response and citations
    assistant_message = Message(
        role="assistant",
        content=result.response,
        citations=result.citations,
        timestamp=datetime.now(UTC),
    )

    # Add assistant message to conversation
    conversation_service.add_message(conversation_id, assistant_message)

    return assistant_message


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    conversation_service: ConversationServiceDep = None,
) -> dict:
    """
    Delete a conversation.

    Args:
        conversation_id: The conversation ID
        conversation_service: Injected conversation service

    Returns:
        dict: Success message

    Raises:
        HTTPException: If conversation not found
    """
    success = conversation_service.delete_conversation(conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted successfully"}


@router.patch("/{conversation_id}/title", response_model=Conversation)
async def update_conversation_title(
    conversation_id: str,
    title: str,
    conversation_service: ConversationServiceDep = None,
) -> Conversation:
    """
    Update a conversation's title.

    Args:
        conversation_id: The conversation ID
        title: The new title
        conversation_service: Injected conversation service

    Returns:
        Conversation: The updated conversation

    Raises:
        HTTPException: If conversation not found
    """
    conversation = conversation_service.update_conversation_title(
        conversation_id, title
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation
