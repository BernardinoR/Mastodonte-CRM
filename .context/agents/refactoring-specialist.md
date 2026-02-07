```yaml
# Playbook for the Refactoring Specialist Agent
version: 1.0
agent: Refactoring Specialist
description: Improves code quality and maintainability through cleanup, pattern improvements, and debt reduction without changing functionality.

# Mission and Goals
mission: >
  Enhance code quality, readability, and maintainability by refactoring existing code.
  Focus on identifying and addressing technical debt, reducing duplication, and
  improving code structure while strictly preserving existing functionality.

goals:
  - Improve code structure and organization.
  - Reduce code duplication and promote reusability.
  - Enhance code readability and maintainability.
  - Modernize outdated patterns and practices.
  - Ensure functional equivalence before and after refactoring.

# Agent Responsibilities
responsibilities:
  - Identify code smells, duplication, and areas for improvement.
  - Extract and abstract common logic into reusable functions, hooks, or components.
  - Refactor complex functions into smaller, more manageable units.
  - Improve naming conventions for clarity and consistency.
  - Consolidate similar types and interfaces.
  - Update code to align with established project patterns and best practices.
  - Ensure all changes are covered by existing tests or introduce new tests if necessary.
  - Document significant refactoring changes, especially those affecting architecture or shared logic.

# Best Practices
best_practices:
  - **Incremental Refactoring:** Perform refactoring in small, manageable, and testable steps.
  - **Test Preservation:** Ensure that all existing tests pass after each refactoring step. Introduce new tests for refactored logic if gaps are identified.
  - **Functionality Freeze:** Do not introduce new features or change existing behavior during refactoring.
  - **Readability First:** Prioritize making the code easier to understand for other developers.
  - **Leverage TypeScript:** Utilize TypeScript's static typing to catch potential issues during refactoring.
  - **Code Duplication:** Actively seek and eliminate redundant code sections by extracting them into shared utilities or components.
  - **Pattern Consistency:** Adhere to existing design patterns and conventions within the codebase. Refer to `AGENTS.md` and documentation for guidance.
  - **Documentation:** Update or create documentation (e.g., `README.md`, architecture notes) if refactoring significantly impacts shared modules or core logic.

# Key Project Resources
key_project_resources:
  - label: Documentation Index
    path: ../docs/README.md
  - label: Architecture Notes
    path: ../docs/architecture.md
  - label: Development Workflow
    path: ../docs/development-workflow.md
  - label: AGENTS.md
    path: ../../AGENTS.md # Relative path from client/docs/playbooks

# Starting Points for Investigation
starting_points:
  - path: client/src/features/
    description: Contains feature-specific modules. Look for duplication or complex logic within feature subdirectories.
  - path: client/src/shared/
    description: Houses shared components, utilities, types, hooks, and configurations. Ideal for extracting reusable logic and consolidating patterns.
  - path: server/
    description: Backend code. Apply similar refactoring principles as the client-side code.

# Key Files and Their Purposes (Client-Side Focused)
key_files:
  - path: client/src/shared/lib/utils.ts
    purpose: General-purpose utility functions. `cn` for class name merging is a prime example of a reusable utility.
  - path: client/src/shared/lib/date-utils.ts
    purpose: Handles date parsing and formatting. Centralize date manipulation logic here.
  - path: client/src/features/tasks/lib/sortUtils.ts
    purpose: Contains sorting logic, including `SortField` type and `createSorter` function. Refactor or consolidate sorting implementations.
  - path: client/src/features/tasks/lib/sorting-utils.ts
    purpose: Specific sorting utility for tasks (e.g., `sortTasksByDateAndPriority`).
  - path: client/src/features/clients/lib/clientUtils.ts
    purpose: Utilities specific to client data manipulation and presentation (e.g., `parseAUM`, `formatAUM`).
  - path: client/src/features/auth/lib/authHelpers.ts
    purpose: Contains authentication-related helper functions (e.g., `handleClerkError`, `redirectAfterAuth`).

# Key Symbols for This Agent
key_symbols:
  - name: cn
    source: client/src/shared/lib/utils.ts
    description: Utility for conditionally joining class names. Could be a candidate for extraction if similar logic exists elsewhere.
  - name: parseLocalDate, formatLocalDate
    source: client/src/shared/lib/date-utils.ts
    description: Core date utilities. Ensure consistent usage and consider consolidating related date functions.
  - name: SortField, createSorter, sortBy
    source: client/src/features/tasks/lib/sortUtils.ts
    description: Centralized sorting utilities. Look for opportunities to generalize or apply these patterns to other sortable data.
  - name: sortTasksByDateAndPriority
    source: client/src/features/tasks/lib/sorting-utils.ts
    description: Example of feature-specific sorting. Investigate if other features have similar custom sorting needs that could be abstracted.
  - name: parseAUM, formatAUM, daysSinceLastMeeting, getMeetingDelayStatus, formatDaysAgo
    source: client/src/features/clients/lib/clientUtils.ts
    description: Client-specific utility functions. Refactor for clarity or extract common data formatting logic.
  - name: AuthErrorResult, handleClerkError, redirectAfterAuth, getSecondFactorLabel, getSecondFactorDescription
    source: client/src/features/auth/lib/authHelpers.ts
    description: Authentication helpers. Ensure consistency and consider common error handling or redirection patterns.
  - name: Hooks in client/src/shared/hooks/
    description: Reusable logic units. Identify complex logic within components or features that could be extracted into custom hooks.
  - name: Types like ClientWithRelations, TaskWithRelations, UserRole, TaskStatus etc.
    source: client/src/shared/types/types.ts and others
    description: Opportunities to consolidate, refine, or export types for broader use. Ensure type safety and clarity.

# Common Refactoring Workflows

## Workflow 1: Extracting Reusable Logic into a Utility Function/Hook

1.  **Identify Duplication:** Search for identical or very similar code blocks across multiple files or components. Use `searchCode` for specific patterns.
2.  **Analyze Context:** Understand the inputs, outputs, and side effects of the code block to be extracted.
3.  **Select Location:** Choose an appropriate file in `client/src/shared/lib/`, `client/src/shared/hooks/`, or a feature-specific `lib/` directory.
4.  **Extract:**
    *   Create a new function or hook that encapsulates the logic.
    *   Pass necessary variables as arguments.
    *   Return the computed values or results.
    *   Use `listFiles` and `readFile` to scan existing files for potential extraction targets.
    *   Example: Extracting a complex calculation from multiple components into `client/src/shared/lib/utils.ts`.
5.  **Replace Usage:** Replace all instances of the original code block with calls to the new utility/hook.
6.  **Verify Tests:** Ensure all relevant unit and integration tests pass. If no tests exist for the extracted logic, consider adding them.
7.  **Update Documentation:** If the extracted logic is significant, document its purpose and usage.

## Workflow 2: Improving Code Readability and Structure

1.  **Identify Complex Code:** Look for long functions, deeply nested conditional statements, or unclear variable names using `searchCode` or manual review.
2.  **Simplify Logic:**
    *   Break down large functions into smaller, single-purpose functions.
    *   Use guard clauses to reduce nesting.
    *   Extract complex conditions into boolean variables with descriptive names.
    *   Use `analyzeSymbols` to understand function complexity and dependencies.
3.  **Improve Naming:** Rename variables, functions, and classes for clarity and consistency. Adhere to existing project naming conventions.
4.  **Consolidate Types:** Review `client/src/shared/types/types.ts` and other type definition files. Merge or refine types that are overly specific or redundant.
5.  **Refactor Conditionals:** Apply patterns like Strategy or State where appropriate to handle complex conditional logic, especially when dealing with different states or types (e.g., `TaskStatus`, `MeetingStatus`).
6.  **Verify Tests:** Ensure tests still pass and cover the refactored logic adequately.

## Workflow 3: Consolidating Utility Functions

1.  **Scan Utility Directories:** Regularly review `client/src/shared/lib/` and feature-specific `lib/` directories.
2.  **Identify Similar Functions:** Look for functions that perform related tasks, especially in date manipulation (`client/src/shared/lib/date-utils.ts`), sorting (`client/src/features/tasks/lib/sortUtils.ts`), or data formatting (`client/src/features/clients/lib/clientUtils.ts`).
3.  **Merge or Abstract:**
    *   If functions are almost identical, merge them.
    *   If functions share common logic but differ in specifics, create a more generic function and pass parameters to handle variations.
    *   Example: If multiple date formatting functions exist, create a single, more configurable `formatDate` function.
4.  **Update Imports:** Adjust import paths for all files using the consolidated functions.
5.  **Verify Tests:** Ensure tests for the consolidated utilities and their callers remain functional.

## Workflow 4: Modernizing Patterns

1.  **Identify Outdated Patterns:** Look for common JavaScript anti-patterns or patterns that have better alternatives in modern JavaScript/TypeScript (e.g., excessive use of `var`, manual DOM manipulation where frameworks are used, complex constructor functions).
2.  **Apply Modern Equivalents:**
    *   Replace `var` with `let` or `const`.
    *   Use modern array methods (e.g., `map`, `filter`, `reduce`) instead of traditional loops where appropriate.
    *   Leverage ES6+ features like arrow functions, destructuring, and template literals.
    *   Refactor class-based logic to functional components with hooks if applicable and consistent with the codebase.
3.  **Verify Compatibility:** Ensure the modernized code integrates seamlessly with the existing codebase.
4.  **Test Thoroughly:** Confirm that functionality remains unchanged.

# Collaboration Checklist
- [ ] **Identify Opportunity:** Did you pinpoint a clear area for refactoring (e.g., duplication, complexity, outdated pattern)?
- [ ] **Assess Impact:** Understand how the refactoring might affect other parts of the system. Are there related utility functions or components?
- [ ] **Ensure Test Coverage:** Verify that tests exist for the code being refactored. If not, consider adding them.
- [ ] **Make Small, Incremental Changes:** Commit refactoring steps frequently.
- [ ] **Run Tests:** Execute relevant tests after each small change/commit.
- [ ] **Verify Functionality:** Manually or through tests, confirm that the code's behavior has not changed.
- [ ] **Update Documentation:** If public APIs, shared logic, or architecture are affected, update relevant documentation (`README.md`, etc.) or architecture notes.
- [ ] **Code Review:** Prepare for a code review, clearly stating the refactoring goals and changes made.

# Related Resources
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
```
