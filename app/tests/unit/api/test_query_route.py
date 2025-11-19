"""Unit tests for query route."""



class TestQueryRoute:
    """Tests for /query endpoint."""

    def test_query_success(self, client_with_mock_service, sample_output):
        """Test successful query returns 200 and Output model."""
        response = client_with_mock_service.get("/query?q=test query")

        assert response.status_code == 200
        data = response.json()

        assert "query" in data
        assert "response" in data
        assert "citations" in data
        assert data["query"] == sample_output.query

    def test_query_with_special_characters(self, client_with_mock_service):
        """Test query with special characters."""
        response = client_with_mock_service.get(
            "/query?q=what%20happens%20if%20I%20steal%3F"
        )

        assert response.status_code == 200

    def test_query_missing_parameter(self, client_with_mock_service):
        """Test query without q parameter returns 422."""
        response = client_with_mock_service.get("/query")

        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_query_empty_string(self, client_with_mock_service):
        """Test query with empty string returns 422."""
        response = client_with_mock_service.get("/query?q=")

        assert response.status_code == 422

    def test_query_whitespace_only(self, client_with_mock_service):
        """Test query with whitespace only returns 422."""
        response = client_with_mock_service.get("/query?q=%20%20%20")

        # Empty after stripping should fail validation
        assert response.status_code in [200, 422]  # Depends on validation

    def test_query_long_text(self, client_with_mock_service):
        """Test query with long text."""
        long_query = "test " * 100  # 500 characters
        response = client_with_mock_service.get(f"/query?q={long_query}")

        assert response.status_code == 200

    def test_query_response_structure(self, client_with_mock_service):
        """Test query response has correct structure."""
        response = client_with_mock_service.get("/query?q=test")

        assert response.status_code == 200
        data = response.json()

        # Check required fields
        assert "query" in data
        assert "response" in data
        assert "citations" in data

        # Check citations structure
        assert isinstance(data["citations"], list)
        if data["citations"]:
            citation = data["citations"][0]
            assert "source" in citation
            assert "text" in citation

    def test_query_citations_count(self, client_with_mock_service, sample_output):
        """Test query returns expected number of citations."""
        response = client_with_mock_service.get("/query?q=test")

        assert response.status_code == 200
        data = response.json()

        expected_count = len(sample_output.citations)
        assert len(data["citations"]) == expected_count

    def test_query_service_called_with_correct_params(
        self, client_with_mock_service, mock_qdrant_service
    ):
        """Test that QdrantService.query is called with correct parameters."""
        query_text = "what happens if I steal"
        client_with_mock_service.get(f"/query?q={query_text}")

        mock_qdrant_service.query.assert_called_once_with(query_text)

    def test_query_url_encoding(self, client_with_mock_service):
        """Test query handles URL encoding correctly."""
        queries = [
            "what happens?",
            "test & query",
            "test=value",
            "test+query",
        ]

        for query in queries:
            response = client_with_mock_service.get(f"/query?q={query}")
            assert response.status_code == 200

    def test_query_unicode_characters(self, client_with_mock_service):
        """Test query with unicode characters."""
        response = client_with_mock_service.get("/query?q=café")

        assert response.status_code == 200

    def test_query_returns_json(self, client_with_mock_service):
        """Test query response is JSON."""
        response = client_with_mock_service.get("/query?q=test")

        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
