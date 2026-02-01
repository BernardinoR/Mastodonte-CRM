# Security Audit Skill

Security review checklist for the Task Management System.

## Authentication Checklist

### Clerk Integration
- [ ] All API routes protected with `clerkAuthMiddleware`
- [ ] Session tokens validated on each request
- [ ] Token expiration handled gracefully
- [ ] Logout clears all session data

### Key Files
- `server/auth.ts` - Clerk middleware and role checks
- `client/src/features/auth/` - Auth components and hooks

## Authorization Checklist

### Role-Based Access Control
- [ ] `requireRole()` used for role-restricted routes
- [ ] `requireAdmin()` used for admin-only operations
- [ ] `requireGroupAccess()` used for group-based access
- [ ] User can only access their own data (unless admin)

### Current Roles
| Role | Access Level |
|------|--------------|
| admin | Full system access |
| manager | Team and client management |
| user | Own tasks and assigned clients |

## Data Validation Checklist

### Server-Side
- [ ] All input validated before processing
- [ ] Prisma parameterized queries (prevents SQL injection)
- [ ] Type checking with TypeScript
- [ ] File uploads validated (if applicable)

### Client-Side
- [ ] Form validation before submission
- [ ] XSS prevention (React handles by default)
- [ ] No sensitive data in localStorage

## API Security Checklist

- [ ] HTTPS enforced in production
- [ ] CORS configured for allowed origins
- [ ] Rate limiting implemented (recommended)
- [ ] Error messages don't leak internal details
- [ ] Sensitive data not logged

## Database Security

- [ ] Database credentials in environment variables
- [ ] Connection uses TLS
- [ ] Minimal required permissions for DB user
- [ ] No raw SQL queries (use Prisma)

## Common Vulnerabilities to Check

| Vulnerability | Prevention |
|--------------|------------|
| SQL Injection | Prisma ORM (parameterized) |
| XSS | React escaping, no dangerouslySetInnerHTML |
| CSRF | Clerk handles via tokens |
| Auth Bypass | Middleware on all routes |
| Data Exposure | Role checks, query filtering |

## Security Review Process

1. **Authentication**
   - Verify all routes require auth
   - Check token handling

2. **Authorization**
   - Test role restrictions
   - Verify data isolation

3. **Input Validation**
   - Test with malicious input
   - Check error handling

4. **Data Protection**
   - Review what data is exposed
   - Check logging for sensitive data

## Key Security Files

| File | Purpose |
|------|---------|
| `server/auth.ts` | Auth middleware |
| `server/storage.ts` | Data access (SQL) |
| `client/src/shared/lib/queryClient.ts` | API calls |
| Environment files | Secrets management |
