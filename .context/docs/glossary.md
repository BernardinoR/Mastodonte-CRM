<!-- agent-update:start:glossary -->
# Glossary & Domain Concepts

List project-specific terminology, acronyms, domain entities, and user personas.

## Core Terms
- **Asset** — A digital file or media item (e.g., images, documents, videos) that can be uploaded, stored, and attached to entities like posts or records in the system. It is central to the application's functionality for content management and is handled primarily in the `attached_assets` directory, with processing logic in `server` and UI in `client`.
- **Shared Module** — A collection of reusable code, including TypeScript types, utilities, and constants that are imported across both `client` and `server` to ensure consistency, reduce duplication, and facilitate type-safe communication. Located in the `shared` directory, it includes data models for assets and user sessions.
- **Client** — The frontend application responsible for user interface rendering, user interactions, and communicating with the backend via API calls. Located in the `client` directory, it handles asset previews, upload forms, and real-time feedback.
- **Server** — The backend application that processes API requests, manages data persistence, handles file storage, and enforces business logic. Located in the `server` directory, it orchestrates asset uploads, validations, and integrations with external services.
- **Attached Asset** — A specific asset that has been linked to a parent entity (e.g., a post, comment, or project record). The `attached_assets` directory contains assets that are actively associated with content in the system, as opposed to orphaned or temporary uploads.
- **Entity** — A domain object in the system that can have assets attached to it, such as posts, projects, or user profiles. Entities are defined in shared schemas and referenced across client and server.
- **Upload Handler** — A server-side component responsible for receiving file uploads, validating file metadata, processing the file (e.g., generating thumbnails), and persisting it to storage. See `server/` for implementation details.
- **Type-Safe Communication** — The practice of using shared TypeScript interfaces and types between client and server to ensure API contracts are enforced at compile time, reducing runtime errors.

## Acronyms & Abbreviations
- **API** — Application Programming Interface; refers to the backend endpoints provided by the `server` for handling requests from the `client`, such as asset uploads and retrievals. It uses RESTful conventions with JSON payloads and is documented in the [API Reference](./api-reference.md).
- **UI** — User Interface; the visual and interactive elements of the `client` application that users engage with directly.
- **REST** — Representational State Transfer; the architectural style used for the API, emphasizing stateless requests and resource-based URLs.
- **JSON** — JavaScript Object Notation; the data interchange format used for API request and response payloads.
- **CRUD** — Create, Read, Update, Delete; the standard operations supported for managing assets and entities via the API.
- **GDPR** — General Data Protection Regulation; EU data privacy regulation that may influence future storage and data handling policies.
- **MIME** — Multipurpose Internet Mail Extensions; used to identify file types during upload validation (e.g., `image/jpeg`, `application/pdf`).
- **UUID** — Universally Unique Identifier; used for generating unique asset IDs to prevent collisions across distributed uploads.

## Personas / Actors
- **Content Creator** — An end-user (e.g., a team member or admin) who interacts with the system to upload and manage attached assets in workflows like content publishing or project collaboration.
  - **Goals**: Quick and reliable file attachments to enhance productivity.
  - **Key Workflows**: Drag-and-drop uploads, previewing assets before saving, bulk uploads.
  - **Pain Points Addressed**: Handling large files without crashes, ensuring cross-device compatibility, and maintaining asset metadata integrity.
- **System Administrator** — A privileged user responsible for configuring system settings, managing user roles, monitoring storage usage, and reviewing security logs.
  - **Goals**: Maintain system health, enforce compliance, and manage access controls.
  - **Key Workflows**: Reviewing upload logs, configuring file size limits, managing user permissions.
- **API Consumer** — An external system or developer integrating with the API programmatically to upload, retrieve, or manage assets.
  - **Goals**: Reliable and well-documented endpoints for automation.
  - **Key Workflows**: Authenticating via tokens, batch uploading assets, querying asset metadata.
- **Viewer** — A read-only user who can access and preview attached assets but cannot upload or modify them.
  - **Goals**: Quick access to relevant files without editing capabilities.
  - **Key Workflows**: Browsing attached assets, downloading permitted files.

## Domain Rules & Invariants
- **File Size Limits**: Assets must not exceed 50MB to prevent server overload; enforced via validation in the `server` upload handler. Exceeding this triggers a user-friendly error with retry options. See [Architecture Overview](./architecture-overview.md) for validation flow.
- **Supported Formats**: Only common media types (e.g., JPEG, PNG, GIF, PDF, MP4, WEBM) are permitted to ensure compatibility; unsupported files are rejected early in the upload process with format conversion suggestions where applicable. MIME type validation occurs both client-side (for immediate feedback) and server-side (for security).
- **Data Consistency**: Shared types enforce invariants like unique asset IDs (UUIDs) across client-server sync, preventing duplicates during concurrent uploads. Optimistic locking is used for update operations.
- **Orphan Cleanup**: Assets not attached to an entity within 24 hours of upload are flagged for automatic cleanup to prevent storage bloat.
- **Security Constraints**: All assets undergo virus scanning on upload (via integrated service in `server`), and access is role-based, tying into user authentication modules. Signed URLs are used for time-limited asset access where applicable.
- **Localization & Compliance**: No localization nuances currently, but future expansions may include region-specific storage compliance (e.g., GDPR for EU users, data residency requirements).
- **Audit Trail**: All asset operations (create, update, delete, access) are logged with timestamps and actor IDs for compliance and debugging purposes.

## Related Documentation
- [Architecture Overview](./architecture-overview.md) — System structure and data flow diagrams.
- [API Reference](./api-reference.md) — Endpoint specifications and payload schemas.
- [Testing Strategy](./testing-strategy.md) — How domain rules and invariants are validated.
- [Onboarding Guide](./onboarding-guide.md) — Getting started for new contributors.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Harvest terminology from recent PRs, issues, and discussions.
2. Confirm definitions with product or domain experts when uncertain.
3. Link terms to relevant docs or modules for deeper context.
4. Remove or archive outdated concepts; flag unknown terms for follow-up.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Product requirement docs, RFCs, user research, or support tickets.
- Service contracts, API schemas, data dictionaries.
- Conversations with domain experts (summarize outcomes if applicable).

<!-- agent-update:end -->
