# Claude Code Project Context

> Task Management System - Full-stack application for managing clients, tasks, meetings, and team workflows.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express |
| Database | PostgreSQL with Prisma ORM |
| Authentication | Clerk |
| UI Components | shadcn/ui |
| State Management | TanStack Query |

## Repository Structure

```
.
├── client/                 # React frontend
│   └── src/
│       ├── app/           # App-level components
│       ├── features/      # Feature modules (tasks, clients, meetings, auth, users)
│       └── shared/        # Shared utilities, hooks, components
├── server/                # Express backend
│   ├── app.ts            # Express application
│   ├── auth.ts           # Clerk authentication middleware
│   └── storage.ts        # Database access layer (DbStorage)
├── prisma/                # Database schema
└── .context/              # AI context documentation
```

## Key Entry Points

- **Server**: `server/app.ts`, `server/index.ts`
- **Client**: `client/src/main.tsx`, `client/src/App.tsx`
- **Database**: `prisma/schema.prisma`
- **Auth**: `server/auth.ts` (Clerk middleware)

## Feature Modules

| Feature | Location | Description |
|---------|----------|-------------|
| Tasks | `client/src/features/tasks/` | Task management with turbo mode |
| Clients | `client/src/features/clients/` | Client management |
| Meetings | `client/src/features/meetings/` | Meeting scheduling with AI summaries |
| Auth | `client/src/features/auth/` | Authentication pages |
| Users | `client/src/features/users/` | User management |

## Architecture Patterns

### Frontend
- **Feature-based structure**: Code organized by business domain
- **Custom hooks**: State and logic in `features/*/hooks/`
- **TanStack Query**: Server state with caching
- **shadcn/ui**: Accessible component library

### Backend
- **Repository pattern**: `DbStorage` class in `server/storage.ts`
- **Middleware chain**: Clerk auth middleware
- **Prisma ORM**: Type-safe database access

## Key Symbols

### Backend
- `DbStorage` (class) @ `server/storage.ts` - Data access layer
- `IStorage` (interface) @ `server/storage.ts` - Storage contract
- `clerkAuthMiddleware` @ `server/auth.ts` - JWT validation
- `requireRole`, `requireAdmin` @ `server/auth.ts` - RBAC

### Frontend
- `apiRequest` @ `client/src/shared/lib/queryClient.ts` - HTTP client
- `useCurrentUser` @ `client/src/features/users/hooks/` - Auth hook
- `useTurboMode` @ `client/src/features/tasks/hooks/` - Bulk task processing
- `cn` @ `client/src/shared/lib/utils.ts` - Class name utility

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests
npx prisma studio    # Database GUI
npx prisma migrate dev  # Run migrations
```

## Code Conventions

### TypeScript
- Strict mode enabled
- Interfaces for object shapes
- Explicit return types
- No `any` (use `unknown` if needed)

### React
- Functional components with hooks
- Custom hooks for reusable logic
- TanStack Query for server state

### Commits
Follow Conventional Commits:
```
feat(tasks): add turbo mode
fix(auth): handle session expiry
refactor(hooks): extract filter logic
```

## Authentication & Authorization

- **Authentication**: Clerk (JWT tokens)
- **Roles**: admin, manager, user
- **Middleware**: `clerkAuthMiddleware`, `requireRole()`, `requireAdmin()`

## Documentation

Full documentation available in `.claude/docs/` (also in `.context/docs/`):
- `architecture.md` - System architecture
- `data-flow.md` - Data flow diagrams
- `development-workflow.md` - Dev process
- `testing-strategy.md` - Test guidelines
- `security.md` - Security model
- `glossary.md` - Domain concepts
- `codebase-map.json` - Symbol index and dependencies

## Agent Playbooks

AI agent playbooks in `.claude/agents/` (also in `.context/agents/`):
- `architect-specialist.md` - System design
- `backend-specialist.md` - Server development
- `frontend-specialist.md` - UI development
- `bug-fixer.md` - Debugging
- `code-reviewer.md` - Code review
- `feature-developer.md` - Feature implementation
- `test-writer.md` - Test generation

## Skills

Project-specific skills in `.claude/skills/`:
- `api-design` - RESTful API patterns
- `bug-investigation` - Debug workflow
- `code-review` - Review guidelines
- `commit-message` - Commit conventions
- `documentation` - Doc standards
- `feature-breakdown` - Task decomposition
- `pr-review` - PR checklist
- `refactoring` - Safe refactoring
- `security-audit` - Security checklist
- `test-generation` - Test patterns
