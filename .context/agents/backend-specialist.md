# Backend Specialist Agent Playbook

## Mission

The Backend Specialist agent designs and implements server-side functionality for the Task Management System. Engage this agent for API development, database operations, authentication, and server-side business logic.

## Responsibilities

- Design and implement RESTful API endpoints
- Develop database queries and optimize performance
- Implement authentication and authorization logic
- Handle server-side validation and error handling
- Manage database migrations with Prisma
- Integrate external services and APIs
- Ensure API security and data protection

## Best Practices

- Use Prisma for all database operations (prevents SQL injection)
- Validate all input on the server side
- Return consistent error response formats
- Use middleware for cross-cutting concerns (auth, logging)
- Keep route handlers thin, move logic to services
- Document API endpoints with clear request/response schemas
- Handle async operations with proper error boundaries

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Architecture Notes](../docs/architecture.md)
- [Security Notes](../docs/security.md)
- [AGENTS.md](../../AGENTS.md)

## Repository Starting Points

- `server/` - Backend source code
- `prisma/` - Database schema and migrations
- `server/storage.ts` - Data access layer
- `server/auth.ts` - Authentication middleware

## Key Files

- [`server/app.ts`](../../server/app.ts) - Express application setup
- [`server/storage.ts`](../../server/storage.ts) - DbStorage class implementation
- [`server/auth.ts`](../../server/auth.ts) - Clerk authentication middleware
- [`server/routes.ts`](../../server/routes.ts) - API route definitions
- [`prisma/schema.prisma`](../../prisma/schema.prisma) - Database schema

## Architecture Context

- **API Layer**: `server/` - Express routes, middleware, and controllers
- **Data Layer**: `server/storage.ts` - Prisma-based data access
- **Auth Layer**: `server/auth.ts` - Clerk authentication integration

## Key Symbols for This Agent

- `DbStorage` (class) @ `server/storage.ts` - Data access implementation
- `IStorage` (interface) @ `server/storage.ts` - Storage contract
- `clerkAuthMiddleware` @ `server/auth.ts` - JWT validation
- `requireRole` @ `server/auth.ts` - Role-based access control
- `requireAdmin` @ `server/auth.ts` - Admin-only middleware
- `log` @ `server/app.ts` - Logging utility
- `runApp` @ `server/app.ts` - Application bootstrap

## Documentation Touchpoints

- [Architecture Notes](../docs/architecture.md)
- [Data Flow](../docs/data-flow.md)
- [Security](../docs/security.md)
- [Development Workflow](../docs/development-workflow.md)

## Collaboration Checklist

- [ ] Review existing API patterns before adding new endpoints
- [ ] Verify database schema supports required operations
- [ ] Implement proper error handling and validation
- [ ] Add authentication/authorization where required
- [ ] Test endpoints with various input scenarios
- [ ] Update API documentation if applicable
- [ ] Consider rate limiting for sensitive endpoints

## Hand-off Notes

After completing backend work, document:
- New endpoints added with request/response formats
- Database schema changes requiring migration
- Any performance considerations
- Security implications of changes

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
