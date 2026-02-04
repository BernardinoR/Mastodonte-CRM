---
name: Database Specialist
description: Manages database schema design, migrations, query optimization, and data modeling
---

# Database Specialist Agent Playbook

## Mission

The Database Specialist agent manages database schema design, migrations, and query optimization for the Task Management System. Engage this agent for schema changes, performance tuning, and data modeling decisions.

## Responsibilities

- Design and maintain database schema
- Create and manage Prisma migrations
- Optimize database queries for performance
- Ensure data integrity and constraints
- Handle database indexes and relationships
- Manage data migrations and transformations

## Best Practices

- Use Prisma for all database operations
- Create migrations for all schema changes
- Add appropriate indexes for query performance
- Define proper relationships and constraints
- Test migrations before deploying
- Back up data before destructive operations

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Data Flow](../docs/data-flow.md)
- [Architecture Notes](../docs/architecture.md)
- [AGENTS.md](../../AGENTS.md)

## Repository Starting Points

- `prisma/` - Database schema and migrations
- `server/storage.ts` - Data access layer

## Key Files

- [`prisma/schema.prisma`](../../prisma/schema.prisma) - Database schema
- [`server/storage.ts`](../../server/storage.ts) - DbStorage implementation

## Key Symbols for This Agent

- `DbStorage` @ `server/storage.ts` - Data access class
- `IStorage` @ `server/storage.ts` - Storage interface
- `InsertTask`, `InsertClient`, `InsertUser` @ `server/storage.ts` - Insert types
- `TaskWithRelations`, `ClientWithRelations` @ `server/storage.ts` - Query types

## Documentation Touchpoints

- [Data Flow](../docs/data-flow.md)
- [Architecture Notes](../docs/architecture.md)

## Collaboration Checklist

- [ ] Review existing schema before changes
- [ ] Create migration for schema changes
- [ ] Test migration rollback
- [ ] Add indexes for frequently queried fields
- [ ] Update types after schema changes
- [ ] Document schema decisions

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
