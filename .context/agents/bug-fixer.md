<!-- agent-update:start:agent-bug-fixer -->
# Bug Fixer Agent Playbook

## Mission
The Bug Fixer Agent supports the development team by systematically identifying, diagnosing, and resolving defects in the codebase across client, server, and shared components. Engage this agent whenever a bug report is submitted via GitHub issues, an error surfaces in logs or testing, or code reviews highlight potential issues. The agent ensures fixes are efficient, tested, and documented to maintain code quality and prevent recurrence.

## Responsibilities
- Analyze bug reports and error messages to understand reported behavior and expected outcomes
- Reproduce issues locally using development tooling before attempting fixes
- Identify root causes through log analysis, debugging, and code inspection
- Implement targeted fixes with minimal side effects, respecting existing architecture
- Write or update tests to prevent regression of the fixed issue
- Document the fix in PR descriptions and update relevant docs when patterns emerge
- Coordinate with other agents (Code Reviewer, DevOps) when fixes span multiple domains

## Best Practices
- **Reproduce First:** Always confirm the bug exists in your local environment before modifying code. Use `npm run dev` to spin up the full stack.
- **Isolate the Problem:** Narrow down to the smallest reproducible case. Check if the issue is client-only, server-only, or involves shared modules.
- **Write a Failing Test:** Before fixing, create a test that captures the bug. This ensures the fix is verifiable and prevents regression.
- **Minimal Changes:** Limit modifications to what is strictly necessary. Avoid refactoring unrelated code in the same PR.
- **Check Shared Dependencies:** Bugs often stem from mismatches in `shared/` types or utilities used by both client and server.
- **Verify Across Environments:** Test fixes in development, and confirm CI passes before requesting review.
- **Document Root Cause:** Include a brief root cause analysis in your PR description to aid future debugging.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Stores static files such as images, documents, and other non-code assets referenced by the application, including user-uploaded content or external resources. Bugs here often relate to file path resolution or missing assets.
- `client/` — Contains the frontend codebase, including UI components (React), client-side routing, state management (React Query, Zustand, or similar), and browser-specific logic. Common bug sources: component lifecycle issues, state synchronization, API response handling.
- `server/` — Houses the backend services, including API endpoints (Express/Node.js), database interactions (Drizzle ORM with PostgreSQL), authentication, and server-side business logic. Common bug sources: query errors, middleware ordering, validation failures.
- `shared/` — Includes reusable modules like TypeScript interfaces, Zod validation schemas, utility functions, and constants imported by both client and server. Bugs here can cascade to both environments.

## Debugging Workflow
1. **Triage:** Review the issue description, labels, and any attached logs or screenshots.
2. **Reproduce:** Clone the latest `main`, install dependencies (`npm install`), and run `npm run dev`. Follow reproduction steps from the issue.
3. **Investigate:** Use browser DevTools (client) or server logs (check console output) to trace the error. Inspect relevant files in `client/`, `server/`, or `shared/`.
4. **Hypothesis:** Form a theory about the root cause. Check recent commits touching affected files (`git log --oneline -10 -- <path>`).
5. **Fix:** Implement the minimal change. Add or update tests in the appropriate `__tests__` or `tests` directory.
6. **Verify:** Run `npm test` and `npm run lint`. Ensure CI passes.
7. **Document:** Write a clear PR description with reproduction steps, root cause, and verification method.

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
1. Confirm assumptions with issue reporters or maintainers before implementing non-obvious fixes.
2. Review open pull requests affecting the same area to avoid conflicts or duplicate work.
3. If the bug reveals a documentation gap, update the relevant doc section and remove any resolved `agent-fill` placeholders.
4. Capture learnings (e.g., new troubleshooting entries) back in [docs/README.md](../docs/README.md) or the appropriate task marker.
5. Tag the Code Reviewer Agent for review once the fix is ready.
6. Notify DevOps Agent if the fix requires deployment considerations (e.g., database migrations, environment variable changes).

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Reduce average bug resolution time by 30% (target: critical bugs under 4 hours, medium under 24 hours), measured via GitHub issue closing times.
- Ensure 100% of fixes include regression tests, tracked through PR checklists.
- Track trends over time to identify improvement areas, such as recurring bug categories (e.g., via quarterly reviews of issue labels and root cause analyses).

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors; TypeScript compilation errors referencing missing types.
**Root Cause:** Package versions incompatible with codebase or peer dependency conflicts.
**Resolution:**
1. Review `package.json` for version ranges and check for conflicting peer dependencies.
2. Delete `node_modules` and `package-lock.json`, then run `npm install` fresh.
3. Run `npm update` to get compatible versions if needed.
4. Test locally (`npm test`, `npm run dev`) before committing.
**Prevention:** Keep dependencies updated regularly via Dependabot or scheduled reviews. Always commit lockfiles.

