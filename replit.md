# CRM Mastodonte

## Overview

CRM Mastodonte is a wealth management platform designed for financial consultants (advisors) and their operational assistants. The system centralizes client relationship management through a structured workflow: Client → Meeting → Task. The platform provides a 360-degree client view, meeting history tracking, and Kanban-based task management to ensure operational efficiency and corporate memory retention.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server with HMR (Hot Module Replacement)
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query v5** for server state management and data fetching

**UI Component System**
- **Shadcn/UI** component library based on Radix UI primitives for accessibility
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Design approach**: Linear + Notion hybrid focusing on clarity, data density, and professional restraint
- **Typography**: Inter font family from Google Fonts with hierarchical text sizing
- **Theme**: Dark mode preferred with comprehensive color system for light/dark variants

**Key UI Patterns**
- Fixed sidebar navigation (16rem width) with collapsible functionality
- Kanban board with drag-and-drop using `@dnd-kit` libraries
- Modal dialogs for CRUD operations (clients, meetings, tasks)
- Responsive grid layouts with Tailwind spacing primitives (2, 4, 6, 8, 12, 16)

**State Management Strategy**
- React Query for server state (fetching, caching, synchronization)
- Local component state with React hooks for UI interactions
- Form state managed via React Hook Form with Zod schema validation

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- Dual entry points: `index-dev.ts` (development with Vite middleware) and `index-prod.ts` (production with static file serving)
- Custom logging middleware tracking request duration and response status

**Database Layer**
- **Drizzle ORM** for type-safe database operations
- **Neon Serverless PostgreSQL** as the database provider with WebSocket support
- Schema-first approach with migrations stored in `/migrations` directory
- Database configuration managed through `drizzle.config.ts`

**API Design**
- RESTful endpoints prefixed with `/api`
- Storage abstraction layer (`IStorage` interface) allowing multiple implementations
- Currently using `MemStorage` (in-memory) with interface for future PostgreSQL implementation
- Session-based authentication pattern (structure present, implementation pending)

**Data Models** (Currently minimal, designed for expansion)
- Users table with username/password authentication
- Schema extensibility for clients, meetings, and tasks entities
- Validation schemas using Drizzle-Zod integration

### Application Structure

**Directory Organization**
```
/client          - Frontend React application
  /src
    /components  - Reusable UI components
      /ui        - Shadcn UI primitives + custom reusables
        /task-badges.tsx    - PriorityBadge, StatusBadge (86 lines)
        /task-assignees.tsx - AssigneeList, AssigneeBadge, AssigneeAvatarStack (161 lines)
      /task-editors        - Extracted task editing components (ClientSelector, AssigneeSelector)
      /task-detail         - TaskDetailModal subcomponents
        /TaskContactButtons.tsx - Email, Phone, WhatsApp contact actions (50 lines)
        /TaskDescription.tsx    - Auto-resizing description textarea (40 lines)
        /TaskHistory.tsx        - History timeline with note types (230 lines)
      /task-popovers.tsx   - TaskDatePopover, TaskPriorityPopover, TaskStatusPopover (284 lines)
      /task-context-menu.tsx - Right-click context menu with bulk operations (203 lines)
      /task-card-dialogs.tsx - Modal dialogs for task operations
      /TaskCard.tsx        - Main task card component (719 lines, down from 1416)
      /TaskDetailModal.tsx - Task detail modal (538 lines, down from 760)
    /pages       - Route-level page components
    /lib         - Utilities and configurations
      /statusConfig.ts  - Centralized colors (UI_COLORS, UI_CLASSES) + status/priority configs
      /mock-data.ts     - Initial task data and mock data generators
    /hooks       - Custom React hooks (hook-first architecture)
      /useTaskCardEditing.ts  - Task card editing state and handlers
      /useTaskAssignees.ts    - Assignee management logic
      /useTaskContextMenu.ts  - Context menu state management
      /useTaskHistory.ts      - Undo/redo functionality with Ctrl+Z support
      /useTaskFilters.ts      - Search, assignee, priority filtering
      /useTaskSelection.ts    - Multi-select with Shift+click
      /useTaskDrag.ts         - Cross-column drag with placeholder
      /useTaskBulkActions.ts  - Bulk update/delete operations
    /types       - TypeScript type definitions
      /task.ts   - Task, TaskStatus, TaskPriority types
/server          - Backend Express application
  /routes.ts     - API route definitions
  /storage.ts    - Data persistence layer
  /db.ts         - Database connection
/shared          - Code shared between client/server
  /schema.ts     - Database schemas and types
```

**Architecture Patterns (Maintainability Score: 85+)**
- Hook-first design: Business logic extracted to custom hooks
- Centralized configuration: statusConfig.ts drives consistent styling
- Reusable UI primitives: Badge and assignee components shared across features
- Component extraction: Popovers, context menu, dialogs in separate modules
- Memoization: Performance-optimized with memo() for re-render prevention

**Routing Strategy**
- Frontend: Client-side routing with Wouter (/, /clients, /clients/:id, /meetings, /tasks)
- Backend: Express routes under /api namespace
- Development: Vite proxies API requests to Express server
- Production: Express serves static frontend build from /dist/public

**Build & Deployment**
- Development: Concurrent Vite dev server with Express backend
- Production: Single Express server serving pre-built static assets
- TypeScript compilation without emit (type checking only, esbuild for bundling)

### Design System Implementation

**Component Hierarchy**
- Atomic components from Shadcn/UI (Button, Input, Dialog, etc.)
- Composite components for domain features (ClientCard, TaskCard, MeetingCard)
- Layout components (KanbanColumn, FilterBar, AppSidebar)
- Page-level components combining layouts and features

**Styling Conventions**
- CSS variables for theming (HSL color space for easy manipulation)
- Tailwind utility classes with custom configuration
- Hover/active states using custom utility classes (hover-elevate, active-elevate-2)
- Responsive breakpoints with mobile-first approach

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query** (v5.60.5) - Server state management
- **express** - Backend web framework
- **react** & **react-dom** - UI library
- **vite** - Frontend build tool and dev server
- **wouter** - Lightweight routing library

### Database & ORM
- **drizzle-orm** - TypeScript ORM
- **drizzle-kit** - Schema migrations and introspection
- **@neondatabase/serverless** (v0.10.4) - Neon Postgres driver with WebSocket support
- **ws** - WebSocket library for Neon connection

### UI Component Libraries
- **@radix-ui/react-*** - Accessible component primitives (23+ packages)
- **@dnd-kit/core**, **@dnd-kit/sortable**, **@dnd-kit/utilities** - Drag-and-drop functionality
- **lucide-react** - Icon library
- **date-fns** - Date formatting and manipulation
- **cmdk** - Command menu component

### Form Management
- **react-hook-form** - Form state management
- **@hookform/resolvers** (v3.10.0) - Form validation resolvers
- **zod** & **drizzle-zod** - Schema validation

### Styling
- **tailwindcss** - Utility-first CSS framework
- **autoprefixer** & **postcss** - CSS processing
- **class-variance-authority** - Type-safe component variants
- **clsx** & **tailwind-merge** - Conditional class composition

### Development Tools
- **typescript** - Type safety
- **tsx** - TypeScript execution for development
- **esbuild** - Production bundling
- **@replit/vite-plugin-*** - Replit-specific development plugins

### Third-Party Services
- **Google Fonts** - Inter font family (via CDN)
- **Neon Database** - Serverless PostgreSQL hosting (DATABASE_URL environment variable required)