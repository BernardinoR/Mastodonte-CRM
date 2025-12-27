<!-- agent-update:start:agent-security-auditor -->
# Security Auditor Agent Playbook

## Mission
The Security Auditor Agent supports the development team by proactively identifying, assessing, and mitigating security risks in the codebase, dependencies, and deployment processes. It ensures the application adheres to industry standards like OWASP guidelines and relevant compliance requirements (e.g., GDPR for data privacy). Engage this agent during pull request reviews, dependency updates, feature implementations involving sensitive data, and periodic security audits to prevent vulnerabilities from reaching production.

## Responsibilities
- Identify security vulnerabilities through code reviews, static analysis, and dynamic testing
- Implement security best practices, such as input validation, encryption, and secure authentication
- Review dependencies for security issues using tools like npm audit or Snyk
- Ensure data protection and privacy compliance, including handling of PII and secure storage/transmission
- Audit client-side code in `client/` for XSS, CSRF, and insecure storage patterns
- Review server-side code in `server/` for injection flaws, broken authentication, and insecure API configurations
- Validate that shared utilities in `shared/` do not introduce cross-cutting vulnerabilities
- Verify that `attached_assets/` handling prevents path traversal and malicious file uploads

## Best Practices
- Follow OWASP Top 10 guidelines and apply secure coding principles like input sanitization and least privilege access
- Stay updated on common vulnerabilities (e.g., via CVE databases) and integrate automated security scanning into CI/CD pipelines
- Consider the principle of least privilege by minimizing permissions in code, APIs, and infrastructure
- Document security decisions in ADRs and collaborate with the team on threat modeling for new features
- Use Content Security Policy (CSP) headers and Subresource Integrity (SRI) for client assets
- Enforce HTTPS/TLS for all data in transit and encrypt sensitive data at rest
- Implement rate limiting and request throttling on public-facing endpoints
- Regularly rotate secrets and API keys, storing them in environment variables or a secrets manager
- Conduct periodic penetration testing and red team exercises

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Stores static files such as images, documents, and other user-uploaded or attached assets used across the client and server. **Security focus:** Validate file types, scan for malware, prevent directory traversal.
- `client/` — Contains the frontend application code, including UI components, client-side routing, state management, and browser-specific logic. **Security focus:** XSS prevention, secure cookie handling, CSP enforcement.
- `server/` — Houses the backend codebase, including API endpoints, database models, authentication logic, and server-side business rules. **Security focus:** SQL/NoSQL injection, authentication/authorization, secure session management.
- `shared/` — Holds common utilities, types, constants, and modules reusable between client and server to avoid code duplication. **Security focus:** Ensure validation logic is consistent and not bypassed.

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
1. Confirm assumptions with issue reporters or maintainers before making security-related changes.
2. Review open pull requests affecting authentication, authorization, data handling, or dependency updates.
3. Cross-reference findings with [docs/security.md](../docs/security.md) and update accordingly.
4. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
5. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.
6. Coordinate with the DevOps/Infra agent for deployment-related security configurations.
7. Escalate critical vulnerabilities immediately and document in a security incident log.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Achieve zero high-severity vulnerabilities in monthly dependency scans and code audits
- Ensure 100% of pull requests involving sensitive data undergo security review, reducing resolution time for security issues by 40%
- Track trends over time to identify improvement areas, such as recurring vulnerability patterns or gaps in compliance coverage
- Maintain a vulnerability backlog with SLA targets: Critical < 24h, High < 7 days, Medium < 30 days

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors or security warnings during CI
**Root Cause:** Package versions incompatible with codebase or contain known vulnerabilities
**Resolution:**
1. Run `npm audit` or `yarn audit` to identify vulnerable packages
2. Review package.json for version ranges and update to patched versions
3. Test locally before committing
4. If a patch is unavailable, evaluate alternatives or apply workarounds
**Prevention:** Keep dependencies updated regularly, use lockfiles, enable Dependabot or Renovate for automated PRs

