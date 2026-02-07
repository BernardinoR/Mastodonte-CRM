# Feature Breakdown Skill Playbook

## When to Use

This skill should be activated when a new feature needs to be implemented. Its purpose is to take a high-level feature description and break it down into smaller, actionable, and well-defined tasks that can be assigned and estimated. This process ensures clarity, identifies dependencies, and facilitates efficient development.

## Instructions

1.  **Understand the Feature Request:** Clearly comprehend the user story, requirements, and goals of the feature. Analyze any provided mockups or design specifications.
2.  **Identify Core Components:** Determine the main parts of the system that the feature will interact with or modify (e.g., UI components, API endpoints, database models, state management).
3.  **Decompose into User Stories/Tasks:** Break down the feature into the smallest possible, independently deliverable units of work, often in the form of user stories or specific tasks.
4.  **Define Acceptance Criteria:** For each task, clearly define what constitutes "done." This should be specific, measurable, achievable, relevant, and time-bound (SMART).
5.  **Identify Dependencies:** Determine any prerequisites for each task. This includes dependencies on other tasks within the same feature, dependencies on completed work from other features, or external dependencies (e.g., API changes from another team).
6.  **Estimate Effort:** Assign an estimated effort (e.g., in story points or hours) to each task. This should be based on complexity, not just time.
7.  **Technical Considerations:** Identify any specific technical challenges, necessary research, or new patterns that need to be explored or implemented.
8.  **Update Documentation:** If the feature has significant architectural implications, ensure relevant documentation (e.g., `architecture.md`) is updated.
9.  **Format Output:** Present the breakdown in a clear, organized format, typically as a list of tasks with descriptions, acceptance criteria, and dependencies.

## Examples

**Feature Request:** Implement a "Task Due Date Reminder" feature. When a task is created or updated, if it has a due date within the next 7 days, the assignee should receive an email notification 24 hours before the due date.

**Expected Output:**

```
## Feature: Task Due Date Reminder

**Goal:** Notify assignees via email 24 hours before a task's due date if the due date is within the next 7 days.

**Breakdown:**

1.  **Task:** Implement a `TaskDueDateService` to manage reminder logic.
    *   **Description:** Create a new service responsible for calculating reminder times and processing notifications.
    *   **Acceptance Criteria:**
        *   `TaskDueDateService` is created with methods for `calculateReminderTime(dueDate)` and `shouldSendReminder(task)`.
        *   `calculateReminderTime` correctly returns a timestamp 24 hours before the `dueDate`.
        *   `shouldSendReminder` returns true if the `dueDate` is within the next 7 days and the reminder time has passed.
    *   **Dependencies:** None.
    *   **Estimation:** 3 Story Points

2.  **Task:** Add `reminderSentAt` timestamp to the `Task` model.
    *   **Description:** Update the database schema and `Task` model to include a field to track when the reminder was last sent.
    *   **Acceptance Criteria:**
        *   `reminderSentAt` field (nullable timestamp) is added to the `Task` schema via Prisma migration.
        *   `Task` type definition includes `reminderSentAt`.
        *   New migrations are generated and applied.
    *   **Dependencies:** None.
    *   **Estimation:** 1 Story Point

3.  **Task:** Integrate `TaskDueDateService` into the task creation/update flow.
    *   **Description:** Modify the task API endpoint (e.g., `POST /tasks` and `PUT /tasks/:id`) to evaluate and potentially set the `reminderSentAt` timestamp upon task creation/update.
    *   **Acceptance Criteria:**
        *   Task creation/update API logic checks if `shouldSendReminder` is true.
        *   If true, `reminderSentAt` is set to the calculated reminder time.
        *   If the task is updated and the due date changes, `reminderSentAt` is recalculated.
    *   **Dependencies:** Task 1, Task 2.
    *   **Estimation:** 2 Story Points

4.  **Task:** Implement a scheduled job to check for pending reminders.
    *   **Description:** Create a background job (e.g., using `node-cron` or a similar library) that runs periodically (e.g., every hour) to find tasks due for reminders.
    *   **Acceptance Criteria:**
        *   A scheduled job is configured to run at a regular interval.
        *   The job queries for tasks where `dueDate` is within the next 7 days and `reminderSentAt` is null or in the past.
        *   The job triggers the email sending logic for matching tasks.
    *   **Dependencies:** Task 1, Task 2.
    *   **Estimation:** 3 Story Points

5.  **Task:** Implement email notification functionality.
    *   **Description:** Integrate with an email service (e.g., Nodemailer, SendGrid) to send formatted email notifications to the task assignee.
    *   **Acceptance Criteria:**
        *   Email sending utility is created.
        *   Email content includes task name, due date, and a link to the task.
        *   The scheduled job successfully calls the email sending utility.
        *   `reminderSentAt` is updated after a successful email send.
    *   **Dependencies:** Task 4.
    *   **Estimation:** 2 Story Points

6.  **Task:** Add unit tests for `TaskDueDateService`.
    *   **Description:** Write comprehensive unit tests to cover various scenarios for the `TaskDueDateService`.
    *   **Acceptance Criteria:**
        *   Tests cover edge cases for date calculations (e.g., leap years, different timezones if applicable).
        *   Tests verify `shouldSendReminder` logic correctly.
        *   Test coverage for `TaskDueDateService` is above 90%.
    *   **Dependencies:** Task 1.
    *   **Estimation:** 2 Story Points

7.  **Task:** Add integration tests for reminder flow.
    *   **Description:** Write integration tests to cover the end-to-end reminder process, from task update to notification.
    *   **Acceptance Criteria:**
        *   Tests simulate task updates and verify mock email service calls.
        *   Tests ensure `reminderSentAt` is updated correctly.
    *   **Dependencies:** Task 3, Task 4, Task 5.
    *   **Estimation:** 3 Story Points
```

## Guidelines

*   **Granularity:** Tasks should be small enough to be completed within 1-2 days. Avoid overly large tasks that are difficult to estimate and track.
*   **Clarity:** Use clear and concise language in task descriptions and acceptance criteria. Avoid ambiguity.
*   **Actionability:** Each task should represent a concrete action or set of actions that a developer can perform.
*   **Testability:** Acceptance criteria should be verifiable. Consider how each task will be tested (unit, integration, manual).
*   **Dependencies:** Explicitly list all dependencies. If a task is blocked, it should be clearly marked.
*   **Estimation:** Use relative estimation (e.g., story points) rather than absolute time estimates where possible, as it accounts better for complexity and uncertainty.
*   **Review:** The generated breakdown should be reviewed by the development team to ensure accuracy, completeness, and feasibility.
*   **Tooling:** If applicable, follow project conventions for task management tools (e.g., Jira, Asana), ensuring tasks are created with appropriate fields.
