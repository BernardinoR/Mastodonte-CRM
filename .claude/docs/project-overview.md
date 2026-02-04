# Project Overview

## Purpose

The Task Management System is a full-stack web application designed to help teams manage clients, tasks, meetings, and workflows efficiently. It provides a modern, responsive interface with features like turbo mode for rapid task processing and AI-powered meeting summaries.

## Goals

1. **Streamline Task Management**: Provide intuitive task creation, assignment, and tracking
2. **Client Relationship Management**: Centralize client information and interaction history
3. **Meeting Organization**: Schedule, document, and summarize meetings effectively
4. **Team Collaboration**: Enable role-based access and team-wide visibility
5. **Productivity Enhancement**: Features like Turbo Mode for bulk operations

## Target Users

| Role    | Description                | Key Features                                               |
| ------- | -------------------------- | ---------------------------------------------------------- |
| Admin   | System administrators      | Full access, user management, system configuration         |
| Manager | Team leads and supervisors | Task assignment, client oversight, reporting               |
| User    | Regular team members       | Task completion, meeting participation, client interaction |

## Key Features

### Task Management

- Create and assign tasks with priorities (urgent, high, medium, low)
- Track task status (pending, in_progress, completed, cancelled)
- Filter and sort tasks by multiple criteria
- Bulk operations via Turbo Mode
- Task history and audit trail

### Client Management

- Client profiles with contact information
- Address management
- Meeting history per client
- Task association
- Client status tracking

### Meeting Management

- Schedule meetings with clients
- Record meeting notes
- AI-powered summary generation
- Track decisions and action items
- Link meetings to tasks

### User & Access Control

- Clerk-based authentication
- Role-based permissions (admin, manager, user)
- Group-based access control
- Secure session management

## Technology Decisions

| Decision           | Choice                  | Rationale                                          |
| ------------------ | ----------------------- | -------------------------------------------------- |
| Frontend Framework | React + Vite            | Fast development, excellent DX, broad ecosystem    |
| Styling            | TailwindCSS + shadcn/ui | Utility-first CSS with accessible components       |
| State Management   | TanStack Query          | Excellent server state caching and synchronization |
| Backend            | Express.js              | Simple, flexible, well-documented                  |
| Database           | PostgreSQL + Prisma     | Reliable RDBMS with type-safe ORM                  |
| Authentication     | Clerk                   | Managed auth with social login support             |

## Project Structure

```
.
├── client/                 # React frontend
│   └── src/
│       ├── app/           # App-level components and pages
│       ├── features/      # Feature modules
│       │   ├── auth/      # Authentication
│       │   ├── clients/   # Client management
│       │   ├── meetings/  # Meeting management
│       │   ├── tasks/     # Task management
│       │   └── users/     # User management
│       └── shared/        # Shared utilities and components
├── server/                # Express backend
├── prisma/                # Database schema
└── attached_assets/       # Static assets
```

## Success Metrics

- **User Adoption**: Active users and daily engagement
- **Task Completion Rate**: Percentage of tasks completed on time
- **Meeting Efficiency**: Time saved with AI summaries
- **System Reliability**: Uptime and error rates

## Roadmap Highlights

1. **Current**: Core task, client, and meeting management
2. **Near-term**: Enhanced reporting and analytics
3. **Future**: Mobile app, integrations with external tools

## Related Resources

- [Architecture Notes](./architecture.md)
- [Development Workflow](./development-workflow.md)
- [Glossary](./glossary.md)
