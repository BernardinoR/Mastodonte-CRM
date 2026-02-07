# API Design Skill Playbook

## When to Use

This skill should be activated when designing new APIs or modifying existing ones to ensure they adhere to RESTful principles, are well-versioned, handle errors effectively, and are properly documented.

## Instructions

1.  **Define Resource-Based Endpoints:** Identify the core resources of the API (e.g., `tasks`, `clients`, `meetings`). Design endpoints following standard RESTful conventions (e.g., `GET /tasks`, `POST /tasks`, `GET /tasks/{id}`, `PUT /tasks/{id}`, `DELETE /tasks/{id}`).
2.  **Implement Input Validation:** For `POST`, `PUT`, and `PATCH` requests, rigorously validate incoming data on the server-side. Use a consistent validation library or schema.
3.  **Standardize Response Formats:** Define a consistent JSON structure for API responses, including success and error cases. For success, return the requested data. For errors, provide a structured error object with fields like `code`, `message`, and `details`.
4.  **Implement Robust Error Handling:**
    *   Use appropriate HTTP status codes (e.g., 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).
    *   Log server-side errors for debugging.
    *   Provide clear, user-friendly error messages to the client without exposing sensitive internal details.
5.  **Implement API Versioning:** Add versioning to the API URL (e.g., `/api/v1/tasks`) or use custom request headers. This allows for backward-compatible changes.
6.  **Document Endpoints:** Use a documentation standard like OpenAPI (Swagger) to describe each endpoint, including its purpose, parameters, request/response body schemas, and possible status codes.
7.  **Consider Security:** Ensure all endpoints are protected appropriately, especially those involving sensitive data or state-changing operations. Integrate with the existing authentication (Clerk) and authorization mechanisms.
8.  **Review and Refine:** Before finalizing, review the API design for consistency, usability, and adherence to best practices. Consider the client-side implementation (e.g., how `apiRequest` in `client/src/shared/lib/queryClient.ts` will interact with the API).

## Examples

**Example 1: Designing a `GET /clients` endpoint**

*   **Purpose:** Retrieve a list of all clients.
*   **HTTP Method:** `GET`
*   **Endpoint:** `/api/v1/clients`
*   **Request:**
    *   Headers: `Authorization: Bearer <token>` (if required)
    *   Query Parameters: `?page=1&limit=10` (for pagination)
*   **Success Response (200 OK):**
    ```json
    {
      "data": [
        {
          "id": "clnt_123",
          "name": "Acme Corp",
          "email": "info@acmecorp.com",
          "createdAt": "2023-10-27T10:00:00Z"
        },
        {
          "id": "clnt_456",
          "name": "Globex Inc",
          "email": "contact@globex.com",
          "createdAt": "2023-10-26T15:30:00Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 50,
        "limit": 10
      }
    }
    ```
*   **Error Response (500 Internal Server Error - Example):**
    ```json
    {
      "error": {
        "code": "INTERNAL_SERVER_ERROR",
        "message": "An unexpected error occurred on the server.",
        "details": null
      }
    }
    ```

**Example 2: Designing a `POST /clients` endpoint**

*   **Purpose:** Create a new client.
*   **HTTP Method:** `POST`
*   **Endpoint:** `/api/v1/clients`
*   **Request:**
    *   Headers: `Authorization: Bearer <token>`
    *   Body:
        ```json
        {
          "name": "Stark Industries",
          "email": "admin@starkindustries.com",
          "phone": "555-1234"
        }
        ```
*   **Success Response (201 Created):**
    ```json
    {
      "data": {
        "id": "clnt_789",
        "name": "Stark Industries",
        "email": "admin@starkindustries.com",
        "phone": "555-1234",
        "createdAt": "2023-10-27T11:00:00Z",
        "updatedAt": "2023-10-27T11:00:00Z"
      }
    }
    ```
*   **Error Response (400 Bad Request - Example due to missing email):**
    ```json
    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input provided.",
        "details": [
          {
            "field": "email",
            "issue": "Email is a required field."
          }
        ]
      }
    }
    ```

## Guidelines

*   **RESTful Principles:** Adhere strictly to principles like statelessness, resource-based URLs, and appropriate use of HTTP methods and status codes.
*   **Consistency is Key:** Maintain consistency in naming conventions (e.g., camelCase for JSON properties), URL structures, and error response formats across all endpoints.
*   **Favor Plural Nouns for Collections:** Use plural nouns for collection endpoints (e.g., `/tasks`, `/clients`).
*   **Use HTTP Methods Correctly:**
    *   `GET`: Retrieve data. Should be safe and idempotent.
    *   `POST`: Create a new resource.
    *   `PUT`: Update an existing resource (replace entirely). Idempotent.
    *   `PATCH`: Partially update an existing resource.
    *   `DELETE`: Remove a resource. Idempotent.
*   **Versioning Strategy:** Use URL path versioning (e.g., `/api/v1/`) for clear and explicit versioning. Avoid query parameter versioning for critical API changes.
*   **Request Validation:** Always validate incoming data on the server-side to prevent malformed or malicious inputs. Refer to server-side validation logic.
*   **Response Structure:** Design clear and predictable response structures. The `client/src/shared/lib/queryClient.ts` uses a structure that expects a `data` field for successful requests, and error handling might rely on a specific error format.
*   **Error Codes:** Define a set of meaningful, standardized error codes to help clients handle errors programmatically.
*   **Documentation:** Keep endpoint documentation up-to-date. This is crucial for client developers and for agents like the `test-writer` to understand how to interact with the API. Tools like OpenAPI can be leveraged.
*   **Security:** Integrate with Clerk for authentication and implement authorization checks within route handlers or middleware. Never expose sensitive data unnecessarily.
*   **Idempotency:** Aim for idempotent operations where appropriate, especially for `PUT` and `DELETE` requests.
*   **Rate Limiting:** Consider implementing rate limiting to prevent abuse.
*   **Clear Data Shapes:** Define clear and specific data shapes (TypeScript interfaces/types) for both request and response payloads. This aids in type safety and developer experience.

By following these guidelines, APIs will be robust, maintainable, and easy for clients to consume. The `server/routes.ts` file, specifically the `registerRoutes` function, is a key entry point for defining and organizing these APIs.
