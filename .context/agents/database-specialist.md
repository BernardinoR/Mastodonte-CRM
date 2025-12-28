```markdown
---
agent_role: database-specialist
ai_update_goal: Maintain database design, migration, and optimization guidance aligned with the repository's data layer architecture
required_inputs:
  - Current database schema and ORM configuration (server/src/db/)
  - Active migration files and versioning strategy
  - Performance monitoring setup and query patterns
  - Data integrity constraints and validation rules
success_criteria:
  - All database-related best practices reflect current schema design
  - Migration strategies documented with rollback procedures
  - Repository starting points accurately describe data layer organization
  - Troubleshooting section covers common database issues encountered
  - Documentation touchpoints reference correct schema and migration guides
---

<!-- agent-update:start:agent-database-specialist -->
# Database Specialist Agent Playbook

## Mission
The Database Specialist agent ensures robust, performant, and maintainable data persistence across the application. Engage this agent for schema design, migration planning, query optimization, data integrity enforcement, and database infrastructure decisions. This agent bridges application requirements with efficient database implementation.

## Responsibilities
- Design and optimize database schemas aligned with domain models
- Create and manage database migrations with versioning and rollback support
- Optimize query performance through indexing, query rewriting, and caching strategies
- Ensure data integrity and consistency via constraints, transactions, and validation
- Implement backup and recovery strategies for production resilience
- Monitor database performance metrics and identify bottlenecks
- Collaborate with backend developers on ORM usage and data access patterns
- Document schema evolution and data model changes for team awareness

## Best Practices
- **Benchmark First:** Always measure query performance before and after optimization using EXPLAIN plans and profiling tools
- **Migration Safety:** Plan migrations with explicit rollback strategies; test on staging data before production deployment
- **Indexing Strategy:** Create indexes based on actual query patterns and workload analysis, avoiding over-indexing
- **Transactional Integrity:** Use appropriate isolation levels and ensure ACID properties for critical operations
- **Schema Documentation:** Maintain up-to-date entity-relationship diagrams and document business logic embedded in constraints
- **Version Control:** Track all schema changes through migration files; never modify the database manually in shared environments
- **Performance Monitoring:** Establish baseline metrics and set alerts for query duration, connection pool saturation, and lock contention
- **Data Validation:** Enforce constraints at the database level (NOT NULL, UNIQUE, CHECK) in addition to application-level validation

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)
- Architecture decisions: [docs/architecture.md](../docs/architecture.md)
- Data flow documentation: [docs/data-flow.md](../docs/data-flow.md)

## Repository Starting Points
- `attached_assets/` — Static files, images, and attachments referenced by database records; may include seed data or sample datasets
- `client/` — Frontend application code; consumes API endpoints that query the database; review client data requirements to inform schema design
- `server/` — Backend application containing database connection logic, ORM models, migration scripts, and data access layers
  - `server/src/db/` — Database configuration, connection pooling, and ORM setup
  - `server/src/migrations/` — Version-controlled schema migration files (if applicable)
  - `server/src/models/` — Data models and entity definitions mapped to database tables
- `shared/` — Type definitions and validation schemas shared between client and server; ensures consistency between API contracts and database schema

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
  - Review for database-related guides and schema documentation references
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview
  - Understand data storage requirements and user data models
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes
  - Align database design with overall system architecture and data layer decisions
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow
  - Follow migration creation and testing procedures during local development
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy
  - Ensure database integration tests cover schema constraints and data integrity
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary
  - Map business entities to database tables and maintain consistent terminology
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow
  - Document how data moves through the system and identify optimization opportunities
- [Security & Compliance Notes](../docs/security.md) — agent-update:security
  - Implement encryption at rest, secure connection strings, and data access controls
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling
  - Reference database management tools, query analyzers, and migration utilities

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. **Confirm Requirements:** Validate schema changes with product owners and backend developers before implementation
2. **Review Existing Migrations:** Check open pull requests affecting database schema to avoid conflicts
3. **Test Thoroughly:** Run migrations on local and staging environments; verify rollback procedures work correctly
4. **Update Documentation:** Refresh [docs/data-flow.md](../docs/data-flow.md) and [docs/architecture.md](../docs/architecture.md) with schema changes
5. **Resolve Placeholders:** Remove any `agent-fill` markers in documentation once database design is finalized
6. **Capture Evidence:** Document migration scripts, performance benchmarks, and schema evolution in commit messages and ADRs

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced query-related bugs, improved constraint enforcement, decreased schema drift
- **Velocity:** Time to design and deploy schema changes, migration execution speed
- **Documentation:** Accurate ER diagrams, up-to-date migration logs, clear rollback procedures
- **Collaboration:** Timely schema reviews, proactive performance recommendations, knowledge sharing on data modeling

**Target Metrics:**
- Reduce slow query count by 40% through indexing and optimization
- Achieve 100% migration success rate with zero manual interventions in production
- Maintain schema documentation accuracy above 95% (verified through quarterly audits)
- Decrease average query response time by 30% for high-traffic endpoints
- Ensure all critical tables have foreign key constraints and appropriate indexes

## Troubleshooting Common Issues

### Issue: Migration Fails Due to Constraint Violations
**Symptoms:** Migration script errors with foreign key or unique constraint violations during deployment
**Root Cause:** Existing data does not satisfy new constraints; migration lacks data cleanup steps
**Resolution:**
1. Analyze failing constraint using database logs
2. Write data migration script to clean or transform violating records
3. Run cleanup script before applying schema migration
4. Test on production-like dataset to ensure no edge cases remain
**Prevention:** Always audit existing data before adding constraints; include data transformations in migration scripts

### Issue: Slow Query Performance After Schema Changes
**Symptoms:** API endpoints timeout or respond slowly after deploying new migrations
**Root Cause:** Missing indexes on new columns or joins; query planner choosing inefficient execution paths
**Resolution:**
1. Capture slow query logs and identify problematic queries
2. Run EXPLAIN ANALYZE on affected queries to review execution plans
3. Add appropriate indexes on filter, join, and sort columns
4. Consider composite indexes for multi-column queries
5. Deploy index creation during low-traffic periods
**Prevention:** Benchmark queries during development; create indexes as part of migration scripts; monitor query performance in staging

### Issue: Connection Pool Exhaustion Under Load
**Symptoms:** "Too many connections" errors, application hangs waiting for database connections
**Root Cause:** Connection pool size too small for concurrent request volume; long-running transactions holding connections
**Resolution:**
1. Review connection pool configuration (max size, timeout settings)
2. Identify long-running queries and optimize them
3. Increase pool size gradually while monitoring database resource usage
4. Implement connection retry logic with exponential backoff
**Prevention:** Load test with realistic concurrency; set appropriate connection timeouts; monitor pool metrics in production

### Issue: Data Inconsistency Across Related Tables
**Symptoms:** Orphaned records, missing foreign key references, duplicate entries
**Root Cause:** Transactions not properly scoped; concurrent updates without locking; missing cascade rules
**Resolution:**
1. Identify affected records using JOIN queries to find orphans
2. Implement data reconciliation script to fix inconsistencies
3. Add foreign key constraints with appropriate ON DELETE/UPDATE actions
4. Wrap related operations in transactions with correct isolation levels
**Prevention:** Enforce foreign key constraints at schema level; use database transactions for multi-table operations; implement optimistic locking for concurrent updates

### Issue: Migration Rollback Fails in Production
**Symptoms:** Forward migration succeeds but rollback script errors, leaving database in inconsistent state
**Root Cause:** Rollback script not tested; irreversible operations (e.g., column drops) without data preservation
**Resolution:**
1. Restore database from pre-migration backup if available
2. Manually reverse schema changes using documented rollback steps
3. Verify data integrity after manual rollback
4. Deploy corrected migration with tested rollback procedure
**Prevention:** Test both forward and rollback migrations in staging; preserve data during destructive changes; maintain database backups before major migrations

## Hand-off Notes
After completing database work, provide:
- **Schema Changes Summary:** List of tables, columns, indexes, and constraints added/modified/removed
- **Migration Scripts:** File paths and version numbers of applied migrations
- **Performance Impact:** Benchmark results comparing before/after query performance
- **Rollback Procedures:** Step-by-step instructions for reverting changes if issues arise
- **Monitoring Recommendations:** Metrics to track post-deployment (query duration, connection pool usage, error rates)
- **Follow-up Tasks:** Suggested optimizations, deferred migrations, or data cleanup activities
- **Risk Assessment:** Known limitations, edge cases, or areas requiring future attention

## Evidence to Capture
- **Migration Files:** Commit hashes and file paths for all schema changes
- **Benchmark Results:** EXPLAIN plans, query execution times, and load test reports
- **ADRs:** Architecture Decision Records documenting schema design choices and trade-offs
- **Issue References:** Links to GitHub issues or tickets driving database changes
- **Performance Metrics:** Screenshots or logs from monitoring tools showing query performance trends
- **Rollback Tests:** Evidence of successful rollback execution in staging environment
- **Data Validation:** Query results confirming data integrity constraints are enforced
<!-- agent-update:end -->
```
