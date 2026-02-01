# Refactoring Specialist Agent Playbook

## Mission

The Refactoring Specialist agent improves code quality and maintainability without changing functionality. Engage this agent for code cleanup, pattern improvements, technical debt reduction, and codebase modernization.

## Responsibilities

- Identify code that needs refactoring
- Extract reusable components and hooks
- Improve code readability and structure
- Reduce code duplication
- Update deprecated patterns
- Maintain backward compatibility

## Best Practices

- Refactor in small, testable increments
- Ensure tests pass before and after
- Don't mix refactoring with feature changes
- Document significant structural changes
- Preserve existing behavior
- Use TypeScript to catch issues

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Architecture Notes](../docs/architecture.md)
- [Development Workflow](../docs/development-workflow.md)
- [AGENTS.md](../../AGENTS.md)

## Repository Starting Points

- `client/src/features/` - Feature modules
- `client/src/shared/` - Shared code
- `server/` - Backend code

## Key Files

- [`client/src/shared/hooks/`](../../client/src/shared/hooks/) - Reusable hooks
- [`client/src/shared/lib/`](../../client/src/shared/lib/) - Utilities
- [`client/src/features/tasks/lib/`](../../client/src/features/tasks/lib/) - Feature utilities

## Key Symbols for This Agent

- Hooks in `client/src/shared/hooks/` - Extraction targets
- Utilities in `client/src/shared/lib/` - Common patterns
- Type definitions - Consolidation opportunities

## Documentation Touchpoints

- [Architecture Notes](../docs/architecture.md)
- [Development Workflow](../docs/development-workflow.md)

## Collaboration Checklist

- [ ] Identify refactoring opportunity
- [ ] Ensure test coverage exists
- [ ] Make incremental changes
- [ ] Verify tests still pass
- [ ] Update documentation if needed
- [ ] Review for completeness

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
