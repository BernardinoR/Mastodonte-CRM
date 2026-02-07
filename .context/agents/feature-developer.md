# Feature Developer Agent Playbook

## Mission

Implement new features end-to-end, spanning both frontend and backend development for the Task Management System, adhering to the established feature-based architecture.

## Responsibilities

*   Develop new features from initial requirements through to deployment.
*   Create and integrate frontend components, hooks, and pages.
*   Design and implement backend API endpoints.
*   Modify database schemas as necessitated by new features, using Prisma.
*   Write comprehensive tests for all new functionality.
*   Maintain and adhere to the feature-based folder structure.

## Best Practices

*   **Requirement Comprehension:** Thoroughly understand feature requirements before implementation.
*   **API Contract Design:** Define and agree upon API contracts (request/response formats) prior to developing backend or frontend integrations.
*   **Pattern Adherence:** Follow existing design patterns, component structures, and coding conventions found within the codebase.
*   **Modular Feature Development:** Encapsulate new features within their own dedicated folders under `client/src/features/` and `server/features/` (if applicable).
*   **Test-Driven Development:** Write unit and integration tests concurrently with feature implementation.
*   **Code Reusability:** Leverage existing shared components, hooks, and utilities where appropriate.

## Key Project Resources

*   **Documentation Index:** [../docs/README.md](../docs/README.md)
*   **Architecture Notes:** [../docs/architecture.md](../docs/architecture.md)
*   **Development Workflow:** [../docs/development-workflow.md](../docs/development-workflow.md)
*   **AGENTS.md:** [../../AGENTS.md](../../AGENTS.md)

## Repository Starting Points

*   **Frontend Feature Modules:** `client/src/features/`
*   **Backend API:** `server/`
*   **Database Schema:** `prisma/`

## Feature Folder Structure (Client-Side)

A typical new feature should reside in its own directory within `client/src/features/`, following this structure:

```
features/[feature-name]/
├── components/     # Reusable React components specific to this feature
├── hooks/          # Custom hooks for feature logic and state management
├── lib/            # Utility functions for the feature
├── types/          # TypeScript types and interfaces for the feature
├── pages/          # Page-level components or views
└── index.ts        # Public exports from the feature module
```

## Key Files and Directories for Focus

*   **`client/src/features/[feature-name]/`**: The primary location for new feature development. Create a new subdirectory here for your feature.
*   **`server/routes.ts`**: Defines backend API routes. New endpoints for your feature will be registered here.
*   **`server/storage.ts`**: Contains the `DbStorage` class, which provides an interface for interacting with the database. Adapt or extend patterns used here for new data access logic.
*   **`client/src/shared/components/`**: Contains reusable UI components and utilities. Familiarize yourself with these for consistent UI implementation.
*   **`client/src/shared/hooks/`**: Contains reusable frontend hooks. Utilize these where applicable to avoid reinventing solutions.
*   **`prisma/schema.prisma`**: The database schema definition. Modify this file to add or alter tables and fields for your feature.
*   **`prisma/seed.ts`**: Used for seeding the database with initial data. May need updates for feature-specific data.
*   **Testing Files:** Test files are typically co-located with the code they are testing (e.g., `client/src/features/tasks/hooks/useTasks.test.ts`). Write tests for components, hooks, and API integrations.

## Key Symbols and Patterns

*   **Core Domain Types:** `Task`, `Client`, `Meeting` (found in shared types or feature-specific type files).
*   **Complex Hook Patterns:** `useTurboMode`, `useTaskFilters` (examples of sophisticated client-side state management and logic).
*   **API Integration:** `apiRequest` (a pattern/utility likely used for making requests to the backend API, check `client/src/shared/api/` or similar).
*   **Backend Data Access:** `DbStorage` (the primary class for database operations in `server/storage.ts`).
*   **UI Components:** Pay attention to props and usage of components like `ButtonProps`, `EditableCellProps`, `ExpandableFilterBarProps`, `SearchableMultiSelectProps`, and various `*BadgeProps` for consistent UI.
*   **Routing:** Understand how routes are registered in `server/routes.ts` and how frontend routing is handled (likely using a framework like React Router).

## Workflows

### 1. Implementing a New Feature

1.  **Understand Requirements:** Clarify the detailed functional and non-functional requirements for the new feature.
2.  **Design API Contract:**
    *   Define the necessary API endpoints (e.g., `POST /tasks`, `GET /tasks/:id`, `PUT /tasks/:id`).
    *   Specify request payloads and response formats.
    *   Consult with backend/frontend leads if necessary.
3.  **Database Schema Design (if needed):**
    *   Update `prisma/schema.prisma` to reflect new data models or relationships.
    *   Run `npx prisma migrate dev --name <migration_name>` to generate and apply migrations.
4.  **Backend Implementation:**
    *   Create a new feature module in `server/[feature-name]/` or integrate into existing relevant modules.
    *   Implement data access logic using `DbStorage` patterns (or create new methods).
    *   Implement API endpoint handlers, validating input and interacting with `DbStorage`.
    *   Register new routes in `server/routes.ts`.
    *   Write backend unit and integration tests.
5.  **Frontend Implementation:**
    *   Create a new feature directory within `client/src/features/`.
    *   Develop necessary React components (`components/`), hooks (`hooks/`), and types (`types/`).
    *   Integrate with backend APIs using the established `apiRequest` pattern.
    *   Implement UI logic, state management, and user interactions.
    *   Create page-level components if the feature requires new views (`pages/`).
    *   Write frontend unit and integration tests.
6.  **Testing:**
    *   Ensure all new code has corresponding unit tests.
    *   Write integration tests to verify the end-to-end flow of the feature.
    *   Manually test the feature in a development environment.
7.  **Documentation:**
    *   Update relevant sections in `docs/` if the feature impacts architecture, workflow, or introduces new concepts.
    *   Add comments to complex code sections.
8.  **Code Review & Deployment:** Submit code for review and follow deployment procedures.

### 2. Modifying an Existing Feature

1.  **Locate Feature Code:** Identify the relevant directory within `client/src/features/` and corresponding backend logic.
2.  **Understand Existing Implementation:** Analyze the existing components, hooks, and API endpoints related to the feature. Use `listFiles` and `readFile` to explore.
3.  **Apply Changes:** Follow the steps for "Implementing a New Feature" (3-7) as applicable to the modification, focusing on the specific part of the feature being changed. Ensure consistency with existing patterns.

## Documentation Touchpoints

*   **Architecture Notes:** [../docs/architecture.md](../docs/architecture.md) - Understand the system's overall design.
*   **Development Workflow:** [../docs/development-workflow.md](../docs/development-workflow.md) - Follow the established process for building and deploying features.
*   **Glossary:** [../docs/glossary.md](../docs/glossary.md) - Define and understand key terms.
*   **Testing Strategy:** [../docs/testing-strategy.md](../docs/testing-strategy.md) - Understand the approach to testing.

## Collaboration Checklist

*   [ ] Feature requirements are clearly understood and documented.
*   [ ] Review of existing codebase patterns and relevant modules is complete.
*   [ ] API contract (endpoints, request/response) is designed and validated.
*   [ ] Backend API endpoints are implemented and tested.
*   [ ] Frontend components, hooks, and logic are implemented and tested.
*   [ ] Unit and integration tests cover the new or modified functionality.
*   [ ] Any necessary documentation updates have been made.

## Related Resources

*   **Documentation Index:** [../docs/README.md](../docs/README.md)
*   **Agent Playbooks:** [./README.md](./README.md)
*   **AGENTS.md:** [../../AGENTS.md](../../AGENTS.md)
