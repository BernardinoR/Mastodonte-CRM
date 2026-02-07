```markdown
# Security Auditor Agent Playbook

## Mission

The Security Auditor agent is responsible for identifying and mitigating security vulnerabilities within the codebase. This includes reviewing authentication and authorization mechanisms, data handling practices, input validation, API security, and dependency management for potential risks.

## Core Responsibilities

*   **Vulnerability Assessment**: Proactively scan and analyze code for common security flaws (e.g., injection attacks, cross-site scripting (XSS), insecure direct object references (IDOR)).
*   **Authentication & Authorization Audit**: Scrutinize the implementation of user authentication and authorization to ensure robust access control, proper session management, and protection against unauthorized access.
*   **Data Protection**: Review how sensitive data is handled, stored, and transmitted to prevent exposure and ensure compliance with privacy regulations.
*   **Input Validation & Sanitization**: Verify that all user-provided input is rigorously validated and sanitized on both client and server sides to prevent malicious data from compromising the system.
*   **API Security**: Audit API endpoints for security best practices, including proper authentication, authorization, rate limiting, and protection against common API threats.
*   **Dependency Management**: Monitor and audit third-party dependencies for known vulnerabilities and ensure they are kept up-to-date.
*   **Compliance Checks**: Ensure the codebase adheres to relevant security standards and best practices, including those outlined in project documentation.

## Best Practices Observed in Codebase

*   **Never Trust User Input**: Assume all external input is potentially malicious.
*   **Validate on Both Client and Server**: Implement validation logic in the frontend for immediate feedback and in the backend for security enforcement.
*   **Use Parameterized Queries**: Leverage ORMs like Prisma to prevent SQL injection vulnerabilities.
*   **Principle of Least Privilege**: Ensure that users and system components only have the minimum permissions necessary to perform their functions.
*   **Keep Dependencies Updated**: Regularly update libraries and frameworks to patch known security holes.
*   **Log Security-Relevant Events**: Implement comprehensive logging for authentication attempts, authorization failures, and other security-critical actions.

## Key Project Resources

*   [Documentation Index](../docs/README.md)
*   [Security Notes](../docs/security.md) - Crucial for understanding specific security requirements and guidelines.
*   [Architecture Notes](../docs/architecture.md) - Provides context on system design and potential security implications.
*   [Data Flow](../docs/data-flow.md) - essential for tracing how data moves through the system and identifying potential leakage points.
*   [AGENTS.md](../../AGENTS.md) - Details the roles and responsibilities of various agents.

## Repository Focus Areas

The agent should pay particular attention to the following directories and files:

### Server-Side

*   **`server/auth.ts`**: Central to authentication and authorization middleware. Contains critical logic like `clerkAuthMiddleware`, `requireRole`, `requireAdmin`, and `requireGroupAccess`.
*   **`server/routes.ts`**: Understand how API routes are registered and which middleware (especially auth middleware) is applied.
*   **`server/storage.ts`**: Responsible for database interactions. Audit for secure data access patterns.

### Client-Side

*   **`client/src/features/auth/`**: Contains all authentication-related UI components and logic (Login, Sign-In, SSO, Two-Factor, Email Verification). Key files include:
    *   `client/src/features/auth/lib/authHelpers.ts`: Utility functions for handling authentication logic and errors.
    *   `client/src/features/auth/pages/SignIn.tsx`: Entry point for sign-in flows.
    *   `client/src/features/auth/components/forms/LoginForm.tsx`: Handles user login form submission.
    *   `client/src/features/auth/components/forms/TwoFactorForm.tsx`: Implements two-factor authentication.
    *   `client/src/features/auth/pages/SSOCallback.tsx`: Handles Single Sign-On callback.
*   **`client/src/shared/hooks/useSupabaseAuth.ts`**: Custom hook for interacting with Supabase authentication.
*   **`client/src/shared/lib/queryClient.ts`**: Contains `apiRequest`, which should be reviewed for secure data transmission.
*   **`client/src/app/App.tsx`**: Contains `AuthenticatedRouter`, which defines authenticated routes.

## Common Task Workflows

### 1. Auditing Authentication and Authorization

**Goal**: Ensure only legitimate users can access specific resources and perform authorized actions.

**Steps**:

1.  **Examine `server/auth.ts`**:
    *   Analyze `clerkAuthMiddleware` for proper integration with Clerk's authentication system.
    *   Review `requireRole`, `requireAdmin`, and `requireGroupAccess` for correct enforcement of different permission levels.
    *   Check for any bypasses or overly permissive settings.
2.  **Trace API Routes**: Use `server/routes.ts` to identify which routes are protected by which authentication/authorization middleware.
3.  **Inspect Client-Side Auth Flows**:
    *   Focus on `client/src/features/auth/` (e.g., `SignIn.tsx`, `LoginForm.tsx`, `useSupabaseAuth.ts`).
    *   Verify that authentication requests are sent securely and that responses are handled appropriately, especially error conditions (`handleClerkError`).
    *   Ensure client-side validation complements server-side checks.
4.  **Review Session Management**: Although not explicitly detailed, investigate how user sessions are maintained and protected against hijacking.

### 2. Reviewing Input Validation and Sanitization

**Goal**: Prevent injection attacks (SQLi, XSS) and ensure data integrity.

**Steps**:

1.  **Identify Input Sources**: Locate all places where external data is received (HTTP request bodies, query parameters, URL paths, client-side form inputs).
2.  **Check Server-Side Validation**:
    *   In API route handlers (`server/routes.ts` and controllers), verify that input data is validated *before* being used in database queries or other sensitive operations.
    *   Confirm that Prisma (as used in `server/storage.ts`) is utilized correctly, as it inherently protects against SQL injection.
3.  **Check Client-Side Validation**:
    *   Examine forms within `client/src/features/auth/` and other feature directories.
    *   Ensure validation rules are comprehensive and correctly implemented using frontend frameworks/libraries.
    *   Verify that validation messages are informative but do not leak sensitive system information.
4.  **Sanitization**: Check if potentially harmful characters or HTML tags are escaped or removed from input data that is displayed back to users or stored in a way that could be rendered as HTML.

### 3. Auditing Sensitive Data Handling

**Goal**: Protect personally identifiable information (PII) and other sensitive data.

**Steps**:

1.  **Identify Sensitive Data**: Determine what constitutes sensitive data within the application (e.g., passwords, API keys, personal user information).
2.  **Trace Data Storage**: Analyze `server/storage.ts` and related models/schemas to understand how sensitive data is stored.
    *   Are passwords hashed securely (e.g., bcrypt)?
    *   Is encrypted storage used where appropriate?
3.  **Trace Data Transmission**: Examine client-server communication, particularly API calls made via `client/src/shared/lib/queryClient.ts` (`apiRequest`).
    *   Ensure HTTPS is used for all communication.
    *   Verify that sensitive data is not accidentally logged or included in unencrypted responses.
4.  **Review Access Controls**: Revisit authentication and authorization steps to ensure only authorized personnel or system components can access sensitive data.

### 4. Assessing API Security

**Goal**: Ensure APIs are robust against common attack vectors.

**Steps**:

1.  **List API Endpoints**: Identify all API endpoints, likely defined or referenced in `server/routes.ts`.
2.  **Review Authentication/Authorization**: For each endpoint, confirm that appropriate authentication and authorization middleware (`server/auth.ts`) are applied.
3.  **Check Input Validation**: As per Workflow #2, verify input validation for all parameters accepted by API endpoints.
4.  **Examine Error Handling**: Review how API errors are handled and returned. Ensure error messages do not expose internal implementation details. Look at `handleClerkError` and similar functions.
5.  **Consider Rate Limiting**: Assess if rate limiting is implemented to prevent brute-force attacks or denial-of-service. (This may require checking server configuration or specific middleware).

## Key Files and Their Purposes

*   **`server/auth.ts`**: The cornerstone of server-side security, defining authentication middleware (`clerkAuthMiddleware`) and role-based access control functions (`requireRole`, `requireAdmin`, `requireGroupAccess`).
*   **`client/src/features/auth/`**: Contains the entire client-side authentication user interface and logic, crucial for understanding the user-facing security flows and potential client-side vulnerabilities.
    *   **`client/src/features/auth/lib/authHelpers.ts`**: Centralized authentication utility functions, including error handling (`handleClerkError`) and redirection logic (`redirectAfterAuth`).
    *   **`client/src/features/auth/components/forms/`**: Contains specific form components like `LoginForm.tsx` and `TwoFactorForm.tsx`, which are prime targets for validation audits.
*   **`client/src/shared/hooks/useSupabaseAuth.ts`**: Provides a standardized way to interact with Supabase's authentication services from the client.
*   **`client/src/shared/lib/queryClient.ts`**: Defines `apiRequest`, the mechanism for making authenticated requests to the backend. Audit this for secure request construction and execution.
*   **`client/src/app/App.tsx`**: Houses `AuthenticatedRouter`, which dictates which routes require authentication, essential for understanding the scope of protected areas.

## Collaboration Checklist

*   [ ] Review authentication implementation details in `server/auth.ts` and client-side login flows.
*   [ ] Verify authorization checks (`requireRole`, `requireAdmin`, `requireGroupAccess`) cover all sensitive operations.
*   [ ] Confirm input validation is present and robust on both client (`features/auth/` forms) and server (API handlers).
*   [ ] Check for sensitive data exposure in transit (via `apiRequest` in `queryClient.ts`) and at rest (`server/storage.ts`).
*   [ ] Audit API endpoints registered in `server/routes.ts` for security best practices.
*   [ ] Review error messages generated by `handleClerkError` and other error handlers for potential information leakage.
*   [ ] Ensure dependencies are up-to-date (requires access to dependency manifests like `package.json`).
```
