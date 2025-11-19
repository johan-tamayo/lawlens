"""Service for Qdrant vector store operations and querying."""

import os

import qdrant_client
from dotenv import load_dotenv
from llama_index.core import Settings, VectorStoreIndex
from llama_index.core.query_engine import CitationQueryEngine
from llama_index.core.schema import Document
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.vector_stores.qdrant import QdrantVectorStore

from app.models import Citation, Output

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
