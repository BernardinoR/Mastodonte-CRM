```markdown
---
ai_update_goal: "Provide a comprehensive overview of the project's purpose, architecture, and technology stack"
required_inputs:
  - package.json dependencies and scripts
  - Directory structure analysis
  - Technology stack identification
  - Project purpose and goals
success_criteria:
  - All placeholder sections filled with accurate information
  - Technology stack clearly documented
  - Directory purposes explained
  - Getting started steps verified
---

<!-- agent-update:start:project-overview -->
# Project Overview

This project is a full-stack web application built with modern TypeScript frameworks, featuring a React-based client, Express-based server, and PostgreSQL database. It provides a foundation for building scalable web applications with type-safe APIs, real-time capabilities, and a comprehensive development toolchain.

## Quick Facts
- Root path: `/home/runner/workspace`
- Primary languages detected:
  - .tsx (127 files) - React components and pages
  - .ts (59 files) - TypeScript modules and configurations
  - .txt (10 files) - Documentation and configuration
  - .png (6 files) - Static assets and images
  - .json (4 files) - Configuration files
- Architecture: Monorepo with shared type definitions
- Database: PostgreSQL with Drizzle ORM
- Build tool: Vite for frontend bundling

## File Structure & Code Organization
- `attached_assets/` — Static assets and resources for documentation, design references, or deployment artifacts
- `client/` — React frontend application built with TypeScript, featuring UI components, pages, routing, and state management
- `components.json` — Shadcn/ui component configuration defining import paths and styling conventions for the UI component library
- `design_guidelines.md` — Design system documentation outlining visual standards, component usage patterns, and UX principles
- `drizzle.config.ts` — Drizzle ORM configuration specifying database connection settings, migration paths, and schema locations
- `package-lock.json` — NPM dependency lock file ensuring reproducible builds across environments
- `package.json` — Project manifest defining dependencies, scripts, and workspace configuration for the monorepo
- `postcss.config.js` — PostCSS configuration for CSS processing, including Tailwind CSS integration
- `replit.md` — Replit-specific documentation for running and deploying the application on the Replit platform
- `server/` — Express-based backend API with route handlers, middleware, database models, and business logic
- `shared/` — Shared TypeScript types, schemas, and utilities used across both client and server for type safety
- `tailwind.config.ts` — Tailwind CSS configuration defining theme customization, plugins, and content paths
- `tsconfig.json` — Root TypeScript compiler configuration with path mappings and compiler options
- `vite.config.ts` — Vite bundler configuration for development server, build optimization, and plugin setup

## Technology Stack Summary

**Runtime & Languages:**
- Node.js runtime environment
- TypeScript 5.x for type-safe development across the entire stack
- Modern ES modules with path mapping support

**Build & Development:**
- Vite for fast frontend development and optimized production builds
- TSX for TypeScript execution during development
- PostCSS with Tailwind CSS for utility-first styling
- ESLint and Prettier for code quality and formatting

## Core Framework Stack

**Backend (Server):**
- Express.js for HTTP server and REST API endpoints
- Drizzle ORM for type-safe database queries and migrations
- PostgreSQL as the primary relational database
- Session-based authentication with secure cookie handling

**Frontend (Client):**
- React 18 with hooks and functional components
- React Router for client-side routing and navigation
- TanStack Query (React Query) for server state management and caching
- Wouter for lightweight routing alternative

**Shared Layer:**
- Zod for runtime schema validation and type inference
- Shared type definitions ensuring contract consistency between client and server

**Architectural Patterns:**
- Monorepo structure with workspace-based dependency management
- Type-safe API contracts via shared schemas
- Component-driven UI development with Shadcn/ui
- Database-first schema design with Drizzle migrations

## UI & Interaction Libraries

**Component Library:**
- Shadcn/ui for accessible, customizable React components
- Radix UI primitives for headless component foundations
- Lucide React for consistent iconography

**Styling & Theming:**
- Tailwind CSS v3 for utility-first styling
- CSS variables for theme customization
- Dark mode support via class-based theming
- Responsive design utilities

**Accessibility:**
- ARIA-compliant components from Radix UI
- Keyboard navigation support
- Screen reader optimizations

**Developer Experience:**
- TypeScript for full type safety across UI components
- Component auto-import configuration
- Hot module replacement for instant feedback

## Development Tools Overview

**Essential Commands:**
- `npm run dev` - Start development servers for both client and server
- `npm run build` - Build production bundles
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

**Development Environment:**
- Replit-compatible configuration for cloud-based development
- Local development support with hot reload
- Database migrations managed via Drizzle Kit

**Code Quality:**
- TypeScript strict mode enabled
- Consistent import paths via tsconfig path mapping
- Shared linting and formatting configuration

For detailed setup instructions and workflow, see [Tooling & Productivity Guide](./tooling.md).

## Getting Started Checklist

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Set up database connection in environment variables
   - Review `.env.example` if available

3. **Initialize Database**
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Explore the Application**
   - Client runs on configured port (typically 5000)
   - Server API available at `/api` endpoints

6. **Review Documentation**
   - Read [Development Workflow](./development-workflow.md) for day-to-day tasks
   - Check [Architecture Overview](./architecture-overview.md) for system design
   - Consult [Testing Strategy](./testing-strategy.md) for quality assurance

## Next Steps

**For New Contributors:**
- Review the design guidelines in `design_guidelines.md`
- Explore existing components in `client/src/components`
- Understand the API structure in `server/routes`

**For Product Development:**
- Consult project issues and milestones for current priorities
- Review ADRs (Architecture Decision Records) for context on technical choices
- Engage with maintainers for feature planning and roadmap alignment

**External Resources:**
- Product specifications: Link to external product docs or requirements
- Stakeholder contacts: To be defined by project maintainers
- Deployment guides: See platform-specific documentation (e.g., `replit.md`)

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. ✅ Reviewed package.json for accurate dependency and script information
2. ✅ Analyzed directory structure and documented purpose of each major directory/file
3. ✅ Identified technology stack from package.json dependencies and configuration files
4. ✅ Documented core frameworks, UI libraries, and development tools
5. ✅ Verified getting started steps align with available scripts
6. ✅ Cross-referenced related documentation guides
7. ⚠️ External product specs and stakeholder information require human input

<!-- agent-readonly:sources -->
## Acceptable Sources
- package.json: Dependencies, scripts, and workspace configuration
- Configuration files: drizzle.config.ts, vite.config.ts, tailwind.config.ts, tsconfig.json
- Directory structure: Analysis of client/, server/, shared/ organization
- Component configuration: components.json for UI library setup
- Design documentation: design_guidelines.md for UX standards

<!-- agent-update:end -->
```
