# Refactoring Skill Playbook

## When to Use

This skill should be activated when code needs to be improved for better structure, readability, maintainability, or adherence to established patterns, without altering its external behavior. This includes:

*   Reducing technical debt.
*   Improving code clarity and understandability.
*   Preparing code for future enhancements.
*   Consolidating duplicate logic.
*   Simplifying complex algorithms or components.

## Instructions

1.  **Identify Target Code:** Pinpoint specific functions, classes, components, or modules that are candidates for refactoring. Look for code smells such as long methods, large classes, duplication, or unclear naming.
2.  **Understand Existing Behavior:** Thoroughly analyze the current functionality of the target code. If tests exist, review them to grasp the expected inputs, outputs, and edge cases. If not, consider the need to add tests *before* refactoring (refer to `test-writer.md`).
3.  **Formulate Refactoring Strategy:**
    *   **Small, Incremental Changes:** Plan to make the smallest possible changes that yield a desired improvement.
    *   **Preserve Behavior:** Ensure that no functionality is altered. Each small step should ideally maintain or improve test coverage.
    *   **Focus:** Target one specific improvement at a time (e.g., extract a function, rename a variable, simplify a loop).
4.  **Implement Refactoring:** Apply the planned changes to the code.
    *   *Example:* Rename a variable or function to be more descriptive.
    *   *Example:* Extract a block of code into a new, well-named function.
    *   *Example:* Replace a complex conditional with a more readable structure.
    *   *Example:* Consolidate similar types or interfaces, like potentially `UseInlineHeaderFieldOptions` and `UseInlineEditOptions` if they share significant overlap.
5.  **Verify Behavior:** After each incremental change, run tests to confirm that functionality remains intact. If tests don't exist or are insufficient, consider writing them first or alongside the refactoring. For changes in `client/src/features/tasks/hooks/useWhatsAppGroups.ts` or `client/src/features/users/hooks/useGoogleCalendar.ts`, ensure API interactions remain consistent.
6.  **Review and Iterate:** If the refactoring introduces new complexities or doesn't achieve the desired improvement, revert and try a different approach.
7.  **Commit Changes:** Commit refactored code with a clear message indicating the purpose of the refactoring (e.g., "refactor: Extract formatting logic from `formatDate` utility").

## Examples

**Scenario 1: Extracting a function**

**Input Code (`client/src/shared/hooks/useVirtualizedList.ts` - hypothetical example):**

```typescript
function useVirtualizedList(items: any[], options: VirtualizedListOptions) {
  // ... other logic ...
  const processedItems = items.map(item => {
    let displayValue = item.name;
    if (options.filter?.startsWith('prefix_')) {
      displayValue = options.filter + displayValue;
    }
    if (item.isActive) {
      displayValue += ' (Active)';
    }
    return { ...item, displayValue };
  });
  // ... rest of the hook logic ...
  return { processedItems, /* ... */ };
}
```

**Refactoring Step:** Extract the mapping logic into a separate helper function.

**Output Code:**

```typescript
function processItemForDisplay(item: any, filter?: string): any {
  let displayValue = item.name;
  if (filter?.startsWith('prefix_')) {
    displayValue = filter + displayValue;
  }
  if (item.isActive) {
    displayValue += ' (Active)';
  }
  return { ...item, displayValue };
}

function useVirtualizedList(items: any[], options: VirtualizedListOptions) {
  // ... other logic ...
  const processedItems = items.map(item => processItemForDisplay(item, options.filter));
  // ... rest of the hook logic ...
  return { processedItems, /* ... */ };
}
```

**Scenario 2: Improving Variable Naming**

**Input Code (`server/storage.ts`):**

```typescript
export class DbStorage implements IStorage {
  async getData(id: string) {
    const res = await db.getClientData(id); // 'res' is unclear
    // ... process res ...
    return processedData;
  }
}
```

**Refactoring Step:** Rename `res` to something more descriptive.

**Output Code:**

```typescript
export class DbStorage implements IStorage {
  async getData(id: string) {
    const clientData = await db.getClientData(id); // 'clientData' is more descriptive
    // ... process clientData ...
    return processedData;
  }
}
```

## Guidelines

*   **Test First (When Possible):** If the code lacks adequate test coverage, prioritize writing tests *before* refactoring. This provides a safety net and clearly defines the expected behavior. Refer to `test-writer.md`.
*   **Small Commits:** Make frequent, small commits. Each commit should represent a single, logical refactoring step and pass all tests. This makes it easier to revert problematic changes.
*   **Focus on Clarity:** Aim for code that is easier for humans to read, understand, and modify. Prefer descriptive names over cryptic abbreviations.
*   **Remove Redundancy:** Identify and eliminate repeated code blocks by extracting them into reusable functions, components, or hooks. Check patterns in `client/src/shared/hooks/` for potential reusability.
*   **Adhere to Project Conventions:** Follow the established coding style, patterns, and architectural guidelines of the project. For example, styling should align with Tailwind CSS usage, and React hooks should follow best practices.
*   **Avoid Feature Changes:** Refactoring should *not* introduce new features or change existing functionality. If a behavior change is needed, it should be a separate task.
*   **Leverage Existing Tools:** Utilize IDE features for renaming, extracting functions, and other refactoring operations.
*   **Document Significant Changes:** If a refactoring significantly alters the structure or introduces new core abstractions (e.g., abstracting database interactions further within `server/storage.ts`), consider adding a brief comment or updating relevant documentation.
*   **Consider Performance:** While the primary goal is structure, be mindful of potential performance implications. Sometimes, a more readable solution might have minor performance trade-offs, which should be acceptable if the improvement in maintainability is substantial. Conversely, refactoring can sometimes *improve* performance by simplifying logic or encouraging better data handling patterns (e.g., optimizing data fetching logic similar to what might be found in `client/src/shared/hooks/usePaginatedList.ts`).
