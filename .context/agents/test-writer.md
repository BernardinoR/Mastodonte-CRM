<!-- agent-update:start:agent-test-writer -->
# Test Writer Agent Playbook

## Mission
The Test Writer Agent ensures code quality and reliability by creating, maintaining, and improving tests across the Piper Morgan application. This agent is engaged when new features require test coverage, existing tests need updates due to code changes, test failures require investigation, or test infrastructure improvements are needed. The agent works closely with the Code Reviewer and Feature Builder agents to maintain high-quality, well-tested code.

## Responsibilities
- Write comprehensive unit and integration tests for client, server, and shared modules
- Ensure good test coverage across the codebase (target: 80%+ for new features, 75%+ overall)
- Create test utilities, fixtures, and mock factories in `shared/test-utils/`
- Maintain and update existing tests when code changes affect them
- Investigate and resolve flaky tests in CI pipelines
- Document testing patterns and best practices for the team
- Review test-related PRs and provide guidance on test quality
- Set up and maintain test infrastructure (Jest/Vitest configuration, coverage reporting)

## Best Practices
- **Write clear, maintainable tests:** Use descriptive test names following the pattern `should [expected behavior] when [condition]`
- **Test both happy path and edge cases:** Include boundary conditions, error states, and null/undefined handling
- **Follow the AAA pattern:** Arrange (setup), Act (execute), Assert (verify) for consistent test structure
- **Keep tests isolated:** Each test should be independent and not rely on execution order or shared mutable state
- **Use appropriate test types:**
  - Unit tests for pure functions and isolated logic
  - Integration tests for API endpoints and database operations
  - Component tests for React UI with React Testing Library
- **Mock external dependencies:** Use MSW for API mocking, Prisma mocks for database, and NextAuth fixtures for authentication
- **Maintain test data factories:** Create reusable fixtures for common entities (users, projects, tasks) in `shared/test-utils/`
- **Run tests locally before committing:** Use `npm test` or `npm run test:watch` during development
- **Monitor coverage trends:** Review Jest coverage reports and SonarQube dashboards quarterly

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)
- Testing strategy: [docs/testing-strategy.md](../docs/testing-strategy.md)

## Repository Starting Points
- `attached_assets/` — Directory for static assets such as images, documents, and uploaded files used in the application, particularly for features involving file attachments or media handling. Test file upload handlers and asset validation here.
- `client/` — Contains the frontend application code, including React components, state management, routing, and client-side logic built with modern JavaScript frameworks. Focus on component tests with React Testing Library and integration tests for client-side state.
- `server/` — Houses the backend server code, including API endpoints, database models with Prisma, authentication logic using NextAuth.js, and server-side business rules implemented in TypeScript/Node.js. Prioritize API endpoint tests, Prisma model validation, and auth flow coverage.
- `shared/` — Includes shared code modules, such as TypeScript types, utility functions, validation schemas with Zod, and constants used across both client and server. Test Zod schemas thoroughly and maintain test utilities here.

## Testing Stack & Tools
- **Test Runner:** Jest or Vitest (check `package.json` for project configuration)
- **React Testing:** React Testing Library (`@testing-library/react`)
- **API Mocking:** MSW (Mock Service Worker) for intercepting HTTP requests
- **Database Mocking:** `@prisma/client` mocks or in-memory SQLite for isolated tests
- **Auth Mocking:** NextAuth.js test fixtures with mocked session providers
- **Coverage Reporting:** Jest coverage with `--coverage` flag, integrated with CI
- **Static Analysis:** SonarQube dashboards for code quality and coverage trends

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
1. Confirm test requirements with issue reporters or maintainers before writing extensive test suites.
2. Review open pull requests affecting test files or tested modules to avoid conflicts.
3. Coordinate with the Code Reviewer Agent on test quality standards and coverage expectations.
4. Coordinate with the Feature Builder Agent to ensure new features ship with adequate tests.
5. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
6. Capture learnings back in [docs/testing-strategy.md](../docs/testing-strategy.md) or the appropriate task marker.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Achieve at least 80% unit test coverage for new features and maintain overall project coverage above 75%.
- Ensure zero test failures in CI/CD pipelines for merged PRs, reducing bug resolution time by 30% through proactive testing.
- Track trends over time to identify improvement areas using tools like Jest coverage reports and SonarQube dashboards, reviewed quarterly.
- Reduce flaky test rate to below 2% of total test suite.
- Maintain average test execution time under 5 minutes for the full suite.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors or type mismatches
**Root Cause:** Package versions incompatible with codebase or outdated type definitions
**Resolution:**
1. Review `package.json` for version ranges and check for breaking changes in changelogs
2. Run `npm update` to get compatible versions
3. If using lockfiles, run `npm ci` for clean installs
4. Test locally before committing
**Prevention:** Keep dependencies updated regularly, use lockfiles, enable Dependabot or Renovate for automated updates

