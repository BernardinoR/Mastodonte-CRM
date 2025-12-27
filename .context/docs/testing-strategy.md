```markdown
<!-- agent-update:start:testing-strategy -->
# Testing Strategy

This document outlines how quality is maintained across the codebase for the full-stack application, which includes client-side (React with Vite), server-side (Express/Node.js with TypeScript), and shared utilities. Testing ensures reliability, prevents regressions, and supports scalable development across the `client/`, `server/`, and `shared/` directories.

## Test Types

- **Unit**: Focus on individual functions, components, and modules in isolation. Uses Vitest as the primary framework for both client and server code, leveraging its native TypeScript support and Vite integration. Test files follow the naming convention `*.test.ts` or `*.test.tsx` and are colocated with source files (e.g., `Component.tsx` alongside `Component.test.tsx`) or placed in `__tests__/` subdirectories. Mocks are used for external dependencies like APIs or databases to keep tests fast and deterministic. Coverage targets isolated logic in `shared/` utilities (schema validation, type definitions), client components (React hooks, UI logic), and server handlers (route controllers, middleware).

- **Integration**: Test interactions between modules, such as API endpoints on the server integrating with database models (Drizzle ORM with PostgreSQL) or shared libraries, or client components interacting with server APIs via TanStack Query. Scenarios include full request-response cycles for Express routes and component-state flows in the client. Tooling includes Vitest with Supertest for server API testing and MSW (Mock Service Worker) for client-side API mocking. Tests are run in a Node.js environment for server and browser-like setup (via happy-dom or jsdom) for client, ensuring no real database connections unless using a test database instance.

- **End-to-end**: Simulate user workflows across the full application stack, from client UI interactions to server processing and data persistence. Uses Playwright for browser-based E2E tests, focusing on critical paths like user authentication, form submissions, and data visualization in the client. Harnesses include a local development server (`npm run dev`) and a test database instance. Tests run in Chromium, Firefox, and WebKit environments, with traces and screenshots captured for failures. Separate suites exist for client-heavy flows and API contract validation.

## Running Tests

- Execute unit and integration tests with `npm run test` from the repository root, which runs Vitest in watch mode by default.
- Run tests once without watch mode: `npm run test -- --run` for CI environments or single execution.
- Use watch mode locally for iterative development: `npm run test` (default Vitest behavior), which reruns affected tests on file changes and supports TDD workflows across client, server, and shared code.
- Add coverage runs before releases: `npm run test:coverage` (alias for `npm run test -- --coverage`), generating reports in `coverage/` with HTML summaries. This aggregates coverage from all packages.
- Run E2E tests with `npm run test:e2e` which starts the development server and runs Playwright tests.
- For interactive E2E debugging: `npm run test:e2e:ui` to open the Playwright UI.

For package-specific testing, use Vitest's filtering: `npm run test -- client/` or `npm run test -- server/`.

## Quality Gates

- **Coverage Expectations**: Maintain at least 70% statement coverage and 60% branch coverage across the codebase, enforced via CI checks. Unit tests should aim for 80%+ in `shared/` schemas and critical server handlers; integration/E2E provide supplementary validation but are not coverage-gated. Reports are threshold-checked using Vitest's coverage configuration in `vitest.config.ts`.
- **Linting and Formatting**: All code must pass ESLint (with `@typescript-eslint` rules for TypeScript files) before merging. CI runs `npm run lint` as a required check on pull requests. Violations block merges unless approved by maintainers. Additional gates include TypeScript compilation (`npm run check` which runs `tsc --noEmit`) to ensure type safety across the codebase.
- **Database Schema Validation**: Changes to Drizzle schema files in `shared/schema.ts` trigger automatic validation via `npm run db:push` in development or migration generation for production deployments.

These gates are defined in the CI/CD pipeline, ensuring consistency for contributions to any directory.

## Test Configuration Files

- `vitest.config.ts` - Root Vitest configuration with coverage settings and test environment
- `playwright.config.ts` - Playwright E2E test configuration (if present)
- `tsconfig.json` - TypeScript configuration affecting test compilation
- `.eslintrc.*` - ESLint rules applied to test files

## Troubleshooting

- **Flaky Suites**: Occasional flakiness in E2E tests due to timing issues with API responses; mitigate by using Playwright's auto-waiting features or explicit `waitFor` assertions. Track via issues labeled "flaky-test" for visibility and resolution.
- **Long-Running Tests**: Server integration tests with database setup can exceed 5s; increase Vitest timeouts via `test.setTimeout()` or configure globally in `vitest.config.ts`. E2E suites may slow on CI due to resource limits—use `--workers=1` to reduce parallelism when debugging.
- **Environment Quirks**: happy-dom/jsdom in Vitest doesn't support all DOM APIs; polyfill missing features (e.g., `IntersectionObserver`, `ResizeObserver`) in test setup files. Database tests require PostgreSQL connection; if unavailable, use mocks or skip with environment-based conditionals. For cross-browser issues in E2E, Playwright supports multiple browsers via project configuration.
- **TypeScript Errors in Tests**: Ensure `tsconfig.json` includes test files and that `@types/node` is installed. Run `npm run check` to validate types before investigating test failures.
- **Module Resolution Issues**: Vitest uses Vite's resolver; ensure path aliases in `vite.config.ts` are mirrored in `tsconfig.json` for consistent resolution.

Refer to [Troubleshooting Guide](./troubleshooting.md) for broader setup issues, and open new issues for persistent problems.

## Related Documentation

- [Architecture Overview](./architecture.md) - System design context for test boundaries
- [Development Workflow](./development-workflow.md) - How testing fits into the development process
- [CI/CD Pipeline](./ci-cd.md) - Automated test execution and quality gates

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Review test scripts and CI workflows to confirm command accuracy.
2. Update Quality Gates with current thresholds (coverage %, lint rules, required checks).
3. Document new test categories or suites introduced since the last update.
4. Record known flaky areas and link to open issues for visibility.
5. Confirm troubleshooting steps remain valid with current tooling.

<!-- agent-readonly:sources -->
## Acceptable Sources
- `package.json` scripts and testing configuration files.
- CI job definitions (GitHub Actions, CircleCI, etc.).
- Issue tracker items labelled "testing" or "flaky" with maintainer confirmation.

<!-- agent-update:end -->
```
