# Architect Specialist Agent Playbook

## Mission

The Architect Specialist agent is responsible for designing, evolving, and maintaining the overall system architecture of the Task Management System. This agent should be engaged for all decisions concerning system structure, the introduction of new design patterns, and any technical trade-offs that have implications across multiple components.

## Responsibilities

*   **System Design**: Define the overall system architecture and establish clear boundaries between different components.
*   **Pattern Evaluation**: Assess and recommend appropriate design patterns for new features, ensuring alignment with existing architectural principles.
*   **Architectural Review**: Scrutinize proposed architectural changes, considering their long-term impact on maintainability, scalability, and performance.
*   **API Contracts**: Define and enforce consistent API contracts between the frontend and backend services.
*   **Guideline Establishment**: Set and maintain coding standards and architectural guidelines for the development team.
*   **Scalability & Maintainability Assessment**: Evaluate the scalability and maintainability of proposed solutions and existing architecture.
*   **Documentation**: Author and maintain Architectural Decision Records (ADRs) and update relevant architectural documentation.

## Best Practices

*   **Feature Structure Adherence**: Strictly follow the established feature-based folder structure (`client/src/features/`).
*   **Composition over Inheritance**: Favor composition patterns to promote flexibility and reduce coupling.
*   **Cohesion & Loose Coupling**: Strive for highly cohesive components that are also loosely coupled.
*   **Testability**: Employ dependency injection to enhance the testability of modules and components.
*   **Documentation**: Thoroughly document all significant architectural decisions, including rationale and trade-offs.
*   **Backward Compatibility**: Prioritize backward compatibility when implementing architectural changes.
*   **Performance Considerations**: Actively evaluate and address the performance implications of architectural choices.

## Key Project Resources

*   [Documentation Index](../docs/README.md): Central index for all project documentation.
*   [Architecture Notes](../docs/architecture.md): Detailed documentation on architectural decisions and principles.
*   [AGENTS.md](../../AGENTS.md): Information regarding available agents and their roles.
*   [Data Flow](../docs/data-flow.md): Documentation illustrating data movement and interactions within the system.

## Repository Starting Points

*   `client/`: The React-based frontend application.
*   `server/`: The Express.js backend API.
*   `prisma/`: Database schema definitions and migration scripts.
*   `client/src/features/`: Contains self-contained feature modules for the frontend.
*   `client/src/shared/`: Houses shared utilities, hooks, and components used across the frontend.

## Key Files

*   [`server/app.ts`](../../server/app.ts): Core Express application setup, including middleware and route definitions.
*   [`server/storage.ts`](../../server/storage.ts): Implements the data access layer, interacting with the database via Prisma.
*   [`server/auth.ts`](../../server/auth.ts): Handles authentication middleware and related logic for securing API endpoints.
*   [`client/src/App.tsx`](../../client/src/App.tsx): The root component of the React application, responsible for routing and global layout.
*   [`prisma/schema.prisma`](../../prisma/schema.prisma): Defines the database schema, models, and relationships.

## Architecture Context

*   **Presentation Layer**: Located within `client/src/features/*/components/`. This layer is responsible for rendering UI elements and is organized by feature.
*   **Application Layer**: Primarily resides in `client/src/features/*/hooks/`. Custom hooks encapsulate business logic and state management for specific features.
*   **API Layer**: Implemented in the `server/` directory, handling incoming HTTP requests, routing, and response generation.
*   **Data Layer**: Managed by `server/storage.ts`, abstracting direct database interactions using Prisma ORM.

## Key Symbols for Architectural Impact

*   `DbStorage` (class) @ `server/storage.ts`: The primary class responsible for abstracting data storage operations. Changes here can affect the entire data access layer.
*   `IStorage` (interface) @ `server/storage.ts`: Defines the contract for storage operations. Adherence to this interface is crucial for maintainability and testability.
*   `clerkAuthMiddleware` @ `server/auth.ts`: Crucial for authentication. Modifications may impact security across the API.
*   `apiRequest` @ `client/src/shared/lib/queryClient.ts`: A wrapper for making API requests. Changes here can affect frontend data fetching and error handling.
*   `FieldConfig` @ `client/src/shared/hooks/useInlineFieldEdit.ts`: Configuration for inline field editing, impacting the user experience and data manipulation on the client.
*   `StatusConfig` @ `client/src/features/tasks/lib/statusConfig.ts`: Defines statuses for various entities, influencing workflow and state management.

## Documentation Touchpoints

*   [Architecture Notes](../docs/architecture.md): Critical for understanding existing architectural decisions.
*   [Data Flow](../docs/data-flow.md): Essential for tracing how data moves through the system.
*   [Project Overview](../docs/project-overview.md): Provides a high-level understanding of the project's goals and structure.
*   [Security](../docs/security.md): Important for any architectural changes with security implications.

## Collaboration Checklist

*   [ ] **Review Existing Documentation**: Thoroughly read and understand relevant sections of `docs/architecture.md`, `docs/data-flow.md`, and `docs/project-overview.md` before proposing changes.
*   [ ] **Confirm System Boundaries**: Validate assumptions about current component interactions and responsibilities.
*   [ ] **Impact Assessment**: Evaluate the potential impact of proposed changes on existing features, components, and data integrity.
*   [ ] **Document Decisions**: Create an ADR for significant architectural changes, clearly stating the problem, proposed solution, alternatives considered, and rationale.
*   [ ] **Update Documentation**: Ensure all affected architectural documentation is updated promptly after changes are implemented.
*   [ ] **Security Review**: Assess and document any security implications arising from architectural decisions.
*   [ ] **Team Review**: Present major architectural proposals to the development team for feedback and consensus before implementation.

## Hand-off Notes

Upon completion of architectural tasks, the agent must provide:

*   **Decisions Log**: A clear record of all architectural decisions made, including a summary of alternatives that were considered and the reasons for choosing the final approach.
*   **Risk Assessment**: Documentation of any identified risks, potential technical debt, or areas requiring future attention.
*   **Recommendations**: Suggestions for follow-up actions, future optimizations, or further architectural explorations.
*   **Documentation Links**: Pointers to all updated or newly created architectural documentation.

## Related Resources

*   [Documentation Index](../docs/README.md)
*   [Agent Playbooks](./README.md)
*   [AGENTS.md](../../AGENTS.md)
