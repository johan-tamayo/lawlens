# Testing Documentation

## 📊 Test Coverage: 92.98%

This document describes the comprehensive test suite for the Law Query API.

## 🏗️ Test Structure

```
app/tests/                           # Backend tests
├── conftest.py                      # Shared fixtures and configuration
├── unit/                            # Unit tests
│   ├── api/
│   │   ├── test_deps.py            # Dependency injection tests (6 tests)
│   │   ├── test_health_route.py    # Health endpoint tests (7 tests)
│   │   └── test_query_route.py     # Query endpoint tests (12 tests)
│   ├── models/
│   │   └── test_schemas.py         # Pydantic model tests (14 tests)
│   ├── services/
│   │   ├── test_document_service.py # Document service tests (9 tests)
│   │   └── test_qdrant_service.py  # Qdrant service tests (9 tests)
│   └── test_config.py              # Configuration tests (6 tests)
├── integration/                     # Integration tests (future)
├── htmlcov/                         # Coverage HTML reports
└── coverage.xml                     # Coverage XML report
```

## ✅ Test Coverage by Module

| Module                             | Coverage   | Tests  | Status                       |
| ---------------------------------- | ---------- | ------ | ---------------------------- |
| `app/api/deps.py`                  | 100%       | 6      | ✅                           |
| `app/api/routes/health.py`         | 100%       | 7      | ✅                           |
| `app/api/routes/query.py`          | 100%       | 12     | ✅                           |
| `app/models/schemas.py`            | 100%       | 14     | ✅                           |
| `app/services/document_service.py` | 100%       | 9      | ✅                           |
| `app/services/qdrant_service.py`   | 100%       | 9      | ✅                           |
| `app/config.py`                    | 100%       | 6      | ✅                           |
| `app/main.py`                      | 100%       | -      | ✅                           |
| `app/core/lifespan.py`             | 36.84%     | -      | ⚠️ (integration test needed) |
| **TOTAL**                          | **92.98%** | **62** | ✅                           |

## 🧪 Running Tests

### Run All Tests

```bash
pytest
```

### Run with Verbose Output

```bash
pytest -v
```

### Run with Coverage

```bash
pytest --cov=app --cov-report=term-missing
```

### Run Specific Test File

```bash
pytest app/tests/unit/models/test_schemas.py
```

### Run Specific Test Class

```bash
pytest app/tests/unit/models/test_schemas.py::TestCitation
```

### Run Specific Test Method

```bash
pytest app/tests/unit/models/test_schemas.py::TestCitation::test_citation_creation
```

### Run Tests by Marker

```bash
pytest -m unit          # Run only unit tests
pytest -m integration   # Run only integration tests
pytest -m "not slow"    # Skip slow tests
```

### Generate HTML Coverage Report

```bash
pytest --cov=app --cov-report=html
# Open app/tests/htmlcov/index.html in browser
```

### Run Tests in Parallel (faster)

```bash
pip install pytest-xdist
pytest -n auto
```

## 📝 Test Categories

### 1. Model Tests (`test_schemas.py`)

Tests for Pydantic models:

- ✅ Model creation and validation
- ✅ Serialization (dict, JSON)
- ✅ Field validation and error handling
- ✅ Nested model validation
- ✅ Data integrity

**Coverage: 14 tests, 100%**

### 2. Service Tests

#### DocumentService (`test_document_service.py`)

- ✅ PDF text processing
- ✅ Section extraction
- ✅ Document metadata creation
- ✅ Text normalization
- ✅ Empty section filtering

**Coverage: 9 tests, 100%**

#### QdrantService (`test_qdrant_service.py`)

- ✅ Service initialization
- ✅ Vector store connection
- ✅ Document loading
- ✅ Query execution
- ✅ Citation extraction
- ✅ k-parameter usage

**Coverage: 9 tests, 100%**

### 3. API Route Tests

#### Health Endpoint (`test_health_route.py`)

- ✅ Status check
- ✅ Response structure
- ✅ Service initialization status
- ✅ Idempotency

**Coverage: 7 tests, 100%**

#### Query Endpoint (`test_query_route.py`)

- ✅ Successful queries
- ✅ Parameter validation
- ✅ Empty/missing parameter handling
- ✅ Special characters and encoding
- ✅ Response structure
- ✅ Citation count verification
- ✅ Service integration

**Coverage: 12 tests, 100%**

### 4. Dependency Tests (`test_deps.py`)

- ✅ Service getter/setter
- ✅ Uninitialized service handling
- ✅ Service persistence
- ✅ Service replacement
- ✅ Error handling (503)

**Coverage: 6 tests, 100%**

### 5. Configuration Tests (`test_config.py`)

- ✅ Default values
- ✅ Environment variables
- ✅ Settings immutability
- ✅ Singleton behavior

**Coverage: 6 tests, 100%**

## 🔧 Test Fixtures

### Shared Fixtures (conftest.py)

- `mock_openai_key` - Mocked OpenAI API key
- `sample_pdf_text` - Sample PDF text
- `sample_documents` - Sample Document objects
- `sample_citations` - Sample Citation objects
- `sample_output` - Sample Output object
- `mock_qdrant_service` - Mocked QdrantService
- `mock_document_service` - Mocked DocumentService
- `client_with_mock_service` - TestClient with mocked service
- `mock_pdf_reader` - Mocked PyPDF reader
- `temp_pdf_file` - Temporary PDF file

## 🎯 Testing Best Practices Used

1. **Isolation**: Each test is independent
2. **Mocking**: External dependencies are mocked
3. **Fixtures**: Reusable test data
4. **Markers**: Tests are categorized
5. **Coverage**: >90% code coverage
6. **Fast**: All 62 tests run in < 1 second
7. **Descriptive**: Clear test names
8. **Assertions**: Multiple assertions per test
9. **Edge Cases**: Boundary conditions tested
10. **Error Handling**: Exception cases covered

## 📈 Coverage Goals

- ✅ **Current Coverage**: 92.98%
- ✅ **Target Coverage**: 80% (exceeded!)
- ⚠️ **Low Coverage Areas**:
  - `app/core/lifespan.py` (36.84%) - Requires integration tests

## 🚀 Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    pytest --cov=app --cov-report=xml

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage.xml
```

## 🐛 Debugging Tests

### Run with PDB on failure

```bash
pytest --pdb
```

### Show print statements

```bash
pytest -s
```

### Run only failed tests

```bash
pytest --lf
```

### Run with warnings

```bash
pytest -W error
```

## 📦 Test Dependencies

- `pytest>=7.4.0` - Test framework
- `pytest-asyncio>=0.21.0` - Async test support
- `pytest-cov>=4.1.0` - Coverage plugin
- `pytest-mock>=3.12.0` - Mocking utilities
- `httpx>=0.24.0` - TestClient dependency

## 🔄 Adding New Tests

### 1. Create test file

```python
# app/tests/unit/new_module/test_new_feature.py
import pytest

class TestNewFeature:
    def test_something(self):
        assert True
```

### 2. Run new tests

```bash
pytest app/tests/unit/new_module/test_new_feature.py
```

### 3. Check coverage

```bash
pytest --cov=app.new_module
```

## 📊 Coverage Report

View the HTML coverage report:

```bash
pytest --cov=app --cov-report=html
open app/tests/htmlcov/index.html
```

## ✨ Test Quality Metrics

- **Total Tests**: 62
- **Pass Rate**: 100%
- **Execution Time**: < 1 second
- **Code Coverage**: 92.98%
- **Branch Coverage**: Included
- **Maintainability**: High (clear structure)
