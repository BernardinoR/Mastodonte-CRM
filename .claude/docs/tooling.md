# Tooling & Productivity Guide

This document covers CLI tools, IDE configuration, and automation workflows for development.

## Development Tools

### Core Tools

| Tool       | Purpose              | Command            |
| ---------- | -------------------- | ------------------ |
| Vite       | Dev server & bundler | `npm run dev`      |
| TypeScript | Type checking        | `npx tsc --noEmit` |
| ESLint     | Code linting         | `npm run lint`     |
| Prisma     | Database ORM         | `npx prisma`       |
| Jest       | Testing              | `npm run test`     |

### Vite Dev Server

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Format schema file
npx prisma format
```

## IDE Setup

### VS Code / Cursor Extensions

Recommended extensions:

- **ESLint** - Linting integration
- **Prettier** - Code formatting
- **Prisma** - Schema syntax highlighting
- **Tailwind CSS IntelliSense** - Class autocompletion
- **TypeScript Importer** - Auto-import suggestions

### Workspace Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Code Quality

### ESLint Configuration

Key rules enforced:

- TypeScript strict mode
- React hooks rules
- Import ordering
- No unused variables
- Consistent code style

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## Git Hooks

### Pre-commit Hook (Recommended)

Using Husky and lint-staged:

```bash
# Install
npm install -D husky lint-staged

# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## Debugging

### Browser DevTools

- React Developer Tools for component inspection
- TanStack Query DevTools for query debugging
- Network tab for API request monitoring

### Server Debugging

```typescript
// Add debug logging
import { log } from "./app";

log(`Processing task ${taskId}`);
```

### Database Debugging

```bash
# View database queries
DEBUG=prisma:query npm run dev

# Open Prisma Studio
npx prisma studio
```

## Useful Scripts

### Quick Commands

```bash
# Fresh install
rm -rf node_modules && npm install

# Database reset and seed
npx prisma migrate reset

# Type check without emit
npx tsc --noEmit

# Find unused exports
npx ts-prune

# Check for outdated packages
npm outdated
```

### Custom npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "jest",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "db:studio": "prisma studio",
    "db:migrate": "prisma migrate dev",
    "db:reset": "prisma migrate reset"
  }
}
```

## Environment Management

### Environment Files

| File              | Purpose              | Git       |
| ----------------- | -------------------- | --------- |
| `.env`            | Local development    | Ignored   |
| `.env.example`    | Template with keys   | Committed |
| `.env.test`       | Test environment     | Ignored   |
| `.env.production` | Production (CI only) | Ignored   |

### Required Variables

```bash
# .env.example
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

## Performance Monitoring

### Build Analysis

```bash
# Analyze bundle size
npm run build -- --analyze
```

### Runtime Monitoring

- Use React DevTools Profiler
- Monitor TanStack Query cache hits
- Track API response times

## Related Resources

- [Development Workflow](./development-workflow.md)
- [Testing Strategy](./testing-strategy.md)
- [Architecture Notes](./architecture.md)
