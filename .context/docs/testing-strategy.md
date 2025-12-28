```markdown
---
ai_update_goal: "Document comprehensive testing strategy including frameworks, conventions, and quality gates"
required_inputs:
  - "package.json test scripts"
  - "CI/CD configuration files"
  - "Test file locations and naming patterns"
  - "Coverage thresholds and quality requirements"
success_criteria:
  - "All test types clearly documented with examples"
  - "Commands verified against package.json"
  - "Quality gates reflect actual CI requirements"
  - "Troubleshooting section addresses known issues"
---

<!-- agent-update:start:testing-strategy -->
# Testing Strategy

This document outlines how quality is maintained across the codebase through comprehensive testing practices, tooling, and quality gates.

## Test Types

### Unit Tests
- **Framework**: Jest (configured in `jest.config.js`)
- **Location**: Co-located with source files in `__tests__/` directories or as `.test.ts` files
- **Naming Convention**: 
  - `<module-name>.test.ts` for TypeScript modules
  - `<component-name>.test.tsx` for React components
- **Scope**: Individual functions, classes, and components in isolation
- **Mocking**: Uses Jest's built-in mocking capabilities for dependencies

### Integration Tests
- **Framework**: Jest with Supertest for API testing
- **Location**: 
  - Server integration tests: `server/src/__tests__/integration/`
  - Client integration tests: `client/src/__tests__/integration/`
- **Scenarios Covered**:
  - API endpoint request/response flows
  - Database operations with test fixtures
  - Service layer interactions
  - Component integration with context providers
- **Required Tooling**: 
  - Test database instance (in-memory or containerized)
  - Mock external service dependencies
  - Test data fixtures in `shared/test-fixtures/`

### End-to-End Tests
- **Framework**: Playwright (if configured) or manual testing procedures
- **Environment**: Staging environment or local development setup
- **Scope**: Critical user workflows including:
  - Authentication flows
  - Core feature interactions
  - Multi-step business processes
- **Note**: E2E test automation is in progress; refer to manual test plans in `docs/manual-testing.md` (if exists)

## Running Tests

### Execute All Tests
```bash
npm run test
```
Runs the complete test suite across client, server, and shared packages.

### Watch Mode (Local Development)
```bash
npm run test -- --watch
```
Automatically reruns tests on file changes for rapid feedback during development.

### Coverage Reports
```bash
npm run test -- --coverage
```
Generates coverage reports in `coverage/` directory. Run before releases to ensure quality gates are met.

### Package-Specific Tests
```bash
# Client tests only
npm run test:client

# Server tests only
npm run test:server

# Shared utilities tests
npm run test:shared
```

### CI Test Execution
Tests run automatically on:
- Every pull request
- Commits to `main` and `develop` branches
- Pre-release tags

## Quality Gates

### Coverage Requirements
- **Minimum Overall Coverage**: 80%
- **Critical Paths**: 90%+ coverage required for:
  - Authentication and authorization logic
  - Payment processing
  - Data validation and sanitization
- **Coverage Reports**: Generated on every CI run and attached as artifacts

### Pre-Merge Checks
All of the following must pass before merging:
1. **Test Suite**: All tests passing (zero failures)
2. **Linting**: ESLint with no errors (`npm run lint`)
3. **Type Checking**: TypeScript compilation with no errors (`npm run type-check`)
4. **Formatting**: Prettier formatting validated (`npm run format:check`)
5. **Build**: Production build succeeds (`npm run build`)

### Code Quality Standards
- **Linting Rules**: ESLint configured with:
  - `@typescript-eslint/recommended`
  - `eslint-plugin-react` for React best practices
  - Custom rules in `.eslintrc.json`
- **Type Safety**: Strict TypeScript mode enabled
- **Formatting**: Prettier with configuration in `.prettierrc`

## Troubleshooting

### Common Issues

#### Flaky Tests
- **Database Connection Timeouts**: Increase Jest timeout in affected tests with `jest.setTimeout(10000)`
- **Async Race Conditions**: Ensure proper use of `await` and `waitFor()` in React Testing Library tests
- **Known Flaky Suites**: 
  - WebSocket connection tests (intermittent timing issues)
  - File upload integration tests (may fail on slow CI runners)

#### Long-Running Tests
- **Database Seeding**: Large fixture sets can slow integration tests
  - Use minimal fixtures per test
  - Consider database snapshots for faster resets
- **API Integration Tests**: Network delays can extend test duration
  - Mock external API calls when possible
  - Use shorter timeouts for local development

#### Environment-Specific Quirks
- **Windows Path Issues**: Use `path.join()` instead of string concatenation
- **CI Memory Limits**: Tests may fail on CI with limited resources
  - Run tests with `--maxWorkers=2` to reduce parallel load
- **Node Version Mismatches**: Ensure Node version matches `.nvmrc` specification
  - CI uses Node 18.x LTS
  - Use `nvm use` locally to align versions

### Debug Mode
```bash
# Run tests with verbose output
npm run test -- --verbose

# Run specific test file
npm run test -- path/to/test-file.test.ts

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Getting Help
- Review test logs in CI artifacts
- Check existing issues tagged with `testing` or `flaky-test`
- Consult `docs/development-workflow.md` for local setup requirements

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. ✅ Reviewed `package.json` scripts to confirm test commands
2. ✅ Updated Quality Gates with coverage thresholds and CI requirements
3. ✅ Documented unit, integration, and E2E test categories
4. ✅ Recorded known flaky test areas with mitigation strategies
5. ✅ Confirmed troubleshooting steps match current tooling (Jest, ESLint, TypeScript)

<!-- agent-readonly:sources -->
## Acceptable Sources
- `package.json` test scripts: `test`, `test:client`, `test:server`, `test:shared`
- CI configuration: GitHub Actions workflows in `.github/workflows/`
- Jest configuration: `jest.config.js` at repository root
- ESLint and TypeScript configs: `.eslintrc.json`, `tsconfig.json`
- Known issues: Repository issue tracker filtered by `testing` and `flaky-test` labels

<!-- agent-update:end -->
```
