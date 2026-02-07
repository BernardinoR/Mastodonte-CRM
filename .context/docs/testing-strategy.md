# Testing Strategy

This document outlines the testing approach, tools, and best practices for the Task Management System.

## Testing Philosophy

-   **Test Behavior, Not Implementation**: Focus on what the code does, not how.
-   **Pyramid Strategy**: Aim for more unit tests, fewer integration tests, and minimal end-to-end (E2E) tests.
-   **Fast Feedback**: Tests should execute quickly to encourage frequent running.
-   **Maintainable Tests**: Tests should be easy to understand and update.

## Test Types

### Unit Tests

Testing individual functions and components in isolation.

**Scope**:
*   Utility functions (e.g., `client/src/shared/lib/`)
*   Custom hooks (e.g., `client/src/features/*/hooks/`)
*   Pure components
*   Server-side helpers

**Tools**: Jest, React Testing Library

```typescript
// Example: Testing a utility function
import { calculateIsOverdue } from './date-utils';

describe('calculateIsOverdue', () => {
  it('returns true for past dates', () => {
    const pastDate = new Date('2020-01-01');
    expect(calculateIsOverdue(pastDate)).toBe(true);
  });

  it('returns false for future dates', () => {
    const futureDate = new Date('2030-01-01');
    expect(calculateIsOverdue(futureDate)).toBe(false);
  });
});
```

### Integration Tests

Testing how different parts of the system work together.

**Scope**:
*   API routes interacting with the database
*   Component trees involving state management
*   Interactions between multiple hooks

**Tools**: Jest, Supertest, React Testing Library

```typescript
// Example: API route test
import request from 'supertest';
import { app } from '../app'; // Assuming app is exported from app.ts

describe('GET /api/tasks', () => {
  it('returns tasks for authenticated user', async () => {
    // Assume validToken is obtained through authentication setup
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('tasks');
  });
});
```

### Component Tests

Testing individual React components, including their user interactions.

**Tools**: React Testing Library, Jest

```typescript
// Example: Component test
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard'; // Assuming TaskCard is exported from TaskCard.tsx

// Mock task object for testing
const mockTask = { id: '1', title: 'Test Task', status: 'pending' };

describe('TaskCard', () => {
  it('displays task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
  });

  it('calls onStatusChange when status is updated', () => {
    const onStatusChange = jest.fn();
    render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />);
    
    // Simulate clicking a button to change status (e.g., complete)
    fireEvent.click(screen.getByRole('button', { name: /complete/i }));
    expect(onStatusChange).toHaveBeenCalledWith('completed');
  });
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Example alias for src directory
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx', // Exclude entry point if not relevant for coverage
  ],
};
```

### Setup File

This file is executed before each test suite. It's useful for global mocks and setup.

```typescript
// jest.setup.ts
import '@testing-library/jest-dom';

// Mock environment variables needed for tests
if (typeof process.env.CLERK_PUBLISHABLE_KEY === 'undefined') {
  process.env.CLERK_PUBLISHABLE_KEY = 'test_key';
}

// Global mocks for authentication libraries
jest.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ user: { id: 'test_user_id', username: 'testuser' } }), // Mock user object
  useAuth: () => ({ isSignedIn: true, getToken: jest.fn().mockResolvedValue('test_token') }), // Mock auth state
}));
```

## Running Tests

| Command                   | Description                               |
| :------------------------ | :---------------------------------------- |
| `npm run test`            | Run all tests                             |
| `npm run test -- --watch` | Run tests in watch mode for development   |
| `npm run test -- --coverage`| Generate a code coverage report           |
| `npm run test -- path/to/file.test.ts` | Run a specific test file                   |

## Coverage Goals

| Metric    | Target | Current |
| :-------- | :----- | :------ |
| Statements | 70%    | -       |
| Branches  | 60%    | -       |
| Functions | 70%    | -       |
| Lines     | 70%    | -       |

*Note: Current coverage metrics will be populated after running tests with the `--coverage` flag.*

## Testing Best Practices

### Do's
*   Write tests *before* fixing bugs (Test-Driven Development for bugs).
*   Use descriptive test names that clearly indicate what is being tested.
*   Keep tests independent; avoid shared state between tests.
*   Test edge cases and error conditions thoroughly.
*   Use meaningful assertions to verify expected outcomes.

### Don'ts
*   Don't test implementation details; test observable behavior.
*   Don't test third-party libraries directly; assume they work.
*   Don't write flaky tests that pass or fail inconsistently.
*   Don't ignore failing tests; address them promptly.
*   Don't test trivial code like simple getters/setters.

## Mock Strategies

### API Mocking

Mocking API responses is crucial for integration and component tests that depend on network requests. Mock Service Worker (MSW) is recommended for this.

```typescript
// Example using MSW for API mocking
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Define mock data
const mockTasks = [{ id: 't1', title: 'Mocked Task' }];

// Setup MSW server with mocked endpoints
const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.json({ tasks: mockTasks }));
  })
);

// Start and reset the server for tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Component Mocking

Mocking child components can simplify testing parent components by isolating their logic.

```typescript
// Mock a child component in your test file
jest.mock('./ComplexChild', () => ({
  // Replace the original export with a mock implementation
  ComplexChild: ({ someProp }: { someProp: string }) => (
    <div data-testid="mock-child">Mocked Child Content (Prop: {someProp})</div>
  ),
}));

// In your test, you can now render the parent component, and it will use the mock
describe('ParentComponent', () => {
  it('renders correctly with mocked child', () => {
    render(<ParentComponent />);
    expect(screen.getByTestId('mock-child')).toBeInTheDocument();
  });
});
```

## CI Integration

Tests are automatically executed in the CI pipeline on key events.

**CI Triggers**:
*   Pull request creation
*   Push to `main` or `develop` branches
*   Scheduled nightly builds

### CI Configuration Example

This snippet shows a GitHub Actions workflow for running tests.

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20' # Specify your Node.js version
      
      - name: Install dependencies
        run: npm ci # Use 'ci' for faster, deterministic installs in CI
      
      - name: Run tests with coverage
        run: npm run test -- --coverage --watchAll=false # Ensure coverage is generated and disable watch mode
      
      - name: Upload coverage reports to Codecov
        uses: codecov/codecov-action@v3
        env:
          CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }} # Ensure this secret is set in your repository settings
```

## Related Resources

*   [Development Workflow](./development-workflow.md)
*   [Architecture Notes](./architecture.md)
