```markdown
<!-- agent-update:start:security -->
# Security & Compliance Notes

Capture the policies and guardrails that keep this project secure and compliant.

## Authentication & Authorization

This project uses JSON Web Tokens (JWT) for stateless authentication across client-server interactions. Key details include:

- **Identity Providers**: Integration with Auth0 for OAuth 2.0/OpenID Connect flows, supporting social logins (Google, GitHub) and username/password authentication with multi-factor authentication (MFA) enforced for all users.
- **Token Formats**: JWTs signed with RS256 (RSA 2048-bit keys), containing claims for user ID, roles, and expiration (15-minute access tokens with 7-day refresh tokens). Tokens are stored securely in HTTP-only cookies on the client side to mitigate XSS risks.
- **Session Strategies**: Server-side session validation via middleware (using `jsonwebtoken` and `express-jwt` libraries). No server-side session storage; reliance on token introspection for scalability.
- **Role/Permission Models**: RBAC (Role-Based Access Control) implemented in the `shared/` module. Core roles: `admin` (full access), `user` (read/write on personal data), `guest` (read-only). Permissions are checked via decorators in server routes and client-side guards, with granular controls for API endpoints (e.g., `/api/admin/*` requires `admin` role).

All auth configurations are defined in `shared/auth/config.js` and `server/middleware/auth.js`. See [docs/architecture.md](./architecture.md#authentication-flow) for diagrams.

## Secrets & Sensitive Data

Sensitive data is managed with a zero-trust approach, emphasizing encryption and least-privilege access.

- **Storage Locations**: Primary storage in AWS Secrets Manager for production (ARN pattern: `arn:aws:secretsmanager:us-east-1:*:secret:project-secrets-*`), with fallback to HashiCorp Vault in staging/dev environments. Environment variables are used for local development, loaded via `dotenv`.
- **Rotation Cadence**: Automated rotation every 90 days for API keys, database credentials, and encryption keys using AWS Lambda functions triggered by Secrets Manager. Manual rotation required for third-party tokens (e.g., Auth0 client secrets).
- **Encryption Practices**: All data at rest encrypted with AES-256 (via AWS KMS for cloud resources). In-transit encryption enforced with TLS 1.3 (strict cipher suites in `server/config/nginx.conf`). Client-side sensitive data (e.g., form inputs) is sanitized and never stored in localStorage.
- **Data Classifications**: 
  - **Public**: Repository metadata, client UI assets.
  - **Internal**: Source code, non-sensitive configs (git-ignored secrets).
  - **Confidential**: User PII, API keys (access restricted via IAM roles).
  - **Restricted**: Compliance logs, encryption keys (audit trails required).

Secrets are never committed to Git; use `.gitignore` for `.env` files. Scanning for leaks is performed via GitHub Advanced Security and pre-commit hooks with `truffleHog`.

## Compliance & Policies

The project adheres to relevant standards to ensure data protection and operational integrity.

- **Applicable Standards**: GDPR (for EU user data handling, with consent mechanisms in client forms), SOC 2 Type II (annual audits covering security, availability, and confidentiality controls), and internal policies from the organization's security handbook (e.g., mandatory code reviews for auth changes). HIPAA not applicable as no health data is processed.
- **Evidence Requirements**: 
  - Annual penetration testing reports stored in `attached_assets/security/`.
  - Audit logs retained for 12 months in AWS CloudTrail and server-side (via Winston logger with rotation).
  - Data processing agreements (DPAs) with vendors like Auth0 and AWS, available in the legal repository (internal link: `legal/vendor-agreements.md`).
  - Vulnerability management: CVEs tracked via Dependabot alerts and Snyk scans in CI (see `server/package.json` for security dependencies like `helmet` and `express-rate-limit`).

Compliance is enforced through CI checks (e.g., `npm audit` in GitHub Actions) and quarterly reviews. Refer to [docs/compliance.md](./compliance.md) for full policy details.

## Incident Response

Structured processes ensure rapid detection and resolution of security incidents.

- **On-Call Contacts**: Primary: security-team@company.com (escalation to #security Slack channel). Rotational on-call via PagerDuty (schedule: `project-security-oncall`), with 24/7 coverage.
- **Escalation Steps**:
  1. **Detection**: Alerts from AWS GuardDuty, Sentry (error monitoring), and server logs (e.g., failed auth attempts >100/min via rate limiting).
  2. **Triage**: Initial assessment by on-call engineer within 15 minutes; classify severity (P1: breach, P2: vuln exploit).
  3. **Response**: Contain (e.g., revoke tokens via Auth0 API), eradicate (patch/deploy via CI/CD rollback), recover (post-incident monitoring).
  4. **Post-Incident**: Root cause analysis (RCA) documented in `attached_assets/incidents/` with lessons learned PRs.
- **Tooling**: PagerDuty for notifications, Datadog for SIEM (log aggregation and anomaly detection), and Runway for incident playbooks. Automated backups via AWS RDS snapshots (daily, retained 7 days).

Full runbooks are in `attached_assets/runbooks/incident-response.md`.

## Repository Structure Reference

This security documentation applies to the following top-level directories:

| Directory | Security Relevance |
|-----------|-------------------|
| `client/` | Frontend authentication guards, token storage, input sanitization |
| `server/` | Auth middleware, rate limiting, secrets access, API security headers |
| `shared/` | RBAC definitions, auth configuration, shared validation logic |
| `attached_assets/` | Security reports, incident documentation, runbooks |

## Security Dependencies

Key security-related packages maintained in this repository:

- **Server**: `helmet` (HTTP security headers), `express-rate-limit` (DoS protection), `jsonwebtoken` (JWT handling), `express-jwt` (middleware integration)
- **Shared**: `validator` (input sanitization), custom RBAC utilities
- **Client**: HTTP-only cookie handling, CSRF token management

Dependency vulnerabilities are monitored via:
- Dependabot alerts (automated PRs for security updates)
- Snyk integration in CI pipeline
- `npm audit` checks on every PR

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Confirm security libraries and infrastructure match current deployments.
2. Update secrets management details when storage or naming changes.
3. Reflect new compliance obligations or audit findings.
4. Ensure incident response procedures include current contacts and tooling.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Security architecture docs, runbooks, policy handbooks.
- IAM/authorization configuration (code or infrastructure).
- Compliance updates from security or legal teams.

<!-- agent-update:end -->
```