### Issue: Client-Server Data Mismatch in Shared Modules
**Symptoms:** Inconsistent data rendering between client hydration and server response, leading to UI errors or hydration mismatches.
**Root Cause:** Divergent handling of shared types or serialization in client/server environments (e.g., Date objects, BigInt).
**Resolution:**
1. Reproduce by running full-stack dev server (`npm run dev`).
2. Inspect `shared/` for type definitions and ensure they match runtime expectations.
3. Add or update serialization utilities in `shared/` (e.g., date formatters, JSON transformers).
4. Test API endpoints and client components together.
5. Commit changes with updated tests covering the cross-boundary data flow.
**Prevention:** Implement shared serialization helpers. Include integration tests in the CI pipeline for client-server data contracts.

### Issue: Database Query Errors After Schema Changes
**Symptoms:** Runtime errors like "column does not exist" or type mismatches when querying the database.
**Root Cause:** Schema migrations not applied, or Drizzle ORM schema out of sync with the actual database.
**Resolution:**
1. Check if migrations are pending: review `drizzle/` folder for unapplied migration files.
2. Run `npm run db:push` or the appropriate migration command to sync the schema.
3. Verify the fix by running affected queries locally.
4. Update or add tests for the affected database operations.
**Prevention:** Always run migrations in local development after pulling changes. Include migration checks in PR checklists.

### Issue: Flaky Tests in CI
**Symptoms:** Tests pass locally but fail intermittently in CI, or vice versa.
**Root Cause:** Race conditions, environment differences, or reliance on external services without mocking.
**Resolution:**
1. Identify the flaky test from CI logs.
2. Run the test in isolation locally multiple times (`npm test -- --grep "test name"`).
3. Add proper async handling (await, waitFor) or mock external dependencies.
4. If environment-specific, check for hardcoded ports, paths, or timing assumptions.
**Prevention:** Use deterministic mocks, avoid time-dependent assertions, and ensure tests clean up after themselves.

### Issue: Static Asset Not Found (attached_assets)
**Symptoms:** 404 errors for images or documents; broken UI elements referencing assets.
**Root Cause:** File moved, renamed, or not committed; incorrect path in code.
**Resolution:**
1. Verify the asset exists in `attached_assets/` and is committed to the repository.
2. Check the reference path in the codebase for typos or incorrect relative paths.
3. If the asset was intentionally moved, update all references.
4. Test by loading the affected page/component locally.
**Prevention:** Use a consistent naming convention for assets. Consider adding a script to validate asset references.

## Hand-off Notes
Upon completing a bug fix, summarize the resolution in the PR description, including:
- **Reproduction Steps:** How to trigger the original bug
- **Root Cause:** Brief explanation of why the bug occurred
- **Verification Method:** How reviewers can confirm the fix works
- **Test Coverage:** Which tests were added or updated

Highlight any remaining risks, such as:
- Potential impacts on related features (e.g., shared utilities affecting multiple modules)
- Performance implications of the fix
- Areas that may need monitoring post-deployment

Suggest follow-ups like:
- Monitoring production logs for 24-48 hours post-deployment
- Updating monitoring alerts if a new failure mode was discovered
- Scheduling a retrospective if patterns emerge (e.g., frequent issues in a specific module)

If recurring bug patterns are identified, flag them for discussion in team channels and consider creating a dedicated troubleshooting guide entry.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., "Fixes #123", "See ADR-005")
- Command output or logs that informed recommendations (sanitized of sensitive data)
- Follow-up items for maintainers or future agent runs
- Performance metrics and benchmarks where applicable (e.g., "Query time reduced from 500ms to 50ms")
- Links to related PRs or discussions that provide context
<!-- agent-update:end -->
