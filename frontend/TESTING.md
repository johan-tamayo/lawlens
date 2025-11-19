# Frontend Testing Guide

This document describes the testing setup and guidelines for the frontend application.

## Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: For testing React components
- **@testing-library/user-event**: For simulating user interactions
- **@testing-library/jest-dom**: Custom matchers for DOM assertions

## Running Tests

### Run all tests

```bash
npm run test
# or
pnpm test
```

### Run tests in watch mode

```bash
npm run test:watch
# or
pnpm test:watch
```

### Run tests with coverage

```bash
npm run test:coverage
# or
pnpm test:coverage
```

### Run tests in CI mode

```bash
npm run test:ci
# or
pnpm test:ci
```

## Test Coverage

Current coverage metrics (as of latest run):

- **Statements**: 68%
- **Branches**: 59.6%
- **Functions**: 65.9%
- **Lines**: 67.64%

Coverage thresholds are configured in `jest.config.js`:

- Statements: 60%
- Branches: 50%
- Functions: 55%
- Lines: 60%

## Test Organization

Tests are organized using the following structure:

```
app/
  _components/
    __tests__/
      NavButton.test.tsx
      HeaderNav.test.tsx
  conversations/
    _components/
      __tests__/
        MessageBubble.test.tsx
        EmptyConversationState.test.tsx
  documents/
    _components/
      __tests__/
        DocumentTree.test.tsx
        TreeSection.test.tsx
lib/
  api/
    __tests__/
      hooks.test.tsx
      client.test.ts
      conversation-types.test.ts
  query/
    __tests__/
      provider.test.tsx
  __tests__/
    index.test.ts
__tests__/
  test-utils.tsx  # Shared test utilities
  mocks/
    handlers.ts   # Mock API handlers
```

## Test Utilities

### Custom Render Function

Located in `__tests__/test-utils.tsx`, this provides a custom render function that wraps components with necessary providers:

```typescript
import { render } from '@/__tests__/test-utils'

test('my component test', () => {
  render(<MyComponent />)
  // Component is automatically wrapped with ChakraProvider and QueryClientProvider
})
```

### Mock Helpers

The test utils also provide helper functions for creating mock data:

```typescript
import {
  createMockConversation,
  createMockMessage,
  createMockDocument,
} from "@/__tests__/test-utils";

const mockConv = createMockConversation({ title: "My Conversation" });
const mockMsg = createMockMessage({ content: "Hello" });
const mockDoc = createMockDocument({ section: "1.1" });
```

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '@/__tests__/test-utils'
import { userEvent } from '@testing-library/user-event'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()

    render(<MyComponent onClick={onClick} />)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMyHook } from '../useMyHook'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useMyHook', () => {
  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useMyHook(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
  })
})
```

## Mocking

### Mocking Next.js Router

The router is automatically mocked in `jest.setup.js`:

```typescript
const mockPush = jest.fn();
jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({
  push: mockPush,
  // ... other router methods
});
```

### Mocking API Calls

Mock the API client in your tests:

```typescript
jest.mock("@/lib/api/client", () => ({
  apiClient: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

// In your test
const mockApiClient = require("@/lib/api/client").apiClient;
mockApiClient.GET.mockResolvedValue({
  data: {
    /* mock data */
  },
  error: null,
});
```

### Mocking Hooks

```typescript
jest.mock("@/lib/api/hooks", () => ({
  useDocuments: jest.fn(() => ({
    data: { documents: [] },
    isLoading: false,
    error: null,
  })),
}));
```

## Best Practices

1. **Test user behavior, not implementation details**: Focus on what the user sees and does
2. **Use semantic queries**: Prefer `getByRole`, `getByLabelText`, etc. over `getByTestId`
3. **Avoid testing internal state**: Test the component's public API (props, rendered output, user interactions)
4. **Mock external dependencies**: Mock API calls, router, etc. to isolate components
5. **Keep tests simple and focused**: One test should verify one behavior
6. **Use descriptive test names**: Clearly state what is being tested and expected outcome
7. **Clean up after tests**: Use `beforeEach` and `afterEach` to reset mocks

## Common Issues

### Chakra UI Components

Some Chakra UI components (like Menu, Modal) may have issues in jsdom. We mock:

- `window.scrollTo`
- `HTMLElement.prototype.scrollTo`
- `matchMedia`
- `IntersectionObserver`

### Async Operations

Always use `waitFor` or `await` when testing async operations:

```typescript
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});
```

### User Events

Use `@testing-library/user-event` for more realistic user interactions:

```typescript
const user = userEvent.setup();
await user.click(button);
await user.type(input, "text");
```

## Debugging Tests

### View rendered output

```typescript
const { debug } = render(<MyComponent />)
debug() // Prints the DOM tree
```

### Check what queries are available

```typescript
screen.logTestingPlaygroundURL(); // Opens playground with current DOM
```

### Run a single test

```bash
npm test -- MyComponent.test.tsx
```

### Run tests matching a pattern

```bash
npm test -- --testNamePattern="renders correctly"
```

## CI/CD Integration

Tests run automatically in CI using the `test:ci` script which:

- Runs in CI mode (non-interactive)
- Generates coverage report
- Uses limited worker threads for better performance
- Fails if coverage thresholds are not met

## Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [user-event Documentation](https://testing-library.com/docs/user-event/intro)