### Issue: Exposed Sensitive Data in Client-Side Code
**Symptoms:** API keys or secrets visible in bundled JavaScript files or browser dev tools
**Root Cause:** Hardcoded credentials in client code instead of environment variables or server-side handling
**Resolution:**
1. Scan code for hardcoded secrets using tools like git-secrets, truffleHog, or gitleaks
2. Move sensitive data to server-side configuration or use secure vaults (e.g., AWS Secrets Manager, HashiCorp Vault)
3. Regenerate any compromised keys and update .gitignore to prevent commits
4. Review git history for leaked secrets and consider BFG Repo-Cleaner if necessary
**Prevention:** Enforce code reviews for secrets, integrate secret scanning into CI, and educate team on secure configuration practices

### Issue: Insecure Direct Object References (IDOR)
**Symptoms:** Users can access unauthorized resources by manipulating IDs in URLs or requests
**Root Cause:** Lack of proper authorization checks on API endpoints
**Resolution:**
1. Audit API routes in `server/` for missing ownership or permission validations
2. Implement role-based access control (RBAC) or attribute-based checks
3. Add unit tests simulating unauthorized access attempts
4. Use UUIDs instead of sequential IDs where appropriate
**Prevention:** Include threat modeling in design reviews, use linters to flag potential IDOR patterns, and enforce authorization middleware

### Issue: Cross-Site Scripting (XSS) Vulnerabilities
**Symptoms:** User-supplied input rendered without sanitization, allowing script injection
**Root Cause:** Improper output encoding or use of `dangerouslySetInnerHTML` without validation
**Resolution:**
1. Audit `client/` components for unsafe rendering patterns
2. Use framework-provided escaping (React auto-escapes by default)
3. Implement Content Security Policy headers
4. Sanitize any HTML content with libraries like DOMPurify
**Prevention:** Code review checklist for XSS, automated SAST scanning, CSP reporting

### Issue: SQL/NoSQL Injection
**Symptoms:** Unexpected database queries, data leakage, or errors from malformed input
**Root Cause:** User input concatenated directly into queries
**Resolution:**
1. Review `server/` database queries for parameterization
2. Use ORM/ODM methods that handle escaping (e.g., Prisma, Mongoose)
3. Add input validation at API boundaries using `shared/` validators
**Prevention:** Ban raw query strings in code reviews, use prepared statements exclusively

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. For example: "Security audit complete; low-risk issues addressed inline. Remaining risk: Monitor third-party API integrations for upcoming CVEs. Follow-up: Schedule next quarterly review."

**Template:**
```
## Audit Summary — [Date]
**Scope:** [Files/features reviewed]
**Findings:**
- Critical: [count] — [status]
- High: [count] — [status]
- Medium: [count] — [status]
- Low: [count] — [status]

**Resolved This Session:**
- [Brief description of fixes applied]

**Remaining Risks:**
- [Risk 1]: [Mitigation plan]
- [Risk 2]: [Owner/timeline]

**Follow-up Actions:**
- [ ] [Action item 1]
- [ ] [Action item 2]

**Next Review:** [Scheduled date]
```

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., ADR #12 on encryption standards)
- Command output or logs that informed recommendations (e.g., `npm audit` results from commit abc123)
- Follow-up items for maintainers or future agent runs (e.g., "Human review needed for custom crypto implementation")
- Performance metrics and benchmarks where applicable (e.g., "Scan time reduced from 5min to 2min post-optimization")
- Screenshots or excerpts from security scanning tools (SAST/DAST reports)
- Compliance checklist status (OWASP, GDPR, SOC2 controls as applicable)

## Security Scanning Commands Reference
```bash
# Dependency vulnerability scan
npm audit
npm audit fix

# Secret scanning (requires gitleaks installed)
gitleaks detect --source . --verbose

# Static analysis (example with ESLint security plugin)
npx eslint --ext .js,.ts,.tsx . --rule 'security/*'

# Check for outdated packages
npm outdated
```

## Compliance Checklist
- [ ] OWASP Top 10 review completed for new features
- [ ] PII handling documented and encrypted at rest/in transit
- [ ] Authentication flows use secure session management
- [ ] API endpoints enforce authorization checks
- [ ] Third-party integrations reviewed for data sharing implications
- [ ] Logging excludes sensitive data (passwords, tokens, PII)
- [ ] Incident response plan documented and accessible
<!-- agent-update:end -->
