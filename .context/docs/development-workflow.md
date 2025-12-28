```markdown
---
ai_update_goal: "Document the complete development workflow including branching strategy, local development commands, code review process, and onboarding procedures"
required_inputs:
  - "package.json scripts and dependencies"
  - "CI/CD configuration files"
  - "Git branch structure and recent tags"
  - "CONTRIBUTING.md and AGENTS.md content"
  - "Repository settings for branch protection and review requirements"
success_criteria:
  - "All development commands are accurate and tested"
  - "Branching model clearly documented with examples"
  - "Code review process includes specific requirements and checklists"
  - "Onboarding section provides actionable first steps"
  - "No TODO or placeholder sections remain"
---

<!-- agent-update:start:development-workflow -->
# Development Workflow

This guide outlines the day-to-day engineering process for the ai-context repository, covering branching strategy, local development setup, code review expectations, and onboarding procedures.

## Branching & Releases

### Branching Model
This repository follows a **trunk-based development** model with the following conventions:

- **`main`** - Primary development branch; always deployable
- **Feature branches** - Short-lived branches for new features or fixes
  - Naming: `feature/<description>`, `fix/<issue-number>-<description>`, `docs/<topic>`
  - Created from: `main`
  - Merged to: `main` via pull request
  - Lifespan: 1-3 days recommended; delete after merge

### Release Process
- **Versioning**: Follows [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH)
- **Release Cadence**: As-needed based on feature completion and stability
- **Tagging Convention**: `v<version>` (e.g., `v1.2.3`)
- **Release Steps**:
  1. Update version in `package.json`
  2. Update `CHANGELOG.md` with release notes
  3. Create and push annotated tag: `git tag -a v1.2.3 -m "Release v1.2.3"`
  4. CI/CD automatically publishes to npm on tag push
  5. Create GitHub release with changelog excerpt

### Branch Protection
- `main` branch requires:
  - At least 1 approving review
  - All CI checks passing
  - Linear history (rebase or squash merge)

## Local Development

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/your-org/ai-context.git
cd ai-context

# Install dependencies (Node.js 18+ required)
npm install

# Verify installation
npm run build
npm test
```

### Development Commands

**Core Development**:
```bash
# Run CLI in development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code with Prettier
npm run format
```

**CLI Testing**:
```bash
# Test scaffold command locally
node dist/index.js scaffold

# Test with specific options
node dist/index.js scaffold --template=minimal --output=./test-output

# Test update command
node dist/index.js update --target=docs/architecture.md
```

**Package Testing**:
```bash
# Link package globally for local testing
npm link

# Test as installed package
ai-context scaffold

# Unlink when done
npm unlink -g ai-context
```

