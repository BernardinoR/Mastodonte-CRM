# Test Writer Agent Playbook

## Mission

The Test Writer agent is responsible for creating, maintaining, and improving the test suite of the application. This includes unit tests, component tests, and integration tests, with a focus on ensuring high test coverage and reliable test execution.

## Responsibilities

- **Develop New Tests:** Write comprehensive unit tests for new functions, hooks, and utility modules. Create component tests for UI elements using React Testing Library. Develop integration tests for API endpoints and critical application flows.
- **Maintain Existing Tests:** Update tests when the codebase evolves, ensuring they remain accurate and relevant. Refactor tests to improve readability, performance, and maintainability. Fix failing tests.
- **Improve Test Coverage:** Identify areas with low test coverage and implement tests to address gaps. Strategize on how to increase overall test coverage without sacrificing test quality.
- **Mocking and Fixturing:** Create and manage mock data and mock functions to isolate the unit under test. Utilize or develop testing utilities for setting up complex test scenarios.
- **Test Execution and CI:** Ensure tests run smoothly in the CI/CD pipeline. Investigate and resolve any test-related CI failures.

## Codebase Focus Areas

The agent should prioritize tests for the following areas:

1.  **`client/src/features/`**:
    *   **Purpose**: Contains the core business logic and UI components for each feature (e.g., tasks, clients, meetings).
    *   **Focus**: Unit tests for custom hooks (e.g., `useTaskCardFieldHandlers`), utility functions within feature `lib` directories, and component tests for reusable UI elements within features.
2.  **`client/src/shared/`**:
    *   **Purpose**: Houses shared utilities, hooks, types, configuration, and UI components used across the application.
    *   **Focus**: Unit tests for utility functions (e.g., `client/src/shared/lib/utils.ts`), custom hooks (e.g., `client/src/shared/hooks/`), and general-purpose UI components (e.g., `client/src/shared/components/ui`). Thorough testing of type guards and data transformation functions is crucial.
3.  **`server/`**:
    *   **Purpose**: Contains the backend API endpoints, controllers, and data access logic.
    *   **Focus**: Integration tests for API routes defined in `server/routes.ts` and the underlying data storage/manipulation logic in files like `server/storage.ts`. Mocking the database or external services will be key here.

## Key Files & Directories for Testing

-   **`client/src/features/**/hooks/*.ts`**: Primary location for custom hooks that often encapsulate complex logic and state management, making them ideal candidates for unit tests.
-   **`client/src/shared/lib/*.ts`**: Contains general-purpose utility functions. These should have robust unit tests covering various use cases and edge cases.
-   **`client/src/shared/components/ui/*.tsx`**: Reusable UI components. Component tests should verify rendering, interaction, and accessibility.
-   **`server/routes.ts`**: Defines the API endpoints. Integration tests should target these routes to ensure correct request handling, data processing, and response generation.
-   **`server/storage.ts`**: Handles data persistence. Unit or integration tests should verify data manipulation logic, potentially using a test database or mocks.
-   **`client/src/shared/mocks/`**: Directory for mock data and utilities. Leverage and potentially extend these for creating test fixtures.
-   **`**/*.test.ts` / `**/*.test.tsx`**: The convention for test files. New tests should follow this naming convention.

## Common Workflows & Steps

### Workflow 1: Writing Unit Tests for a New Utility Function

1.  **Identify Target**: Locate the utility function in `client/src/shared/lib/` or `client/src/features/*/lib/`.
2.  **Create Test File**: Create a corresponding `*.test.ts` file in the same directory or a dedicated `test/` subdirectory.
3.  **Import:** Import the function to be tested.
4.  **Arrange**: Define test inputs, including edge cases (e.g., null, undefined, empty strings, zero values).
5.  **Act**: Call the function with the arranged inputs.
6.  **Assert**: Use `expect` with appropriate matchers (e.g., `toEqual`, `toBe`, `toBeTruthy`, `toThrow`) to verify the output against expected results.
7.  **Cover Edge Cases**: Explicitly test the function's behavior with invalid or boundary inputs.
8.  **Example**: Testing `client/src/shared/lib/utils.ts`:

    ```typescript
    // client/src/shared/lib/utils.test.ts
    import { cn } from './utils'; // Assuming 'cn' is in utils.ts

    describe('cn utility', () => {
      it('should join class names correctly', () => {
        expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
      });

      it('should handle null/undefined/empty strings', () => {
        expect(cn('btn', null, 'btn-lg', undefined, '')).toBe('btn btn-lg');
      });

      it('should return empty string if no valid classes are provided', () => {
        expect(cn(null, undefined, '')).toBe('');
      });
    });
    ```

### Workflow 2: Writing Component Tests for a Reusable UI Component

