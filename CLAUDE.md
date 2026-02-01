# CLAUDE.md - AI Context for CRM Mastodonte

## Project Overview

CRM Mastodonte is a full-stack wealth management CRM platform for financial consultants and operational assistants. It provides client relationship management, meeting scheduling, and task workflows with a centralized "360-degree client view".

**Core business flow:** Client -> Meeting -> Task

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Wouter (routing), TanStack Query v5, Tailwind CSS, Shadcn/UI (new-york style), Framer Motion, React Hook Form + Zod, @dnd-kit
- **Backend:** Express.js with TypeScript
- **Database:** PostgreSQL (Supabase), Prisma ORM
- **Auth:** Clerk (OAuth, email/password, SSO)
- **Build:** Vite (frontend), esbuild (backend)

## Commands

```bash
npm run dev          # Start dev server (Vite + Express)
npm run build        # Production build (frontend + backend)
npm start            # Start production server
npm run check        # TypeScript type checking
npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
```

## Project Structure

```
client/src/
  app/                    # Root component, routing, sidebar
    components/           # AppSidebar
    pages/                # Dashboard, NotFound
  features/               # Feature modules (domain-driven)
    auth/                 # Clerk authentication (LoginForm, SignUp, SSO)
    clients/              # Client management (ClientCard, ClientProfile, forms)
    tasks/                # Task management (Kanban board, TaskCard, TaskDetail)
    meetings/             # Meeting management (MeetingCard, MeetingDetail)
    users/                # User/admin management (Profile, Admin panel)
  shared/
    components/ui/        # Shadcn UI primitives (50+ components)
    hooks/                # Utility hooks (useInlineFieldEdit, useSearchFilter, etc.)
    lib/                  # Utils, date-utils, queryClient
    types/                # Shared types (imports from Prisma)
    config/               # Shared configs (meetingConfig)

server/
  app.ts                  # Express app setup & middleware
  routes.ts               # API route definitions (~900 lines)
  storage.ts              # Data access layer (Prisma wrapper, IStorage interface)
  db.ts                   # Prisma client singleton
  auth.ts                 # Clerk auth middleware
  index-dev.ts            # Dev entry (Vite middleware)
  index-prod.ts           # Prod entry (static serving)

prisma/
  schema.prisma           # Database schema
```

## Architecture Patterns

### Frontend
- **Feature-based modules:** Each feature (auth, clients, tasks, meetings, users) is self-contained with components, hooks, contexts, types, and lib
- **Hook-first design:** Business logic extracted into custom hooks
- **Context API:** Feature-level state (TasksContext, ClientsContext, UsersContext)
- **Server state:** TanStack Query for all API data fetching and caching
- **Form state:** React Hook Form + Zod validation schemas
- **Path aliases:** `@/` (client/src), `@features/`, `@app/`, `@shared/`

### Backend
- RESTful API under `/api` namespace
- Zod schema validation on request bodies
- Bearer token auth on all protected routes
- Storage abstraction layer (IStorage interface -> PrismaStorage)
- Response format: `{ data }` or `{ error }` with proper HTTP status codes

### Database
- Core entities: User, Group, Client, Meeting, Task, TaskAssignee, TaskHistory, WhatsAppGroup
- Prisma for type-safe queries with relationship loading (includes)
- User access control checks on data layer

## Auth & Roles

```
Roles: administrador, consultor, alocador, concierge
```

- Clerk handles authentication (OAuth, email/password, SSO)
- Middleware: `requireAdmin()`, `requireRole()`, `checkClientAccess()`
- Group-based access: users see only their own or group members' clients
- First registered user becomes admin automatically

## Design System

- **Style:** Linear + Notion hybrid, dark mode preferred
- **Font:** Inter (Google Fonts)
- **Colors:** CSS variables with HSL format, custom sidebar palette, status colors
- **Border radius:** 9px/6px/3px tokens
- **Animations:** Minimal motion approach with Framer Motion
- Refer to `design_guidelines.md` for full specifications

## Key Features

- **Tasks:** Kanban board (To Do, In Progress, Done), drag-and-drop, inline editing, bulk actions, history/audit trail, undo/redo, Pomodoro timer
- **Clients:** 360-degree view, WhatsApp group management, foundation code validation (N8N webhook), financial data tracking
- **Meetings:** Scheduling, type-based workflow, AI summary generation, meeting-to-task creation
- **Admin:** User/group management, invitations with role/group assignment

## Conventions

- TypeScript strict mode enabled
- Conventional Commits for git messages (e.g., `feat(tasks): add bulk delete`)
- Components use Shadcn/UI primitives as building blocks
- All API inputs validated with Zod schemas matching Prisma types
- Portuguese language used in UI labels and business terminology
- Task status in English (To Do, In Progress, Done), priority in Portuguese (Urgente, Importante, Normal, Baixa)
- QueryClient staleTime: Infinity - invalidate manually after mutations

## Detailed Context

Full documentation available in `.context/`:
- [Architecture](.context/docs/architecture.md) - System architecture, tech stack, project structure
- [API Reference](.context/docs/api-reference.md) - All REST endpoints with schemas
- [Database](.context/docs/database.md) - Prisma schema, entities, relationships
- [Frontend](.context/docs/frontend.md) - React features, 36+ hooks, 3 contexts, all components
- [Auth](.context/docs/auth.md) - Clerk authentication, roles, access control flow
- [Design System](.context/docs/design-system.md) - UI guidelines, colors, typography
- [Agent Playbook](.context/agents/README.md) - How to work on this codebase
