# Bug Investigation Skill Playbook

## When to Use

This skill should be activated when a bug, defect, or unexpected behavior is reported or detected within the application. Its purpose is to systematically investigate the issue, identify its root cause, and provide sufficient information to facilitate a fix.

## Instructions

1.  **Understand the Bug Report:**
    *   Carefully read the bug report, noting the reported behavior, steps to reproduce, severity, and any provided context (e.g., environment, user details, screenshots).
    *   If the report is unclear or lacks detail, ask clarifying questions.

2.  **Reproduce the Bug:**
    *   Follow the provided steps to attempt to reproduce the bug in a controlled environment (e.g., development or staging environment).
    *   If the bug is not immediately reproducible, try variations on the steps or explore related functionalities.
    *   Document the exact steps and conditions under which the bug was successfully reproduced. If it cannot be reproduced, document the attempts and the reasons why it might be failing.

3.  **Gather Diagnostic Information:**
    *   **Client-Side:**
        *   Check browser developer console for errors (JavaScript errors, network failures).
        *   Inspect network requests and responses.
        *   Examine component state and props using React DevTools.
        *   Review relevant state management (e.g., application state, local component state).
        *   Utilize logging or add temporary `console.log` statements in `client/src/` files like `client/src/shared/hooks/use-toast.ts` or within feature-specific hooks like `client/src/features/tasks/hooks/useWhatsAppGroups.ts` to trace execution flow and variable values.
    *   **Server-Side:**
        *   Check server logs for errors and relevant information.
        *   Inspect API request/response logs.
        *   Review database logs if applicable.
        *   Add temporary logging in `server/` files such as `server/storage.ts` or `server/auth.ts` to understand data flow and logic execution.

4.  **Isolate the Root Cause:**
    *   Use the gathered information to pinpoint the exact location in the codebase where the bug originates.
    *   Consider potential culprits based on the bug's symptoms:
        *   Incorrect data manipulation (e.g., in `server/storage.ts`, `client/src/features/tasks/lib/sortUtils.ts`).
        *   Flawed component logic or state management (e.g., custom hooks like `client/src/shared/hooks/useVirtualizedList.ts`).
        *   Authentication or authorization issues (e.g., in `server/auth.ts`).
        *   API endpoint errors (e.g., issues in `server/app.ts` routes).
        *   Incorrect type definitions or interface implementations (e.g., related to `client/src/features/tasks/types/task.ts`).
        *   Issues with UI event handling or state updates.
    *   Formulate a hypothesis about the root cause and test it by making small, targeted changes or using debugging tools.

5.  **Propose a Solution (Optional, if not handing off directly):**
    *   Based on the root cause, outline a potential fix.
    *   Consider the impact of the fix on other parts of the application.
    *   Reference relevant code components, hooks, or modules.

6.  **Document Findings:**
    *   Clearly document the bug's symptoms, steps to reproduce (verified), the identified root cause, and any diagnostic information gathered.
    *   If a solution was developed, describe it and provide the relevant code changes.

## Examples

**Scenario:** A user reports that tasks are not displaying correctly after applying a filter.

**Example Investigation Steps:**

1.  **Reproduce:** Log in as a user, navigate to the tasks view, apply a specific filter (e.g., "Due Today"). Observe that the task list appears empty or shows incorrect tasks.
2.  **Client-Side Diagnostics:**
    *   Open browser dev tools. Check the "Network" tab. Observe the API call made for fetching tasks when the filter is applied.
    *   Inspect the request payload: Is the filter parameter being sent correctly?
    *   Inspect the response: Does the API return the expected filtered data?
    *   If the response is incorrect, investigate the server-side logic. If the response is correct but the UI doesn't update, investigate client-side rendering and state management, potentially in hooks like `client/src/shared/hooks/usePaginatedList.ts` or within the task feature component.
    *   Add logging around the filter application logic in `client/src/features/tasks/lib/statusConfig.ts` or `client/src/features/tasks/lib/sortUtils.ts`.
3.  **Server-Side Diagnostics (if response is incorrect):**
    *   Examine logs in `server/app.ts` related to the task fetching endpoint.
    *   Look at `server/storage.ts` to see how the filtering logic is implemented for database queries.
    *   Hypothesize: Perhaps the filter logic in `server/storage.ts` is not correctly translating the client-side filter parameters into a database query.
4.  **Root Cause:** Found an issue in `server/storage.ts` where a filter parameter was being mishandled, leading to an incorrect database query and thus incorrect results returned to the client.

**Example Documentation Output:**

```
Bug Report: Tasks not displaying after filter application.

Steps to Reproduce (Verified):
1. Log in to the application.
2. Navigate to the "Tasks" page.
3. Apply the "Overdue" filter from the filter dropdown.
4. Observe that the task list becomes empty, even though overdue tasks exist.

Diagnostic Information:
- Client-side: Network request to `/api/tasks` with `filter=OVERDUE` parameter sent.
- Server-side: Logs indicate the filter parameter was received but the subsequent database query generated by `server/storage.ts` was using a different, incorrect condition (e.g., `status = 'PENDING'` instead of `dueDate < NOW()`).

Root Cause:
The filtering logic within `server/storage.ts` incorrectly processes the `OVERDUE` filter. Specifically, the implementation for handling `DateFilterValue` types within the storage layer fails to correctly construct the `dueDate < NOW()` condition when the `OVERDUE` enum value is encountered. An incorrect condition `status = 'PENDING'` was being used instead.

Evidence:
- Log snippet from `server/storage.ts` before fix: `Executing query with conditions: { status: 'PENDING' }`
- Database query generated by Prisma client based on the above.
```

## Guidelines

*   **Prioritize Reproduction:** A reproducible bug is significantly easier to diagnose. Spend adequate time ensuring you can reliably trigger the issue.
*   **Be Systematic:** Follow a logical process: reproduce, gather data, hypothesize, test, and conclude. Avoid jumping to conclusions.
*   **Isolate Variables:** When debugging, try to change one thing at a time to isolate the cause.
*   **Leverage Existing Tools:** Utilize browser developer tools, server logs, and debugging capabilities effectively.
*   **Understand the Codebase:** Familiarize yourself with key modules like data storage (`server/storage.ts`), authentication (`server/auth.ts`), and relevant hooks (`client/src/shared/hooks/`, `client/src/features/*/hooks/`) to better understand potential areas of failure.
*   **Consider Edge Cases:** Think about how different inputs, states, or environmental conditions might affect the behavior.
*   **Document Thoroughly:** Clear and concise documentation is crucial for effective bug resolution by others.
*   **Distinguish Symptoms from Cause:** Focus on finding the underlying reason for the bug, not just the surface-level manifestation.
*   **Communicate Effectively:** If working collaboratively, clearly communicate findings and hypotheses.
