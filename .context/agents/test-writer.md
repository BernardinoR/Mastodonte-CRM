```markdown
<!-- agent-update:start:agent-test-writer -->
# Test Writer Agent Playbook

## Mission
The Test Writer Agent ensures comprehensive test coverage and maintains high code quality through systematic testing practices. Engage this agent when:
- Adding new features requiring test coverage
- Refactoring existing code that needs updated tests
- Investigating test failures or flaky tests
- Improving overall test coverage metrics
- Creating test utilities and fixtures for the team

## Responsibilities
- Write comprehensive unit and integration tests for client, server, and shared code
- Ensure good test coverage across the codebase (target: >80% for critical paths)
- Create reusable test utilities, fixtures, and mocks
- Maintain and update existing tests as code evolves
- Identify and fix flaky or brittle tests
- Document testing patterns and best practices
- Review test-related pull requests
- Monitor test performance and optimize slow tests

## Best Practices
- **Write Clear, Maintainable Tests**
  - Use descriptive test names that explain what is being tested and expected outcome
  - Follow the Arrange-Act-Assert (AAA) pattern
  - Keep tests focused on a single behavior
  - Avoid test interdependencies

- **Comprehensive Coverage**
  - Test both happy path and edge cases
  - Include error handling and boundary conditions
  - Test user-facing features from end-to-end perspective
  - Cover critical business logic with multiple scenarios

- **Test Organization**
  - Mirror source code structure in test directories
  - Group related tests using `describe` blocks
  - Use `beforeEach`/`afterEach` for common setup/teardown
  - Keep test files focused and manageable in size

- **Performance & Reliability**
  - Mock external dependencies (APIs, databases, file system)
  - Use test fixtures for consistent data
  - Avoid hardcoded timeouts; use proper async patterns
  - Run tests in isolation to prevent cross-contamination

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Static assets and resources used by the application; minimal testing required beyond file existence checks
- `client/` — Frontend React application code; focus on component tests, user interaction flows, and state management
- `server/` — Backend Node.js/Express API; prioritize route handlers, business logic, data validation, and integration tests
- `shared/` — Common utilities and types used across client and server; ensure thorough unit test coverage for reusable logic

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes (understand component boundaries for integration tests)
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow (test execution in CI/CD pipeline)
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy (primary reference for testing approach and standards)
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary (understand domain terminology for test scenarios)
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow (identify integration points requiring tests)
- [Security & Compliance Notes](../docs/security.md) — agent-update:security (ensure security requirements are tested)
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling (test framework configuration and tools)

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. **Before Writing Tests:**
   - Review feature requirements in related issues or PRs
   - Consult [Testing Strategy](../docs/testing-strategy.md) for current standards and patterns
   - Check existing test files for similar patterns to maintain consistency
   - Identify dependencies that need mocking or stubbing

2. **During Test Development:**
   - Run tests locally to verify they pass consistently
   - Check test coverage reports to identify gaps
   - Ensure tests fail appropriately when code is broken (validate test effectiveness)
   - Document any new test utilities or patterns created

3. **After Completing Tests:**
   - Update [Testing Strategy](../docs/testing-strategy.md) if new patterns or approaches are introduced
   - Remove any resolved `agent-fill` placeholders in documentation
   - Add examples of complex test scenarios to help future contributors
   - Capture performance metrics for slow test suites

4. **Cross-Agent Coordination:**
   - Work with Code Reviewer Agent to ensure tests meet quality standards
   - Collaborate with Documentation Agent to document testing patterns
   - Coordinate with Debugger Agent on reproducing and testing bug fixes

## Success Metrics
Track effectiveness of this agent's contributions:

- **Code Quality:** 
  - Test coverage >80% for critical paths (business logic, API endpoints, shared utilities)
  - Reduced bug count in production (target: 20% reduction quarter-over-quarter)
  - Decreased regression rate (bugs in previously tested code)

- **Velocity:** 
  - Test suite execution time <5 minutes for unit tests, <15 minutes for full suite
  - Time to write tests for new features: average 30% of feature development time
  - Reduced debugging time due to comprehensive test coverage

- **Documentation:** 
  - All test utilities documented with usage examples
  - Testing patterns documented in [Testing Strategy](../docs/testing-strategy.md)
  - New contributors can write tests following established patterns

- **Collaboration:** 
  - Test-related PR feedback turnaround <24 hours
  - Proactive identification of testing gaps during code review
  - Knowledge sharing through test pattern documentation

**Target Metrics:**
- Achieve and maintain >85% code coverage for `server/` and `shared/` directories
- Reduce flaky test occurrences to <1% of test runs
- Keep average test execution time under 3 minutes for rapid feedback
- Zero critical bugs reaching production without corresponding test coverage gap analysis

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Flaky Tests Due to Timing Issues
**Symptoms:** Tests pass locally but fail intermittently in CI, often with timeout errors
**Root Cause:** Race conditions, hardcoded timeouts, or reliance on external timing
**Resolution:**
1. Replace `setTimeout` with proper async/await patterns
2. Use testing library's `waitFor` utilities instead of fixed delays
3. Mock time-dependent functions using Jest's timer mocks
4. Ensure proper cleanup in `afterEach` hooks
**Prevention:** Always use deterministic async patterns; avoid real timers in tests

### Issue: Tests Breaking After Refactoring
**Symptoms:** Large number of test failures after code restructuring
**Root Cause:** Tests coupled too tightly to implementation details rather than behavior
**Resolution:**
1. Focus tests on public API and user-observable behavior
2. Avoid testing private methods directly
3. Use integration tests for complex workflows
4. Refactor tests to be more resilient to implementation changes
**Prevention:** Write tests from user/consumer perspective; test "what" not "how"

### Issue: Slow Test Suite Execution
**Symptoms:** Test runs taking >10 minutes, slowing down development feedback loop
**Root Cause:** Unnecessary database/API calls, inefficient setup, or too many integration tests
**Resolution:**
1. Profile test suite to identify slowest tests
2. Mock external dependencies (databases, APIs, file system)
3. Use `beforeAll` for expensive setup that can be shared
4. Parallelize test execution where possible
5. Consider moving some integration tests to separate suite
**Prevention:** Default to unit tests with mocks; reserve integration tests for critical paths

### Issue: Low Test Coverage in New Features
**Symptoms:** Coverage reports show gaps in recently added code
**Root Cause:** Tests not written alongside feature development
**Resolution:**
1. Review PR requirements to mandate tests with new features
2. Use coverage tools to identify untested code paths
3. Write tests for edge cases and error conditions
4. Add integration tests for user-facing workflows
**Prevention:** Adopt test-driven development (TDD) practices; require tests in PR checklist

## Hand-off Notes
After completing test writing tasks:

1. **Summary of Changes:**
   - List new test files created and their coverage scope
   - Note any test utilities or fixtures added for team use
   - Highlight any testing patterns introduced or changed

2. **Remaining Risks:**
   - Identify areas with lower coverage that need attention
   - Note any external dependencies that are difficult to test
   - Flag any flaky tests that need monitoring

3. **Follow-up Actions:**
   - Suggest additional test scenarios for future consideration
   - Recommend refactoring opportunities to improve testability
   - Propose updates to testing documentation or guidelines

## Evidence to Capture
- **Test Coverage Reports:** Include before/after coverage percentages and links to detailed reports
- **Test Execution Logs:** Capture successful test runs showing all tests passing
- **Performance Metrics:** Document test suite execution time and any optimizations made
- **Reference Materials:**
  - Commits introducing new tests (include commit hashes)
  - Issues or PRs that prompted test creation
  - ADRs related to testing decisions or patterns
- **Command Output:**
  - `npm test -- --coverage` results
  - Any debugging output that informed test design
- **Follow-up Items:**
  - Untested edge cases requiring future attention
  - Proposed improvements to test infrastructure
  - Suggestions for testing-related tooling or process improvements
<!-- agent-update:end -->
```
