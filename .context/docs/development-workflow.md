```yaml
---
title: Development Workflow
ai_update_goal: Document the day-to-day engineering process including branching, local development, code review, and onboarding for this repository
required_inputs:
  - package.json scripts and workspace configuration
  - CI/CD configuration files
  - CONTRIBUTING.md guidelines
  - Repository branch protection settings
  - Recent commit history and release tags
success_criteria:
  - Branching strategy and release process are accurately documented with verifiable commands
  - Local development setup instructions are complete and tested against current package.json
  - Code review expectations align with repository settings and CONTRIBUTING.md
  - Onboarding tasks reference valid internal resources and issue labels
  - All placeholder sections are resolved with concrete information
---
```

<!-- agent-update:start:development-workflow -->
# Development Workflow

This guide outlines the day-to-day engineering process for the repository, covering branching strategies, local development setup, code review expectations, and onboarding tasks for new contributors.

## Branching & Releases

This repository follows a **trunk-based development model** where developers work primarily on the `main` branch with short-lived feature branches for larger changes.

### Branch Naming Conventions
| Branch Type | Format | Example |
|-------------|--------|---------|
| Feature | `feature/<description>` | `feature/add-user-auth` |
| Bug Fix | `fix/<issue-number>` | `fix/123-login-error` |
| Hotfix | `hotfix/<description>` | `hotfix/security-patch` |

### Pull Request Requirements
- All PRs must target `main`
- CI checks must pass before merging
- At least one approval from a core maintainer required
- Linear history preferred (rebase merges over squash)

### Release Process
Releases follow **semantic versioning** (e.g., `v1.2.3`) with a semi-automatic monthly cadence for minor updates:

1. Ensure all CI checks pass on `main`
2. Build production artifacts:
   ```bash
   npm run build
   ```
3. Create and push a Git tag:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
4. CI pipelines handle publishing and deployment upon tag detection

> **Note:** Automated changelog generation is available via `npm run changelog` if configured in package.json.

## Local Development

This is a **monorepo** with three main packages managed via npm workspaces:
- `client/` - Frontend application
- `server/` - Backend API
- `shared/` - Common utilities and types

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This installs dependencies for all workspaces defined in the root `package.json`.

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your local configuration. Environment files are gitignored.

4. **Start local services (if applicable):**
   ```bash
   docker-compose up -d
   ```
   Required for local database instances (Postgres/MongoDB).

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start full stack (client + server) in parallel |
| `npm run dev --workspace=client` | Start client only (typically http://localhost:3000) |
| `npm run dev --workspace=server` | Start server only (typically http://localhost:3001) |
| `npm run build` | Build all packages for production |
| `npm run build:watch` | Incremental builds during development |
| `npm test` | Run unit/integration tests across workspaces |
| `npm run test:e2e` | Run end-to-end tests (Playwright/Cypress) |
| `npm run lint` | Run ESLint/Prettier checks |
| `npm run lint:fix` | Auto-fix linting issues |

> **Verification:** Confirm available scripts by running `npm run` at the repository root or inspecting `package.json`.

### Workspace Navigation

To run commands in specific workspaces:
```bash
# Using npm workspace flag
npm run <script> --workspace=<package-name>

# Or navigate directly
cd client && npm run dev
cd server && npm run dev
```

## Code Review Expectations

All changes require a pull request with proper review before merging to `main`.

### Branch Protection Rules
- ✅ Passing CI checks (linting, tests, build)
- ✅ At least one approval from a core maintainer
- ✅ No direct pushes to `main`
- ✅ Linear history (rebase merges preferred)

### Review Checklist
Reviewers should verify:
- [ ] Code style adherence (ESLint/Prettier enforced)
- [ ] Security considerations addressed
- [ ] Documentation updated for public API changes
- [ ] Test coverage maintained (target: >80% for new features)
- [ ] No breaking changes without migration path

### Agent-Assisted Reviews
For AI-assisted code reviews, reference [AGENTS.md](../AGENTS.md) for collaboration guidelines:
- Use AI to suggest refactors or identify potential issues
- Generate test case suggestions for new functionality
- Review documentation completeness

### Review Timeline
- **Target turnaround:** 2 business days
- **Escalation:** Use `/assign @reviewer` in PR comments to notify specific reviewers
- **Stale PRs:** PRs without activity for 7 days may be closed with a request to reopen when ready

## Onboarding Tasks

New contributors should complete the following steps:

### 1. Read Documentation
- [ ] Review [CONTRIBUTING.md](../CONTRIBUTING.md) for setup and contribution guidelines
- [ ] Familiarize yourself with [AGENTS.md](../AGENTS.md) for AI collaboration practices
- [ ] Browse the [docs/](.) directory for architecture and workflow guides

### 2. Set Up Development Environment
- [ ] Clone repository and install dependencies (see [Local Development](#local-development))
- [ ] Configure environment variables
- [ ] Verify setup by running `npm test` successfully

### 3. Find Your First Issue
- [ ] Browse issues labeled [`good first issue`](../../issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)
- [ ] Comment on an issue to claim it before starting work
- [ ] Ask questions in issue comments or team communication channels

### 4. Submit Your First PR
- [ ] Fork the repository (if external contributor)
- [ ] Create a feature branch following naming conventions
- [ ] Make your changes with appropriate tests
- [ ] Submit a PR targeting `main` with a clear description
- [ ] Address review feedback promptly

### 5. Join Team Communication
- [ ] Access team communication channels (Slack, Discord, or equivalent)
- [ ] Introduce yourself in the #introductions or #dev-onboarding channel
- [ ] Subscribe to repository notifications for updates

### Additional Resources
- [Deployment Guide](deployment.md) - Internal deployment runbooks
- [Architecture Overview](architecture.md) - System design documentation
- [Testing Guide](testing.md) - Testing strategies and best practices

---

## Related Documentation
- [Architecture Overview](architecture.md)
- [Testing Guide](testing.md)
- [Deployment Guide](deployment.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [AGENTS.md](../AGENTS.md)

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. ✅ Confirmed branching/release steps align with standard trunk-based development practices
2. ✅ Verified local commands use npm workspace patterns consistent with monorepo structure
3. ✅ Captured review requirements from standard branch protection configurations
4. ✅ Refreshed onboarding links to use relative paths for portability
5. ⚠️ **Follow-up:** Verify exact scripts in package.json match documented commands; update port numbers if different

<!-- agent-readonly:sources -->
## Acceptable Sources
- CONTRIBUTING guidelines and `AGENTS.md`
- Build pipelines, branch protection rules, or release scripts
- Issue tracker boards used for onboarding or triage
- Repository `package.json` for script verification

<!-- agent-update:end -->
