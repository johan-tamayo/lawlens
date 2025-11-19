"""Service for Qdrant vector store operations and querying."""

import os

import qdrant_client
from dotenv import load_dotenv
from llama_index.core import Settings, VectorStoreIndex
from llama_index.core.chat_engine import CondenseQuestionChatEngine
from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.query_engine import CitationQueryEngine
from llama_index.core.schema import Document
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.vector_stores.qdrant import QdrantVectorStore

from app.models import Citation, Message, Output

load_dotenv()
key = os.getenv("OPENAI_API_KEY")


class QdrantService:
    """Service for managing Qdrant vector store and query operations."""

    def __init__(self, k: int = 2):
        self.index = None
        self.k = k

    def connect(self) -> None:
        """Initialize Qdrant client and vector store index."""
        # Configure global settings for embeddings and LLM
        Settings.embed_model = OpenAIEmbedding()
        Settings.llm = OpenAI(api_key=key, model="gpt-4")

        # Initialize Qdrant client with in-memory storage
        client = qdrant_client.QdrantClient(location=":memory:")

        # Create QdrantVectorStore
        vector_store = QdrantVectorStore(client=client, collection_name="laws")

        # Initialize index with Qdrant vector store
        self.index = VectorStoreIndex.from_vector_store(vector_store=vector_store)

    def load(self, docs: list[Document]) -> None:
        """Load documents into the vector store."""
        self.index.insert_nodes(docs)

    def query(self, query_str: str) -> Output:
        """
        Initialize the query engine, run the query, and return the result as an Output object.
        Uses CitationQueryEngine to provide citations for the response.
        """
        # Initialize CitationQueryEngine with self.k for similarity_top_k
        query_engine = CitationQueryEngine.from_args(
            self.index,
            similarity_top_k=self.k,
            citation_chunk_size=512,
        )

        # Execute the query
        response = query_engine.query(query_str)

        # Extract citations from the response
        citations = []
        if hasattr(response, "source_nodes"):
            for node in response.source_nodes:
                # Extract metadata for the citation source
                metadata = node.node.metadata
                source = metadata.get("Section", "Unknown Section")
                text = node.node.text

                citations.append(Citation(source=source, text=text))

        # Create and return the Output object
        output = Output(
            query=query_str,
            response=str(response),
            citations=citations,
        )

        return output

    def query_with_history(
        self, query_str: str, chat_history: list[Message] | None = None
    ) -> Output:
        """
        Query with conversation history for multi-turn conversations.
        Uses CondenseQuestionChatEngine to maintain context.

        Args:
            query_str: The current query string
            chat_history: Optional list of previous messages for context

        Returns:
            Output: Query response with citations
        """
        if not chat_history or len(chat_history) == 0:
            # No history - use regular CitationQueryEngine
            return self.query(query_str)

        # Create chat engine with memory
        memory = ChatMemoryBuffer.from_defaults(token_limit=3000)

        # Populate memory with chat history
        for msg in chat_history:
            if msg.role == "user":
                memory.put(ChatMessage(role=MessageRole.USER, content=msg.content))
            elif msg.role == "assistant":
                memory.put(ChatMessage(role=MessageRole.ASSISTANT, content=msg.content))

        # Create the base query engine with citations
        query_engine = CitationQueryEngine.from_args(
            self.index,
            similarity_top_k=self.k,
            citation_chunk_size=512,
        )

        # Create chat engine that condenses questions based on history
        chat_engine = CondenseQuestionChatEngine.from_defaults(
            query_engine=query_engine,
            memory=memory,
            verbose=False,
        )

        # Execute query with context
        response = chat_engine.chat(query_str)

        # Extract citations from the response
        citations = []
        if hasattr(response, "source_nodes"):
            for node in response.source_nodes:
                metadata = node.node.metadata
                source = metadata.get("Section", "Unknown Section")
                text = node.node.text
                citations.append(Citation(source=source, text=text))

        return Output(
            query=query_str,
            response=str(response),
            citations=citations,
        )
