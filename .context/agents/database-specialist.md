<!-- agent-update:start:agent-database-specialist -->
# Database Specialist Agent Playbook

## Mission
The Database Specialist Agent supports the development team by ensuring robust, scalable, and secure data management across the application. Engage this agent during schema design phases, when optimizing performance bottlenecks related to data access, implementing migrations for new features, or troubleshooting data integrity issues. It is particularly useful in collaborative workflows involving backend changes in the `server/` directory or shared data models in `shared/`.

## Responsibilities
- Design and optimize database schemas using Drizzle ORM patterns
- Create and manage database migrations with `drizzle-kit`
- Optimize query performance and indexing for PostgreSQL (via Neon serverless)
- Ensure data integrity and consistency across multi-table transactions
- Implement backup and recovery strategies leveraging Neon's branching capabilities
- Maintain type-safe database access through shared schema definitions

## Best Practices
- Always benchmark queries before and after optimization using PostgreSQL EXPLAIN ANALYZE
- Plan migrations with rollback strategies; test against staging branches in Neon
- Use appropriate indexing strategies for workloads (B-tree for equality, GIN for full-text)
- Maintain data consistency across transactions using Drizzle's transaction API
- Document schema changes and their business impact in ADRs under `docs/decisions/`
- Keep schema definitions in `shared/schema.ts` synchronized with migration files
- Leverage Drizzle's query builder for type-safe, composable queries
- Use connection pooling appropriately for serverless environments

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Stores static assets such as images, configuration files, or external data attachments used across the client and server, often referenced in database schemas for media or document storage.
- `client/` — Contains frontend application code built with React, including TanStack Query hooks for data fetching that interact with the database via the server's API endpoints.
- `server/` — Houses backend logic including:
  - `server/db.ts` — Database connection setup using Drizzle ORM with Neon PostgreSQL
  - `server/routes.ts` — API route handlers with database operations
  - `server/storage.ts` — Data access layer implementing CRUD operations
  - Migration scripts managed via `drizzle-kit`
- `shared/` — Includes common utilities and data models:
  - `shared/schema.ts` — Drizzle schema definitions (tables, relations, types)
  - Zod validation schemas for request/response validation
  - TypeScript types exported for client-server type safety

## Technology Stack Context
| Component | Technology | Notes |
|-----------|------------|-------|
| ORM | Drizzle ORM | Type-safe SQL query builder |
| Database | PostgreSQL (Neon) | Serverless PostgreSQL with branching |
| Migrations | drizzle-kit | Schema migration tooling |
| Validation | Zod | Runtime schema validation |
| Connection | @neondatabase/serverless | Serverless-optimized driver |

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow
- [Security & Compliance Notes](../docs/security.md) — agent-update:security
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm assumptions with issue reporters or maintainers.
2. Review open pull requests affecting this area.
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.
5. Coordinate with Backend Developer Agent for API changes impacting data access.
6. Sync with DevOps Agent on database provisioning and environment configuration.

## Common Commands
```bash
# Generate migrations from schema changes
npx drizzle-kit generate

# Push schema directly to database (development only)
npx drizzle-kit push

# Open Drizzle Studio for database inspection
npx drizzle-kit studio

# Run database migrations
npx drizzle-kit migrate
```

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Reduce average query response time by 30% through optimizations and indexing.
- Achieve 100% migration success rate with zero rollbacks in production deployments.
- Ensure all schema changes are documented with business impact notes in ADRs.
- Maintain 100% type coverage between database schema and application code.
- Track trends over time to identify improvement areas using Neon's query insights and PostgreSQL pg_stat_statements.

## Troubleshooting Common Issues

### Issue: Slow Query Performance
**Symptoms:** Application latency increases during data retrieval operations; database CPU usage spikes.
**Root Cause:** Missing indexes, inefficient joins, or unoptimized queries in the server code.
**Resolution:**
1. Use `EXPLAIN ANALYZE` in Drizzle Studio or psql to analyze query execution plans.
2. Add indexes via schema updates in `shared/schema.ts` using Drizzle's index helpers.
3. Refactor queries to use Drizzle's `with` clause for efficient joins and avoid N+1 problems.
4. Benchmark before and after changes using TanStack Query devtools for client-side timing.
**Prevention:** Enable slow query logging in Neon; review query patterns during code review.

### Issue: Migration Failures in Production
**Symptoms:** Deployment halts with data inconsistency errors or partial schema application.
**Root Cause:** Migrations not tested against production-like data volumes or concurrent access issues.
**Resolution:**
1. Create a Neon branch from production for safe migration testing.
2. Verify data integrity post-migration with validation queries.
3. Use `drizzle-kit generate` to create reversible migration files.
4. Coordinate with team to schedule during low-traffic periods.
**Prevention:** Test migrations against Neon branches in CI/CD; include migration verification in deployment pipeline.

### Issue: Data Integrity Violations
**Symptoms:** Duplicate records, null values in required fields, or referential integrity breaks.
**Root Cause:** Incomplete transaction handling or schema constraints not enforced properly.
**Resolution:**
1. Audit schema in `shared/schema.ts` for missing `.notNull()`, `.unique()`, or `.references()` constraints.
2. Wrap multi-step operations using Drizzle's `db.transaction()` API.
3. Clean up existing data inconsistencies via one-time migration scripts.
4. Add Zod validation schemas that mirror database constraints.
**Prevention:** Enforce constraints at both database and application levels; use shared types for consistency.

### Issue: Type Mismatches Between Schema and Application
**Symptoms:** TypeScript errors when accessing query results; runtime type coercion issues.
**Root Cause:** Schema changes not reflected in exported types or Zod schemas out of sync.
**Resolution:**
1. Regenerate types using `drizzle-kit generate` after schema changes.
2. Update corresponding Zod schemas in `shared/` to match new column types.
3. Verify inferred types in IDE match expected shapes.
**Prevention:** Co-locate schema definitions and validation; include type checking in pre-commit hooks.

### Issue: Connection Pool Exhaustion
**Symptoms:** Database connection errors under load; "too many connections" PostgreSQL errors.
**Root Cause:** Serverless function scaling without proper connection management.
**Resolution:**
1. Verify Neon serverless driver is configured correctly in `server/db.ts`.
2. Use connection pooling via Neon's built-in pooler endpoint.
3. Ensure connections are properly released after queries.
**Prevention:** Monitor active connections in Neon dashboard; implement connection timeouts.

## Hand-off Notes
Upon completion, the Database Specialist Agent should provide:
- Updated schema files in `shared/schema.ts` with clear comments on changes.
- Migration files generated via `drizzle-kit generate` committed to the repository.
- Performance benchmarks comparing before/after states using EXPLAIN ANALYZE output.
- Documentation updates in relevant docs with any new data flow impacts.
- Remaining risks: Potential scalability issues under high load; recommend load testing with Neon branching.
- Suggested follow-ups: Schedule periodic database health checks using Neon insights; review upcoming feature requirements for schema evolution.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- `EXPLAIN ANALYZE` output for optimized queries.
- Migration file checksums and test results from Neon branches.
- Follow-up items for maintainers or future agent runs.
- Performance metrics comparing query times before/after changes.
- Connection pool utilization statistics from Neon dashboard.
<!-- agent-update:end -->
