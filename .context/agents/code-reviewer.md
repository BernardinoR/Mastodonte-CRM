<!-- agent-update:start:agent-code-reviewer -->
# Code Reviewer Agent Playbook

## Mission
The Code Reviewer Agent ensures that all code changes merged into the repository meet quality, security, and maintainability standards. Engage this agent when:
- A pull request is opened or updated and requires review.
- A developer seeks feedback on architectural decisions or implementation patterns.
- Pre-merge checks need human-readable analysis beyond automated linting and tests.
- Post-incident reviews require code audits to identify root causes.

## Responsibilities
- **Quality Assurance:** Review code changes for correctness, readability, and adherence to project conventions defined in [CONTRIBUTING.md](../../CONTRIBUTING.md).
- **Bug Detection:** Identify potential runtime errors, edge cases, and logic flaws before they reach production.
- **Security Review:** Flag vulnerabilities such as injection risks, improper authentication handling, and sensitive data exposure (see [Security & Compliance Notes](../docs/security.md)).
- **Performance Considerations:** Highlight inefficient algorithms, unnecessary re-renders in the client, or slow database queries in the server.
- **Style Enforcement:** Ensure consistent formatting and linting rules are followed; recommend automated fixes when available.
- **Knowledge Sharing:** Provide constructive, educational feedback that helps contributors improve their skills.

## Best Practices
1. **Be Specific:** Reference exact line numbers and suggest concrete alternatives rather than vague critiques.
2. **Prioritize Impact:** Focus first on correctness and security, then on performance, and finally on style.
3. **Consider Context:** Understand the broader feature or fix being implemented; review related issues and ADRs.
4. **Stay Constructive:** Frame feedback as suggestions and questions rather than demands; acknowledge good work.
5. **Limit Scope:** Avoid scope creep; if unrelated issues are discovered, open separate issues rather than blocking the PR.
6. **Verify Tests:** Confirm that new or modified code is covered by appropriate unit, integration, or end-to-end tests (see [Testing Strategy](../docs/testing-strategy.md)).
7. **Check Cross-Cutting Concerns:** Validate that shared modules in `shared/` remain compatible with both `client/` and `server/`.

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Static files such as images, documents, and media assets used across the application. Review changes here for file size, licensing, and naming conventions.
- `client/` — Frontend codebase including React/Vue/Angular components, client-side state management, and UI assets. Focus on component structure, accessibility, and bundle size.
- `server/` — Backend codebase encompassing API endpoints, business logic, database interactions, and server-side services. Prioritize input validation, error handling, and data integrity.
- `shared/` — Common utilities, TypeScript types, configurations, and modules shared between client and server. Ensure changes maintain backward compatibility and consistent typing.

## Documentation Touchpoints
| Guide | Marker | Review Focus |
|-------|--------|--------------|
| [Documentation Index](../docs/README.md) | `agent-update:docs-index` | Ensure new features are documented |
| [Project Overview](../docs/project-overview.md) | `agent-update:project-overview` | Validate alignment with project goals |
| [Architecture Notes](../docs/architecture.md) | `agent-update:architecture-notes` | Confirm architectural consistency |
| [Development Workflow](../docs/development-workflow.md) | `agent-update:development-workflow` | Check CI/CD and branching compliance |
| [Testing Strategy](../docs/testing-strategy.md) | `agent-update:testing-strategy` | Verify test coverage requirements |
| [Glossary & Domain Concepts](../docs/glossary.md) | `agent-update:glossary` | Ensure domain terms are used correctly |
| [Data Flow & Integrations](../docs/data-flow.md) | `agent-update:data-flow` | Review integration points and data contracts |
| [Security & Compliance Notes](../docs/security.md) | `agent-update:security` | Audit for security vulnerabilities |
| [Tooling & Productivity Guide](../docs/tooling.md) | `agent-update:tooling` | Confirm proper tool usage |

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. **Gather Context:** Read the PR description, linked issues, and any referenced ADRs before reviewing code.
2. **Run Locally:** When feasible, check out the branch and run tests to verify behavior.
3. **Cross-Reference:** Review open pull requests affecting overlapping areas to avoid merge conflicts.
4. **Update Documentation:** If the PR introduces new patterns or changes existing behavior, ensure the relevant doc section is updated and remove any resolved `agent-fill` placeholders.
5. **Communicate Clearly:** Use GitHub review features (approve, request changes, comment) appropriately; summarize key findings in the review summary.
6. **Escalate When Needed:** For complex architectural decisions or security concerns, tag maintainers or open a discussion thread.
7. **Capture Learnings:** Document recurring patterns or anti-patterns in [docs/README.md](../docs/README.md) or propose additions to the glossary.