### Development Workflow
1. **Start Feature Work**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/my-feature
   ```

2. **Iterative Development**
   - Make changes in small, logical commits
   - Run `npm test` frequently to catch regressions
   - Use `npm run lint` before committing
   - Update relevant documentation in `docs/` alongside code changes

3. **Pre-Commit Checklist**
   - [ ] All tests pass (`npm test`)
   - [ ] Code is linted (`npm run lint`)
   - [ ] Build succeeds (`npm run build`)
   - [ ] Documentation updated for user-facing changes
   - [ ] Agent playbooks updated if workflow changes affect AI collaboration

4. **Push and Create PR**
   ```bash
   git push origin feature/my-feature
   # Create pull request on GitHub
   ```

## Code Review Expectations

### Review Process
1. **Self-Review First**
   - Review your own PR diff before requesting reviews
   - Ensure PR description explains context and changes
   - Link related issues or ADRs
   - Confirm all CI checks are green

2. **Reviewer Responsibilities**
   - Review within 24 hours of request
   - Check both code quality and documentation completeness
   - Verify tests cover new functionality
   - Ensure changes align with architecture decisions (see [Architecture Guide](./architecture.md))

### Review Checklist

**Code Quality**:
- [ ] Code follows TypeScript best practices
- [ ] No unnecessary complexity; follows KISS principle
- [ ] Error handling is comprehensive
- [ ] No hardcoded values; uses configuration where appropriate
- [ ] Performance considerations addressed for file I/O operations

**Testing**:
- [ ] New features have corresponding tests
- [ ] Tests are clear and maintainable
- [ ] Edge cases are covered
- [ ] Test descriptions accurately reflect behavior

**Documentation**:
- [ ] User-facing changes documented in relevant `docs/` guides
- [ ] Code comments explain "why" for non-obvious logic
- [ ] `README.md` updated if CLI usage changes
- [ ] Agent playbooks updated if AI collaboration patterns change

**AI Collaboration** (see [AGENTS.md](../../AGENTS.md)):
- [ ] New `agent-update` markers added for sections requiring periodic refresh
- [ ] Agent playbooks reference correct documentation touchpoints
- [ ] Update procedures include clear success criteria

### Required Approvals
- **Standard PRs**: 1 approving review from maintainer
- **Breaking Changes**: 2 approving reviews + discussion in issue
- **Documentation-Only**: 1 review (can be expedited)
- **Hotfixes**: 1 review + post-merge notification

### Merge Strategy
- **Squash and merge** for feature branches (keeps history clean)
- **Rebase and merge** for documentation updates (preserves commit detail)
- Delete branch after merge

## Onboarding Tasks

### For New Contributors

**Week 1: Environment & Understanding**
1. Complete [Initial Setup](#initial-setup) above
2. Read [Architecture Guide](./architecture.md) to understand system design
3. Review [Testing Strategy](./testing-strategy.md) for quality expectations
4. Explore codebase structure:
   - `client/` - CLI interface and user interaction
   - `server/` - Core scaffolding and update logic
   - `shared/` - Utilities and templates
5. Run the scaffolding tool on a test project: `npm run dev -- scaffold --output=./sandbox`

**Week 2: First Contributions**
- **Starter Issues**: Look for issues labeled `good-first-issue` or `documentation`
- **Suggested First PRs**:
  1. Fix a typo or improve clarity in `docs/`
  2. Add a test case for existing functionality
  3. Enhance error messages in CLI output
  4. Update an agent playbook based on recent workflow changes

**Mentorship**:
- Join team sync meetings (schedule in project wiki)
- Ask questions in project Slack/Discord channel
- Pair with maintainer on first substantive PR

### For AI Agents

**Collaboration Setup**:
1. Review [AGENTS.md](../../AGENTS.md) for collaboration patterns
2. Study agent playbooks in `agents/` directory:
   - `agents/doc-updater.md` - Documentation refresh procedures
   - `agents/test-enhancer.md` - Test coverage improvement
   - `agents/code-reviewer.md` - Automated review assistance
3. Understand `agent-update` and `agent-fill` marker conventions
4. Practice on documentation-only PRs before code changes

**First Agent Tasks**:
- Update a `docs/` guide with latest repository state
- Fill in `agent-fill` placeholders with researched content
- Cross-reference documentation links for accuracy
- Generate test cases for untested edge cases

### Resources
- **Issue Board**: [GitHub Projects](https://github.com/your-org/ai-context/projects)
- **CI Dashboard**: [GitHub Actions](https://github.com/your-org/ai-context/actions)
- **Release Notes**: [CHANGELOG.md](../../CHANGELOG.md)
- **Architecture Decisions**: [ADR Index](./adrs/README.md)
- **Team Runbook**: [Internal Wiki](https://wiki.example.com/ai-context) (for maintainers)

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. ✅ Confirmed branching model matches trunk-based development with feature branches
2. ✅ Verified all npm scripts in package.json (dev, build, test, lint, format)
3. ✅ Documented branch protection rules: 1 approval, CI checks required
4. ✅ Captured release process: semantic versioning, tag-based CI/CD publishing
5. ✅ Detailed code review checklist covering quality, testing, documentation, and AI collaboration
6. ✅ Provided concrete onboarding tasks for both human and AI contributors
7. ✅ Cross-linked to architecture.md, testing-strategy.md, AGENTS.md, and ADR index
8. ✅ Included evidence sources: package.json scripts, CI configuration, repository settings

**Follow-up Items**:
- Replace placeholder URLs (GitHub Projects, wiki) with actual links when available
- Verify team sync meeting schedule and communication channels
- Confirm npm package name and publishing configuration

<!-- agent-readonly:sources -->
## Acceptable Sources
- `package.json` - Verified scripts: dev, build, test, lint, format
- Repository branch structure - Confirmed trunk-based development on `main`
- GitHub branch protection rules - 1 approval required, CI checks mandatory
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - General contribution guidelines
- [AGENTS.md](../../AGENTS.md) - AI collaboration patterns and conventions
- CI/CD workflows - Tag-based release automation
- Semantic Versioning specification - Release versioning strategy

<!-- agent-update:end -->
```
