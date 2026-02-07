# Tooling & Productivity Guide

This document outlines the essential tools, configurations, and workflows to ensure a smooth and productive development experience.

## Development Tools

### Core CLI Tools

The project relies on several standard development tools, accessible via npm scripts:

| Tool         | Purpose                                 | Primary Command(s)             |
| :----------- | :-------------------------------------- | :----------------------------- |
| Vite         | Dev server, build tool, and bundler     | `npm run dev`, `npm run build` |
| TypeScript   | Static typing and compilation           | `npx tsc --noEmit`             |
| ESLint       | Code linting and style enforcement      | `npm run lint`, `npm run lint:fix` |
| Prisma       | Database ORM, migrations, and client generation | `npx prisma ...`               |
| Jest         | Automated testing framework             | `npm run test`                 |

### Vite Development Server

```bash
# Start the development server with hot module replacement
npm run dev

# Build the application for production deployment
npm run build

# Preview the production build locally
npm run preview
```

### Prisma Database Management

Prisma simplifies database interactions, including schema management and migrations.

```bash
# Generate the Prisma client based on your schema
npx prisma generate

# Create a new database migration (e.g., 'add-users-table')
npx prisma migrate dev --name migration_name

# Apply pending migrations to the production database
npx prisma migrate deploy

# Reset the database to its initial state (USE WITH CAUTION: ALL DATA WILL BE LOST)
npx prisma migrate reset

# Open Prisma Studio, a GUI for interacting with your database
npx prisma studio

# Format your schema.prisma file according to standard conventions
npx prisma format
```

## IDE Setup

### VS Code / Cursor Extensions

For an optimized editing experience, consider installing the following extensions:

-   **ESLint**: Integrates ESLint into the editor for real-time feedback.
-   **Prettier - Code formatter**: Automatically formats code on save.
-   **Prisma**: Provides syntax highlighting and IntelliSense for `schema.prisma` files.
-   **Tailwind CSS IntelliSense**: Offers autocompletion and syntax highlighting for Tailwind CSS classes.
-   **TypeScript Importer**: Helps automatically import modules.

### Workspace Settings (`.vscode/settings.json`)

These settings configure editor behavior for consistent formatting and linting on save:

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

### Debugging Configuration (`.vscode/launch.json`)

Configure your debugger to easily launch and attach to the development server:

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
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## Code Quality

### ESLint Configuration

ESLint enforces code quality and consistency across the project. Key configurations include:

-   TypeScript strict mode enabled.
-   React hooks rules applied.
-   Import ordering enforced.
-   Rules against unused variables and imports.
-   Consistent code styling.

```bash
# Run ESLint to check for code style issues
npm run lint

# Automatically fix any linting issues that can be resolved
npm run lint:fix
```

### Prettier Configuration (`.prettierrc`)

Prettier is used for opinionated code formatting.

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

Automate code checks before committing using Husky and lint-staged.

**Installation:**

```bash
# Install Husky and lint-staged as dev dependencies
npm install -D husky lint-staged

# Initialize Husky
npx husky install

# Add the pre-commit hook script
npx husky add .husky/pre-commit "npx lint-staged"
```

**Configuration (`package.json`):**

Define which files should be linted and formatted by `lint-staged`:

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

### Browser Developer Tools

Leverage browser extensions for in-depth debugging:

-   **React Developer Tools**: Inspect component hierarchies, props, and state.
-   **TanStack Query DevTools**: Visualize and debug your data fetching and caching.
-   **Network Tab**: Monitor all outgoing API requests and responses.

### Server-Side Logging

Add `console.log` statements or use the `log` utility for server-side debugging:

```typescript
// Example usage of the log utility
import { log } from './app'; // Adjust path as necessary

log(`Processing task with ID: ${taskId}`);
```

### Database Debugging

Monitor Prisma queries or access the database directly:

```bash
# Enable verbose Prisma query logging in the development server
DEBUG=prisma:query npm run dev

# Open Prisma Studio to browse and modify database data
npx prisma studio
```

## Useful Scripts

### Common Workflow Commands

These scripts streamline frequent development tasks:

```bash
# Ensure a clean state with a fresh installation
rm -rf node_modules && npm install

# Reset the database to its initial state and seed it (if applicable)
npx prisma migrate reset

# Perform a type check without compiling/emitting JavaScript files
npx tsc --noEmit

# Identify any exported types/functions that are not being used
npx ts-prune

# Check for any outdated npm packages in your dependencies
npm outdated
```

### Custom npm Scripts (`package.json`)

The `package.json` file includes useful scripts for common tasks:

```json
// package.json
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

Different environment files are used to manage configuration variables:

| File            | Purpose                             | Git Status |
| :-------------- | :---------------------------------- | :--------- |
| `.env`          | Local development overrides         | Ignored    |
| `.env.example`  | Template for required environment variables | Committed  |
| `.env.test`     | Test environment configuration      | Ignored    |
| `.env.production` | Production configuration (CI/CD)  | Ignored    |

### Locally Required Variables

Ensure your `.env` file contains the necessary variables, using `.env.example` as a guide:

```bash
# .env.example
# Example variables - replace placeholders with actual values
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

## Performance Monitoring

### Build Analysis

Understand your production bundle size to identify optimization opportunities:

```bash
# Build the project and generate a bundle analysis report
npm run build -- --analyze
```

### Runtime Performance

Monitor application performance during runtime:

-   Utilize the **React DevTools Profiler** to identify rendering bottlenecks.
-   Track **TanStack Query** cache performance and data retrieval times.
-   Analyze **API response times** in the browser's Network tab.

## Related Resources

-   [Development Workflow](./development-workflow.md)
-   [Testing Strategy](./testing-strategy.md)
-   [Architecture Notes](./architecture.md)
