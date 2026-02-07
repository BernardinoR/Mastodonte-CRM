# Documentation Skill Playbook

## When to Use

This skill should be activated when there's a need to create new documentation, update existing documentation, or ensure that the project's documentation remains accurate, comprehensive, and easy to understand. This includes documenting new features, architectural changes, API endpoints, or clarifying existing processes.

## Instructions

1.  **Identify Documentation Needs:** Determine what specific aspect of the project requires documentation or updates. This could be a new feature, a bug fix that impacts usage, an architectural change, or outdated information.
2.  **Locate Relevant Files:** Identify existing documentation files (e.g., `README.md`, `architecture.md`, `docs/`) or identify where new documentation should be created.
3.  **Gather Context:** Analyze the relevant code or feature to be documented. Understand its purpose, functionality, inputs, outputs, and any dependencies or side effects.
4.  **Draft Documentation Content:** Write clear, concise, and accurate documentation.
    *   For features: Explain what the feature does, how to use it, and any prerequisites.
    *   For APIs: Document endpoints, request/response formats, parameters, and authentication.
    *   For architecture: Detail components, layers, data flow, and design decisions.
    *   Use Markdown formatting effectively (headings, lists, code blocks, tables, links).
5.  **Incorporate Examples:** Provide practical, runnable examples of how to use the documented feature, API, or code.
6.  **Review and Refine:** Ensure the documentation is easy to understand, technically accurate, and follows project conventions. Check for clarity, completeness, and consistency.
7.  **Update or Create Files:** Save the new or updated documentation in the appropriate location within the repository. Common locations include `README.md` for project overviews, `architecture.md` for architectural details, and potentially a dedicated `docs/` directory for more in-depth guides.

## Examples

**Example 1: Documenting a new API Endpoint**

**Scenario:** A new `/api/tasks/:id` endpoint has been added to retrieve a specific task.

**Documentation Snippet (to be added to server-side documentation or a dedicated API docs file):**

```markdown
### GET /api/tasks/:id

Retrieves a specific task by its unique identifier.

**Authentication:** Requires a valid JWT, passed in the `Authorization` header as `Bearer <token>`.

**Parameters:**

| Parameter | Type   | Required | Description             |
| :-------- | :----- | :------- | :---------------------- |
| `id`      | string | Yes      | The unique ID of the task |

**Responses:**

*   **200 OK:** Returns the task object.
    ```json
    {
      "id": "clp987654321",
      "title": "Update project documentation",
      "description": "Add documentation for the new API endpoint.",
      "status": "in_progress",
      "createdAt": "2023-10-27T10:00:00Z",
      "updatedAt": "2023-10-27T11:30:00Z",
      "dueDate": "2023-11-01T17:00:00Z"
    }
    ```
*   **404 Not Found:** If a task with the specified `id` does not exist.
*   **401 Unauthorized:** If the authentication token is missing or invalid.

**Example Request (using cURL):**

```bash
curl -X GET https://your-api-url.com/api/tasks/clp987654321 \
     -H "Authorization: Bearer <your_jwt_token>"
```
```

**Example 2: Updating the `README.md` for a new feature**

**Scenario:** A new feature for task prioritization (e.g., setting 'high', 'medium', 'low' priority) has been implemented.

**Update to `README.md` (within the "Features" section):**

*   **Task Prioritization:** Users can now assign a priority level (High, Medium, Low) to tasks, allowing for better organization and focus on urgent items. This is managed via a new dropdown in the task creation and editing forms.

## Guidelines

*   **Clarity First:** Prioritize clear and unambiguous language. Assume the reader may not have deep familiarity with the specific code but general understanding of the project's domain.
*   **Be Specific:** Reference actual file paths, function names, component names, and configuration settings. For example, instead of "update the UI component," say "update the `PrioritySelector.tsx` component in `client/src/features/tasks/components/`."
*   **Provide Actionable Examples:** Ensure examples are correct, runnable, and demonstrate the intended usage effectively. For code examples, highlight key parts.
*   **Maintain Consistency:** Adhere to the existing documentation style, tone, and formatting conventions of the repository. Refer to `README.md` and `architecture.md` for established patterns.
*   **Keep it Concise:** While comprehensive, avoid unnecessary jargon or overly lengthy explanations. Get to the point efficiently.
*   **Document Rationale:** For architectural decisions or complex code, briefly explain the "why" behind the design choices. This is crucial for long-term maintainability.
*   **Update Regularly:** Documentation is a living entity. Ensure it's updated alongside code changes. Stale documentation is often worse than none.
*   **Use Appropriate Locations:**
    *   `README.md`: For high-level project overview, setup, and quick start.
    *   `architecture.md`: For detailed system architecture, layers, and design patterns.
    *   Feature-specific documentation (e.g., in `docs/` or within feature folders): For in-depth guides on specific functionalities.
    *   Code Comments: For explaining intricate logic within the code itself.
*   **Leverage Tooling:** When documenting APIs, consider using formats like OpenAPI (Swagger) if the project adopts it, or clearly structured Markdown tables as shown in the example.