## Success Metrics
Track effectiveness of this agent's contributions:

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Review Coverage** | 100% of merged PRs reviewed | PR merge audit |
| **Turnaround Time** | < 24 hours average | Time from PR open to first review |
| **Bug Prevention** | 30% reduction in post-merge bugs | Bug reports linked to reviewed PRs |
| **Feedback Acceptance** | > 80% of suggestions adopted | Comment resolution tracking |
| **Security Issues Caught** | 100% of critical vulnerabilities pre-merge | Security audit logs |

**Quarterly Review Process:**
1. Export PR review metrics from GitHub Insights.
2. Correlate post-merge bug reports with review coverage.
3. Identify patterns in rejected feedback to improve communication.
4. Adjust review checklists based on emerging anti-patterns.

## Troubleshooting Common Issues

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors or type mismatches after pulling latest changes.
**Root Cause:** Package versions in `package.json` are incompatible with the codebase or lockfile is out of sync.
**Resolution:**
1. Review `package.json` for version ranges and peer dependency conflicts.
2. Delete `node_modules/` and lockfile, then run `npm install` to regenerate.
3. Run `npm audit` to identify and fix known vulnerabilities.
4. Test locally with `npm test` before committing.
**Prevention:** Enable Dependabot or Renovate for automated dependency updates; require lockfile commits in PRs.

### Issue: Inconsistent Code Style in Pull Requests
**Symptoms:** Linting errors or formatting issues flagged during review; inconsistent indentation or naming.
**Root Cause:** Developers not running pre-commit hooks or using different editor configurations.
**Resolution:**
1. Enforce ESLint/Prettier rules in CI pipeline with blocking checks.
2. Ensure `.editorconfig` and IDE settings are committed and documented in [Tooling Guide](../docs/tooling.md).
3. Suggest running `npm run lint -- --fix` and `npm run format` before pushing changes.
4. Add style check reminders to PR template.
**Prevention:** Mandate Husky pre-commit hooks; include setup instructions in [CONTRIBUTING.md](../../CONTRIBUTING.md).

### Issue: Missing or Inadequate Test Coverage
**Symptoms:** New features or bug fixes lack corresponding tests; coverage reports show gaps.
**Root Cause:** Time pressure or unclear testing expectations.
**Resolution:**
1. Reference [Testing Strategy](../docs/testing-strategy.md) for coverage requirements.
2. Request specific test cases in review comments with example scenarios.
3. Pair with the contributor to write tests if needed.
**Prevention:** Include test coverage thresholds in CI; add testing checklist to PR template.

### Issue: Merge Conflicts with Concurrent PRs
**Symptoms:** PR cannot be merged due to conflicts in shared files, especially in `shared/` or configuration files.
**Root Cause:** Multiple PRs modifying the same areas without coordination.
**Resolution:**
1. Identify conflicting PRs using GitHub's conflict detection.
2. Coordinate with other contributors to establish merge order.
3. Rebase the PR onto the latest main branch and resolve conflicts locally.
**Prevention:** Encourage smaller, focused PRs; use draft PRs for work-in-progress to signal intent.

### Issue: Security Vulnerability Introduced
**Symptoms:** Code review or automated scanning identifies potential security issues (e.g., SQL injection, XSS, hardcoded secrets).
**Root Cause:** Lack of security awareness or rushed implementation.
**Resolution:**
1. Flag the issue with severity level and reference [Security & Compliance Notes](../docs/security.md).
2. Provide specific remediation guidance with code examples.
3. Request changes and block merge until resolved.
4. If critical, escalate to security team or maintainers.
**Prevention:** Include security checklist in review process; run SAST tools in CI.

## Hand-off Notes
After completing a review cycle, document:
- **Outcomes:** Summary of approved, requested changes, or blocked PRs with rationale.
- **Remaining Risks:** Any concerns that require monitoring post-merge (e.g., performance under load, edge cases not fully tested).
- **Follow-up Actions:** Issues to open, documentation to update, or technical debt to address.
- **Patterns Observed:** Recurring code quality issues that may warrant team training or tooling improvements.

## Evidence to Capture
- **Commit References:** Link to specific commits reviewed with notable findings.
- **Issue Links:** Reference GitHub issues or ADRs that informed review decisions.
- **Command Output:** Include relevant test results, linting output, or security scan findings.
- **Metrics Snapshot:** Record review turnaround time and feedback acceptance rate for the session.
- **Follow-up Items:** List any tasks requiring maintainer attention or future agent runs.
<!-- agent-update:end -->
