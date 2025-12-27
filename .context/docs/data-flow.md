<!-- agent-update:start:data-flow -->
# Data Flow & Integrations

Explain how data enters, moves through, and exits the system, including interactions with external services.

## High-level Flow

The primary data pipeline begins with user interactions on the client-side application, built with Vite, TypeScript, React, and Tailwind CSS. Data input occurs via form submissions, API calls, WebSocket connections, or file uploads (handled in the `attached_assets` directory for development fixtures and user uploads). This data is transmitted to the server via HTTP requests to RESTful endpoints or real-time WebSocket connections.

The server, implemented in Node.js with Express and TypeScript, processes the data using shared utilities from the `shared` directory, interacts with the PostgreSQL database via Drizzle ORM (configured in `drizzle.config.ts`), and returns responses to the client. Output includes rendered UI updates on the client, persisted data in the database, WebSocket event broadcasts, or exported assets.

```
┌─────────────┐     HTTP/WS      ┌─────────────┐     Drizzle ORM     ┌─────────────┐
│   Client    │ ───────────────► │   Server    │ ──────────────────► │  PostgreSQL │
│  (React +   │ ◄─────────────── │  (Express)  │ ◄────────────────── │  Database   │
│   Vite)     │   JSON/Events    │             │    Query Results    │             │
└─────────────┘                  └─────────────┘                     └─────────────┘
       │                               │
       │                               ▼
       │                        ┌─────────────┐
       └───────────────────────►│   Shared    │
         Types & Utilities      │  (Types,    │
                                │  Schemas)   │
                                └─────────────┘
```

For visual architecture overviews, refer to `docs/architecture.md`.

## Internal Movement

Modules across the repository collaborate as follows:

### Client (`client/`)
- **UI Rendering**: React components with Radix UI primitives and Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state, with optimistic updates
- **API Communication**: Custom fetch wrapper using `@tanstack/react-query` for data fetching with automatic caching, deduplication, and background refetching
- **Real-time Updates**: WebSocket client for live data synchronization
- **Form Handling**: React Hook Form with Zod validation schemas (shared with server)
- **Bundling**: Vite for development server and production builds (`vite.config.ts`)
- **Styling Pipeline**: PostCSS with Tailwind CSS (`postcss.config.js`, `tailwind.config.ts`)

### Server (`server/`)
- **HTTP Layer**: Express.js with typed route handlers
- **WebSocket Layer**: Native WebSocket server for real-time bidirectional communication
- **Database Access**: Drizzle ORM with PostgreSQL driver (`drizzle.config.ts`)
- **Request Validation**: Zod schemas imported from `shared/` for consistent validation
- **Session Management**: Express sessions with PostgreSQL session store
- **Error Handling**: Centralized error middleware with structured error responses

### Shared (`shared/`)
- **Type Definitions**: TypeScript interfaces and types used by both client and server
- **Validation Schemas**: Zod schemas for request/response validation ensuring runtime type safety
- **Constants**: Shared configuration values and enums
- **Utilities**: Common helper functions (date formatting, string manipulation, etc.)

### Attached Assets (`attached_assets/`)
- **Development Fixtures**: Sample files for testing upload functionality
- **Static Resources**: Images, documents, and other assets referenced in development
- **Upload Staging**: Temporary storage for user-uploaded files before processing

### Data Movement Patterns

| Pattern | Mechanism | Use Case |
|---------|-----------|----------|
| Request/Response | HTTP REST | CRUD operations, form submissions |
| Real-time Sync | WebSocket | Live updates, notifications, collaborative features |
| File Upload | Multipart HTTP | User file uploads, asset management |
| Shared Validation | Zod Schemas | Client-side preview, server-side enforcement |

Database interactions are handled directly by the server through Drizzle ORM, ensuring ACID compliance with PostgreSQL. Shared database access patterns include:
- **Transactions**: Wrapped in `db.transaction()` for multi-step operations
- **Migrations**: Managed via `drizzle-kit` with migration files in `drizzle/`
- **Connection Pooling**: Configured via `DATABASE_URL` environment variable

## External Integrations

### Current Integrations

| Service | Purpose | Auth Method | Documentation |
|---------|---------|-------------|---------------|
| PostgreSQL (Neon) | Primary database | Connection string | `drizzle.config.ts` |
| Replit | Deployment platform | Platform-managed | `replit.md`, `.replit` |

### Integration Guidelines

For future external service integrations (e.g., third-party APIs for authentication, payment processing, email delivery):

1. **Purpose Definition**: Document the business need in an ADR (`docs/decisions/`)
2. **Authentication Patterns**:
   - API keys: Store in environment variables, never commit to repository
   - OAuth2: Implement token refresh with secure storage
   - JWT: Validate signatures server-side, use short expiration
3. **Payload Contracts**:
   - Define TypeScript interfaces in `shared/types/`
   - Match external OpenAPI specs where available
   - Version payload shapes for backward compatibility
4. **Retry Strategy**:
   - Implement exponential backoff (base 2s, max 32s, 5 attempts)
   - Use circuit breaker pattern for persistent failures
   - Log all retry attempts with correlation IDs
5. **Rate Limiting**:
   - Respect external API rate limits with request queuing
   - Implement client-side throttling for user-triggered calls

## Observability & Failure Modes

### Logging Infrastructure

| Layer | Tool | Configuration |
|-------|------|---------------|
| Server | Console logging | Structured JSON in production |
| Client | Console + Error Boundary | React error boundaries capture component failures |
| Database | Drizzle query logging | Enabled via `logger: true` in development |

### Metrics Collection

Currently metrics are collected via:
- **Replit Console**: Runtime logs and basic resource monitoring
- **Browser DevTools**: Network timing, React DevTools profiler
- **Database Queries**: Drizzle logger for query performance analysis

### Failure Modes & Recovery

| Failure Type | Detection | Recovery Strategy |
|--------------|-----------|-------------------|
| Database connection loss | Connection error in Drizzle | Automatic reconnection with exponential backoff; return 503 to client |
| WebSocket disconnect | Client heartbeat timeout | Automatic reconnection with state reconciliation |
| Request validation failure | Zod parse error | Return 400 with structured error details |
| Unhandled server error | Express error middleware | Log stack trace, return 500 with correlation ID |
| Client render error | React Error Boundary | Display fallback UI, log to console |

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;        // Machine-readable error code
    message: string;     // Human-readable message
    details?: unknown;   // Validation errors or additional context
    correlationId: string; // For log correlation
  };
}
```

### Graceful Degradation

- **Database unavailable**: Cache recent reads, queue writes for retry
- **WebSocket unavailable**: Fall back to polling with increased interval
- **External service timeout**: Return cached data if available, otherwise error

### Future Observability Enhancements

Planned improvements (not yet implemented):
- OpenTelemetry integration for distributed tracing
- Structured logging with Winston/Pino
- Health check endpoints (`/health`, `/ready`)
- Error reporting service integration (Sentry, LogRocket)

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Validate flows against the latest integration contracts or diagrams.
2. Update authentication, scopes, or rate limits when they change.
3. Capture recent incidents or lessons learned that influenced reliability.
4. Link to runbooks or dashboards used during triage.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Architecture diagrams, ADRs, integration playbooks.
- API specs, queue/topic definitions, infrastructure code.
- Postmortems or incident reviews impacting data movement.

<!-- agent-update:end -->
