```markdown
---
ai_update_goal: Document security policies, authentication mechanisms, secrets management, compliance requirements, and incident response procedures
required_inputs:
  - Authentication/authorization implementation details
  - Secrets management strategy and storage locations
  - Compliance standards and audit requirements
  - Incident response contacts and procedures
success_criteria:
  - All authentication and authorization mechanisms documented
  - Secrets management practices clearly defined
  - Compliance obligations and evidence requirements listed
  - Incident response procedures include current contacts and tooling
---

<!-- agent-update:start:security -->
# Security & Compliance Notes

This document captures the security policies, authentication mechanisms, compliance requirements, and incident response procedures for the Generative Mailer project.

## Authentication & Authorization

### Identity & Session Management
- **Authentication Strategy**: The application uses session-based authentication with secure HTTP-only cookies
- **Session Storage**: Sessions are managed server-side with configurable storage (in-memory for development, persistent storage recommended for production)
- **Token Format**: Session tokens are cryptographically secure random strings stored in HTTP-only cookies with SameSite protection
- **Session Lifecycle**: 
  - Default session timeout: 24 hours of inactivity
  - Absolute session timeout: 7 days
  - Sessions invalidated on logout or security events

### Authorization Model
- **Role-Based Access Control (RBAC)**: User permissions are managed through role assignments
- **Permission Scopes**:
  - `user`: Standard authenticated user access
  - `admin`: Administrative privileges for user management and system configuration
  - `api`: Programmatic access for integrations
- **Authorization Enforcement**: Middleware validates permissions on protected routes before controller execution
- **API Security**: RESTful endpoints require valid session tokens; rate limiting applied per user/IP

### Security Headers
The application enforces security best practices through HTTP headers:
- `Strict-Transport-Security`: HSTS enabled for HTTPS enforcement
- `X-Content-Type-Options`: nosniff to prevent MIME type confusion
- `X-Frame-Options`: DENY to prevent clickjacking
- `Content-Security-Policy`: Restrictive CSP to mitigate XSS attacks

## Secrets & Sensitive Data

### Storage & Management
- **Environment Variables**: Secrets loaded from `.env` files (development) or environment configuration (production)
- **Sensitive Configuration**:
  - Database connection strings
  - API keys for external services (email providers, AI services)
  - Session secret keys
  - Encryption keys for data at rest
- **Production Recommendations**:
  - Use a secrets management service (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault)
  - Rotate secrets on a regular cadence (minimum quarterly)
  - Never commit secrets to version control (enforced by `.gitignore`)

### Data Classification
- **Public**: Marketing content, public documentation
- **Internal**: User-generated email templates, campaign metadata
- **Confidential**: User credentials (hashed), session tokens, API keys
- **Restricted**: Payment information (if applicable), compliance audit logs

### Encryption Practices
- **Data in Transit**: TLS 1.2+ required for all external communications
- **Data at Rest**: 
  - Database encryption enabled for production deployments
  - Passwords hashed using bcrypt with minimum work factor of 12
  - Sensitive fields encrypted using AES-256-GCM
- **Key Management**: Encryption keys stored separately from encrypted data; rotation procedures documented in runbooks

### Secret Rotation
- **Rotation Cadence**:
  - Database credentials: Quarterly
  - API keys: Semi-annually or on suspected compromise
  - Session secrets: Annually
  - Encryption keys: Annually with backward compatibility period
- **Rotation Procedure**: Documented in operational runbooks with zero-downtime migration steps

## Compliance & Policies

### Applicable Standards
- **GDPR (General Data Protection Regulation)**:
  - User consent management for email communications
  - Right to access, rectify, and delete personal data
  - Data portability support
  - Breach notification procedures (72-hour requirement)
- **CAN-SPAM Act**:
  - Unsubscribe mechanisms in all marketing emails
  - Accurate sender information and subject lines
  - Physical postal address inclusion
- **Data Retention**: User data retained for active accounts; deletion within 30 days of account closure request

### Evidence Requirements
- **Audit Logging**: All authentication events, authorization failures, and data access logged with timestamps and user context
- **Compliance Artifacts**:
  - User consent records with timestamps
  - Data processing agreements with third-party providers
  - Security assessment reports (annual)
  - Penetration test results (annual)
- **Data Subject Requests**: Documented procedures for handling access, deletion, and portability requests within regulatory timeframes

### Privacy Policies
- Privacy policy published and accessible to users
- Cookie policy and consent management for EU users
- Terms of service defining acceptable use and data handling

## Incident Response

### Detection & Monitoring
- **Security Monitoring Tools**:
  - Application logging with structured log aggregation
  - Failed authentication attempt tracking
  - Rate limiting and anomaly detection
  - Dependency vulnerability scanning (automated)
- **Alerting Thresholds**:
  - Multiple failed login attempts: 5 within 15 minutes
  - Unusual API usage patterns: 3x baseline traffic
  - Critical vulnerability disclosures: Immediate notification

### Incident Classification
- **P0 (Critical)**: Active data breach, service compromise, widespread outage
- **P1 (High)**: Suspected breach, authentication bypass, significant vulnerability
- **P2 (Medium)**: Isolated security issue, minor data exposure
- **P3 (Low)**: Potential vulnerability, security configuration improvement

### Escalation & Response
- **On-Call Contacts**:
  - Primary: Development team lead (see internal contact list)
  - Secondary: Security officer or designated security contact
  - Escalation: CTO or technical leadership
- **Response Steps**:
  1. **Detection**: Automated alerts or manual discovery
  2. **Triage**: Assess severity, scope, and impact (target: 15 minutes)
  3. **Containment**: Isolate affected systems, revoke compromised credentials
  4. **Investigation**: Root cause analysis, evidence preservation
  5. **Remediation**: Apply fixes, verify resolution
  6. **Communication**: Notify stakeholders per compliance requirements
  7. **Post-Incident**: Document lessons learned, update procedures

### Post-Incident Analysis
- **Incident Reports**: Required for P0/P1 incidents within 48 hours
- **Root Cause Analysis**: Five Whys or similar methodology
- **Remediation Tracking**: Action items assigned with owners and deadlines
- **Knowledge Base**: Incident summaries added to runbook for future reference

### Tooling
- **Logging & SIEM**: Centralized log aggregation for security event correlation
- **Incident Tracking**: Issue tracker for incident management workflow
- **Communication**: Dedicated incident response channel (Slack, Teams, etc.)
- **Forensics**: Log preservation and analysis tools for investigation

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. ✅ Confirmed authentication mechanisms match current session-based implementation
2. ✅ Documented secrets management practices and production recommendations
3. ✅ Listed applicable compliance standards (GDPR, CAN-SPAM) with evidence requirements
4. ✅ Defined incident response procedures with classification and escalation steps
5. ⚠️ On-call contacts reference internal documentation (update with specific contacts when available)
6. ⚠️ Production secrets management should specify the chosen vault solution when deployed

<!-- agent-readonly:sources -->
## Acceptable Sources
- Security architecture docs, runbooks, policy handbooks
- IAM/authorization configuration (code or infrastructure)
- Compliance updates from security or legal teams
- Session management implementation in `server/` codebase
- Environment variable configuration in `.env.example`
- HTTP security middleware configuration

<!-- agent-update:end -->
```
