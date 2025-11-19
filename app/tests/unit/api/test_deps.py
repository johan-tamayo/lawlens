"""Unit tests for API dependencies."""

import pytest
from fastapi import HTTPException

from app.api.deps import get_qdrant_service, set_qdrant_service
from app.services import QdrantService


class TestDependencies:
    """Tests for API dependencies."""

    def test_set_qdrant_service(self, mock_qdrant_service):
        """Test setting Qdrant service."""
        set_qdrant_service(mock_qdrant_service)
        service = get_qdrant_service()

        assert service is mock_qdrant_service

        # Cleanup
        set_qdrant_service(None)

    def test_get_qdrant_service_when_not_initialized(self):
        """Test getting service when not initialized raises HTTPException."""
        set_qdrant_service(None)

        with pytest.raises(HTTPException) as exc_info:
            get_qdrant_service()

        assert exc_info.value.status_code == 503
        assert "not initialized" in exc_info.value.detail.lower()

    def test_get_qdrant_service_when_initialized(self, mock_qdrant_service):
        """Test getting service when initialized."""
        set_qdrant_service(mock_qdrant_service)

        service = get_qdrant_service()

        assert service is not None
        assert isinstance(service, type(mock_qdrant_service))

        # Cleanup
        set_qdrant_service(None)

    def test_set_qdrant_service_to_none(self):
        """Test setting service to None."""
        set_qdrant_service(None)

        with pytest.raises(HTTPException):
            get_qdrant_service()

    def test_service_persistence(self, mock_qdrant_service):
        """Test service persists across multiple gets."""
        set_qdrant_service(mock_qdrant_service)

        service1 = get_qdrant_service()
        service2 = get_qdrant_service()

        assert service1 is service2

        # Cleanup
        set_qdrant_service(None)

    def test_service_replacement(self, mock_qdrant_service):
        """Test replacing existing service."""
        set_qdrant_service(mock_qdrant_service)

        new_service = QdrantService(k=5)
        set_qdrant_service(new_service)

        retrieved = get_qdrant_service()
        assert retrieved is new_service
        assert retrieved is not mock_qdrant_service

        # Cleanup
        set_qdrant_service(None)
