# PR Review Skill

Review pull requests for the Task Management System against team standards.

## PR Review Checklist

### Code Quality
- [ ] Code follows feature-based folder structure
- [ ] TypeScript types are properly defined (no `any`)
- [ ] React hooks follow rules of hooks
- [ ] Components are focused and composable
- [ ] No console.log or debug code left in

### Architecture
- [ ] New code follows existing patterns in the codebase
- [ ] Shared logic extracted to hooks (`client/src/shared/hooks/`)
- [ ] API calls use `apiRequest` from queryClient
- [ ] Database operations use `DbStorage` methods

### Testing
- [ ] Tests added for new functionality
- [ ] Existing tests still pass
- [ ] Edge cases considered

### Security
- [ ] Authentication required for protected routes
- [ ] Authorization checks in place (`requireRole`, `requireAdmin`)
- [ ] No sensitive data exposed in responses
- [ ] Input validated on server side

### Documentation
- [ ] Code is self-documenting with clear names
- [ ] Complex logic has comments
- [ ] API changes documented

## Key Files to Check

| Feature Area | Review Focus |
|--------------|--------------|
| Tasks | `client/src/features/tasks/`, status handling, turbo mode |
| Clients | `client/src/features/clients/`, context usage |
| Auth | `server/auth.ts`, Clerk middleware usage |
| API | `server/storage.ts`, Prisma queries |

## Common Issues

1. **Missing error handling** in API calls
2. **Inconsistent state updates** in hooks
3. **Missing loading states** in components
4. **Hardcoded values** instead of config
5. **Missing TypeScript types** for props

## Approval Criteria

- All checklist items addressed
- No blocking issues
- Tests pass in CI
- Code follows project conventions
