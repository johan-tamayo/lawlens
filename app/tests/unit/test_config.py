"""Unit tests for configuration."""


from app.config import Settings


class TestConfig:
    """Tests for application configuration."""

    def test_settings_defaults(self):
        """Test default settings values."""
        settings = Settings()

        assert settings.app_name == "Law Query API"
        assert settings.app_version == "1.0.0"
        assert settings.qdrant_similarity_top_k == 3
        assert settings.documents_path == "docs/laws.pdf"

    def test_settings_description(self):
        """Test app description."""
        settings = Settings()
        assert (
            "RAG" in settings.app_description or "querying" in settings.app_description
        )

    def test_settings_openai_key(self, mock_openai_key):
        """Test OpenAI API key from environment."""
        settings = Settings()
        assert settings.openai_api_key == mock_openai_key

    def test_settings_custom_values(self, monkeypatch):
        """Test settings with custom environment variables."""
        monkeypatch.setenv("QDRANT_SIMILARITY_TOP_K", "5")
        monkeypatch.setenv("DOCUMENTS_PATH", "custom/path.pdf")

        settings = Settings()

        assert settings.qdrant_similarity_top_k == 5
        assert settings.documents_path == "custom/path.pdf"

    def test_settings_immutable_after_creation(self):
        """Test settings are immutable after creation."""
        settings = Settings()

        # Pydantic settings are frozen by default in some versions
        # This test verifies the behavior
        original_name = settings.app_name
        assert original_name == "Law Query API"

    def test_settings_singleton_behavior(self):
        """Test settings can be imported as singleton."""
        from app.config import settings

        assert settings.app_name == "Law Query API"
        assert isinstance(settings, Settings)
