# Norm.ai Full-Stack Take-Home Project

This repository contains a full-stack application with a FastAPI backend and Next.js frontend. The backend provides an AI-powered service to query laws from Game of Thrones using RAG (Retrieval-Augmented Generation).

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Docker and Docker Compose
- OpenAI API Key

### Setup

1. **Clone and navigate to the repository**

```bash
cd norm-takehome-fullstack
```

2. **Set up environment variables**

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=your_actual_openai_api_key
```

3. **Option A: Run with Docker (Recommended)**

**Production Mode:**

```bash
docker-compose up --build
```

This will start both backend and frontend services:

- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Frontend: http://localhost:3000

**Development Mode (with hot reload):**

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This provides:

- Backend with hot reload on code changes
- Frontend with hot reload on code changes
- Better development experience with faster builds

4. **Option B: Run Locally (Without Docker)**

**Backend:**

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
cd frontend

# Install dependencies
npx pnpm install

# Run development server
npm run dev
```

- Frontend: http://localhost:3000

## Development Tools

This project includes automated linting and formatting tools:

### Python (Backend)

- **Black**: Code formatter
- **Ruff**: Fast Python linter
- **MyPy**: Static type checker

### JavaScript/TypeScript (Frontend)

- **ESLint**: Linter for Next.js
- **Prettier**: Code formatter

### Pre-commit Hooks (Husky)

Git hooks are configured to automatically lint and format code before each commit:

- Python files are formatted with Black and linted with Ruff
- Frontend files are linted with ESLint and formatted with Prettier

### Commands

```bash
# Lint all code
npm run lint

# Format all code
npm run format

# Backend only
npm run lint:backend
npm run format:backend

# Frontend only
npm run lint:frontend
npm run format:frontend
```

## Project Structure

```
norm-takehome-fullstack/
├── app/                       # FastAPI backend application
│   ├── main.py               # Main FastAPI application
│   ├── api/                  # API routes
│   ├── core/                 # Core functionality
│   ├── models/               # Data models
│   ├── services/             # Business logic
│   └── tests/                # Backend tests (82% coverage)
├── frontend/                 # Next.js frontend application
│   ├── app/                  # Next.js app directory
│   ├── lib/                  # Utilities and API client
│   ├── e2e/                  # E2E tests (Playwright)
│   ├── __tests__/            # Unit tests (Jest)
│   ├── Dockerfile            # Production frontend image
│   └── Dockerfile.dev        # Development frontend image
├── docs/                     # Documentation and reference files
│   └── laws.pdf             # Game of Thrones laws dataset
├── .husky/                  # Git hooks configuration
├── pyproject.toml           # Python tool configuration
├── requirements.txt         # Python dependencies
├── docker-compose.yml       # Production Docker services
├── docker-compose.dev.yml   # Development Docker services
└── Dockerfile              # Backend Docker image
```

## API Endpoints

### Query Laws

**Endpoint:** `GET /query`

**Parameters:**

- `q` (query string): The question to ask about the laws

**Example:**

```bash
curl "http://localhost:8000/query?q=what+happens+if+I+steal+from+the+Sept"
```

**Response:**

```json
{
  "query": "what happens if I steal from the Sept?",
  "response": "...",
  "sources": [...]
}
```

## Documentation

For detailed setup instructions, troubleshooting, and development guidelines, see [SETUP.md](./SETUP.md).

## Technology Stack

### Backend

- **FastAPI**: Modern Python web framework
- **LlamaIndex**: RAG framework for document indexing and querying
- **OpenAI**: LLM for generating responses
- **Qdrant**: Vector database for similarity search
- **PyPDF**: PDF processing
- **Uvicorn**: ASGI server

### Frontend

- **Next.js 14**: React framework
- **TypeScript**: Type-safe JavaScript
- **Chakra UI**: Component library
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library

### Development Tools

- **Black & Ruff**: Python formatting and linting
- **ESLint & Prettier**: JavaScript/TypeScript linting and formatting
- **Husky**: Git hooks
- **Lint-staged**: Run linters on staged files
- **Docker**: Containerization

## Contributing

1. Make sure all linting tools are installed (`npm install`)
2. Create a feature branch
3. Make your changes (pre-commit hooks will auto-format)
4. Test your changes locally
5. Submit a pull request

## License

This is a take-home project for Norm.ai.

## Support

For issues or questions, please refer to the [SETUP.md](./SETUP.md) troubleshooting section.