1.  **Identify Target**: Locate the component (e.g., a Button, Input) in `client/src/shared/components/ui/` or a feature-specific components directory.
2.  **Create Test File**: Create a `*.test.tsx` file alongside the component file.
3.  **Import**: Import necessary modules like `render`, `screen` from `@testing-library/react`, and the component itself. Import any required context providers or mock services.
4.  **Arrange**: Render the component using the `render` function. Provide necessary props, context, or mock data.
5.  **Act**: Simulate user interactions using `@testing-library/user-event` or by directly interacting with DOM elements queried via `screen`.
6.  **Assert**: Use `screen.getBy*` queries to find elements and `expect` to assert their presence, attributes, or text content. Verify that event handlers were called using mocks.
7.  **Test Variations**: Test different prop combinations and states of the component.
8.  **Example**: Testing a hypothetical `Button` component:

    ```typescript
    // client/src/shared/components/ui/Button.test.tsx
    import React from 'react';
    import { render, screen } from '@testing-library/react';
    import userEvent from '@testing-library/user-event';
    import Button from './Button';

    describe('Button Component', () => {
      it('renders with provided text', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
      });

      it('calls onClick handler when clicked', async () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        await userEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it('applies primary class when primary prop is true', () => {
        render(<Button primary>Click Me</Button>);
        // Assuming 'primary' prop adds a 'btn-primary' class
        expect(screen.getByRole('button', { name: /click me/i })).toHaveClass('btn-primary');
      });
    });
    ```

### Workflow 3: Writing Integration Tests for an API Endpoint

1.  **Identify Target**: Locate the API route definition in `server/routes.ts` or related controller files.
2.  **Create Test File**: Create a test file (e.g., `server/tests/api/tasks.test.ts`).
3.  **Setup**: Import `supertest` (or similar HTTP testing library) and the application instance (often exported from `server/app.ts` or `server/server.ts`).
4.  **Arrange**:
    *   Prepare necessary mock data.
    *   If the endpoint requires authentication, mock the authentication middleware or process.
    *   If the endpoint interacts with storage, mock the `storage.ts` functions or use a test database.
5.  **Act**: Make an HTTP request to the endpoint using `supertest` (e.g., `request(app).get('/api/tasks')`).
6.  **Assert**:
    *   Check the HTTP status code (`.expect(200)`).
    *   Verify the response body structure and data (`.expect(response => { ... })`).
    *   Assert that underlying data/storage functions were called as expected if mocking was used.
7.  **Example**: Testing a GET endpoint for tasks:

    ```typescript
    // server/tests/api/tasks.test.ts
    import request from 'supertest';
    import app from '../../server/app'; // Assuming app is exported from app.ts
    import * as storage from '../../server/storage'; // Mock storage

    describe('GET /api/tasks', () => {
      it('should return a list of tasks', async () => {
        const mockTasks = [{ id: 1, title: 'Test Task', status: 'pending' }];
        // Mock the storage function called by the route handler
        jest.spyOn(storage, 'getTasks').mockResolvedValue(mockTasks);

        const response = await request(app).get('/api/tasks');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockTasks);
        expect(storage.getTasks).toHaveBeenCalledTimes(1);
      });

      it('should return 500 if storage fails', async () => {
        jest.spyOn(storage, 'getTasks').mockRejectedValue(new Error('DB Error'));

        const response = await request(app).get('/api/tasks');

        expect(response.status).toBe(500);
        expect(storage.getTasks).toHaveBeenCalledTimes(1);
      });

      // Add tests for other scenarios like filtering, authentication, etc.
    });
    ```

## Best Practices & Conventions

1.  **AAA Pattern**: Structure tests using Arrange, Act, Assert for clarity.
2.  **Descriptive Names**: Use `describe` blocks for feature/component/module names and `it` blocks for specific behaviors being tested (e.g., `it('should return an empty array when no tasks exist')`).
3.  **Mock Dependencies**: Mock external services, API calls, and potentially complex internal modules to isolate the code under test. Use `jest.fn()` for mock functions and `jest.spyOn()` for mocking methods on existing objects/modules.
4.  **Test Behavior, Not Implementation**: Focus on what the code *does* (inputs, outputs, side effects) rather than *how* it does it. Avoid brittle tests that rely on specific implementation details.
5.  **Independent Tests**: Ensure tests do not depend on the state left by previous tests. Use `beforeEach` and `afterEach` hooks for setup and teardown.
6.  **React Testing Library**: Prefer querying the DOM in ways that resemble how users interact with the application (e.g., by role, accessible name, text content) over implementation details like CSS selectors or component instance structure.
7.  **TypeScript**: Leverage TypeScript in tests for better type safety, especially when dealing with data structures and mock payloads.
8.  **Coverage**: Aim for high test coverage, particularly for business logic and critical paths. Use tools like `jest --coverage` to monitor coverage.

## Collaboration Checklist

-   [ ] Review new feature/bug fix pull requests for adequate test coverage.
-   [ ] Identify and prioritize areas lacking sufficient tests.
-   [ ] Write clear, concise, and maintainable tests following project conventions.
-   [ ] Ensure mocks accurately represent real dependencies.
-   [ ] Verify that all tests pass locally and in CI.
-   [ ] Update existing tests promptly when refactoring or fixing bugs.
-   [ ] Document any complex testing setups or custom mocking utilities.
