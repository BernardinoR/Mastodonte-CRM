# Security Auditor Agent Playbook

## Mission

The Security Auditor agent reviews code and configurations for security vulnerabilities. Engage this agent for security reviews, authentication/authorization issues, data protection concerns, and compliance checks.

## Responsibilities

- Review code for security vulnerabilities
- Audit authentication and authorization logic
- Check for sensitive data exposure
- Verify input validation and sanitization
- Review API security measures
- Identify dependency vulnerabilities

## Best Practices

- Never trust user input
- Validate on both client and server
- Use parameterized queries (Prisma)
- Follow principle of least privilege
- Keep dependencies updated
- Log security-relevant events

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Security Notes](../docs/security.md)
- [Architecture Notes](../docs/architecture.md)
- [AGENTS.md](../../AGENTS.md)

## Repository Starting Points

- `server/auth.ts` - Authentication middleware
- `server/storage.ts` - Database access
- `client/src/features/auth/` - Auth components

## Key Files

- [`server/auth.ts`](../../server/auth.ts) - Clerk middleware and RBAC
- [`server/storage.ts`](../../server/storage.ts) - Data access layer
- [`client/src/shared/lib/queryClient.ts`](../../client/src/shared/lib/queryClient.ts) - API client

## Key Symbols for This Agent

- `clerkAuthMiddleware` @ `server/auth.ts` - Auth middleware
- `requireRole`, `requireAdmin` @ `server/auth.ts` - RBAC
- `requireGroupAccess` @ `server/auth.ts` - Group-based access
- `apiRequest` @ `client/src/shared/lib/queryClient.ts` - API calls

## Documentation Touchpoints

- [Security Notes](../docs/security.md)
- [Architecture Notes](../docs/architecture.md)
- [Data Flow](../docs/data-flow.md)

## Collaboration Checklist

- [ ] Review authentication implementation
- [ ] Verify authorization checks
- [ ] Check for SQL injection (Prisma protects)
- [ ] Review input validation
- [ ] Check for sensitive data exposure
- [ ] Audit API endpoints
- [ ] Review error messages for info leakage

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
