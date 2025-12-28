```markdown
---
ai_update_goal: Document all tooling, automation, and productivity workflows
required_inputs:
  - package.json scripts
  - CI/CD configuration
  - Development environment setup
  - Editor configurations
  - Pre-commit hooks and linters
success_criteria:
  - All required tools listed with installation instructions
  - Development automation workflows documented
  - Editor setup guidance provided
  - Productivity tips based on actual project structure
---

<!-- agent-update:start:tooling -->
# Tooling & Productivity Guide

This guide documents the scripts, automation, and editor settings that keep contributors efficient across the ai-context project.

## Required Tooling

### Node.js & pnpm
- **Node.js**: v18+ required (check `.nvmrc` if present)
- **pnpm**: v8+ recommended for workspace management
  ```bash
  npm install -g pnpm
  ```
- Powers: Package management, script execution, workspace coordination

### TypeScript
- **Version**: 5.x (defined in `package.json`)
- **Installation**: Included in project dependencies
  ```bash
  pnpm install
  ```
- Powers: Type checking, compilation for client/server/shared packages

### Git
- **Version**: 2.30+ recommended
- **Installation**: Via system package manager
- Powers: Version control, pre-commit hooks, collaboration workflows

### Docker (Optional but Recommended)
- **Version**: Latest stable
- **Installation**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Powers: Containerized development, consistent environments

## Recommended Automation

### Pre-commit Hooks
The project uses Git hooks to maintain code quality:
- **Linting**: ESLint runs on staged files
- **Formatting**: Prettier auto-formats code
- **Type checking**: TypeScript validates types before commit

Setup (if not auto-configured):
```bash
pnpm run prepare
```

### Linting & Formatting Commands
```bash
# Lint all packages
pnpm run lint

# Format all code
pnpm run format

# Type check entire workspace
pnpm run type-check
```

### Development Watch Modes
```bash
# Watch mode for server development
cd server && pnpm run dev

# Watch mode for client development
cd client && pnpm run dev

# Build shared package in watch mode
cd shared && pnpm run build --watch
```

### Code Generation & Scaffolding
- **AI Context Generation**: `pnpm run generate-context` - Updates AI-friendly repository snapshots
- **Component Templates**: Use workspace-specific generators in `client/` and `server/` directories
- **Type Generation**: Shared types auto-sync across packages via workspace references

## IDE / Editor Setup

### VS Code (Recommended)
**Required Extensions**:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript and JavaScript Language Features (built-in)

**Recommended Extensions**:
- GitLens (`eamodio.gitlens`)
- Error Lens (`usernamehw.errorlens`)
- Path Intellisense (`christian-kohler.path-intellisense`)
- Markdown All in One (`yzhang.markdown-all-in-one`)

**Workspace Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### JetBrains IDEs (WebStorm/IntelliJ)
- Enable ESLint: Preferences → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
- Enable Prettier: Preferences → Languages & Frameworks → JavaScript → Prettier
- Set TypeScript version: Preferences → Languages & Frameworks → TypeScript → Use TypeScript from project

### Vim/Neovim
- Use CoC (Conquer of Completion) with `coc-tsserver`, `coc-eslint`, `coc-prettier`
- Or configure LSP with `typescript-language-server`

## Productivity Tips

### Terminal Aliases
Add to your `.bashrc`, `.zshrc`, or equivalent:
```bash
# Quick navigation
alias ai-server='cd ~/path/to/ai-context/server'
alias ai-client='cd ~/path/to/ai-context/client'

# Common commands
alias ai-lint='pnpm run lint'
alias ai-test='pnpm run test'
alias ai-build='pnpm run build'

# Development shortcuts
alias ai-dev='pnpm run dev'
alias ai-clean='pnpm run clean && pnpm install'
```

### Workspace Development Loop
1. **Start in root**: `pnpm install` to sync all dependencies
2. **Parallel development**: Open multiple terminals for client/server
3. **Watch shared changes**: Keep `shared/` building in watch mode
4. **Hot reload**: Both client and server support hot module replacement

### Container Workflows
If using Docker for development:
```bash
# Build development container
docker-compose up --build

# Run tests in container
docker-compose run --rm test

# Shell into running container
docker-compose exec app sh
```

### Local Testing Shortcuts
```bash
# Run tests for specific package
cd server && pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test -- path/to/test.spec.ts
```

### Performance Optimization
- **Incremental builds**: TypeScript project references enable faster rebuilds
- **Selective testing**: Use `--testPathPattern` to run relevant tests only
- **Parallel execution**: pnpm workspaces run tasks concurrently when possible

### Shared Scripts & Dotfiles
- **Workspace scripts**: See `package.json` in root and each package
- **CI/CD scripts**: `.github/workflows/` contains automation examples
- **Development utilities**: `scripts/` directory (if present) for custom tooling

### Documentation Workflows
- **Generate AI context**: Run `pnpm run generate-context` before major updates
- **Update guides**: Follow `docs/README.md` document map
- **Validate links**: Use markdown linters to catch broken cross-references

## Cross-References
- [Development Workflow](./workflow.md) - Branching, commits, and PR process
- [Testing Strategy](./testing.md) - Test execution and coverage requirements
- [Architecture Overview](./architecture.md) - System design and package structure
- [Contributing Guide](./contributing.md) - Onboarding and collaboration guidelines

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. ✅ Verified commands align with latest package.json scripts
2. ✅ Documented workspace-specific tooling (pnpm, TypeScript)
3. ✅ Added IDE setup for VS Code, JetBrains, and Vim
4. ✅ Included productivity shortcuts and development loops
5. ✅ Cross-linked to related documentation
6. ✅ Removed placeholder TODOs and agent-fill markers

<!-- agent-readonly:sources -->
## Acceptable Sources
- Root and package-level `package.json` files
- `.github/workflows/` CI configuration
- Common IDE configuration patterns for TypeScript projects
- Standard pnpm workspace practices
- Git hooks and linting tool documentation

<!-- agent-update:end -->
```
