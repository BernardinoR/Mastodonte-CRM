# Security Auditor Agent Playbook

## When to Use

This skill should be activated when:
- A security audit of the codebase is required.
- Specific security concerns related to authentication, authorization, input validation, or data handling need to be addressed.
- New features involving user authentication, data submission, or access control are implemented.
- A review of third-party dependencies for known vulnerabilities is necessary.

## Instructions

1.  **Identify Key Security Areas**: Focus on critical areas such as authentication (`server/auth.ts`, `client/src/shared/hooks/useSupabaseAuth.ts`, `client/src/features/auth/pages/SignIn.tsx`), authorization (`server/auth.ts` with functions like `requireRole`, `requireAdmin`, `requireGroupAccess`), input validation across forms (e.g., `client/src/features/auth/components/forms/LoginForm.tsx`, `client/src/features/auth/components/forms/TwoFactorForm.tsx`), and data handling.
2.  **Review Authentication Flows**: Analyze the authentication process implemented via Clerk and Supabase. Examine `client/src/app/App.tsx` for `AuthenticatedRouter` and how authentication state is managed. Check `client/src/features/auth/lib/authHelpers.ts` for helper functions like `handleClerkError` and `redirectAfterAuth`.
3.  **Audit Authorization Logic**: Inspect server-side middleware and functions in `server/auth.ts` (`clerkAuthMiddleware`, `requireRole`, `requireAdmin`, `requireGroupAccess`) to ensure access is correctly restricted based on user roles and permissions.
4.  **Examine Input Validation**: Scrutinize all forms and API endpoints that accept user input. Look for inconsistencies or missing validation in components like `client/src/features/auth/components/forms/LoginForm.tsx`, `client/src/features/auth/components/forms/TwoFactorForm.tsx`, and `client/src/features/auth/pages/SignIn.tsx`. Pay attention to how data is processed on the server before being used.
5.  **Check for OWASP Top 10 Vulnerabilities**: Systematically review the codebase for common vulnerabilities such as:
    *   **Injection**: Ensure that any database queries or command executions are parameterized and do not directly incorporate user input.
    *   **Broken Authentication**: Verify session management, password policies, and multi-factor authentication (e.g., `client/src/features/auth/components/forms/TwoFactorForm.tsx`).
    *   **Sensitive Data Exposure**: Review how sensitive information (passwords, tokens, PII) is stored, transmitted, and logged.
    *   **XML External Entities (XXE)**: If XML is processed, ensure it's done securely.
    *   **Broken Access Control**: Verify that users can only access resources and perform actions they are authorized for, paying close attention to the authorization functions in `server/auth.ts`.
    *   **Security Misconfiguration**: Check server configurations and framework settings for security best practices.
    *   **Cross-Site Scripting (XSS)**: Ensure user-generated content is properly escaped before being rendered in the UI.
    *   **Insecure Deserialization**: If applicable, ensure deserialized data is validated.
    *   **Using Components with Known Vulnerabilities**: Audit `package.json` and associated lock files for outdated or vulnerable dependencies.
    *   **Insufficient Logging & Monitoring**: Verify that security-relevant events are logged adequately.
6.  **Analyze Server-Side Security**: Pay close attention to `server/auth.ts` and any other server-side logic that handles authentication, authorization, and sensitive data.
7.  **Review Client-Side Security**: Examine client-side logic in `client/src/features/auth/` and `client/src/shared/` for potential vulnerabilities like DOM-based XSS, insecure handling of tokens, or insufficient client-side validation that bypasses server protections.
8.  **Dependency Audit**: Use tools or manual inspection to check `package.json` for outdated dependencies that may have known security vulnerabilities.
9.  **Report Findings**: Document all identified vulnerabilities, categorizing them by severity and providing clear, actionable recommendations for remediation. Reference specific file paths and line numbers.

## Examples

**Example 1: Auditing Authorization Logic**

