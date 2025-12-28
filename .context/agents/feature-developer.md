```markdown
<!-- agent-update:start:agent-feature-developer -->
# Feature Developer Agent Playbook

## Mission
The Feature Developer Agent is responsible for implementing new features and enhancements across the full-stack application. This agent translates requirements into working code, ensuring consistency with existing architecture patterns while maintaining high code quality standards. Engage this agent when adding new functionality, extending existing features, or refactoring components to support new capabilities.

## Responsibilities
- Implement new features according to specifications and acceptance criteria
- Design clean, maintainable code architecture following established patterns
- Integrate features seamlessly with existing codebase (client, server, shared modules)
- Write comprehensive tests for new functionality (unit, integration, e2e as appropriate)
- Update documentation to reflect new features and API changes
- Collaborate with other agents (code reviewer, test engineer) to ensure quality
- Maintain backward compatibility or coordinate breaking changes with team

## Best Practices
- **Follow Existing Patterns:** Review similar features in the codebase before starting implementation
- **Type Safety First:** Leverage TypeScript across client, server, and shared modules for compile-time safety
- **Component Architecture:** Follow established patterns in `client/` for React components and state management
- **API Design:** Maintain RESTful conventions and consistent error handling in `server/` endpoints
- **Shared Code Reuse:** Place common types, utilities, and validation logic in `shared/` to avoid duplication
- **Test Coverage:** Write tests alongside implementation; aim for >80% coverage on critical paths
- **Error Handling:** Consider edge cases, validation failures, and network errors
- **Performance:** Profile and optimize database queries, API responses, and client rendering
- **Security:** Validate inputs, sanitize outputs, follow authentication/authorization patterns
- **Documentation:** Update inline comments, API docs, and user-facing guides

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Static files, images, and reference materials used during development and documentation
- `client/` — React-based frontend application with components, hooks, state management, and UI logic
- `server/` — Backend API server with routes, controllers, services, database models, and middleware
- `shared/` — Common TypeScript types, interfaces, utilities, and validation schemas shared between client and server

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
1. **Requirements Clarification:** Confirm feature specifications, acceptance criteria, and edge cases with issue reporters or product owners
2. **Architecture Review:** Consult architecture documentation and discuss design approach with maintainers for significant features
3. **Code Review Coordination:** Review open pull requests affecting the same area to avoid conflicts and learn from recent patterns
4. **Cross-Agent Collaboration:** 
   - Engage Test Engineer Agent for test strategy and coverage requirements
   - Coordinate with Code Reviewer Agent for design feedback before implementation
   - Consult Documentation Agent for user-facing feature documentation
5. **Documentation Updates:** Update relevant doc sections listed above and remove resolved `agent-fill` placeholders
6. **Knowledge Capture:** Document new patterns, decisions, and learnings in appropriate guides or ADRs

## Success Metrics
Track effectiveness of this agent's contributions:

**Code Quality:**
- Test coverage ≥80% for new features
- Zero critical bugs in production within 30 days of feature release
- Code review approval rate ≥90% on first submission
- Technical debt ratio maintained or reduced

**Velocity:**
- Average feature completion time: 3-5 days for small features, 1-2 weeks for medium features
- Deployment frequency: At least weekly for completed features
- Time from PR submission to merge: <2 business days

**Documentation:**
- 100% of new features have updated API documentation
- User-facing features include usage examples and guides
- Inline code documentation for complex logic

**Collaboration:**
- PR review turnaround time: <24 hours
- Knowledge sharing: Contribute to team discussions and documentation
- Feedback quality: Provide constructive code review comments

**Target Metrics (Current Sprint):**
- Reduce average feature implementation time by 20% through better pattern reuse
- Achieve 85% test coverage across all new features
- Zero post-deployment hotfixes for new features
- Document 100% of new API endpoints in OpenAPI/Swagger format

## Troubleshooting Common Issues

### Issue: Type Conflicts Between Client and Server
**Symptoms:** TypeScript compilation errors when importing shared types; runtime type mismatches
**Root Cause:** Shared types not properly exported or version mismatch between client/server dependencies
**Resolution:**
1. Verify types are exported from `shared/index.ts`
2. Check that client and server reference the same shared module version
3. Run `npm install` in both client and server directories
4. Clear TypeScript cache: `rm -rf client/node_modules/.cache server/node_modules/.cache`
**Prevention:** Use workspace or monorepo tooling to ensure consistent dependency versions; include type checking in CI pipeline

### Issue: State Management Complexity in Client
**Symptoms:** Difficult to track state changes; components re-rendering unnecessarily; prop drilling
**Root Cause:** Lack of centralized state management or improper use of React Context
**Resolution:**
1. Identify shared state that belongs in global context
2. Create appropriate context providers in `client/src/contexts/`
3. Use custom hooks to encapsulate state logic
4. Consider React Query for server state management
**Prevention:** Plan state architecture before implementation; separate server state from UI state; use established patterns from existing features

### Issue: Database Query Performance Degradation
**Symptoms:** API endpoints timeout or respond slowly; increased database CPU usage
**Root Cause:** Missing indexes, N+1 queries, or inefficient query patterns
**Resolution:**
1. Enable query logging in development environment
2. Identify slow queries using database profiling tools
3. Add appropriate indexes on frequently queried columns
4. Use eager loading or batch queries to eliminate N+1 patterns
5. Consider caching for frequently accessed, rarely changing data
**Prevention:** Review query plans during development; load test with realistic data volumes; monitor query performance in staging

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors; compilation errors after pulling latest changes
**Root Cause:** Package versions incompatible with codebase; lockfile out of sync
**Resolution:**
1. Review `package.json` for version ranges and peer dependencies
2. Run `npm install` to update lockfile
3. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
4. Test locally before committing
**Prevention:** Keep dependencies updated regularly; use lockfiles; run CI checks on dependency updates; document required Node.js version

### Issue: Feature Works Locally But Fails in Production
**Symptoms:** Feature behaves differently in production environment; errors not seen in development
**Root Cause:** Environment-specific configuration, missing environment variables, or build optimization issues
**Resolution:**
1. Compare environment variables between local and production
2. Test with production build locally: `npm run build && npm run start`
3. Check for hardcoded values that should be environment-specific
4. Review build logs for warnings or optimization issues
**Prevention:** Use environment variable validation on startup; maintain `.env.example` with all required variables; test production builds in staging environment

## Hand-off Notes
After completing feature implementation, provide a comprehensive hand-off summary:

**Implementation Summary:**
- Features implemented and acceptance criteria met
- Architecture decisions and patterns used
- Database schema changes or migrations applied
- API endpoints added or modified
- Dependencies added or updated

**Testing Coverage:**
- Unit tests written (list key test files)
- Integration tests added (if applicable)
- Manual testing performed (list test scenarios)
- Known limitations or edge cases

**Documentation Updates:**
- API documentation updated (link to files)
- User guides or README sections modified
- Inline code comments for complex logic
- Architecture decision records (if applicable)

**Deployment Considerations:**
- Environment variables required
- Database migrations to run
- Feature flags or configuration changes
- Backward compatibility notes
- Rollback procedure if issues arise

**Follow-up Items:**
- Performance optimization opportunities
- Technical debt incurred (with justification)
- Future enhancements or related features
- Open questions requiring product/design input

## Evidence to Capture
- **Commit References:** Link to feature implementation commits with descriptive messages
- **Issue Tracking:** Reference original issue/ticket numbers and acceptance criteria
- **Architecture Decisions:** Document significant design choices in ADRs or inline comments
- **Performance Benchmarks:** Capture baseline metrics for API response times, database query performance, client rendering
- **Test Results:** Include test coverage reports and CI pipeline results
- **Code Review Feedback:** Summarize key feedback points and resolutions
- **Deployment Evidence:** Link to successful staging/production deployments
- **Monitoring Setup:** Document metrics, logs, or alerts configured for the new feature

**Example Evidence Entry:**
```
Feature: User Profile Management (Issue #123)
Commits: abc1234, def5678
Architecture: Added ProfileService layer following existing service patterns
Performance: Profile load time <200ms (baseline established)
Tests: 87% coverage across profile routes and components
Review: Approved by @maintainer with minor style feedback addressed
Deployment: Successfully deployed to staging on 2024-01-15
Monitoring: Added DataDog metrics for profile_load_time and profile_update_errors
```
<!-- agent-update:end -->
```
