# Security & Compliance Notes

This document covers the security model, authentication, authorization, and compliance considerations for the application.

## Authentication

### Clerk Integration

The system utilizes [Clerk](https://clerk.com) for robust user authentication. Key features include:

*   **Session Management**: Implemented using JWT-based sessions with automatic refresh mechanisms to ensure continuous user access without frequent re-logins.
*   **Social Login**: Supports authentication via popular OAuth providers such as Google and GitHub, simplifying the login process for users.
*   **Multi-factor Authentication**: An optional two-factor authentication (2FA) layer is available to significantly enhance account security.
*   **Password Policies**: Configurable password requirements are enforced to ensure users create strong, secure passwords.

### Authentication Flow

The authentication process between the user, frontend, Clerk, and backend is visualized below:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Clerk
    participant Backend
    
    User->>Frontend: Login request
    Frontend->>Clerk: Authenticate
    Clerk-->>Frontend: JWT token
    Frontend->>Backend: API request + JWT
    Backend->>Clerk: Verify token
    Clerk-->>Backend: User claims
    Backend-->>Frontend: Protected data
```

### Token Handling

*   **Storage**: Authentication tokens are securely stored in HTTP-only cookies, mitigating risks associated with Cross-Site Scripting (XSS) attacks.
*   **Refresh**: Tokens are automatically refreshed before their expiration to provide a seamless user experience.
*   **Transmission**: All token transmissions are secured using HTTPS to prevent eavesdropping.
*   **Revocation**: Token revocation is handled upon user logout to ensure immediate termination of sessions.

## Authorization

### Role-Based Access Control (RBAC)

Access to system resources is managed through Role-Based Access Control (RBAC), ensuring users only have permissions necessary for their roles.

| Role    | Capabilities                                                        |
| :------ | :------------------------------------------------------------------ |
| Admin   | Full system access, user management, configuration                  |
| Manager | Team management, client oversight, reporting                        |
| User    | Own tasks, assigned clients, meeting participation                  |

### Permission Matrix

The following matrix details resource access based on user roles:

| Resource        | Admin | Manager     | User        |
| :-------------- | :---- | :---------- | :---------- |
| View all tasks  | Yes   | Yes (group) | No          |
| Create tasks    | Yes   | Yes         | Yes         |
| Assign tasks    | Yes   | Yes         | No          |
| Delete tasks    | Yes   | No          | No          |
| View all clients| Yes   | Yes (group) | No          |
| Create clients  | Yes   | Yes         | No          |
| Manage users    | Yes   | No          | No          |

### Middleware Implementation

Authorization logic is enforced server-side using middleware. For example, the `requireRole` function checks if the authenticated user's role matches the required roles for an endpoint.

```typescript
// server/auth.ts
export function requireRole(roles: string[]) {
  return (req, res, next) => {
    const userRole = req.auth?.sessionClaims?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

export const requireAdmin = requireRole(['admin']);
```

## Data Protection

### Database Security

*   **Connection Encryption**: All database connections are encrypted using TLS to protect data in transit.
*   **Credentials Management**: Sensitive database credentials are managed securely via environment variables, never hardcoded.
*   **SQL Injection Prevention**: The ORM (Prisma) used by the application automatically handles query parameterization, effectively preventing SQL injection vulnerabilities.
*   **Access Control**: Database users are configured with the principle of least privilege, granting only the necessary permissions for application operation.

### API Security

*   **CORS Configuration**: Cross-Origin Resource Sharing (CORS) is strictly configured to allow requests only from explicitly defined, trusted origins.
*   **Rate Limiting**: Implementing rate limiting on API endpoints is recommended to protect against brute-force attacks and general abuse.
*   **Input Validation**: All incoming data from the client is rigorously validated on the server-side to ensure data integrity and prevent malicious inputs.
*   **Error Handling**: API responses provide generic error messages to avoid leaking sensitive information about the server's internal state or potential vulnerabilities.

### Sensitive Data Handling

| Data Type      | Protection Mechanism                                 |
| :------------- | :--------------------------------------------------- |
| Passwords      | Managed by Clerk (hashed and salted)                 |
| API Keys       | Stored exclusively in environment variables          |
| User PII       | Access is strictly controlled by user role           |
| Session Tokens | Stored in HTTP-only cookies, transmitted over HTTPS |

## Security Headers

To enhance the security posture of the application, the following security-related HTTP headers are recommended for production environments:

```typescript
// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevents MIME-sniffing
  res.setHeader('X-Frame-Options', 'DENY'); // Prevents clickjacking by disallowing framing
  res.setHeader('X-XSS-Protection', '1; mode=block'); // Enables built-in XSS protection
  res.setHeader('Strict-Transport-Security', 'max-age=31536000'); // Enforces HTTPS
  next();
});
```

## Audit & Logging

### Activity Logging

Comprehensive logging is crucial for security monitoring and incident investigation. The system logs events such as:

*   User authentication events (successful logins, logouts, failed attempts).
*   Data modification events (creation, updates, deletions of key resources).
*   Administrative actions (user management, system configuration changes).

### Task History

The `TaskHistory` entity provides an immutable log of all changes made to tasks. Each entry details:

*   The user responsible for the modification.
*   The timestamp of the change.
*   A record of the specific fields that were altered, including their previous and new values.

## Compliance Considerations

### Data Retention

*   **User Data**: User data is retained as long as their account is active. Upon account deletion, personal data is purged, though anonymized audit logs may be retained for a defined period.
*   **Meeting Notes**: Meeting notes are retained in accordance with business record-keeping policies.

### Privacy

*   **Minimal Data Collection**: Adheres to the principle of collecting only the data strictly necessary for application functionality.
*   **User Consent**: User consent is obtained for data processing activities where applicable.
*   **Data Export**: Functionality for users to export their data is provided, supporting GDPR compliance.
*   **Right to Deletion**: The system is designed to support user requests for data deletion, aligning with privacy regulations.

## Security Checklist

### Development Phase

*   [ ] Never commit secrets (API keys, passwords, etc.) to version control.
*   [ ] Utilize environment variables for all sensitive configuration and credentials.
*   [ ] Implement robust validation and sanitization for all user-provided input.
*   [ ] Ensure all database queries are parameterized (Prisma assists with this).

### Deployment Phase

*   [ ] Always enable HTTPS for secure communication.
*   [ ] Configure and deploy recommended security headers.
*   [ ] Implement rate limiting on public-facing APIs.
*   [ ] Set up comprehensive logging and monitoring systems.
*   [ ] Regularly update all project dependencies to patch known vulnerabilities.

### Operations Phase

*   [ ] Conduct regular security audits and vulnerability assessments.
*   [ ] Establish and maintain an incident response plan.
*   [ ] Implement and test regular backup and recovery procedures.
*   [ ] Periodically review user access permissions.

## Related Resources

*   [Architecture Notes](./architecture.md)
*   [Development Workflow](./development-workflow.md)
