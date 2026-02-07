# Test Generation Skill Playbook

## When to Use

This skill should be activated when there is a need to generate comprehensive tests for code. This includes creating unit tests for new functions or existing ones with low coverage, developing component tests for UI elements, and ensuring edge cases are adequately covered. The primary goal is to increase test coverage and maintain the quality and reliability of the codebase.

## Instructions

1.  **Identify Code for Testing:** Precisely locate the function, hook, component, or API endpoint that requires test generation.
2.  **Determine Test Type:** Based on the code's nature, decide on the appropriate test type: unit, component, or integration.
3.  **Analyze Code Functionality:** Understand the intended behavior, inputs, outputs, and potential side effects of the code.
4.  **Identify Edge Cases:** Brainstorm and list edge cases, error conditions, and boundary values relevant to the code's functionality.
5.  **Choose Mocking Strategy:** Determine if mocks or stubs are necessary for dependencies (e.g., API calls, utility functions, context providers) and select appropriate mocking techniques.
6.  **Generate Test Cases:** Write individual test cases for each identified scenario, including happy paths, edge cases, and error conditions.
7.  **Implement Tests:** Write the test code using the project's testing framework (e.g., Jest, React Testing Library). Adhere to established project conventions for test file organization and naming.
8.  **Integrate Mocks:** Implement the chosen mocking strategy to isolate the unit under test.
9.  **Review and Refine:** Ensure tests are readable, maintainable, and accurately reflect the code's behavior. Verify that existing tests are not broken by the new additions.
10. **Add to Test Suite:** Place the generated test file in the appropriate directory within the `client/src/` or `server/` structure (e.g., `client/src/features/tasks/hooks/__tests__/useTasks.test.ts`).

## Examples

**Input:** A new utility function `calculateDiscount(price: number, discountRate: number): number` located in `client/src/shared/lib/utils.ts`.

**Expected Test Generation (for `client/src/shared/lib/utils.ts`):**

```typescript
// client/src/shared/lib/utils/__tests__/utils.test.ts
import { calculateDiscount } from '../utils';

describe('utils', () => {
  describe('calculateDiscount', () => {
    // Happy path
    test('should correctly calculate discount for a valid price and rate', () => {
      expect(calculateDiscount(100, 0.1)).toBe(10);
      expect(calculateDiscount(50, 0.25)).toBe(12.5);
    });

    // Edge cases
    test('should return 0 discount if price is 0', () => {
      expect(calculateDiscount(0, 0.1)).toBe(0);
    });

    test('should return price if discount rate is 0', () => {
      expect(calculateDiscount(100, 0)).toBe(0);
    });

    test('should handle discount rate of 1 (100%)', () => {
      expect(calculateDiscount(100, 1)).toBe(100);
    });

    // Error conditions / Invalid inputs (depending on requirements, might throw or return NaN/null)
    // Assuming it should return NaN for invalid rates > 1 or negative prices
    test('should return NaN for discount rate greater than 1', () => {
        expect(calculateDiscount(100, 1.1)).toBeNaN();
    });

    test('should return NaN for negative discount rate', () => {
        expect(calculateDiscount(100, -0.1)).toBeNaN();
    });

    test('should return 0 for negative price if that is the desired behavior', () => {
        expect(calculateDiscount(-100, 0.1)).toBe(0); // Or expect NaN depending on spec
    });
  });
});
```

**Input:** A React component `TaskList.tsx` in `client/src/features/tasks/components/TaskList.tsx` that takes `tasks: Task[]` and an `onTaskClick: (taskId: string) => void` prop.

**Expected Test Generation (for `client/src/features/tasks/components/__tests__/TaskList.test.tsx` using React Testing Library):**

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from '../TaskList';
import { Task } from '@/features/tasks/types'; // Assuming Task type is here

const mockTasks: Task[] = [
  { id: 'task-1', title: 'Learn Testing', completed: false },
  { id: 'task-2', title: 'Build Feature', completed: true },
  { id: 'task-3', title: 'Deploy Application', completed: false },
];

describe('TaskList', () => {
  test('renders a list of tasks correctly', () => {
    render(<TaskList tasks={mockTasks} onTaskClick={() => {}} />);
    mockTasks.forEach(task => {
      expect(screen.getByText(task.title)).toBeInTheDocument();
    });
  });

  test('does not render anything if tasks array is empty', () => {
    render(<TaskList tasks={[]} onTaskClick={() => {}} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  test('calls onTaskClick handler when a task is clicked', () => {
    const mockOnTaskClick = jest.fn();
    render(<TaskList tasks={mockTasks} onTaskClick={mockOnTaskClick} />);

    const firstTaskElement = screen.getByText(mockTasks[0].title).closest('li');
    fireEvent.click(firstTaskElement!);

    expect(mockOnTaskClick).toHaveBeenCalledTimes(1);
    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0].id);
  });

  test('applies specific styling or attributes for completed tasks if applicable', () => {
    render(<TaskList tasks={mockTasks} onTaskClick={() => {}} />);
    const completedTaskElement = screen.getByText(mockTasks[1].title);
    // Example: Check for a specific class or data-testid that indicates completion
    // This would depend on the actual implementation of TaskList.tsx
    // expect(completedTaskElement).toHaveClass('completed');
    // OR
    // expect(screen.getByTestId(`task-item-${mockTasks[1].id}`)).toHaveAttribute('data-completed', 'true');
  });
});

```

## Guidelines

*   **Unit Testing Focus:** Prioritize unit tests for pure functions, hooks, and utility modules. Aim for high isolation using mocks.
*   **Component Testing:** Use React Testing Library for component tests. Focus on user interactions and visible output rather than implementation details.
*   **Mocking Dependencies:**
    *   For API calls, mock `fetch` or the specific data-fetching library used (e.g., TanStack Query mocks).
    *   For utility functions called within a hook or component, import and mock them directly using `jest.mock`.
    *   For context providers, wrap the component under test with a mock Context Provider.
*   **Naming Conventions:**
    *   Test files should be named `*.test.ts` or `*.test.tsx` and placed adjacent to the file they are testing (e.g., `useTasks.ts` -> `useTasks.test.ts`).
    *   Use `describe` blocks for grouping related tests and `test` or `it` for individual test cases.
*   **Assertion:** Use clear and **specific assertions**. Avoid generic checks like `expect(true).toBe(true)`. Leverage Jest matchers and React Testing Library queries effectively.
*   **Readability:** Write tests that are easy to understand. Tests should act as living documentation for the code.
*   **Coverage:** Aim for significant test coverage, particularly for critical business logic and user flows. However, prioritize *meaningful* tests over simply achieving a high percentage.
*   **Avoid Testing Implementation Details:** Tests should break if the *behavior* of the code changes, not just if the *internal implementation* changes. Focus on inputs and outputs.
*   **Test Organization:** Group tests logically using `describe` blocks. For complex components or hooks, consider organizing tests by scenario (e.g., `describe('when user is logged in')`, `describe('when fetching data')`).
*   **Refer to Existing Tests:** Analyze existing tests in `client/src/` and `server/` for patterns, preferred assertion styles, and mocking strategies. For example, check tests in `client/src/shared/lib/` and `client/src/features/tasks/hooks/__tests__/`.
