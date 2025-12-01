# CRM Mastodonte

## Overview

CRM Mastodonte is a wealth management platform for financial consultants and their operational assistants. It centralizes client relationship management via a Client → Meeting → Task workflow, offering a 360-degree client view, meeting history, and Kanban-based task management. The platform aims to boost operational efficiency and maintain corporate memory.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend uses **React 18** with **TypeScript**, built with **Vite**. **Wouter** handles client-side routing, and **TanStack Query v5** manages server state. The UI is built with **Shadcn/UI** (based on Radix UI) and styled using **Tailwind CSS**, following a Linear + Notion design aesthetic with the Inter font family and a dark mode preference. Key UI patterns include a fixed, collapsible sidebar, `@dnd-kit`-powered Kanban boards, modal dialogs for CRUD operations, and responsive grid layouts. Form state is managed by React Hook Form with Zod validation.

### Backend

The backend is an **Express.js** application with **TypeScript** running on Node.js. It features dual entry points for development and production and custom logging middleware. The database layer uses **Drizzle ORM** with **Neon Serverless PostgreSQL**. The API is RESTful, prefixed with `/api`, and currently uses `MemStorage` as an in-memory storage abstraction, with a plan for PostgreSQL integration. Session-based authentication is structured but not yet fully implemented.

### Application Structure

The project is organized into `/client` (React app), `/server` (Express app), and `/shared` (common code) directories. A "hook-first" design extracts business logic into custom React hooks (e.g., `useTaskCardEditing`, `useTaskDrag`). The project emphasizes centralized configuration (`statusConfig.ts`), reusable UI primitives, and performance optimization through memoization. Frontend routing is handled by Wouter, and backend routes are under `/api`. Development uses Vite and Express concurrently, while production serves static assets via Express.

### Design System

The design system combines **Shadcn/UI** atomic components with composite domain-specific components (e.g., `TaskCard`) and layout components. Styling uses CSS variables for theming, Tailwind utility classes for responsive design, and consistent conventions for hover states, text hierarchy, and spacing.

## External Dependencies

### Core Frameworks
- **@tanstack/react-query**: Server state management.
- **express**: Backend web framework.
- **react**, **react-dom**: UI library.
- **vite**: Frontend build tool.
- **wouter**: Lightweight routing.

### Database & ORM
- **drizzle-orm**: TypeScript ORM.
- **drizzle-kit**: Schema migrations.
- **@neondatabase/serverless**: Neon Postgres driver.
- **ws**: WebSocket library for Neon.

### UI Components & Utilities
- **@radix-ui/react-***: Accessible component primitives.
- **@dnd-kit/core**, **@dnd-kit/sortable**: Drag-and-drop.
- **lucide-react**: Icon library.
- **date-fns**: Date manipulation.
- **cmdk**: Command menu.

### Form Management & Validation
- **react-hook-form**: Form state management.
- **@hookform/resolvers**: Form validation resolvers.
- **zod**, **drizzle-zod**: Schema validation.

### Styling
- **tailwindcss**: Utility-first CSS.
- **autoprefixer**, **postcss**: CSS processing.
- **class-variance-authority**: Type-safe component variants.
- **clsx**, **tailwind-merge**: Conditional class composition.

### Development Tools
- **typescript**: Type safety.
- **tsx**: TypeScript execution.
- **esbuild**: Production bundling.

### Third-Party Services
- **Google Fonts**: Inter font family.
- **Neon Database**: Serverless PostgreSQL hosting.