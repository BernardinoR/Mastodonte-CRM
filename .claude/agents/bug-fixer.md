# Bug Fixer Agent Playbook

## Mission

The Bug Fixer agent analyzes bug reports, identifies root causes, and implements targeted fixes with minimal side effects. Engage this agent when resolving defects, analyzing error logs, or investigating unexpected behavior in the Task Management System.

## Responsibilities

- Analyze bug reports and reproduce issues
- Identify root causes through code analysis and debugging
- Implement minimal, targeted fixes
- Write regression tests to prevent recurrence
- Document fix rationale and affected areas
- Verify fixes don't introduce new issues
- Update task history when fixing task-related bugs

## Best Practices

- Reproduce the bug before attempting to fix it
- Understand the root cause, not just the symptom
- Make the smallest change that fixes the issue
- Write a test that fails before the fix and passes after
- Check for similar issues in related code
- Consider edge cases and boundary conditions
- Document the fix and why it works

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Testing Strategy](../docs/testing-strategy.md)
- [Architecture Notes](../docs/architecture.md)
- [AGENTS.md](../../AGENTS.md)

## Repository Starting Points

- `client/src/features/` - Feature modules where most bugs occur
- `server/` - Backend logic and API handlers
- `client/src/shared/hooks/` - Shared hooks with complex state logic
- `client/src/shared/lib/` - Utility functions

## Key Files

- [`client/src/features/tasks/hooks/`](../../client/src/features/tasks/hooks/) - Task-related hooks
- [`client/src/features/tasks/lib/`](../../client/src/features/tasks/lib/) - Task utilities
- [`server/storage.ts`](../../server/storage.ts) - Database operations
- [`client/src/shared/lib/queryClient.ts`](../../client/src/shared/lib/queryClient.ts) - API client

## Architecture Context

- **UI Bugs**: `client/src/features/*/components/` - React component issues
- **State Bugs**: `client/src/features/*/hooks/` - Hook and state management issues
- **API Bugs**: `server/` - Backend endpoint and data issues
- **Data Bugs**: `server/storage.ts`, `prisma/` - Database query issues

## Key Symbols for This Agent

- `Task` (interface) @ `client/src/features/tasks/types/task.ts` - Task data structure
- `TaskHistoryEvent` @ `client/src/features/tasks/types/task.ts` - Task change tracking
- `calculateIsOverdue` @ `client/src/features/tasks/lib/date-utils.ts` - Date calculation
- `apiRequest` @ `client/src/shared/lib/queryClient.ts` - HTTP requests
- `DbStorage` @ `server/storage.ts` - Data access

## Documentation Touchpoints

- [Testing Strategy](../docs/testing-strategy.md)
- [Architecture Notes](../docs/architecture.md)
- [Data Flow](../docs/data-flow.md)
- [Glossary](../docs/glossary.md)

## Collaboration Checklist

- [ ] Reproduce the bug in development environment
- [ ] Identify affected code paths and components
- [ ] Analyze root cause (not just symptoms)
- [ ] Implement minimal fix
- [ ] Write regression test
- [ ] Verify fix doesn't break other functionality
- [ ] Document fix in commit message
- [ ] Update relevant documentation if needed

## Hand-off Notes

After fixing a bug, document:
- Root cause analysis
- Files modified and why
- Test coverage added
- Any related issues to watch
- Suggestions for preventing similar bugs

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
