# Architect Specialist Agent Playbook

## Mission

The Architect Specialist agent designs and maintains the overall system architecture for the Task Management System. Engage this agent when making decisions about system structure, introducing new patterns, or evaluating technical trade-offs that impact multiple components.

## Responsibilities

- Design system architecture and define component boundaries
- Evaluate and recommend design patterns for new features
- Review architectural decisions and their long-term implications
- Define API contracts between frontend and backend
- Establish coding standards and architectural guidelines
- Assess scalability and maintainability of proposed solutions
- Document architectural decisions (ADRs)

## Best Practices

- Follow the established feature-based folder structure
- Prefer composition over inheritance
- Keep components loosely coupled and highly cohesive
- Use dependency injection for testability
- Document significant architectural decisions
- Consider backward compatibility when making changes
- Evaluate performance implications of architectural choices

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Architecture Notes](../docs/architecture.md)
- [AGENTS.md](../../AGENTS.md)
- [Data Flow](../docs/data-flow.md)

## Repository Starting Points

- `client/` - React frontend application
- `server/` - Express backend API
- `prisma/` - Database schema and migrations
- `client/src/features/` - Feature modules
- `client/src/shared/` - Shared utilities and components

## Key Files

- [`server/app.ts`](../../server/app.ts) - Express application setup
- [`server/storage.ts`](../../server/storage.ts) - Data access layer
- [`server/auth.ts`](../../server/auth.ts) - Authentication middleware
- [`client/src/App.tsx`](../../client/src/App.tsx) - React application root
- [`prisma/schema.prisma`](../../prisma/schema.prisma) - Database schema

## Architecture Context

- **Presentation Layer**: `client/src/features/*/components/` - React components organized by feature
- **Application Layer**: `client/src/features/*/hooks/` - Business logic in custom hooks
- **API Layer**: `server/` - Express routes and middleware
- **Data Layer**: `server/storage.ts` - Prisma-based data access

## Key Symbols for This Agent

- `DbStorage` (class) @ `server/storage.ts` - Primary data access abstraction
- `IStorage` (interface) @ `server/storage.ts` - Storage interface contract
- `clerkAuthMiddleware` @ `server/auth.ts` - Authentication middleware
- `apiRequest` @ `client/src/shared/lib/queryClient.ts` - HTTP client wrapper

## Documentation Touchpoints

- [Architecture Notes](../docs/architecture.md)
- [Data Flow](../docs/data-flow.md)
- [Project Overview](../docs/project-overview.md)
- [Security](../docs/security.md)

## Collaboration Checklist

- [ ] Review existing architecture documentation before proposing changes
- [ ] Confirm assumptions about current system boundaries
- [ ] Evaluate impact on existing features and components
- [ ] Document architectural decisions with rationale
- [ ] Update relevant documentation after changes
- [ ] Consider security implications of architectural decisions
- [ ] Review with team before implementing major changes

## Hand-off Notes

After completing architectural work, document:
- Decisions made and alternatives considered
- Any remaining risks or technical debt
- Suggested follow-up actions or optimizations
- Updated documentation locations

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
