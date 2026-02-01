# Bug Investigation Skill

Systematic bug investigation for the Task Management System.

## Investigation Workflow

### 1. Reproduce the Bug
- Get exact steps to reproduce
- Note environment (browser, user role)
- Check if it's consistent or intermittent

### 2. Isolate the Problem
- Determine: Frontend, Backend, or Database?
- Use browser DevTools Network tab for API issues
- Check console for JavaScript errors

### 3. Find the Root Cause
- Trace the data flow
- Check relevant hooks and state
- Review recent changes in the area

### 4. Fix and Verify
- Make minimal fix
- Write regression test
- Test related functionality

## Common Bug Patterns

### State Management Issues
**Symptom:** UI doesn't update after action
**Check:**
- TanStack Query cache invalidation
- State setter calls
- Dependency arrays in hooks

```typescript
// Common fix: Invalidate queries after mutation
queryClient.invalidateQueries({ queryKey: ['tasks'] });
```

### API/Data Issues
**Symptom:** Wrong data displayed or saved
**Check:**
- API request/response in Network tab
- Prisma query in `server/storage.ts`
- Data transformation in hooks

### Authentication Issues
**Symptom:** 401 errors, unauthorized access
**Check:**
- Clerk session status
- Token in request headers
- Middleware in `server/auth.ts`

### Type Mismatches
**Symptom:** Runtime errors, unexpected behavior
**Check:**
- TypeScript types match actual data
- API response types correct
- Null/undefined handling

## Debugging Tools

### Frontend
- React DevTools (component state)
- TanStack Query DevTools (cache state)
- Browser Console (errors, logs)
- Network tab (API calls)

### Backend
- Server logs (`log()` in `server/app.ts`)
- Prisma query logging
- Postman/curl for API testing

## Key Files by Area

| Area | Files to Check |
|------|----------------|
| Tasks | `features/tasks/hooks/`, `features/tasks/lib/` |
| Clients | `features/clients/hooks/`, `features/clients/lib/` |
| Auth | `features/auth/`, `server/auth.ts` |
| API | `server/storage.ts`, route handlers |
| State | `shared/hooks/`, `shared/lib/queryClient.ts` |

## Fix Verification

- [ ] Bug no longer reproduces
- [ ] Regression test added
- [ ] Related features still work
- [ ] No new TypeScript errors
- [ ] Tests pass
