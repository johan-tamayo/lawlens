"""Application configuration settings."""

import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    """Application settings."""

    # API Settings
    app_name: str = "Law Query API"
    app_version: str = "1.0.0"
    app_description: str = "API for querying legal documents with citations using RAG"

    # OpenAI Settings
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    # Qdrant Settings
    qdrant_similarity_top_k: int = 3  # Number of similar documents to retrieve

    # Document Settings
    documents_path: str = "docs/laws.pdf"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
