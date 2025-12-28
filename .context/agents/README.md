```markdown
---
ai_update_goal: Maintain an accurate, up-to-date index of agent playbooks with clear descriptions and usage guidance
required_inputs:
  - List of all agent playbook files in agents/ directory
  - Current repository structure (client, server, shared directories)
  - Latest documentation index from docs/README.md
  - Project technology stack and architecture patterns
success_criteria:
  - All agent playbooks are listed with accurate descriptions
  - Usage instructions reflect current repository workflow
  - Cross-references to documentation are valid and complete
  - No placeholder or TODO content remains
---

# Agent Handbook

This directory contains ready-to-customize playbooks for AI agents collaborating on this TypeScript/React/Node.js repository. Each playbook provides role-specific context, responsibilities, and best practices aligned with the project's architecture and documentation.

## Repository Context

This is a full-stack TypeScript application with:
- **Client**: React-based frontend (Vite build system)
- **Server**: Node.js/Express backend with WebSocket support
- **Shared**: Common types, utilities, and validation logic
- **Architecture**: Component-based UI, RESTful API, real-time communication layer

## Available Agents

<!-- agent-update:start:agent-list -->

### Development Agents

- **[Feature Developer](./feature-developer.md)** — Implement new features following TypeScript best practices, React patterns, and API design guidelines. Ensures type safety across client/server boundaries.

- **[Bug Fixer](./bug-fixer.md)** — Analyze error reports, reproduce issues, and implement fixes with appropriate test coverage. Focuses on root cause analysis and regression prevention.

- **[Refactoring Specialist](./refactoring-specialist.md)** — Identify code smells, improve maintainability, and apply design patterns. Maintains backward compatibility and updates affected tests.

### Quality Assurance Agents

- **[Code Reviewer](./code-reviewer.md)** — Review pull requests for code quality, TypeScript usage, React best practices, and adherence to project conventions. Validates test coverage and documentation updates.

- **[Test Writer](./test-writer.md)** — Create comprehensive unit, integration, and E2E tests using the project's testing frameworks. Ensures coverage of edge cases and error scenarios.

- **[Security Auditor](./security-auditor.md)** — Identify security vulnerabilities in authentication, data validation, API endpoints, and dependency usage. Recommends remediation strategies.

- **[Performance Optimizer](./performance-optimizer.md)** — Analyze runtime performance, bundle sizes, and rendering efficiency. Provides optimization recommendations for both client and server.

### Specialist Agents

- **[Backend Specialist](./backend-specialist.md)** — Design and implement server-side features including REST APIs, WebSocket handlers, middleware, and business logic. Ensures proper error handling and logging.

- **[Frontend Specialist](./frontend-specialist.md)** — Design and implement React components, state management, routing, and UI/UX patterns. Focuses on accessibility and responsive design.

- **[Database Specialist](./database-specialist.md)** — Design database schemas, write optimized queries, implement migrations, and ensure data integrity. Works with the project's data persistence layer.

- **[Architect Specialist](./architect-specialist.md)** — Design system architecture, define module boundaries, establish coding standards, and make technology decisions. Maintains architectural documentation.

- **[DevOps Specialist](./devops-specialist.md)** — Design and maintain CI/CD pipelines, deployment processes, monitoring, and infrastructure as code. Ensures reliable builds and deployments.

- **[Mobile Specialist](./mobile-specialist.md)** — Develop mobile-specific features, responsive layouts, and progressive web app capabilities. Optimizes for mobile performance and user experience.

### Documentation Agents

- **[Documentation Writer](./documentation-writer.md)** — Create and maintain technical documentation, API references, user guides, and inline code comments. Ensures documentation stays synchronized with code changes.

<!-- agent-update:end -->

## How To Use These Playbooks

<!-- agent-update:start:usage-instructions -->

### 1. Select the Appropriate Agent

Choose the agent playbook that best matches your current task:
- **Feature work**: Feature Developer, Backend/Frontend Specialist
- **Bug fixing**: Bug Fixer, relevant specialist
- **Code review**: Code Reviewer
- **Testing**: Test Writer
- **Documentation**: Documentation Writer
- **Architecture**: Architect Specialist
- **Infrastructure**: DevOps Specialist

### 2. Prepare Context

Before using a playbook, gather:
- Relevant issue or ticket numbers
- Related files from `client/`, `server/`, or `shared/`
- Existing tests in `__tests__/` directories
- Related documentation from `docs/`
- Recent commit history for the affected area

### 3. Customize the Prompt

1. Open the selected agent playbook
2. Review the "Context Gathering Checklist" section
3. Fill in project-specific details (file paths, component names, API endpoints)
4. Add any additional constraints or requirements
5. Include links to relevant documentation sections

### 4. Execute and Capture Learnings

1. Share the customized prompt with your AI assistant
2. Review the agent's output against the playbook's success criteria
3. Document any new patterns, decisions, or best practices in:
   - `docs/architecture.md` for design decisions
   - `docs/workflow.md` for process improvements
   - `docs/testing.md` for test strategies
   - Relevant agent playbooks for future reference

### 5. Update Documentation

After completing work with an agent:
- Update affected `docs/*.md` files within `<!-- agent-update -->` blocks
- Add new patterns to the appropriate playbook's "Best Practices" section
- Update cross-references between related agents and documentation

<!-- agent-update:end -->

## Agent Collaboration Patterns

<!-- agent-update:start:collaboration -->

Agents often work together in sequences:

1. **Feature Development Flow**
   - Architect Specialist → defines approach
   - Feature Developer → implements functionality
   - Test Writer → adds test coverage
   - Code Reviewer → validates quality
   - Documentation Writer → updates guides

2. **Bug Resolution Flow**
   - Bug Fixer → diagnoses and fixes issue
   - Test Writer → adds regression tests
   - Code Reviewer → reviews changes
   - Documentation Writer → updates troubleshooting guides

3. **Refactoring Flow**
   - Refactoring Specialist → identifies improvements
   - Architect Specialist → validates approach
   - Test Writer → ensures test coverage
   - Code Reviewer → validates changes

4. **Performance Optimization Flow**
   - Performance Optimizer → identifies bottlenecks
   - Backend/Frontend Specialist → implements optimizations
   - Test Writer → adds performance tests
   - Documentation Writer → documents optimization strategies

<!-- agent-update:end -->

## Related Resources

<!-- agent-update:start:resources -->

### Documentation
- [Documentation Index](../docs/README.md) — Complete guide to all project documentation
- [Architecture Guide](../docs/architecture.md) — System design and patterns
- [Workflow Guide](../docs/workflow.md) — Development processes and conventions
- [Testing Guide](../docs/testing.md) — Testing strategies and frameworks
- [Deployment Guide](../docs/deployment.md) — Build and deployment procedures

### Project Files
- [Agent Knowledge Base](../../AGENTS.md) — High-level agent usage guidelines
- [Contributing Guidelines](../../CONTRIBUTING.md) — Code contribution standards
- [Package Configuration](../../package.json) — Dependencies and scripts

### Repository Structure
- `client/` — React frontend application
- `server/` — Node.js backend services
- `shared/` — Common TypeScript types and utilities
- `docs/` — Comprehensive project documentation
- `agents/` — AI agent playbooks (this directory)

<!-- agent-update:end -->

## Maintenance

This handbook is maintained through the ai-context scaffolding system. To update:

1. Edit agent playbooks directly in `agents/*.md`
2. Update this index when adding/removing agents
3. Keep cross-references synchronized with `docs/` changes
4. Use `<!-- agent-update -->` markers for AI-assisted maintenance
5. Review and update after significant architectural changes

For questions or improvements, refer to the [Documentation Writer](./documentation-writer.md) playbook.
```
