# Code Review Skill Playbook

## When to Use

This skill should be activated whenever a code change is proposed (e.g., in a pull request) to ensure adherence to quality standards, best practices, and project conventions. It aims to catch potential issues related to maintainability, performance, security, and style consistency before merging.

## Instructions

1.  **Understand the Changes:** Analyze the diff of the proposed code changes. Identify the files modified, added, or deleted.
2.  **Contextualize with Project Goals:** Review the changes in the context of the project's overall architecture and goals as outlined in `README.md` and `architecture.md`.
3.  **Check for Functional Correctness:**
    *   Verify that the code implements the intended functionality as described in the associated ticket or feature request.
    *   Ensure that the changes do not introduce regressions in existing features.
4.  **Evaluate Code Quality and Maintainability:**
    *   **Readability:** Assess if the code is clear, well-commented (where necessary), and easy to understand. Check for adherence to naming conventions.
    *   **Modularity:** Examine if the code is broken down into logical, reusable components, functions, or hooks.
    *   **DRY Principle:** Identify and flag any instances of repeated code that could be abstracted into shared utilities or components (e.g., in `client/src/shared/`).
    *   **Error Handling:** Ensure robust error handling is in place, especially for API calls, data manipulation, and user input.
5.  **Assess Performance Implications:**
    *   Look for potential performance bottlenecks, particularly in data fetching (`client/src/shared/hooks/usePaginatedList.ts`, `client/src/shared/hooks/useVirtualizedList.ts`), rendering, and complex computations.
    *   Consider the impact on bundle size.
6.  **Review Security Aspects:**
    *   Examine authentication and authorization logic (refer to `server/auth.ts`).
    *   Check for proper input validation and sanitization, especially for data coming from the client or external sources.
    *   Ensure sensitive data is handled securely.
7.  **Verify Style and Consistency:**
    *   Confirm adherence to TypeScript best practices.
    *   Check for consistency with existing code patterns, especially within related files (e.g., hooks in `client/src/shared/hooks/` or data handling in `server/storage.ts`).
    *   Ensure correct usage of UI components and styling (Tailwind CSS, shadcn/ui).
8.  **Check Test Coverage:**
    *   Verify that new functionality is adequately covered by unit, integration, or component tests.
    *   Ensure existing tests are updated if necessary to reflect the changes. Refer to the `test-writer.md` playbook for expected testing practices.
9.  **Formulate Feedback:** Provide clear, constructive, and actionable feedback. Differentiate between mandatory changes (blocking merges) and suggestions for improvement. Reference specific lines of code and existing project conventions where applicable.

## Examples

**Scenario 1: Adding a new API endpoint**

*   **Input:** A pull request adding a new route in `server/app.ts` and its handler.
*   **Review Focus:**
    *   Is the route properly defined and integrated with Express?
    *   Is authentication middleware applied correctly (`server/auth.ts`)?
    *   Are request parameters validated?
    *   Is error handling robust?
    *   Does the handler interact correctly with storage (`server/storage.ts`)?
    *   Are corresponding tests added?
*   **Example Feedback:** "Consider adding input validation for the `userId` parameter in the new `/tasks/:id` endpoint to prevent potential issues. Also, ensure that the `DbStorage` methods used are properly typed and handle potential `null` or `undefined` returns."

**Scenario 2: Modifying a UI hook**

*   **Input:** A pull request updating `client/src/shared/hooks/usePaginatedList.ts`.
*   **Review Focus:**
    *   Does the change maintain the expected `UsePaginatedListOptions` and `UsePaginatedListReturn` interface?
    *   Are there potential performance implications for lists using this hook?
    *   Is the logic clear and maintainable?
    *   Have related component usages been considered?
*   **Example Feedback:** "The update to the `fetchData` logic in `usePaginatedList` looks good. However, ensure that any new dependencies added to the `useEffect` hook are either stable or properly memoized to avoid unnecessary re-fetches. Additionally, double-check the downstream components that consume this hook to ensure their usage is still valid."

## Guidelines

*   **Be Specific:** Refer to exact file names, line numbers, and code snippets when providing feedback.
*   **Reference Conventions:** Cite project documentation (e.g., `README.md`, `architecture.md`) or established patterns (e.g., usage of hooks in `client/src/shared/hooks/`) when explaining recommendations.
*   **Prioritize:** Distinguish between critical issues (security, regressions, build failures) and stylistic suggestions.
*   **Be Constructive:** Frame feedback positively, focusing on improvement rather than criticism. Use phrases like "Consider..." or "Might be clearer if..."
*   **Respect Functionality:** Ensure that refactoring suggestions do not alter the intended behavior of the code unless explicitly part of a bug fix.
*   **Collaborate:** If unsure about a specific area, consult relevant roles or documentation. For example, for security concerns, refer to the `security-auditor.md` playbook. For performance, refer to `performance-optimizer.md`.
*   **Check Dependencies:** Be mindful of how changes might affect other parts of the system, especially shared utilities and hooks.
