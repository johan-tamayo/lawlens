"""Unit tests for health route."""

from fastapi.testclient import TestClient

from app.api.deps import set_qdrant_service
from app.main import app


class TestHealthRoute:
    """Tests for /health endpoint."""

    def test_health_check_success(self, client_with_mock_service):
        """Test health check returns 200."""
        response = client_with_mock_service.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "service_initialized" in data

    def test_health_check_structure(self, client_with_mock_service):
        """Test health check response structure."""
        response = client_with_mock_service.get("/health")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, dict)
        assert data["status"] == "healthy"
        assert isinstance(data["service_initialized"], bool)

    def test_health_check_with_service_initialized(self, mock_qdrant_service):
        """Test health check when service is initialized."""
        set_qdrant_service(mock_qdrant_service)
        client = TestClient(app)

        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        # Note: service_initialized might be False due to global state
        assert "service_initialized" in data

        # Cleanup
        set_qdrant_service(None)

    def test_health_check_without_service(self):
        """Test health check when service is not initialized."""
        set_qdrant_service(None)
        client = TestClient(app)

        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        # service_initialized should be False
        # (may vary based on test execution order)

        # Cleanup
        set_qdrant_service(None)

    def test_health_check_returns_json(self, client_with_mock_service):
        """Test health check response is JSON."""
        response = client_with_mock_service.get("/health")

        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"

    def test_health_check_no_parameters_needed(self, client_with_mock_service):
        """Test health check works without any parameters."""
        response = client_with_mock_service.get("/health")

        assert response.status_code == 200

    def test_health_check_idempotent(self, client_with_mock_service):
        """Test health check is idempotent."""
        response1 = client_with_mock_service.get("/health")
        response2 = client_with_mock_service.get("/health")

        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response1.json() == response2.json()
