# PR Review Skill Playbook

### 1. ## When to Use

This skill should be activated to review incoming pull requests. Its primary purpose is to ensure code quality, completeness, adherence to project standards, and to identify potential issues before merging. It acts as an automated first-pass reviewer, augmenting human review efforts.

### 2. ## Instructions

1.  **Analyze Code Changes:** Examine the diff of the pull request to understand the scope and nature of the changes.
2.  **Check for new/modified tests:** Verify that new features have corresponding tests or that existing tests have been updated to reflect changes. Prioritize newly added files in `client/src/features/` and `server/` for test coverage.
3.  **Review for Architectural Adherence:** Ensure new code aligns with the established architectural layers (Presentation, Application, API, Data Access, Shared) as described in `architecture.md`. Look for components or logic misplaced across layers.
4.  **Validate against Coding Standards:** Check for adherence to TypeScript best practices, consistent naming conventions, and proper use of utility functions from the `client/src/shared/` directory.
5.  **Inspect for Potential Security Vulnerabilities:** Look for common security disregard patterns, especially in areas related to authentication (`server/auth.ts`), data handling, and input processing. Reference the `security-auditor.md` playbook for common checks.
6.  **Assess Performance Implications:** Identify potential performance bottlenecks introduced by the changes, particularly in areas related to data fetching (`client/src/shared/hooks/usePaginatedList.ts`, `client/src/shared/hooks/useVirtualizedList.ts`) or rendering.
7.  **Evaluate Documentation Updates:** Confirm that code changes, especially new features or significant modifications, are accompanied by relevant documentation updates in `README.md` or other relevant markdown files.
8.  **Check for Refactoring Opportunities:** Identify areas where the code could be improved for readability, maintainability, or to reduce technical debt, referencing the `refactoring-specialist.md` playbook.
9.  **Provide Constructive Feedback:** Summarize findings, categorizing them by severity (e.g., critical, major, minor, suggestion). Provide specific line numbers and actionable recommendations for improvement.

### 3. ## Examples

**Scenario: A new task filtering feature is added.**

**Input (PR Description & Diff Summary):**

*   **PR Title:** feat: Add status filter to task list
*   **Files Modified:**
    *   `client/src/features/tasks/components/TaskList.tsx` (adds filter UI)
    *   `client/src/features/tasks/lib/sortUtils.ts` (adds filter logic)
    *   `client/src/features/tasks/types/task.ts` (adds new filter types)
    *   `client/src/features/tasks/hooks/useTasks.ts` (integrates filter logic)

**Expected Review Output:**

```
PR Review Findings for "feat: Add status filter to task list"

**Summary:** This PR introduces a new status filtering capability for the task list. The implementation appears largely correct, but several areas require attention.

**Details:**

1.  **Testing (Minor):**
    *   No new unit tests were added for the filtering logic in `client/src/features/tasks/lib/sortUtils.ts`. Please add tests to cover various filter combinations. [Ref: `test-writer.md`]
    *   The `TaskList.tsx` component should ideally have tests for rendering the filter UI and interacting with it.

2.  **Code Quality (Suggestion):**
    *   In `client/src/features/tasks/hooks/useTasks.ts`, the filter application logic could potentially be extracted into a separate utility function within `client/src/features/tasks/lib/` for better separation of concerns. [Ref: `refactoring-specialist.md`]

3.  **Documentation (Action Required):**
    *   The `README.md` should be updated to include details about the new task filtering feature, explaining how it works and how users can utilize it.

4.  **Potential Improvements (Suggestion):**
    *   Consider adding more specific filter types beyond just 'status' in `client/src/features/tasks/types/task.ts` if future requirements suggest broader filtering needs.

**Overall Recommendation:** Address the testing and documentation points. Consider the refactoring suggestion for improved maintainability.
```

### 4. ## Guidelines

*   **Prioritize Safety and Stability:** Focus on critical issues like security vulnerabilities, data corruption risks, and breaking changes first.
*   **Adhere to Project Conventions:** Always reference `architecture.md`, `README.md`, and existing code patterns for consistency.
*   **Be Specific and Actionable:** Provide clear feedback with line numbers and concrete suggestions. Generic feedback is less helpful.
*   **Respect Developer Intent:** Assume good intent. Frame suggestions constructively, focusing on improvement rather than just criticism.
*   **Leverage Other Playbooks:** When identifying specific issues (e.g., testing gaps, refactoring needs, security concerns), reference the relevant agent playbooks (e.g., `test-writer.md`, `refactoring-specialist.md`, `security-auditor.md`) to guide remediation.
*   **Distinguish Severity:** Clearly categorize feedback (e.g., critical, major, minor, suggestion, style) to help the developer prioritize.
*   **Focus on Code, Not Just Style:** While style is important, prioritize functional correctness, maintainability, and security. Style suggestions should be secondary.
*   **Check for Unused Code/Imports:** Identify and flag any dead code or unused imports that were not cleaned up.
*   **Verify Error Handling:** Ensure that potential errors are gracefully handled, especially in API endpoints (`server/app.ts`) and critical user interactions.
*   **Review State Management:** Pay attention to how state is managed in React components, especially in hooks like `useVirtualizedList.ts` and `usePaginatedList.ts`, looking for potential performance or correctness issues.
