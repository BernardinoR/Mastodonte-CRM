```markdown
# Agent Handbook

This directory contains ready-to-customize playbooks for AI agents collaborating on the repository.

## Repository Overview

This is a full-stack application with the following structure:

| Directory | Purpose |
|-----------|---------|
| `client/` | Frontend application code (UI components, state management, routing) |
| `server/` | Backend application code (API endpoints, business logic, data access) |
| `shared/` | Common utilities, types, and constants used by both client and server |
| `attached_assets/` | Static assets and resources attached to the project |

**Repository Stats:** 476 files scanned, approximately 18.21 MB total size.

## Available Agents

| Agent | Primary Focus | Key Documentation |
|-------|---------------|-------------------|
| [Code Reviewer](./code-reviewer.md) | Review code changes for quality, style, and best practices | [Code Style Guide](../docs/code-style-guide.md) |
| [Bug Fixer](./bug-fixer.md) | Analyze bug reports and error messages | [Troubleshooting Guide](../docs/troubleshooting-guide.md) |
| [Feature Developer](./feature-developer.md) | Implement new features according to specifications | [Architecture Overview](../docs/architecture-overview.md) |
| [Refactoring Specialist](./refactoring-specialist.md) | Identify code smells and improvement opportunities | [Code Style Guide](../docs/code-style-guide.md) |
| [Test Writer](./test-writer.md) | Write comprehensive unit and integration tests | [Testing Strategy](../docs/testing-strategy.md) |
| [Documentation Writer](./documentation-writer.md) | Create clear, comprehensive documentation | [Documentation Index](../docs/README.md) |
| [Performance Optimizer](./performance-optimizer.md) | Identify performance bottlenecks | [Architecture Overview](../docs/architecture-overview.md) |
| [Security Auditor](./security-auditor.md) | Identify security vulnerabilities | [Security Guidelines](../docs/security-guidelines.md) |
| [Backend Specialist](./backend-specialist.md) | Design and implement server-side architecture | [API Reference](../docs/api-reference.md) |
| [Frontend Specialist](./frontend-specialist.md) | Design and implement user interfaces | [UI Components](../docs/ui-components.md) |
| [Architect Specialist](./architect-specialist.md) | Design overall system architecture and patterns | [Architecture Overview](../docs/architecture-overview.md) |
| [Devops Specialist](./devops-specialist.md) | Design and maintain CI/CD pipelines | [CI/CD Workflow](../docs/ci-cd-workflow.md) |
| [Database Specialist](./database-specialist.md) | Design and optimize database schemas | [Database Schema](../docs/database-schema.md) |

## How To Use These Playbooks

1. **Select the Right Agent**
   - Pick the agent that matches your task from the table above.
   - For cross-cutting concerns, consider combining multiple agents (e.g., Feature Developer + Test Writer).

2. **Prepare Context**
   - Review the agent's linked documentation before starting.
   - Gather relevant file paths, error messages, or requirements.
   - For this repository, common context includes:
     - Frontend code: `client/` directory
     - Backend code: `server/` directory
     - Shared types/utilities: `shared/` directory

3. **Customize the Playbook**
   - Open the agent's `.md` file and fill in project-specific sections.
   - Add links to relevant issues, PRs, or ADRs.
   - Specify any constraints or preferences for the task.

4. **Execute and Iterate**
   - Share the customized prompt with your AI assistant.
   - Review outputs against the agent's success criteria.
   - Refine the prompt based on results.

5. **Capture Learnings**
   - Document successful patterns in the relevant guide.
   - Update the agent playbook if you discover improvements.
   - Add new best practices to the [Documentation Index](../docs/README.md).

## Agent Collaboration Patterns

### Sequential Handoff
For complex tasks, chain agents in sequence:
```
Feature Developer → Test Writer → Code Reviewer → Documentation Writer
```

### Parallel Review
For comprehensive analysis, run agents simultaneously:
```
Security Auditor + Performance Optimizer + Code Reviewer
```

### Specialist Consultation
For domain-specific questions, engage specialists:
```
Frontend Specialist ↔ Backend Specialist (API contract discussions)
Database Specialist ↔ Backend Specialist (query optimization)
```

## Related Resources

- [Documentation Index](../docs/README.md) — Complete guide to all project documentation
- [Agent Knowledge Base](../AGENTS.md) — High-level agent configuration and capabilities
- [Contributor Guidelines](../CONTRIBUTING.md) — How to contribute to this repository
- [Architecture Overview](../docs/architecture-overview.md) — System design and component relationships
- [Getting Started Guide](../docs/getting-started.md) — Setup instructions for new contributors

## Maintenance Notes

This handbook should be updated when:
- New agent playbooks are added to the `agents/` directory
- Documentation structure changes in `docs/`
- Repository directory structure is modified
- New collaboration patterns are discovered

Last reviewed against repository state: 476 files, 18.21 MB
```