*   **Input**: Review the `server/auth.ts` file.
*   **Analysis**: Examine the implementation of `requireRole` and `requireAdmin`. Check if these middleware correctly verify the user's role obtained from the Clerk authentication context before allowing access to a route. Ensure that `requireGroupAccess` properly checks group membership.
*   **Potential Vulnerability**: If `requireAdmin` only checks for the existence of a role and not its specific value (e.g., "admin"), it might incorrectly grant access to non-admin users.
*   **Expected Output Snippet**:
    ```
    Vulnerability Found: Insufficient role check in 'requireAdmin' middleware.
    File: server/auth.ts
    Line: 69
    Description: The 'requireAdmin' function checks for the presence of a role but does not verify if the role is specifically 'admin'. This could lead to privilege escalation if other roles exist that are not strictly 'admin'.
    Recommendation: Modify the role check to explicitly compare against the 'admin' role, e.g., `if (!user.roles.includes('admin')) { ... }`.
    ```

**Example 2: Input Validation in Login Form**

*   **Input**: Examine `client/src/features/auth/components/forms/LoginForm.tsx` and corresponding server-side handling.
*   **Analysis**: Verify that the `LoginForm` component performs client-side validation on email and password fields. Crucially, confirm that the server-side endpoint receiving these credentials performs its own *independent* validation and sanitization before attempting authentication. Look for potential issues like SQL injection if credentials were being used directly in database queries (though Clerk abstracts much of this).
*   **Potential Vulnerability**: Hardcoding credentials or weak validation on the server could be exploited. Relying solely on client-side validation is insecure as it can be bypassed.
*   **Expected Output Snippet**:
    ```
    Security Observation: Login form input validation.
    File: client/src/features/auth/components/forms/LoginForm.tsx
    Description: Client-side validation for email and password exists.
    Recommendation: Ensure that the backend API endpoint handling login requests performs robust, server-side validation and sanitization of the email and password fields before processing. Confirm that no sensitive information from the input is logged insecurely.
    ```

**Example 3: Auditing Dependency Vulnerabilities**

*   **Input**: Analyze `package.json` and `package-lock.json`.
*   **Analysis**: Use a tool like `npm audit` or `yarn audit` to check for known vulnerabilities in installed packages.
*   **Potential Vulnerability**: An outdated version of a utility library might contain a known XSS vulnerability.
*   **Expected Output Snippet**:
    ```
    Vulnerability Found: High severity vulnerability in dependency 'some-utility-library'.
    File: package.json / package-lock.json
    Description: The installed version '1.2.0' of 'some-utility-library' has a known vulnerability (CVE-2023-XXXXX) related to improper input sanitization, potentially leading to XSS attacks.
    Recommendation: Update 'some-utility-library' to the latest non-vulnerable version (e.g., '1.2.1' or higher). Run `npm audit fix` or `yarn upgrade some-utility-library`.
    ```

## Guidelines

*   **Prioritize High-Impact Areas**: Focus initial audits on authentication, authorization, and data handling as these are common sources of critical vulnerabilities.
*   **Contextualize Findings**: Understand the application's architecture (React frontend, Express backend, Clerk for auth) to identify vulnerabilities specific to this stack. For example, be mindful of how client-side state might expose information if not handled carefully.
*   **Assume Input is Malicious**: Treat all data coming from external sources (user input, API requests) as potentially malicious until proven otherwise through validation.
*   **Validate Both Sides**: Always ensure that validation and sanitization occur on *both* the client-side (for UX) and, more importantly, the server-side (for security).
*   **OWASP Top 10 is a Baseline**: While focusing on OWASP Top 10 is crucial, also be aware of other emerging threats and common security pitfalls.
*   **Leverage Existing Security Tools**: Utilize linters, static analysis tools (if configured), and dependency scanners (`npm audit`, `yarn audit`) as part of the auditing process.
*   **Refer to Project Documentation**: Consult `README.md` and `architecture.md` for insights into the project's intended security measures and data flows.
*   **Be Specific in Recommendations**: Provide clear, actionable steps for remediation, including file names, line numbers, and code examples.
*   **Report Inconsistencies**: Highlight discrepancies between intended security (as per documentation) and actual implementation.
*   **Don't Modify Code Directly (unless instructed)**: The primary role is to audit and report. If modifications are required, it should be a separate, deliberate step.
