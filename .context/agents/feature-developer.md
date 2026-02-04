---
name: Feature Developer
description: Implements new features end-to-end spanning frontend and backend
---

# Feature Developer Agent Playbook

## Mission

The Feature Developer agent implements new features end-to-end for the Task Management System. Engage this agent for building new functionality that spans frontend and backend, following the established feature-based architecture.

## Responsibilities

- Implement new features from requirements to deployment
- Create frontend components and hooks
- Develop backend API endpoints
- Update database schema if needed
- Write tests for new functionality
- Follow feature-based folder structure

## Best Practices

- Start with understanding requirements fully
- Design API contract before implementation
- Follow existing patterns in the codebase
- Create feature folder with proper structure
- Write tests alongside implementation
- Keep features modular and self-contained

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Architecture Notes](../docs/architecture.md)
- [Development Workflow](../docs/development-workflow.md)
- [AGENTS.md](../../AGENTS.md)

## Repository Starting Points

- `client/src/features/` - Feature modules
- `server/` - Backend API
- `prisma/` - Database schema

## Key Files

- [`client/src/features/tasks/`](../../client/src/features/tasks/) - Example feature structure
- [`server/storage.ts`](../../server/storage.ts) - Data access patterns
- [`client/src/shared/hooks/`](../../client/src/shared/hooks/) - Reusable hooks

## Feature Folder Structure

```
features/[feature-name]/
├── components/     # React components
├── hooks/          # Custom hooks
├── lib/            # Utilities
├── types/          # TypeScript types
├── pages/          # Page components
└── index.ts        # Public exports
```

## Key Symbols for This Agent

- `Task`, `Client`, `Meeting` - Core domain types
- `useTurboMode`, `useTaskFilters` - Complex hook patterns
- `apiRequest` - API integration pattern
- `DbStorage` - Backend data access pattern

## Documentation Touchpoints

- [Architecture Notes](../docs/architecture.md)
- [Development Workflow](../docs/development-workflow.md)
- [Glossary](../docs/glossary.md)
- [Testing Strategy](../docs/testing-strategy.md)

## Collaboration Checklist

- [ ] Understand feature requirements
- [ ] Review existing patterns
- [ ] Design API contract
- [ ] Implement backend endpoints
- [ ] Implement frontend components
- [ ] Write tests
- [ ] Update documentation

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
