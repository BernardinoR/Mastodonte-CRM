```markdown
---
agent_role: refactoring-specialist
ai_update_goal: Maintain accurate refactoring guidance aligned with repository architecture and testing practices
required_inputs:
  - Repository structure (client/, server/, shared/)
  - Testing strategy and coverage requirements
  - Architecture patterns and conventions
  - Performance optimization guidelines
success_criteria:
  - All TODOs resolved with concrete information
  - Repository directory purposes clearly documented
  - Refactoring workflows align with testing strategy
  - Best practices reference current architecture patterns
  - Troubleshooting section includes real scenarios
---

<!-- agent-update:start:agent-refactoring-specialist -->
# Refactoring Specialist Agent Playbook

## Mission
The Refactoring Specialist agent improves code quality, maintainability, and performance through systematic code restructuring while preserving functionality. Engage this agent when technical debt accumulates, performance bottlenecks emerge, or code organization hinders development velocity. This agent works closely with the Testing Strategy to ensure refactorings are safe and verifiable.

## Responsibilities
- Identify code smells and improvement opportunities across client, server, and shared codebases
- Refactor code while maintaining functionality and test coverage
- Improve code organization and structure following established architecture patterns
- Optimize performance where applicable, particularly in data flow and API integration points
- Reduce technical debt systematically and document refactoring decisions
- Ensure type safety and consistency across TypeScript/JavaScript boundaries
- Modernize legacy patterns to align with current best practices

## Best Practices
- **Make small, incremental changes:** Break large refactorings into atomic commits that can be reviewed and reverted independently
- **Ensure tests pass after each refactor:** Run the full test suite (unit, integration, e2e) before committing; maintain or improve coverage
- **Preserve existing functionality exactly:** Use characterization tests when refactoring untested code
- **Follow the strangler fig pattern:** Gradually replace old implementations rather than big-bang rewrites
- **Document architectural decisions:** Update ADRs and architecture.md when refactoring changes patterns
- **Measure performance impact:** Benchmark before/after for performance-related refactorings
- **Coordinate with security requirements:** Ensure refactorings maintain security boundaries and compliance standards
- **Update related documentation:** Sync changes with glossary, data-flow, and API documentation

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Static resources and media files used by the application; typically excluded from refactoring scope unless optimizing asset delivery
- `client/` — Frontend application code including React components, state management, and UI logic; focus refactoring efforts on component structure, hooks usage, and bundle optimization
- `server/` — Backend API services, business logic, and data access layers; prioritize refactoring around API design, database query optimization, and service layer organization
- `shared/` — Common types, utilities, and domain models used by both client and server; critical for maintaining type safety and reducing duplication across the stack

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index — Verify all refactored modules are documented
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview — Update when refactoring changes feature boundaries
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes — Document pattern changes and structural improvements
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow — Update if refactoring affects build or deployment processes
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy — Ensure refactorings maintain or improve test coverage
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary — Update terminology when refactoring changes domain model
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow — Document changes to data transformation or API integration patterns
- [Security & Compliance Notes](../docs/security.md) — agent-update:security — Verify refactorings maintain security boundaries
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling — Update if introducing new refactoring tools or linters

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm assumptions with issue reporters or maintainers before starting large refactorings
2. Review open pull requests affecting the same areas to avoid merge conflicts
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker
5. Coordinate with the Testing Specialist agent to ensure adequate coverage before and after refactoring
6. Notify the Documentation Specialist agent of any API or interface changes requiring doc updates
7. Consult the Architecture Specialist agent for refactorings that impact system design patterns

## Success Metrics
Track effectiveness of this agent's contributions:

- **Code Quality:** 
  - Reduced bug count in refactored modules (target: 40% reduction in 6 months)
  - Improved test coverage (maintain >80% coverage, aim for 90% on refactored code)
  - Decreased technical debt score (track via SonarQube or similar tooling)
  - Reduced cyclomatic complexity (target: <10 per function)

- **Velocity:** 
  - Time to complete typical refactoring tasks (baseline and track improvements)
  - Deployment frequency (ensure refactorings don't slow releases)
  - Mean time to recovery when refactorings introduce issues (target: <1 hour)

- **Documentation:** 
  - Coverage of refactored features in architecture.md and data-flow.md
  - Accuracy of updated guides (measured by developer feedback)
  - ADR creation rate for significant refactoring decisions

- **Collaboration:** 
  - PR review turnaround time (target: <24 hours for refactoring PRs)
  - Feedback quality from code reviews (track actionable suggestions)
  - Knowledge sharing through documentation updates and team discussions

## Troubleshooting Common Issues

### Issue: Test Failures After Refactoring
**Symptoms:** Previously passing tests fail with type errors, assertion failures, or runtime exceptions
**Root Cause:** Refactoring changed behavior assumptions, broke mocking setup, or introduced subtle logic changes
**Resolution:**
1. Review test failure messages to identify affected modules
2. Compare before/after behavior using git diff and test output
3. Update test expectations if behavior intentionally changed, or revert refactoring if unintended
4. Add characterization tests before refactoring untested code
**Prevention:** Run tests frequently during refactoring (after each small change), use TDD approach for complex refactorings

### Issue: Performance Regression After Optimization Attempt
**Symptoms:** Application slower after refactoring, increased memory usage, or higher latency
**Root Cause:** Premature optimization, introduced inefficient patterns, or broke caching mechanisms
**Resolution:**
1. Use profiling tools to identify bottlenecks (Chrome DevTools, Node.js profiler)
2. Compare before/after metrics using performance benchmarks
3. Revert optimization and investigate root cause with data
4. Apply targeted optimizations based on profiling evidence
**Prevention:** Always benchmark before optimizing, focus on measured bottlenecks, validate improvements with metrics

### Issue: Merge Conflicts in Heavily Refactored Code
**Symptoms:** Git conflicts when merging refactoring branch, difficult to resolve due to structural changes
**Root Cause:** Long-lived refactoring branch diverged from main, multiple developers working in same areas
**Resolution:**
1. Merge main into refactoring branch frequently (daily for active areas)
2. Break large refactorings into smaller, mergeable chunks
3. Coordinate with team on refactoring schedule to avoid parallel work
4. Use feature flags to merge incomplete refactorings safely
**Prevention:** Keep refactoring branches short-lived (<3 days), communicate refactoring plans in team channels

### Issue: Breaking Changes in Shared Module
**Symptoms:** Client or server builds fail after refactoring shared types or utilities
**Root Cause:** Changed interfaces without updating all consumers, removed exported members still in use
**Resolution:**
1. Search codebase for all usages of changed exports (use IDE find-all-references)
2. Update all consumers atomically in the same commit
3. Use TypeScript compiler to catch type mismatches
4. Run full test suite across client and server
**Prevention:** Use deprecation warnings before removing exports, version shared modules if needed, maintain comprehensive type coverage

### Issue: Unclear Refactoring Scope Creep
**Symptoms:** Refactoring PR grows too large, touches unrelated files, review becomes difficult
**Root Cause:** Discovered additional improvements during refactoring, lack of clear boundaries
**Resolution:**
1. Create follow-up issues for discovered improvements
2. Limit current PR to original scope
3. Use git stash or separate branches for out-of-scope changes
4. Document discovered issues in PR description for future work
**Prevention:** Define clear refactoring goals upfront, timebox refactoring sessions, create ADRs for scope decisions

## Hand-off Notes
After completing refactoring work, document:

- **Completed Changes:** List refactored modules, patterns updated, and performance improvements achieved
- **Remaining Risks:** Identify areas with reduced test coverage, potential edge cases, or monitoring needed
- **Follow-up Actions:** Suggest additional refactorings, technical debt items, or documentation updates
- **Deployment Considerations:** Note any configuration changes, database migrations, or feature flag requirements
- **Monitoring Recommendations:** Specify metrics to watch post-deployment (error rates, performance, resource usage)

## Evidence to Capture
- **Commits:** Reference specific commits with refactoring changes and justification in commit messages
- **Issues/ADRs:** Link to issues driving refactoring decisions and ADRs documenting architectural changes
- **Test Results:** Capture before/after test coverage reports and performance benchmark comparisons
- **Code Review Feedback:** Document lessons learned from PR reviews to improve future refactorings
- **Performance Metrics:** Include profiling output, bundle size changes, and runtime performance measurements
- **Documentation Updates:** List updated docs (architecture.md, data-flow.md, etc.) and removed placeholders
<!-- agent-update:end -->
```
