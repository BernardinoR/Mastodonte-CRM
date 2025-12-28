```markdown
---
ai_update_goal: "Maintain comprehensive backend specialist guidance aligned with repository architecture and workflows"
required_inputs:
  - "server/ directory structure and technology stack"
  - "API specifications and data models"
  - "Testing and deployment configurations"
  - "Security and authentication patterns"
success_criteria:
  - "All directory purposes clearly documented"
  - "Technology stack and patterns identified"
  - "Success metrics defined with measurable targets"
  - "Common issues documented with solutions"
---

<!-- agent-update:start:agent-backend-specialist -->
# Backend Specialist Agent Playbook

## Mission
The Backend Specialist agent is responsible for server-side development, API design, database optimization, and backend infrastructure. Engage this agent when working on server logic, API endpoints, database schemas, authentication/authorization, or backend performance optimization.

## Responsibilities
- Design and implement server-side architecture using Node.js/TypeScript
- Create and maintain RESTful APIs with proper validation and error handling
- Optimize database queries and data models (PostgreSQL/MongoDB patterns)
- Implement authentication and authorization (JWT, OAuth, RBAC)
- Handle server deployment, scaling, and monitoring
- Ensure backend security best practices and compliance
- Write comprehensive backend tests (unit, integration, e2e)
- Maintain API documentation and service contracts

## Best Practices
- Design APIs following RESTful principles and project specifications
- Implement proper error handling with consistent error codes and messages
- Use appropriate design patterns (Repository, Service Layer, Factory, Strategy)
- Apply clean architecture principles (separation of concerns, dependency injection)
- Consider scalability and performance from the start (caching, query optimization, load balancing)
- Implement comprehensive testing for business logic (aim for >80% coverage)
- Use TypeScript strict mode and proper type definitions
- Follow security best practices (input validation, SQL injection prevention, rate limiting)
- Document APIs using OpenAPI/Swagger specifications
- Implement proper logging and monitoring (structured logs, metrics, tracing)

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Static assets and uploaded files managed by the backend (images, documents, media)
- `client/` — Frontend application code (React/Vue/Angular) - coordinate with Frontend Specialist for API contracts
- `server/` — **Primary backend codebase**: Express/Fastify server, API routes, business logic, database models, middleware, authentication
- `shared/` — Shared TypeScript types, interfaces, utilities, and validation schemas used by both client and server

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview - Tech stack and system context
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes - Server architecture, layers, patterns
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow - Backend dev setup and processes
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy - Backend testing approaches
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary - Business domain terms
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow - API flows and external integrations
- [Security & Compliance Notes](../docs/security.md) — agent-update:security - Authentication, authorization, data protection
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling - Backend development tools

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm assumptions with issue reporters or maintainers before significant architectural changes
2. Review open pull requests affecting backend code to avoid conflicts
3. Coordinate with Frontend Specialist on API contract changes (update shared types)
4. Update API documentation when endpoints change
5. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders
6. Run backend test suite before submitting changes
7. Verify database migrations are reversible and documented
8. Check security implications of changes (input validation, authorization)
9. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker

## Success Metrics
Track effectiveness of this agent's contributions:

**Code Quality:**
- Backend test coverage: Target >80%
- Critical bug count: Reduce by 40% quarter-over-quarter
- Code review approval rate: >90% first-time approval
- Technical debt ratio: <5% of codebase

**Velocity:**
- Average time to implement API endpoint: <4 hours
- Database query optimization turnaround: <2 days
- Deployment frequency: Daily to staging, weekly to production
- Mean time to recovery (MTTR): <30 minutes

**Documentation:**
- API documentation coverage: 100% of public endpoints
- Accuracy of architecture diagrams: Reviewed monthly
- Onboarding time for new backend developers: <3 days

**Collaboration:**
- PR review turnaround time: <24 hours
- Cross-team API contract alignment: Zero breaking changes without notice
- Knowledge sharing sessions: Monthly backend tech talks

**Target Metrics:**
- Reduce API response time p95 by 30% through query optimization
- Achieve 99.9% uptime for backend services
- Maintain zero critical security vulnerabilities
- Reduce bug resolution time by 30% through improved testing

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Slow Database Queries
**Symptoms:** API endpoints timeout, high database CPU usage, slow response times
**Root Cause:** Missing indexes, N+1 queries, inefficient joins, large result sets
**Resolution:**
1. Enable query logging and identify slow queries
2. Analyze query execution plans (`EXPLAIN` in PostgreSQL)
3. Add appropriate indexes on frequently queried columns
4. Implement pagination for large result sets
5. Use eager loading to prevent N+1 queries
6. Consider caching frequently accessed data
**Prevention:** Review query performance during code review, use ORM query builders wisely, monitor query metrics

### Issue: Authentication Token Expiration Errors
**Symptoms:** Users logged out unexpectedly, "Token expired" errors in logs
**Root Cause:** JWT expiration time too short, refresh token logic not implemented
**Resolution:**
1. Review token expiration configuration in auth middleware
2. Implement refresh token rotation strategy
3. Add client-side token refresh logic
4. Set appropriate expiration times (access: 15min, refresh: 7 days)
**Prevention:** Test token lifecycle in integration tests, document token management strategy

### Issue: Memory Leaks in Node.js Server
**Symptoms:** Increasing memory usage over time, eventual OOM crashes
**Root Cause:** Event listeners not removed, circular references, large caches
**Resolution:**
1. Use Node.js heap profiler to identify memory growth
2. Review event listener registration/cleanup
3. Implement cache size limits with LRU eviction
4. Check for circular references in data structures
5. Use WeakMap/WeakSet for temporary object references
**Prevention:** Monitor memory metrics, perform load testing, review resource cleanup in code

### Issue: Database Migration Conflicts
**Symptoms:** Migration failures during deployment, schema mismatch errors
**Root Cause:** Multiple developers creating migrations simultaneously, missing migration dependencies
**Resolution:**
1. Coordinate migration creation through team communication
2. Use sequential migration naming (timestamp-based)
3. Test migrations on a copy of production data
4. Ensure migrations are idempotent and reversible
5. Document migration dependencies
**Prevention:** Run migrations in isolated environments first, maintain migration changelog

## Hand-off Notes
After completing backend work, provide:

1. **Changes Summary:** List of modified endpoints, database changes, new dependencies
2. **Testing Evidence:** Test coverage reports, integration test results, performance benchmarks
3. **Deployment Notes:** Migration steps, environment variable changes, rollback procedures
4. **Breaking Changes:** API contract changes requiring frontend updates
5. **Monitoring:** New metrics to track, expected baseline values, alert thresholds
6. **Follow-up Items:** Technical debt incurred, optimization opportunities, future refactoring needs
7. **Documentation Updates:** Links to updated API docs, architecture diagrams, runbooks

## Evidence to Capture
- **Commits:** Reference specific commits implementing features or fixes
- **Issues:** Link to resolved issues with root cause analysis
- **ADRs:** Architectural Decision Records for significant design choices
- **Performance Data:** Query execution times, API response times, load test results
- **Security Scans:** Dependency vulnerability reports, penetration test findings
- **Code Review Feedback:** Common patterns or issues identified during reviews
- **Deployment Logs:** Evidence of successful migrations and rollouts
- **Monitoring Dashboards:** Screenshots or links to relevant metrics showing impact
<!-- agent-update:end -->
```
