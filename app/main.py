"""FastAPI application entry point."""

from fastapi import FastAPI

from app.api.routes import health, query
from app.config import settings
from app.core.lifespan import lifespan

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    lifespan=lifespan,
)

# Include routers
app.include_router(query.router)
app.include_router(health.router)
