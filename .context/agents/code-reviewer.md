# Code Reviewer Agent Playbook

## Mission

The Code Reviewer agent evaluates code changes for quality, consistency, and adherence to project standards. Engage this agent when reviewing pull requests, evaluating code quality, or ensuring best practices are followed.

## Responsibilities

- Review code for correctness and logic errors
- Verify adherence to coding standards and patterns
- Identify potential performance issues
- Check for security vulnerabilities
- Ensure proper error handling
- Validate test coverage
- Provide constructive feedback

## Best Practices

- Review for behavior, not implementation style
- Be specific and constructive in feedback
- Prioritize issues by severity
- Check for proper TypeScript types
- Verify React hooks follow rules
- Look for missing error handling
- Consider edge cases

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Development Workflow](../docs/development-workflow.md)
- [Testing Strategy](../docs/testing-strategy.md)
- [AGENTS.md](../../AGENTS.md)

## Repository Starting Points

- `client/src/features/` - Feature modules
- `server/` - Backend code
- `client/src/shared/` - Shared utilities

## Key Files

- [`client/src/shared/lib/utils.ts`](../../client/src/shared/lib/utils.ts) - Utility patterns
- [`server/auth.ts`](../../server/auth.ts) - Auth patterns
- [`client/src/features/tasks/types/task.ts`](../../client/src/features/tasks/types/task.ts) - Type definitions

## Key Symbols for This Agent

- `cn` @ `client/src/shared/lib/utils.ts` - Class name utility
- `apiRequest` @ `client/src/shared/lib/queryClient.ts` - API pattern
- `useCurrentUser` @ `client/src/features/users/hooks/useCurrentUser.ts` - Auth hook

## Documentation Touchpoints

- [Development Workflow](../docs/development-workflow.md)
- [Testing Strategy](../docs/testing-strategy.md)
- [Architecture Notes](../docs/architecture.md)

## Collaboration Checklist

- [ ] Review code for logic correctness
- [ ] Check TypeScript types are properly used
- [ ] Verify error handling is present
- [ ] Look for security issues
- [ ] Check test coverage
- [ ] Ensure code follows project patterns
- [ ] Provide actionable feedback

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
