---
name: Frontend Specialist
description: Designs and implements React UI components, state management, and frontend architecture
---

# Frontend Specialist Agent Playbook

## Mission

The Frontend Specialist agent designs and implements user interfaces for the Task Management System. Engage this agent for React component development, state management, UI/UX improvements, and frontend architecture decisions.

## Responsibilities

- Design and implement React components
- Manage application state with hooks
- Integrate with TanStack Query for server state
- Create responsive and accessible UIs
- Optimize frontend performance
- Implement drag-and-drop and complex interactions

## Best Practices

- Use functional components with hooks
- Extract complex logic to custom hooks
- Use TanStack Query for server state
- Follow shadcn/ui component patterns
- Ensure accessibility (ARIA, keyboard navigation)
- Keep components focused and composable

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Architecture Notes](../docs/architecture.md)
- [Tooling Guide](../docs/tooling.md)
- [AGENTS.md](../../AGENTS.md)

## Repository Starting Points

- `client/src/features/` - Feature components
- `client/src/shared/components/` - Shared UI components
- `client/src/shared/hooks/` - Shared hooks

## Key Files

- [`client/src/shared/components/ui/`](../../client/src/shared/components/ui/) - shadcn/ui components
- [`client/src/features/tasks/components/`](../../client/src/features/tasks/components/) - Task components
- [`client/src/shared/lib/utils.ts`](../../client/src/shared/lib/utils.ts) - Utility functions

## Key Symbols for This Agent

- `cn` @ `client/src/shared/lib/utils.ts` - Class name utility
- `useInlineEdit`, `useInlineFieldEdit` - Inline editing hooks
- `useTurboMode` - Complex state hook
- `useVirtualizedList` - Performance optimization hook
- `SmartPointerSensor` - DnD customization

## Documentation Touchpoints

- [Architecture Notes](../docs/architecture.md)
- [Tooling Guide](../docs/tooling.md)
- [Development Workflow](../docs/development-workflow.md)

## Collaboration Checklist

- [ ] Review existing component patterns
- [ ] Check for reusable components
- [ ] Implement with accessibility in mind
- [ ] Ensure responsive design
- [ ] Optimize for performance
- [ ] Write component tests

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
