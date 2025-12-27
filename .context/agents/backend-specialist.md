<!-- agent-update:start:agent-backend-specialist -->
# Backend Specialist Agent Playbook

## Mission
The backend specialist agent supports the development team by focusing on robust, scalable server-side components, ensuring seamless data handling, security, and integration with frontend and external services. Engage this agent for tasks involving API development, database optimization, authentication systems, deployment configurations, or performance tuning on the server side.

## Responsibilities
- Design and implement server-side architecture using Express.js with TypeScript
- Create and maintain RESTful APIs following OpenAPI specifications
- Optimize PostgreSQL database queries and Drizzle ORM data models
- Implement authentication and authorization using Passport.js with session-based auth
- Handle server deployment, scaling, and environment configuration
- Manage WebSocket connections for real-time features
- Integrate with external services (OpenAI API, SendGrid for email)

## Best Practices
- Design APIs according to the RESTful conventions established in the project
- Implement proper error handling with structured error responses and centralized logging
- Use the repository pattern and clean architecture principles in `server/` modules
- Consider scalability and performance from the start; leverage connection pooling and caching
- Implement comprehensive testing for business logic using Vitest
- Follow the shared type definitions in `shared/` for API contracts
- Use environment variables via dotenv for configuration management
- Document all API endpoints with JSDoc comments and update OpenAPI specs

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Stores static assets such as images, documents, and external files referenced in the application, including any media or configuration files not part of the core codebase.
- `client/` — Contains the frontend application code built with React and Vite, including UI components, client-side logic, and assets for the user interface.
- `server/` — Houses the backend services built with Express.js and TypeScript, including:
  - `server/routes.ts` — API route definitions and endpoint handlers
  - `server/storage.ts` — Data access layer and database operations
  - `server/db.ts` — PostgreSQL connection setup using Drizzle ORM
  - `server/auth.ts` — Authentication middleware and Passport.js configuration
  - `server/vite.ts` — Vite integration for development server
- `shared/` — Includes common modules shared across client and server:
  - `shared/schema.ts` — Drizzle ORM schema definitions and Zod validation schemas
  - Shared TypeScript types for API contracts and domain models

## Technology Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Node.js 20+ | Server execution environment |
| Framework | Express.js | HTTP server and routing |
| Language | TypeScript | Type-safe development |
| Database | PostgreSQL | Primary data store |
| ORM | Drizzle ORM | Database queries and migrations |
| Validation | Zod | Request/response validation |
| Auth | Passport.js | Session-based authentication |
| Testing | Vitest | Unit and integration tests |
| Build | esbuild | Server bundling |

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
5. Coordinate with frontend-specialist when API contracts change.
6. Ensure shared types in `shared/schema.ts` are updated when modifying data models.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Achieve at least 90% unit test coverage for backend APIs and business logic
- Maintain average API response times under 200ms for core endpoints
- Reduce backend bug resolution time by 30% through proactive monitoring and testing
- Track trends over time using tools like GitHub Insights or SonarQube to identify improvement areas, reviewing metrics bi-weekly during sprint retrospectives

## Troubleshooting Common Issues

### Issue: Database Connection Timeouts
**Symptoms:** API calls fail with connection errors or slow query responses during peak loads
**Root Cause:** Overloaded database server, unoptimized connection pooling, or network latency
**Resolution:**
1. Check database logs for connection limits and current load
2. Adjust connection pool settings in `server/db.ts` (increase max connections in Drizzle/pg config)
3. Optimize slow queries using `EXPLAIN ANALYZE` in PostgreSQL
4. Restart services if temporary; scale database resources if persistent
**Prevention:** Implement query caching, regular index maintenance, and load testing in CI/CD

### Issue: Authentication Token Validation Failures
**Symptoms:** Users receive 401 Unauthorized errors on protected routes despite valid login
**Root Cause:** Session configuration issues, mismatched secret keys, or improper middleware ordering
**Resolution:**
1. Verify session secret consistency in environment variables
2. Check Passport.js session serialization in `server/auth.ts`
3. Debug with logging: Add traces to authentication middleware
4. Verify cookie settings (secure, sameSite) match the deployment environment
**Prevention:** Use environment-specific secrets management via dotenv, automate session rotation, and include auth tests in the suite

### Issue: Deployment Scaling Issues
**Symptoms:** Application crashes or slows under increased traffic post-deployment
**Root Cause:** Insufficient resource allocation, unhandled concurrency, or missing health checks
**Resolution:**
1. Review container orchestration logs for resource usage
2. Scale replicas or adjust CPU/memory limits in deployment config
3. Add or fix health check endpoints for load balancers
4. Test scaling manually with tools like Apache Bench or k6
**Prevention:** Design for horizontal scaling from the start, include autoscaling rules, and perform stress tests before releases

### Issue: Drizzle ORM Migration Failures
**Symptoms:** Database schema changes fail to apply or cause runtime errors
**Root Cause:** Migration conflicts, missing migration files, or schema drift
**Resolution:**
1. Review migration files in the migrations directory
2. Run `drizzle-kit push` to sync schema changes
3. Check for conflicts between local and production schemas
4. Rollback if necessary and regenerate migrations
**Prevention:** Always test migrations locally, use version control for migration files, and maintain backup procedures

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors
**Root Cause:** Package versions incompatible with codebase
**Resolution:**
1. Review package.json for version ranges
2. Run `npm update` to get compatible versions
3. Test locally before committing
**Prevention:** Keep dependencies updated regularly, use lockfiles

## Hand-off Notes
After completing backend tasks, summarize key changes (e.g., new API endpoints, database migrations), highlight any performance improvements or risks (e.g., potential bottlenecks), and suggest follow-ups like frontend integration testing or monitoring setup. Include:
- List of modified files in `server/` and `shared/`
- Any new environment variables required
- Database migration instructions if schema changed
- API contract changes that require frontend updates

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., commit hash abc123 for API optimization).
- Command output or logs that informed recommendations (e.g., database query profiles from EXPLAIN ANALYZE).
- Follow-up items for maintainers or future agent runs (e.g., "Review shared module changes in PR #45").
- Performance metrics and benchmarks where applicable (e.g., "Pre-optimization query time: 500ms; Post: 150ms").
- Drizzle migration checksums and schema version information.
<!-- agent-update:end -->
