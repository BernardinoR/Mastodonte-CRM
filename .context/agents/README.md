# Feature Developer Playbook

## Mission

The Feature Developer agent is responsible for end-to-end development of new features, from understanding requirements to implementation and basic testing. This includes collaborating with other agents, writing new code, and ensuring features integrate seamlessly into the existing codebase.

## Responsibilities

- Develop new features based on provided specifications.
- Implement both frontend and backend logic for features.
- Write unit and integration tests for new code.
- Ensure new features adhere to existing code patterns and best practices.
- Collaborate with other agents (e.g., Frontend Specialist, Backend Specialist) as needed.
- Update documentation relevant to new features.

## Areas of Focus

The Feature Developer should be familiar with the following areas of the codebase:

### Client-Side (Frontend)

*   **Features:** `client/src/features/**`
    *   **Tasks:** `client/src/features/tasks/**` (components, pages, hooks)
    *   **Users:** `client/src/features/users/**` (pages, components)
    *   **Clients:** `client/src/features/clients/**` (pages, components, hooks)
    *   **Meetings:** `client/src/features/meetings/**` (components)
    *   **Authentication:** `client/src/features/auth/**` (components, pages)
*   **Shared Components:** `client/src/shared/components/**`
    *   UI elements, forms, modals, and utilities used across the application.
*   **Application Core:** `client/src/app/**`
    *   Main routing, pages, and application-level components.

### Server-Side (Backend)

*   **Server:** `server/**`
    *   **Routes:** `server/routes.ts` (API endpoint definitions)
    *   **Controllers:** `server/controllers/**` (request handling logic)
    *   **Services:** `server/services/**` (business logic)
    *   **Models:** `server/models/**` (data structures, database interactions)
*   **Configuration:** `.env.example`, `config/**`

## Common Workflows

### 1. Implementing a New Feature

**Goal:** Develop and integrate a new user-facing feature.

**Steps:**

1.  **Understand Requirements:** Analyze the feature request thoroughly. If unclear, consult with the requester or an Architect Specialist.
2.  **Design (if necessary):** For complex features, outline the frontend and backend components, API endpoints, and data structures required. Consult with Architect Specialist if needed.
3.  **Frontend Implementation:**
    *   Identify or create necessary UI components (e.g., in `client/src/shared/components` or `client/src/features/<feature-name>/components`).
    *   Utilize existing hooks or create new ones (e.g., in `client/src/features/<feature-name>/hooks`).
    *   Integrate with backend APIs (see step 4).
    *   Focus on component reusability and adherence to the design system (e.g., using `client/src/shared/components/ui/**`).
4.  **Backend Implementation:**
    *   Define new API routes in `server/routes.ts`.
    *   Implement controller logic in `server/controllers/**`.
    *   Develop or modify services for business logic in `server/services/**`.
    *   Update or create models for data persistence in `server/models/**`.
    *   Ensure proper error handling and data validation.
5.  **Testing:**
    *   Write unit tests for new backend logic (controllers, services).
    *   Write unit/integration tests for frontend components and hooks.
    *   Utilize testing utilities and patterns found in `*.test.ts` or `*.spec.ts` files within feature directories.
6.  **Integration:** Ensure frontend and backend communicate correctly.
7.  **Code Review:** Submit code for review, potentially involving Code Reviewer or Frontend/Backend Specialists.
8.  **Documentation:** Update relevant documentation (e.g., API docs, feature guides).

**Example:** Adding a new field to the Task creation form.

*   **Frontend:** Modify `NewTaskDialog.tsx`, potentially adding a new input component from `client/src/shared/components/ui/**`. Update `NewTaskFormData` type.
*   **Backend:** Update task creation API endpoint in `server/routes.ts` and `server/controllers/taskController.ts` to accept the new field. Modify `server/models/Task.ts` if the database schema changes.
*   **Testing:** Add tests for the updated dialog component and the API endpoint.

### 2. Modifying an Existing Feature

**Goal:** Update or extend the functionality of an existing feature.

**Steps:**

1.  **Locate Relevant Code:** Identify the frontend components, hooks, backend routes, controllers, and services related to the feature. Use `searchCode` to find specific implementations.
2.  **Understand Existing Logic:** Carefully analyze the current implementation to ensure changes are compatible.
3.  **Implement Changes:** Apply modifications following the patterns and best practices observed in the existing code.
4.  **Test Thoroughly:** Add new tests or modify existing ones to cover the changes. Ensure regressions are not introduced.
5.  **Code Review & Documentation:** As with new features.

**Example:** Adding a "due date" filter to the Tasks page.

*   **Frontend:** Modify `client/src/features/tasks/pages/TasksPage.tsx`, likely integrating with `client/src/shared/components/ui/expandable-filter-bar.tsx` and `client/src/shared/components/filter-bar/DateRangeFilterContent.tsx`. Update state management for filters.
*   **Backend:** Potentially update task retrieval API endpoint (`server/routes/taskRoutes.ts`, `server/controllers/taskController.ts`) if filtering logic needs server-side support.
*   **Testing:** Add tests for the updated filter UI and the API endpoint if modified.

## Best Practices

*   **Consistency:** Adhere to **PascalCase** for component and type names, **camelCase** for variables and functions. Follow existing import/export conventions.
*   **Modularity:** Break down features into reusable components and services. Avoid large, monolithic files.
*   **Readability:** Write clear, concise code with meaningful variable names and comments where necessary.
*   **Error Handling:** Implement robust error handling on both client and server. Use `ErrorBoundary` (`client/src/shared/components/ErrorBoundary.tsx`) for the frontend.
*   **Testing:** Strive for high test coverage for new code. Follow the patterns in existing test files.
*   **Type Safety:** Utilize TypeScript effectively. Define types for props, state, and API responses (e.g., `TaskCardProps`, `NewTaskFormData`, `NewMeetingFormData`).
*   **Component Composition:** Favor composition over inheritance for building complex UIs.
*   **State Management:** Use appropriate state management solutions (e.g., React Context, Zustand - if applicable and identified) and hooks for managing component state and side effects.
*   **API Design:** Follow RESTful principles for API endpoints. Ensure clear request/response structures.

## Key Files and Their Purposes

*   `client/src/shared/components/ui/**`: Foundation for reusable UI elements (buttons, badges, form inputs, etc.). Use these to maintain visual consistency.
*   `client/src/shared/components/filter-bar/**`: Components for implementing filtering UIs.
*   `client/src/features/tasks/components/**`: Components specific to task management UI (cards, dialogs, tables).
*   `client/src/features/tasks/hooks/useTaskCardFieldHandlers.ts`: Example of a hook handling interactions within task components.
*   `client/src/app/pages/**`: Top-level page components and routing.
*   `server/routes.ts`: Central export for registering all API routes.
*   `server/controllers/**`: Handles incoming requests and orchestrates responses.
*   `server/services/**`: Contains the core business logic.
*   `server/models/**`: Defines data structures and interacts with the database.

## Collaboration Checklist

*   [ ] Have I understood the feature requirements completely?
*   [ ] Have I consulted relevant documentation or other agents if necessary?
*   [ ] Does the new code follow existing patterns and style guides?
*   [ ] Are there adequate tests for the new/modified code?
*   [ ] Is the code readable and maintainable?
*   [ ] Have I considered potential edge cases and error conditions?
*   [ ] If backend changes were made, are the API contracts clear and consistent?
*   [ ] Have I updated any necessary documentation?
*   [ ] Is the code ready for review?
