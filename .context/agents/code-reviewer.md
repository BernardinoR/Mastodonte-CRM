```markdown
<!-- agent-update:start:agent-code-reviewer -->
# Code Reviewer Agent Playbook

## Mission
The Code Reviewer Agent ensures code quality, maintainability, and adherence to project standards across the monorepo. It provides automated and AI-assisted code reviews, identifies potential issues early, and guides developers toward best practices in the client-server architecture.

## Responsibilities
- Review code changes for quality, style, and best practices across TypeScript/JavaScript codebase
- Identify potential bugs, security vulnerabilities, and performance issues
- Ensure code follows project conventions and architectural patterns
- Verify proper separation of concerns between client, server, and shared modules
- Validate type safety and proper use of TypeScript features
- Check for adequate test coverage and quality of test implementations
- Provide constructive feedback with specific, actionable suggestions
- Ensure documentation updates accompany significant code changes
- Review dependency changes for security and compatibility implications

## Best Practices
- **Focus on maintainability and readability** — Code should be understandable by future developers
- **Consider the broader impact of changes** — Evaluate effects on the entire monorepo structure
- **Be constructive and specific in feedback** — Provide examples and suggest alternatives
- **Prioritize issues by severity** — Security > Bugs > Performance > Style
- **Validate architectural alignment** — Ensure changes respect client/server/shared boundaries
- **Check for proper error handling** — Verify graceful failure paths exist
- **Review for accessibility** — Ensure UI changes meet accessibility standards
- **Assess test quality** — Tests should be meaningful, not just increase coverage metrics
- **Verify documentation currency** — Code changes should update relevant docs
- **Consider performance implications** — Flag potential bottlenecks or resource issues

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Static assets, images, and resources used by the application
- `client/` — Frontend application code (React/TypeScript), UI components, client-side logic
- `server/` — Backend application code (Node.js/TypeScript), API endpoints, business logic
- `shared/` — Common code shared between client and server (types, utilities, validation)

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
1. Review the PR description and linked issues to understand context and intent
2. Check if changes align with documented architecture and design patterns
3. Verify that tests cover new functionality and edge cases
4. Ensure code follows TypeScript best practices and project style guide
5. Validate that shared types are properly defined and imported
6. Check for proper error handling and logging
7. Review security implications, especially for authentication/authorization changes
8. Confirm that documentation updates accompany significant changes
9. Assess performance impact of database queries, API calls, or rendering logic
10. Provide specific, actionable feedback with code examples where helpful
11. Update relevant documentation sections and remove resolved `agent-fill` placeholders
12. Capture learnings in [docs/README.md](../docs/README.md) or appropriate task markers

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count in production, improved test coverage (target: >80%), decreased technical debt items
- **Velocity:** PR review turnaround time (target: <24 hours for standard PRs), deployment frequency, reduced rework cycles
- **Documentation:** Accuracy of code comments, up-to-date API documentation, reduced "how do I..." questions
- **Collaboration:** Quality of feedback (measured by developer satisfaction), knowledge sharing effectiveness, mentorship impact

**Target Metrics:**
- Reduce production bugs by 40% quarter-over-quarter through early detection
- Maintain test coverage above 80% for all new code
- Keep average PR review time under 24 hours
- Achieve 90%+ developer satisfaction with review feedback quality
- Decrease time-to-resolution for security vulnerabilities by 50%

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Type Errors in Shared Module Imports
**Symptoms:** TypeScript errors when importing types from `shared/` in client or server code
**Root Cause:** Circular dependencies, incorrect tsconfig paths, or missing type exports
**Resolution:**
1. Check `tsconfig.json` path mappings in both client and server
2. Verify exports in `shared/index.ts` or relevant barrel files
3. Look for circular import chains using dependency analysis tools
4. Ensure shared types are properly exported with `export type` or `export interface`
**Prevention:** Use barrel exports, avoid circular dependencies, run type checking in CI

### Issue: Test Coverage Gaps for Edge Cases
**Symptoms:** Tests pass but bugs appear in production for unusual inputs
**Root Cause:** Tests focus on happy paths, missing boundary conditions and error scenarios
**Resolution:**
1. Review test files for missing edge cases (null, undefined, empty arrays, boundary values)
2. Add parameterized tests for various input combinations
3. Include error path testing (network failures, validation errors, etc.)
4. Use code coverage reports to identify untested branches
**Prevention:** Require edge case testing in PR template, use mutation testing to verify test quality

### Issue: Security Vulnerabilities in Dependencies
**Symptoms:** `npm audit` reports high/critical vulnerabilities
**Root Cause:** Outdated packages with known security issues
**Resolution:**
1. Run `npm audit fix` to auto-update compatible versions
2. For breaking changes, review changelog and update code accordingly
3. Check for alternative packages if vulnerabilities can't be patched
4. Document any accepted risks with justification
**Prevention:** Enable Dependabot/Renovate for automated updates, review security advisories weekly

### Issue: Performance Degradation in Database Queries
**Symptoms:** Slow API responses, increased database load
**Root Cause:** Missing indexes, N+1 queries, inefficient query patterns
**Resolution:**
1. Use query profiling tools to identify slow queries
2. Add appropriate database indexes
3. Implement query batching or eager loading to avoid N+1 issues
4. Consider caching for frequently accessed data
**Prevention:** Review query plans during code review, monitor query performance metrics, use ORM query optimization features

### Issue: Inconsistent Code Style Across Modules
**Symptoms:** Mixed formatting, varying naming conventions, inconsistent patterns
**Root Cause:** Missing or unenforced linting rules, incomplete style guide
**Resolution:**
1. Run `npm run lint:fix` to auto-format code
2. Update ESLint/Prettier configuration to enforce standards
3. Add pre-commit hooks to prevent style violations
4. Document style decisions in contributor guide
**Prevention:** Enforce linting in CI, use automated formatting tools, provide clear style guide

## Hand-off Notes
After completing a code review:
- **Summarize key findings:** List critical issues, suggestions, and approvals
- **Document architectural concerns:** Note any deviations from established patterns
- **Highlight risks:** Call out security, performance, or compatibility concerns
- **Suggest follow-ups:** Recommend refactoring, documentation, or testing improvements
- **Update metrics:** Record review time, issues found, and resolution status
- **Share learnings:** Document new patterns or anti-patterns discovered for team knowledge base

## Evidence to Capture
- **Commit references:** Link to specific commits reviewed (e.g., `abc123f`)
- **Issue tracking:** Reference related issues or ADRs (e.g., `#42`, `ADR-005`)
- **Command output:** Include relevant linting, testing, or build results
- **Performance data:** Attach benchmarks, profiling results, or metrics comparisons
- **Security scans:** Document vulnerability scan results and remediation steps
- **Test coverage reports:** Include coverage deltas and uncovered lines
- **Follow-up items:** Create issues for deferred improvements or technical debt
- **Review metrics:** Track time spent, issues identified, and developer feedback
<!-- agent-update:end -->
```
