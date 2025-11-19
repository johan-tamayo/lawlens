# LawLens

## 1. Description

This is a full-stack application that provides an AI-powered service to query legal documents using RAG (Retrieval-Augmented Generation). The application allows users to search through legal documents (specifically Game of Thrones laws) and receive AI-generated responses with proper citations to the source material.

### 1.1. Key Features

- **Document Querying**: Query legal documents using natural language questions
- **Conversation Management**: Create and manage multiple conversation threads with context-aware responses
- **Citation Support**: All responses include citations pointing to the relevant sections of the source documents
- **Document Browsing**: View and navigate through the document structure in a tree-like interface
- **RAG-Powered Search**: Uses vector embeddings and semantic search to find relevant document sections
- **Multi-turn Conversations**: Maintains conversation history for context-aware follow-up questions

The backend uses FastAPI to serve a REST API, while the frontend is built with Next.js providing a modern, responsive user interface. The system leverages LlamaIndex for RAG implementation, Qdrant for vector storage, and OpenAI for embeddings and language model inference.

## 2. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python 3.11+**: Required for the FastAPI backend
- **Node.js 18+**: Required for the Next.js frontend
- **pnpm**: Package manager for the frontend (install via `npm install -g pnpm`)
- **Docker & Docker Compose** (Optional): For containerized deployment
- **OpenAI API Key**: Required for embeddings and LLM inference. You can obtain one from [OpenAI](https://platform.openai.com/)

### 2.1. Environment Setup

- Create a `.env` file in the root directory with the following:

  ```env
  OPENAI_API_KEY=your_openai_api_key_here
  ```

- Ensure the legal documents PDF is located at `docs/laws.pdf`
- Ensure Docker and Docker Compose are installed on your system
- Run `docker compose up --build` from the root directory to start both the frontend and backend services

## 3. Architecture

The application follows a clean architecture pattern with clear separation of concerns. Below is the project folder structure:

### 3.1. Project Folder Structure

```
LawLens/
├── app/                                 # Backend FastAPI application
│   ├── api/                             # API layer
│   │   ├── routes/                      # API route handlers
│   │   │   ├── conversations.py
│   │   │   ├── documents.py
│   │   │   ├── health.py
│   │   │   └── query.py
│   │   ├── deps.py
│   │   └── __init__.py
│   ├── config.py                        # Application configuration
│   ├── core/                            # Core application logic
│   │   ├── lifespan.py                  # Application lifecycle management
│   │   └── __init__.py
│   ├── main.py                          # FastAPI application entry point
│   ├── models/                          # Data models and schemas (Pydantic)
│   │   ├── schemas.py
│   │   └── __init__.py
│   ├── services/                        # Business logic layer
│   │   ├── conversation_service.py      # Conversation management
│   │   ├── document_service.py          # PDF processing
│   │   ├── document_storage_service.py  # Document metadata storage
│   │   ├── qdrant_service.py            # Vector store operations
│   │   └── __init__.py
│   ├── tests/
│   │   ├── unit/                        # Backend Unit Testing Files
│   │   │   ├── api/
│   │   │   ├── models/
│   │   │   └── services/
│   │   ├── conftest.py                  # Pytest configuration
│   │   └── __init__.py
│   └── pytest.ini                       # Pytest configuration
│
├── frontend/                            # Next.js frontend application
│   ├── app/                             # Next.js App Router
│   │   ├── _components/                 # Components for Layout Setup
│   │   │   ├── HeaderNav.tsx
│   │   │   ├── HeaderNavWrapper.tsx
│   │   │   └── NavButton.tsx
│   │   ├── conversations/               # Conversations Page
│   │   │   ├── _components/
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── ConversationList.tsx
│   │   │   │   ├── EmptyConversationState.tsx
│   │   │   │   └── MessageBubble.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── documents/                   # Documents Page
│   │   │   ├── _components/
│   │   │   │   ├── DocumentContent.tsx
│   │   │   │   ├── DocumentTree.tsx
│   │   │   │   └── TreeSection.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css                  # Global styles
│   │   ├── layout.tsx                   # Root layout
│   │   └── page.tsx                     # Landing page
│   ├── lib/
│   │   ├── api/                         # API Integration
│   │   │   ├── client.ts
│   │   │   ├── conversation-types.ts
│   │   │   ├── hooks.ts
│   │   │   ├── schema.ts
│   │   │   └── index.ts
│   │   ├── query/                       # React Query setup
│   │   │   └── provider.tsx
│   │   └── index.ts
│   ├── __tests__/                       # Frontend test utilities
│   │   ├── mocks/                       # Test mocks
│   │   └── test-utils.tsx               # Testing utilities
│   ├── e2e/                             # End-to-end tests
│   │   ├── documents.spec.ts            # E2E testing for Documents pages
│   │   └── fixtures.ts                  # Test fixtures
│   ├── public/                          # Static assets
│   │   └── logo.svg
│   ├── Dockerfile                       # Frontend Docker image
│   ├── jest.config.js                   # Jest configuration
│   ├── jest.setup.js                    # Jest setup
│   ├── next.config.mjs                  # Next.js configuration
│   ├── package.json                     # Frontend dependencies
│   ├── playwright.config.ts             # Playwright configuration
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── README.md
│
├── docs/
│   └── laws.pdf
│
├── docker-compose.yml                   # Docker Compose configuration
├── Dockerfile                           # Backend Docker image
├── package.json                         # Root package.json (scripts)
├── pyproject.toml                       # Python project configuration
├── requirements.txt                     # Python dependencies
├── pnpm-lock.yaml
└── README.md
```

### 3.2. Data Flow

1. **Document Loading**: On startup, the backend loads PDF documents, processes them into sections, and stores them in Qdrant vector store
2. **Query Processing**: User queries are converted to embeddings and matched against document vectors
3. **RAG Generation**: Relevant document sections are retrieved and used as context for the LLM to generate responses
4. **Citation Extraction**: Source sections are extracted and included in the response
5. **Conversation Management**: Conversation history is maintained in-memory for multi-turn dialogues

### 3.3. Service Layer

- **QdrantService**: Manages vector store operations, query execution, and citation extraction
- **DocumentService**: Handles PDF parsing, text extraction, and document structuring
- **DocumentStorageService**: Stores and retrieves document metadata
- **ConversationService**: Manages conversation state, message history, and conversation CRUD operations

## 4. Tech Stack

### 4.1. Backend

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework for building APIs
- **Language**: Python 3.11+
- **RAG Framework**: [LlamaIndex](https://www.llamaindex.ai/) - Data framework for LLM applications
- **Vector Store**: [Qdrant](https://qdrant.tech/) - Vector similarity search engine (in-memory)
- **LLM & Embeddings**: [OpenAI API](https://platform.openai.com/) - GPT-4 for LLM, OpenAI embeddings
- **PDF Processing**: [PyPDF](https://pypdf.readthedocs.io/) - PDF text extraction
- **Validation**: [Pydantic](https://docs.pydantic.dev/) - Data validation using Python type annotations
- **Server**: [Uvicorn](https://www.uvicorn.org/) - ASGI server implementation
- **Configuration**: [pydantic-settings](https://docs.pydantic.dev/latest/usage/settings/) - Settings management

### 4.2. Frontend

- **Framework**: [Next.js 14](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- **UI Library**: [React 18](https://react.dev/) - UI component library
- **Styling**:
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [Chakra UI](https://chakra-ui.com/) - Component library
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query) - Server state management
- **API Client**: [openapi-fetch](https://openapi-ts.pages.dev/openapi-fetch/) - Type-safe API client
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) - Icon library
- **Date Handling**: [date-fns](https://date-fns.org/) - Date utility library

### 4.3. Development Tools

- **Linting & Formatting**:
  - [Ruff](https://docs.astral.sh/ruff/) - Fast Python linter and formatter
  - [Black](https://black.readthedocs.io/) - Python code formatter
  - [ESLint](https://eslint.org/) - JavaScript/TypeScript linter
  - [Prettier](https://prettier.io/) - Code formatter
- **Type Checking**: [MyPy](https://mypy.readthedocs.io/) - Static type checker for Python
- **Testing**:
  - [Pytest](https://pytest.org/) - Python testing framework
  - [Jest](https://jestjs.io/) - JavaScript testing framework
  - [Playwright](https://playwright.dev/) - End-to-end testing
  - [Testing Library](https://testing-library.com/) - React component testing
- **API Documentation**: FastAPI auto-generates OpenAPI/Swagger documentation

### 4.4. Infrastructure

- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Package Management**:
  - Python: `requirements.txt` with pip
  - Frontend: `pnpm` (faster, disk-efficient package manager)

## 5. Challenges

### 5.1. Extracting the documents from the PDFs

Extracting the document content from the given PDF was done using the PyPDF package. The main challenges were maintaining the original layout and improving the accuracy of extracted text to enhance the quality of the RAG pipeline responses.

- Extracted the text using PyPDF (should use layout flag to read the text keeping the original layout)
- Added/removed spaces to the necessary places.
- Passed down the document contents one by one into the OpenAI to fix the issues that are made by OCR processes.

### 5.2. Implementing RAG-Powered Search

The original QdrantService implementation in the codebase was insufficient to make the RAG pipeline work effectively. To resolve this issue, we enhanced the service by incorporating previous chat context into the vector data during conversations and properly configuring conversation history management.

## 6. Future Improvements

### 6.1. Backend

- Set up authentication and user management
- Implement rate limiting
- Set up a message queue to handle GET /query requests to support multiple conversation threads simultaneously
- Migrate conversation history from in-memory storage to a persistent database (PostgreSQL) to prevent data loss on application restart
- Set up SQLAlchemy as an ORM to integrate with the database

### 6.2. Frontend

- Build authentication-related pages
- If required, implement workspace management and role-based access control
