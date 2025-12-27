<!-- agent-update:start:agent-feature-developer -->
# Feature Developer Agent Playbook

## Mission
The Feature Developer agent supports the team by implementing new features based on specifications, ensuring they integrate seamlessly with the existing codebase while maintaining high standards of code quality, testability, and documentation. Engage this agent during sprint planning or when a new user story or ticket requires code-level implementation, such as adding UI components, API endpoints, or business logic.

## Responsibilities
- Implement new features according to specifications and acceptance criteria
- Design clean, maintainable code architecture following established patterns
- Integrate features with existing codebase across client, server, and shared modules
- Write comprehensive tests for new functionality (unit, integration, and e2e where applicable)
- Update documentation to reflect new capabilities and API changes
- Coordinate with Code Reviewer and QA agents for feedback incorporation

## Best Practices
- Follow existing patterns and conventions established in the codebase
- Consider edge cases, error handling, and validation at boundaries
- Write tests alongside implementation (TDD encouraged)
- Use TypeScript interfaces from `shared/` to ensure type consistency
- Keep commits atomic and well-documented for easier review
- Profile performance-critical code paths before finalizing
- Document breaking changes and migration steps when modifying shared contracts

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Stores static assets such as images, configuration files, datasets, or external resources (e.g., ML models, API keys, seed data) that are attached to the project for use across client and server components. When adding new features that require media or configuration, place files here and reference them via relative paths.
- `client/` — Contains the frontend application code, including React components, state management (e.g., Redux or Context API), UI logic, and client-side routing for the web interface. New UI features typically start here with component scaffolding and hook integration.
- `server/` — Houses the backend application code, including API routes, database interactions (ORM models, migrations), authentication logic, and server-side business rules using Node.js/Express. New endpoints and background jobs are implemented here.
- `shared/` — Holds common utilities, types, constants, and modules shared between client and server to avoid duplication and ensure consistency (e.g., TypeScript interfaces, validation schemas, error codes). Always update shared types when modifying API contracts.

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
1. Confirm assumptions with issue reporters or maintainers before starting implementation.
2. Review open pull requests affecting the same area to avoid merge conflicts.
3. Run `git status -sb` and `npm test` locally before pushing changes.
4. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
5. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.
6. Tag Code Reviewer agent for PR review; notify QA agent when feature is ready for testing.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Achieve 90%+ test coverage for new features; reduce post-deployment bugs by 25% per quarter.
- Complete feature implementation within estimated story points 80% of the time; aim for bi-weekly deployments.
- Track trends over time to identify improvement areas, such as quarterly code review metrics and developer satisfaction surveys.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors; TypeScript compilation errors referencing missing exports.
**Root Cause:** Package versions incompatible with codebase or lockfile drift.
**Resolution:**
1. Review `package.json` for version ranges and compare with `package-lock.json`.
2. Run `npm ci` to restore exact locked versions; if issues persist, run `npm update` selectively.
3. Test locally (`npm run build && npm test`) before committing.
**Prevention:** Keep dependencies updated regularly via Dependabot or scheduled audits; commit lockfiles.

### Issue: Integration Errors Between Client and Server
**Symptoms:** API calls from client fail with mismatched data formats, 422 validation errors, or authentication issues.
**Root Cause:** Changes in shared types or endpoints not synchronized across directories.
**Resolution:**
1. Verify `shared/` exports match current versions in both `client/` and `server/`.
2. Run full integration tests via `npm run test:integration` (or equivalent script).
3. Update API documentation in `docs/data-flow.md` if schemas changed.
**Prevention:** Use TypeScript for shared modules; enforce CI checks for type consistency; require API contract reviews in PRs.

### Issue: Performance Bottlenecks in New Features
**Symptoms:** Slow page loads, high API response times, or memory spikes after adding functionality.
**Root Cause:** Inefficient algorithms, unoptimized queries, or large uncompressed assets in `attached_assets/`.
**Resolution:**
1. Profile code with browser dev tools (Lighthouse, React Profiler) or Node.js profiler (`--inspect`).
2. Optimize by lazy-loading assets, adding database indexes, or caching responses.
3. Benchmark before/after changes and commit performance notes to PR description.
**Prevention:** Include performance tests in the testing suite; review bundle size and query plans during PRs.

### Issue: Feature Flag Misconfiguration
**Symptoms:** New feature appears in production unexpectedly or fails to appear in staging.
**Root Cause:** Environment-specific flags not set correctly or cached config.
**Resolution:**
1. Check `.env` files and deployment configuration for flag values.
2. Clear caches and redeploy to staging for verification.
3. Confirm flag logic in code matches expected environment behavior.
**Prevention:** Document all feature flags in `docs/tooling.md`; add flag state to deployment checklist.

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. Example format:

> **Feature:** User authentication flow  
> **Status:** Implemented and passing CI  
> **Risks:** Edge cases in multi-device sessions not fully covered; recommend manual QA testing on mobile browsers.  
> **Follow-up:** Update deployment scripts if new environment variables were added; schedule load testing for production rollout.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., "Commit `abc123` informed directory descriptions; Issue #45 resolved integration patterns").
- Command output or logs that informed recommendations (e.g., `npm ls` output for dependency checks, test coverage reports).
- Follow-up items for maintainers or future agent runs (e.g., "Monitor test coverage post-merge; revisit caching strategy in Q3").
- Performance metrics and benchmarks where applicable (e.g., "API latency reduced from 500ms to 200ms after query optimization").
<!-- agent-update:end -->
