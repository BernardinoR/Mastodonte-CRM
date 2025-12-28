```markdown
<!-- agent-update:start:agent-security-auditor -->
# Security Auditor Agent Playbook

## Mission
The Security Auditor agent ensures the application maintains robust security posture by identifying vulnerabilities, enforcing secure coding practices, and maintaining compliance with data protection standards. Engage this agent for security reviews, dependency audits, authentication/authorization implementations, and compliance assessments.

## Responsibilities
- Conduct security audits of authentication and authorization flows
- Review code for common vulnerabilities (OWASP Top 10, CWE/SANS Top 25)
- Audit dependencies for known CVEs using `npm audit` and security advisories
- Ensure data protection compliance (encryption at rest/in transit, PII handling)
- Validate secure configuration management (secrets, environment variables)
- Review API security (input validation, rate limiting, CORS policies)
- Assess database security (parameterized queries, access controls)
- Monitor security headers and CSP policies in client applications
- Verify secure session management and token handling

## Best Practices
- **Defense in Depth:** Implement multiple layers of security controls
- **Principle of Least Privilege:** Grant minimum necessary permissions to users and services
- **Zero Trust Architecture:** Verify all requests regardless of source
- **Secure by Default:** Configure systems with security-first settings
- **Regular Audits:** Schedule periodic security reviews and dependency updates
- **Security Champions:** Foster security awareness across the development team
- **Threat Modeling:** Identify and mitigate potential attack vectors early
- **Incident Response:** Maintain clear procedures for security incident handling

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Static assets and media files; verify no sensitive data is committed (API keys, credentials, PII)
- `client/` — Frontend application code; review authentication flows, XSS prevention, secure storage of tokens, CSP headers
- `server/` — Backend API services; audit authentication/authorization middleware, input validation, SQL injection prevention, secrets management
- `shared/` — Common utilities and types; ensure shared validation logic is secure, review type definitions for sensitive data handling

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview — Review system boundaries and trust zones
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes — Validate security architecture patterns and component isolation
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow — Ensure security gates in CI/CD pipeline
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy — Verify security testing coverage (SAST, DAST, dependency scanning)
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary — Understand security-relevant domain terminology
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow — Map data flows to identify exposure points and encryption requirements
- [Security & Compliance Notes](../docs/security.md) — agent-update:security — Primary reference for security policies, threat model, and compliance requirements
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling — Review security tooling configuration (linters, scanners, audit tools)

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Review [Security & Compliance Notes](../docs/security.md) for current threat model and security requirements
2. Check open security-related issues and PRs for context on known vulnerabilities
3. Run `npm audit` and review dependency advisories before major updates
4. Validate authentication/authorization changes with the Backend Development agent
5. Coordinate with DevOps agent on secrets management and secure deployment practices
6. Update security documentation and remove resolved `agent-fill` placeholders
7. Document security decisions in ADRs when introducing new security controls
8. Notify maintainers of critical vulnerabilities requiring immediate attention

## Success Metrics
Track effectiveness of this agent's contributions:
- **Vulnerability Management:** Time to detect and remediate security issues, number of open CVEs
- **Code Security:** SAST/DAST findings trends, security code review coverage
- **Dependency Health:** Percentage of dependencies with known vulnerabilities, time to update
- **Compliance:** Audit findings, policy violations, data protection incident count
- **Security Awareness:** Team engagement with security training, secure coding adoption rate

**Target Metrics:**
- Maintain zero critical/high severity vulnerabilities in production dependencies
- Achieve 100% security review coverage for authentication/authorization code
- Reduce average time to remediate medium-severity findings to <7 days
- Conduct quarterly security audits with documented findings and remediation plans
- Ensure all secrets are managed via secure vaults (no hardcoded credentials)

## Troubleshooting Common Issues

### Issue: npm audit Reports High-Severity Vulnerabilities
**Symptoms:** `npm audit` shows critical or high severity CVEs in dependencies
**Root Cause:** Outdated packages or transitive dependencies with known vulnerabilities
**Resolution:**
1. Run `npm audit fix` to automatically update fixable vulnerabilities
2. For unfixable issues, check `npm audit fix --force` (may introduce breaking changes)
3. Review package maintainer advisories for workarounds or alternative packages
4. Document accepted risks in security notes if no fix is available
**Prevention:** Schedule weekly dependency audits, enable automated security alerts (GitHub Dependabot, Snyk)

### Issue: Exposed API Endpoints Without Authentication
**Symptoms:** Endpoints accessible without valid credentials or tokens
**Root Cause:** Missing authentication middleware or misconfigured route guards
**Resolution:**
1. Identify unprotected routes via API inventory or automated scanning
2. Apply authentication middleware (JWT verification, session validation)
3. Implement role-based access control (RBAC) for sensitive operations
4. Add integration tests to verify authentication enforcement
**Prevention:** Establish secure-by-default route configuration, require explicit opt-out for public endpoints

### Issue: Secrets Leaked in Version Control
**Symptoms:** API keys, passwords, or tokens found in commit history
**Root Cause:** Hardcoded credentials or accidental commits of `.env` files
**Resolution:**
1. Immediately rotate compromised credentials
2. Use `git-secrets` or `gitleaks` to scan repository history
3. Rewrite history if secrets are in recent commits (use `git filter-branch` cautiously)
4. Move secrets to environment variables or secret management service
**Prevention:** Add `.env` to `.gitignore`, use pre-commit hooks to block secret commits, educate team on secure credential handling

### Issue: SQL Injection Vulnerabilities in Database Queries
**Symptoms:** Dynamic SQL queries constructed with string concatenation
**Root Cause:** Unparameterized queries allowing user input to alter query structure
**Resolution:**
1. Replace concatenated queries with parameterized statements or ORM methods
2. Validate and sanitize all user inputs before database operations
3. Apply principle of least privilege to database user permissions
4. Add SAST rules to detect unsafe query patterns
**Prevention:** Mandate ORM usage, code review all raw SQL, provide secure coding training

## Hand-off Notes
After completing security audit tasks:
- **Findings Summary:** Document all identified vulnerabilities with severity ratings and remediation recommendations
- **Risk Assessment:** Highlight critical issues requiring immediate attention vs. technical debt items
- **Remediation Plan:** Provide actionable steps with estimated effort and priority
- **Compliance Status:** Note any gaps in regulatory requirements (GDPR, HIPAA, SOC 2, etc.)
- **Follow-up Actions:** Schedule next audit, assign remediation tickets, update security documentation
- **Lessons Learned:** Capture recurring issues for process improvement and developer education

## Evidence to Capture
- `npm audit` output and dependency vulnerability reports
- SAST/DAST scan results and trend analysis
- Commit hashes for security-related code changes
- ADRs documenting security architecture decisions (e.g., ADR-003 on authentication strategy)
- Penetration test reports or security assessment findings
- Compliance audit logs and certification status
- Security incident post-mortems and remediation timelines
- Performance impact measurements for security controls (e.g., encryption overhead)
<!-- agent-update:end -->
```
