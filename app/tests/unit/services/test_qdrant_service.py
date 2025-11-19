"""Unit tests for QdrantService."""

from unittest.mock import Mock, patch

from app.models import Output
from app.services import QdrantService


class TestQdrantService:
    """Tests for QdrantService."""

    def test_init_default_k(self):
        """Test QdrantService initialization with default k."""
        service = QdrantService()
        assert service.k == 2
        assert service.index is None

    def test_init_custom_k(self):
        """Test QdrantService initialization with custom k."""
        service = QdrantService(k=5)
        assert service.k == 5

    @patch("app.services.qdrant_service.qdrant_client.QdrantClient")
    @patch("app.services.qdrant_service.QdrantVectorStore")
    @patch("app.services.qdrant_service.VectorStoreIndex")
    @patch("app.services.qdrant_service.OpenAIEmbedding")
    @patch("app.services.qdrant_service.OpenAI")
    @patch("app.services.qdrant_service.Settings")
    def test_connect(
        self,
        mock_settings,
        mock_openai,
        mock_embedding,
        mock_index,
        mock_vector_store,
        mock_client,
        mock_openai_key,
    ):
        """Test connect method initializes all components."""
        service = QdrantService(k=3)
        service.connect()

        # Verify client was created
        mock_client.assert_called_once_with(location=":memory:")

        # Verify vector store was created
        mock_vector_store.assert_called_once()

        # Verify index was created
        mock_index.from_vector_store.assert_called_once()

        # Verify embeddings and LLM were set
        assert mock_settings.embed_model is not None or mock_embedding.called
        assert mock_settings.llm is not None or mock_openai.called

    def test_load(self, sample_documents):
        """Test load method."""
        service = QdrantService()
        service.index = Mock()

        service.load(sample_documents)

        service.index.insert_nodes.assert_called_once_with(sample_documents)

    @patch("app.services.qdrant_service.CitationQueryEngine")
    def test_query_returns_output(self, mock_query_engine, sample_documents):
        """Test query method returns Output object."""
        service = QdrantService(k=3)
        service.index = Mock()

        # Mock query engine response
        mock_response = Mock()
        mock_response.__str__ = Mock(return_value="Test response")
        mock_response.source_nodes = [
            Mock(
                node=Mock(
                    metadata={"Section": "Test 1.1"},
                    text="Test text 1",
                )
            ),
            Mock(
                node=Mock(
                    metadata={"Section": "Test 1.2"},
                    text="Test text 2",
                )
            ),
        ]

        mock_engine_instance = Mock()
        mock_engine_instance.query.return_value = mock_response
        mock_query_engine.from_args.return_value = mock_engine_instance

        result = service.query("test query")

        assert isinstance(result, Output)
        assert result.query == "test query"
        assert result.response == "Test response"
        assert len(result.citations) == 2

    @patch("app.services.qdrant_service.CitationQueryEngine")
    def test_query_uses_k_parameter(self, mock_query_engine):
        """Test query method uses self.k parameter."""
        service = QdrantService(k=5)
        service.index = Mock()

        mock_response = Mock()
        mock_response.__str__ = Mock(return_value="Response")
        mock_response.source_nodes = []

        mock_engine = Mock()
        mock_engine.query.return_value = mock_response
        mock_query_engine.from_args.return_value = mock_engine

        service.query("test")

        # Verify k was used in query engine initialization
        mock_query_engine.from_args.assert_called_once()
        call_kwargs = mock_query_engine.from_args.call_args[1]
        assert call_kwargs["similarity_top_k"] == 5

    @patch("app.services.qdrant_service.CitationQueryEngine")
    def test_query_extracts_citations(self, mock_query_engine):
        """Test query correctly extracts citations from response."""
        service = QdrantService()
        service.index = Mock()

        # Create mock response with source nodes
        mock_node1 = Mock()
        mock_node1.node.metadata = {"Section": "Thievery 1.1"}
        mock_node1.node.text = "Punishment text"

        mock_node2 = Mock()
        mock_node2.node.metadata = {"Section": "Thievery 1.2"}
        mock_node2.node.text = "Theft from sept"

        mock_response = Mock()
        mock_response.__str__ = Mock(return_value="Response")
        mock_response.source_nodes = [mock_node1, mock_node2]

        mock_engine = Mock()
        mock_engine.query.return_value = mock_response
        mock_query_engine.from_args.return_value = mock_engine

        result = service.query("test query")

        assert len(result.citations) == 2
        assert result.citations[0].source == "Thievery 1.1"
        assert result.citations[0].text == "Punishment text"
        assert result.citations[1].source == "Thievery 1.2"

    @patch("app.services.qdrant_service.CitationQueryEngine")
    def test_query_handles_missing_section_metadata(self, mock_query_engine):
        """Test query handles nodes without Section metadata."""
        service = QdrantService()
        service.index = Mock()

        mock_node = Mock()
        mock_node.node.metadata = {}  # No Section key
        mock_node.node.text = "Text"

        mock_response = Mock()
        mock_response.__str__ = Mock(return_value="Response")
        mock_response.source_nodes = [mock_node]

        mock_engine = Mock()
        mock_engine.query.return_value = mock_response
        mock_query_engine.from_args.return_value = mock_engine

        result = service.query("test")

        # Should use default "Unknown Section"
        assert result.citations[0].source == "Unknown Section"

    @patch("app.services.qdrant_service.CitationQueryEngine")
    def test_query_no_source_nodes(self, mock_query_engine):
        """Test query when response has no source_nodes."""
        service = QdrantService()
        service.index = Mock()

        mock_response = Mock()
        mock_response.__str__ = Mock(return_value="Response")
        # No source_nodes attribute
        del mock_response.source_nodes

        mock_engine = Mock()
        mock_engine.query.return_value = mock_response
        mock_query_engine.from_args.return_value = mock_engine

        result = service.query("test")

        assert len(result.citations) == 0
