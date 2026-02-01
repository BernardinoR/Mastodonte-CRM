# AGENTS.md

## Dev environment tips
- Install dependencies with `npm install` before running.
- Use `npm run dev` to start both Vite dev server and Express backend with HMR.
- Run `npm run check` for TypeScript type checking.
- Run `npm run build` to create production bundles before deploying.
- Database changes: edit `prisma/schema.prisma`, then `npm run db:push` or `npm run db:migrate`.

## Testing instructions
- No test framework is currently configured.
- Validate changes manually via the dev server preview.
- Run `npm run check` to catch TypeScript errors before committing.

## PR instructions
- Follow Conventional Commits (e.g., `feat(tasks): add bulk delete`, `fix(auth): handle SSO redirect`).
- Scope by feature: `auth`, `clients`, `tasks`, `meetings`, `users`, `api`, `db`.
- Confirm `npm run check` and `npm run build` pass before opening a PR.

## Repository map
- `client/` — React frontend application. Feature modules in `client/src/features/`, shared UI in `client/src/shared/`.
- `server/` — Express backend. API routes in `routes.ts`, data access in `storage.ts`, auth middleware in `auth.ts`.
- `prisma/` — Database schema and migrations. Edit `schema.prisma` for model changes.
- `design_guidelines.md` — Full design system specification (typography, colors, spacing, components).
- `components.json` — Shadcn/UI configuration (style: new-york, path aliases).
- `package.json` — Dependencies and npm scripts.
- `vite.config.ts` — Vite build configuration with path aliases.
- `tailwind.config.ts` — Tailwind CSS theme with custom tokens and dark mode.
- `tsconfig.json` — TypeScript config with strict mode and path aliases (`@/`, `@features/`, `@app/`, `@shared/`).
## AI Context References
- Documentation index: `.context/docs/README.md`
- Agent playbooks: `.context/agents/README.md`

