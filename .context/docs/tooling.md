<!-- agent-update:start:tooling -->
# Tooling & Productivity Guide

Collect the scripts, automation, and editor settings that keep contributors efficient.

## Required Tooling
- **Node.js** — Install the latest LTS version (v20+) from [nodejs.org](https://nodejs.org/). Required for running the server, building the client, and executing shared scripts across the monorepo.
- **Git** — Install via your OS package manager (e.g., `brew install git` on macOS or `apt install git` on Ubuntu) or from [git-scm.com](https://git-scm.com/). Version 2.30+ recommended. Essential for version control, cloning the repo, and submitting pull requests.
- **pnpm** — Install globally with `npm install -g pnpm` (version 8+). Acts as the primary package manager for the monorepo setup, handling dependencies in `client/`, `server/`, and `shared/` directories efficiently with its symlink-based structure.
- **TypeScript** — Bundled as a dev dependency; no global install required. The monorepo uses TypeScript across all packages for type safety and IDE intelligence.

## Recommended Automation
- **Pre-commit hooks**: Configured via Husky (in `package.json` scripts) and lint-staged. Runs ESLint checks and Prettier formatting automatically before commits to enforce code quality without manual intervention. See `.husky/pre-commit` for the hook script.
- **Linting/formatting commands**: Use `pnpm lint` (powered by ESLint for code style and error detection) and `pnpm format` (Prettier for consistent formatting). Integrate into CI via the `.github/workflows/` setup. Run `pnpm lint:fix` to auto-fix issues where possible.
- **Code generators/scaffolding**: Leverage the ai-context tool (see [docs/architecture.md](docs/architecture.md)) for generating boilerplate in `client/` and `server/`. Run `pnpm scaffold` to initialize new components following established patterns.
- **Shortcuts/watch modes**: `pnpm dev` starts concurrent watchers for client (Vite-based HMR at `http://localhost:5173`) and server (tsx watch mode for auto-restarts at `http://localhost:5000`), enabling a fast local development loop.
- **Type checking**: Run `pnpm check` to execute TypeScript compiler checks across all packages without emitting files. Useful for CI validation and pre-push verification.

## IDE / Editor Setup
- **VS Code extensions** (recommended):
  - "ESLint" (by Microsoft) — Real-time linting with auto-fix on save
  - "Prettier - Code formatter" — Auto-formatting on save
  - "TypeScript Importer" — Quick module imports in TypeScript files
  - "Tailwind CSS IntelliSense" — Autocomplete for Tailwind classes in `client/`
  - "REST Client" — Test API endpoints directly from `.http` files
- **Workspace settings**: Use the provided `.vscode/settings.json` (if present) or create one with:
  ```json
  {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "typescript.preferences.importModuleSpecifier": "relative",
    "files.exclude": {
      "**/node_modules": true,
      "**/dist": true,
      "**/.turbo": true
    }
  }
  ```
- **Snippets/templates**: Share custom snippets in `.vscode/my-snippets.code-snippets` for common patterns like React components in `client/src/components/` or Express routes in `server/routes/`.

## Productivity Tips
- **Terminal aliases**: Add these to your shell profile (`~/.zshrc`, `~/.bashrc`, or equivalent):
  ```bash
  alias dev="pnpm dev"
  alias test="pnpm test"
  alias lint="pnpm lint"
  alias build="pnpm build"
  ```
- **Container workflows**: Use Docker (install from [docker.com](https://docker.com/)) with `docker-compose up` to spin up a production-like environment mirroring the full stack (client, server, and any databases), as defined in `docker-compose.yml` if present in the repository root.
- **Local emulators**: For API testing, run the server with `pnpm dev` and use tools like:
  - **Postman** or **Insomnia** for manual API exploration
  - **curl** for quick command-line tests
  - Built-in Swagger docs at `http://localhost:5000/api-docs` (if OpenAPI is configured in server)
- **Database tools**: If using PostgreSQL or SQLite, tools like DBeaver, TablePlus, or the VS Code SQLite extension help inspect local data.
- **Shared scripts**: Check the `scripts/` directory (if present) for utilities. Common scripts may include:
  - `db:migrate` — Run database migrations
  - `db:seed` — Seed development data
  - `clean` — Remove build artifacts and node_modules

## Monorepo-Specific Tips
- **Package resolution**: The monorepo uses pnpm workspaces. Shared code in `shared/` is automatically linked to `client/` and `server/` via workspace protocol (`workspace:*`).
- **Running package-specific commands**: Use `pnpm --filter <package> <command>` to target a specific workspace (e.g., `pnpm --filter client build`).
- **Dependency management**: Add dependencies to the correct package directory. Use `pnpm add <pkg> --filter <workspace>` to scope installations.

## Troubleshooting
| Issue | Solution |
|-------|----------|
| `pnpm install` fails | Delete `node_modules` and `pnpm-lock.yaml`, then reinstall |
| Port already in use | Check for zombie processes with `lsof -i :<port>` and kill them |
| TypeScript errors after pull | Run `pnpm install` to sync dependencies, then restart TS server in VS Code |
| Hot reload not working | Ensure Vite dev server is running; check browser console for WebSocket errors |

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Verify commands align with the latest scripts and build tooling.
2. Remove instructions for deprecated tools and add replacements.
3. Highlight automation that saves time during reviews or releases.
4. Cross-link to runbooks or README sections that provide deeper context.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Onboarding docs, internal wikis, and team retrospectives.
- Script directories, package manifests, CI configuration.
- Maintainer recommendations gathered during pairing or code reviews.

<!-- agent-update:end -->
