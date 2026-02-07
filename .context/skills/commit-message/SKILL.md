# Commit Message Skill Playbook

## When to Use

This skill should be activated whenever a code change is ready to be committed. Its purpose is to generate conventional commit messages that accurately describe the change, adhere to project standards, and facilitate easier changelog generation and versioning.

## Instructions

1.  **Summarize the Change:** Briefly describe the core purpose of the commit in a concise subject line (max 50 characters).
2.  **Categorize the Change:** Prefix the subject line with a type (e.g., `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`, `ci`, `build`).
3.  **Add Scope (Optional):** If the change is specific to a particular module or feature, include it in parentheses after the type (e.g., `feat(auth):`, `fix(tasks):`).
4.  **Write a Body (Optional but Recommended):** Provide a more detailed explanation of the change. Explain the 'why' behind the change, not just the 'what'. Wrap lines at 72 characters.
5.  **Reference Issues:** If the commit relates to an issue in the project's issue tracker, reference it in the body using the appropriate format (e.g., `Closes #123`, `Fixes #456`).
6.  **Add a Footer (Optional):** Include metadata like `BREAKING CHANGE:` for major modifications or `Co-authored-by:` for contributions.

## Examples

**Example 1: Adding a new feature**

```
feat(tasks): Implement task prioritization

- Users can now set a priority level for tasks (High, Medium, Low).
- Added a new 'priority' field to the task type.
- Updated the task creation and editing forms to include the priority selection.
- Added SortByPriority component to the task list view.
Closes #789
```

**Example 2: Fixing a bug**

```
fix(auth): Correct user redirect after login

- Resolved an issue where users were sometimes redirected to the wrong page after successful authentication.
- Ensures users are now consistently redirected to their dashboard.
Fixes #1011
```

**Example 3: Chore (e.g., updating dependencies, build process)**

```
chore: Update ESLint dependencies

- Upgraded ESLint and related plugins to their latest versions.
- Adjusted configurations to accommodate new rules.
```

**Example 4: Refactoring code**

```
refactor(hooks): Extract useDebounce to a shared utility

- Moved the `useDebounce` hook from `client/src/features/tasks/hooks/useDebounce.ts` to `client/src/shared/hooks/useDebounce.ts`.
- This improves reusability across different features.
```

## Guidelines

*   **Be Clear and Concise:** The subject line should be understandable at a glance.
*   **Be Specific:** Avoid vague descriptions. Clearly state what the commit does.
*   **Use the Imperative Mood:** Write the subject line as if giving a command (e.g., "Add feature", "Fix bug", not "Added feature", "Fixes bug").
*   **Follow Conventional Commits:** Adhere strictly to the `type(scope): subject` format. Supported types include: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`, `ci`, `build`.
*   **Explain the "Why":** The commit body should justify the change, especially for bug fixes and new features.
*   **Link to Issues:** Always reference relevant issues using `Closes #` or `Fixes #` in the footer or body.
*   **Keep it Atomic:** Each commit should represent a single logical change. Avoid including multiple unrelated changes in one commit.
*   **Review Existing Commits:** Before generating, consider scanning recent commit history for similar changes or established patterns in files like `server/storage.ts`, `client/src/features/tasks/lib/dndSensors.ts`, or `server/auth.ts`.