### Issue: Flaky Tests in Integration Suites
**Symptoms:** Tests pass intermittently, causing unreliable CI builds
**Root Cause:** Non-deterministic factors like network latency, database state, race conditions, or concurrent test execution
**Resolution:**
1. Identify flaky tests using CI logs or tools like Jest's `--runInBand` flag for serial execution
2. Isolate the test, mock external dependencies (e.g., API calls with MSW), and use fixed seeds for random data
3. Add explicit waits using `waitFor` from Testing Library instead of arbitrary timeouts
4. Refactor to make tests idempotent and add retries only as a last resort
**Prevention:** Run tests in isolated environments, use test databases with setup/teardown scripts, and monitor flakiness in CI reports

### Issue: Mocking Complex Dependencies (e.g., Database or Auth)
**Symptoms:** Tests fail due to real database connections or auth token issues
**Root Cause:** Tests hitting live services instead of mocks, leading to side effects or errors
**Resolution:**
1. Use libraries like `@prisma/client` mocks or `vi.mock` in Vitest/Jest for Prisma
2. For NextAuth.js, mock session providers and use test-specific auth fixtures
3. Verify mocks in test setup files and ensure they match production interfaces
4. Check that `NODE_ENV=test` is set to trigger test-specific configurations
**Prevention:** Centralize mock utilities in `shared/test-utils/` and enforce mock usage in code reviews

### Issue: Slow Test Execution
**Symptoms:** Test suite takes too long, slowing down CI feedback loops
**Root Cause:** Heavy setup/teardown, real network calls, unoptimized database queries in tests
**Resolution:**
1. Profile slow tests using `--verbose` or `--detectOpenHandles` flags
2. Replace real API calls with MSW mocks
3. Use in-memory databases or transaction rollbacks instead of full database resets
4. Parallelize tests where safe using Jest's default parallel execution
**Prevention:** Set time budgets for tests, review test performance in CI metrics, refactor slow tests proactively

### Issue: Coverage Gaps in Critical Paths
**Symptoms:** Coverage reports show low coverage on important business logic
**Root Cause:** Tests focus on trivial code while complex logic remains untested
**Resolution:**
1. Review coverage reports to identify uncovered lines in `server/` and `shared/` directories
2. Prioritize tests for error handling, edge cases, and security-sensitive code
3. Add integration tests for critical API endpoints and data flows
**Prevention:** Include coverage checks in PR reviews, set coverage thresholds in CI configuration

## Hand-off Notes
When completing test-related work, summarize:
- **Tests Added/Modified:** List new test files or significant changes to existing tests
- **Coverage Impact:** Note coverage percentage changes (before/after)
- **Known Limitations:** Document any areas that couldn't be tested and why
- **Remaining Risks:** Identify code paths still lacking coverage or areas prone to regression
- **Follow-up Actions:** Suggest improvements for future test runs (e.g., adding E2E tests, improving fixtures)

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify test decisions
- Coverage report snapshots showing before/after metrics
- CI pipeline logs for test runs, especially for flaky test investigations
- Command output or logs that informed recommendations (e.g., `npm test -- --coverage`)
- Follow-up items for maintainers or future agent runs
- Performance metrics: test execution time, flaky test rate, coverage trends
<!-- agent-update:end -->
