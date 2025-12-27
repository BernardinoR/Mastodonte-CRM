```markdown
<!-- agent-update:start:project-overview -->
# Project Overview

This project is a full-stack web application built with TypeScript, featuring a React-based frontend and a Node.js backend. It solves the problem of managing and serving attached assets (such as images and files) in a web environment, enabling efficient upload, storage, and display of user-generated content. Beneficiaries include developers building interactive web apps, end-users interacting with asset-heavy interfaces, and teams requiring a scalable client-server architecture for asset management.

## Quick Facts
- Root path: `/home/runner/workspace`
- Primary languages detected: TypeScript (TS/TSX for client and server code), JavaScript (configs and utilities), with extensive image assets (PNG files)
- .tsx (127 files)
- .ts (59 files)
- .png (266 files)
- .json (4 files)
- .txt (10 files)
- Total files scanned: 476
- Repository size (approx.): 18.21 MB

## File Structure & Code Organization
### Directories
- `attached_assets/` — Stores static assets such as images (primarily PNG files) and other uploaded or attached resources used throughout the application, including UI elements, user uploads, and media files.
- `client/` — Contains the frontend codebase, including React components (written in TSX/TS), styles, and client-side logic for rendering the user interface and handling interactions.
- `server/` — Houses the backend codebase, including Node.js server logic, API routes, database interactions via Drizzle ORM, and server-side TypeScript modules for processing requests and managing data.
- `shared/` — Holds code that is shared between the client and server, such as types, utilities, constants, and business logic to ensure consistency and reduce duplication across the stack.

### Key Files
- `components.json` — Configuration file defining component registrations, exports, or metadata for the UI library or build process in the client application.
- `design_guidelines.md` — Documentation outlining the project's design principles, UI/UX standards, component usage, and visual consistency rules for contributors.
- `drizzle.config.ts` — Configuration for Drizzle ORM, specifying database schema paths, migrations, and connection details for the backend data layer.
- `package-lock.json` — Auto-generated lockfile for NPM dependencies, ensuring reproducible installations of packages across environments.
- `package.json` — Core manifest file defining project metadata, dependencies (e.g., React, Node modules, Drizzle), devDependencies, and NPM scripts for building, testing, and running the application.
- `postcss.config.js` — Configuration for PostCSS, a tool for transforming CSS with plugins; integrates with Tailwind and other processors for optimized stylesheets.
- `replit.md` — Instructions and setup guide specific to running the project in the Replit online IDE, including environment variables and deployment notes.
- `tailwind.config.ts` — Configuration for Tailwind CSS, customizing theme colors, fonts, breakpoints, and plugins to match the project's design system.
- `tsconfig.json` — TypeScript compiler configuration, defining compilation options, module resolution, paths, and strict mode settings for both client and server code.
- `vite.config.ts` — Configuration for Vite, the build tool and dev server, including plugin setups for React, TypeScript, and asset handling optimized for fast development and production builds.

## Technology Stack Summary
- **Primary runtimes:** Node.js (backend), modern browsers (frontend via Vite bundling).
- **Languages:** TypeScript (primary for type safety), JavaScript (for configs and polyfills).
- **Platforms:** Web application, deployable to cloud environments like Vercel, Netlify, or Replit.
- **Build tooling:** Vite for fast bundling and hot module replacement; NPM for package management.
- **Linting and formatting:** TypeScript strict mode enabled via `tsconfig.json`; ESLint and Prettier integration available (check `package.json` for exact tools); no explicit CI linting pipeline detected in repository root.

## Core Framework Stack
- **Backend:** Node.js with TypeScript; Drizzle ORM for database interactions (likely SQLite or PostgreSQL based on `drizzle.config.ts`); Express.js or similar routing framework (inferred from `server/` structure).
- **Frontend:** React (via TSX components) for building interactive UIs; Vite for development and production builds with hot module replacement.
- **Data:** Drizzle ORM for schema management, queries, and migrations; shared types in `shared/` for data consistency between client and server.
- **Messaging:** No explicit messaging frameworks (e.g., WebSockets or queues) detected; relies on HTTP REST APIs for client-server communication.
- **Architectural patterns:** Modular monorepo with separation of concerns (client/server/shared); type-safe code with shared interfaces; asset pipeline for handling `attached_assets/`.

## UI & Interaction Libraries
- **UI kits:** React components (custom-built in `client/`); Tailwind CSS for utility-first styling and responsive design.
- **Theming:** Customizable via `tailwind.config.ts`, supporting dark/light modes and brand colors as defined in the design system.
- **Accessibility:** Follow standard React a11y practices (e.g., semantic HTML, ARIA attributes); enforced via `design_guidelines.md`.
- **Localization:** No explicit i18n library detected; strings are managed via props in components or hardcoded.

## Development Tools Overview
- **Essential CLIs:** `npm` for dependency management and running scripts (e.g., `npm run dev` for Vite dev server, `npm run build` for production).
- **Scripts:** Defined in `package.json` for development, building, and potentially testing/linting.
- **Developer environments:** Supports local Node.js setup (v18+ recommended), Replit for cloud editing; Vite provides instant server startup with HMR.
- Link to [Tooling & Productivity Guide](./tooling.md) for deeper setup instructions, including environment variables and debugging tips.

## Getting Started Checklist
1. Clone the repository and navigate to the project root.
2. Install dependencies with `npm install`.
3. Start the development server by running `npm run dev` (starts Vite dev server for the client and proxies API requests to the server).
4. Review [Development Workflow](./development-workflow.md) for day-to-day tasks, such as adding new components or updating the database schema.
5. Consult `replit.md` if running in the Replit online IDE for environment-specific setup.

## Next Steps
- **Product positioning:** A lightweight, asset-focused full-stack app ideal for prototypes or MVPs in content management, media sharing, or e-learning spaces.
- **Key stakeholders:** Core development team (maintainers via GitHub repository); potential users in web design, content management, or educational technology.
- **External links:**
  - Check Replit integration for hosted demos (see `replit.md`).
  - Drizzle ORM documentation: [https://orm.drizzle.team/](https://orm.drizzle.team/)
  - Tailwind CSS documentation: [https://tailwindcss.com/](https://tailwindcss.com/)
  - Vite documentation: [https://vitejs.dev/](https://vitejs.dev/)
  - React documentation: [https://react.dev/](https://react.dev/)

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Review roadmap items or issues labelled "release" to confirm current goals.
2. Cross-check Quick Facts against `package.json` and environment docs.
3. Refresh the File Structure & Code Organization section to reflect new or retired modules; keep guidance actionable.
4. Link critical dashboards, specs, or runbooks used by the team.
5. Flag any details that require human confirmation (e.g., stakeholder ownership).

<!-- agent-readonly:sources -->
## Acceptable Sources
- Recent commits, release notes, or ADRs describing high-level changes.
- Product requirement documents linked from this repository.
- Confirmed statements from maintainers or product leads.
- Repository scan metadata (476 files, 18.21 MB, top-level directories: attached_assets, client, server, shared).

<!-- agent-update:end -->
```
