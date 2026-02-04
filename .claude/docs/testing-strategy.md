# Testing Strategy

This document outlines the testing approach, tools, and best practices for the Task Management System.

## Testing Philosophy

- **Test Behavior, Not Implementation**: Focus on what the code does, not how
- **Pyramid Strategy**: More unit tests, fewer integration tests, minimal E2E
- **Fast Feedback**: Tests should run quickly to encourage frequent execution
- **Maintainable Tests**: Tests should be easy to understand and update

## Test Types

### Unit Tests

Testing individual functions and components in isolation.

**Scope**:

- Utility functions (`client/src/shared/lib/`)
- Custom hooks (`client/src/features/*/hooks/`)
- Pure components
- Server-side helpers

**Tools**: Jest, React Testing Library

```typescript
// Example: Testing a utility function
import { calculateIsOverdue } from "./date-utils";

describe("calculateIsOverdue", () => {
  it("returns true for past dates", () => {
    const pastDate = new Date("2020-01-01");
    expect(calculateIsOverdue(pastDate)).toBe(true);
  });

  it("returns false for future dates", () => {
    const futureDate = new Date("2030-01-01");
    expect(calculateIsOverdue(futureDate)).toBe(false);
  });
});
```

### Integration Tests

Testing how components work together.

**Scope**:

- API routes with database
- Component trees with state
- Hook interactions

**Tools**: Jest, Supertest, Testing Library

```typescript
// Example: API route test
import request from "supertest";
import { app } from "../app";

describe("GET /api/tasks", () => {
  it("returns tasks for authenticated user", async () => {
    const response = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("tasks");
  });
});
```

### Component Tests

Testing React components with user interactions.

**Tools**: React Testing Library, Jest

```typescript
// Example: Component test
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('displays task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
  });

  it('calls onStatusChange when status is updated', () => {
    const onStatusChange = jest.fn();
    render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />);

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
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/main.tsx"],
};
```

### Setup File

```typescript
// jest.setup.ts
import "@testing-library/jest-dom";

// Mock environment variables
process.env.CLERK_PUBLISHABLE_KEY = "test_key";

// Global mocks
jest.mock("@clerk/clerk-react", () => ({
  useUser: () => ({ user: mockUser }),
  useAuth: () => ({ isSignedIn: true }),
}));
```

## Running Tests

| Command                        | Description                |
| ------------------------------ | -------------------------- |
| `npm run test`                 | Run all tests              |
| `npm run test -- --watch`      | Watch mode for development |
| `npm run test -- --coverage`   | Generate coverage report   |
| `npm run test -- path/to/file` | Run specific test file     |

## Coverage Goals

| Metric     | Target | Current |
| ---------- | ------ | ------- |
| Statements | 70%    | -       |
| Branches   | 60%    | -       |
| Functions  | 70%    | -       |
| Lines      | 70%    | -       |

## Testing Best Practices

### Do's

- Write tests before fixing bugs (TDD for bugs)
- Use descriptive test names
- Keep tests independent (no shared state)
- Test edge cases and error conditions
- Use meaningful assertions

### Don'ts

- Don't test implementation details
- Don't test third-party libraries
- Don't write flaky tests
- Don't ignore failing tests
- Don't test trivial code (getters/setters)

## Mock Strategies

### API Mocking

```typescript
// Using MSW for API mocking
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.get("/api/tasks", (req, res, ctx) => {
    return res(ctx.json({ tasks: mockTasks }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Component Mocking

```typescript
// Mock child component
jest.mock('./ComplexChild', () => ({
  ComplexChild: () => <div data-testid="mock-child">Mocked</div>,
}));
```

## CI Integration

Tests run automatically on:

- Pull request creation
- Push to main/develop branches
- Scheduled nightly builds

### CI Configuration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v3
```

## Related Resources

- [Development Workflow](./development-workflow.md)
- [Architecture Notes](./architecture.md)
