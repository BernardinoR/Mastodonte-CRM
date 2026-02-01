# Skills

This directory contains skill definitions for AI agents working on the Task Management System. Each skill provides specialized guidance for specific development tasks.

## Available Skills

| Skill | Description | Phases |
|-------|-------------|--------|
| [API Design](./api-design/SKILL.md) | Design RESTful APIs following project patterns | P, R |
| [Bug Investigation](./bug-investigation/SKILL.md) | Systematic debugging and root cause analysis | E, V |
| [Code Review](./code-review/SKILL.md) | Review code quality and best practices | R, V |
| [Commit Message](./commit-message/SKILL.md) | Generate conventional commit messages | E, C |
| [Documentation](./documentation/SKILL.md) | Generate and maintain documentation | P, C |
| [Feature Breakdown](./feature-breakdown/SKILL.md) | Break features into implementable tasks | P |
| [PR Review](./pr-review/SKILL.md) | Review pull requests against standards | R, V |
| [Refactoring](./refactoring/SKILL.md) | Safe code refactoring approach | E |
| [Security Audit](./security-audit/SKILL.md) | Security review checklist | R, V |
| [Test Generation](./test-generation/SKILL.md) | Generate test cases with Jest | E, V |

## PREVC Phases

Skills are tagged with applicable PREVC workflow phases:

| Phase | Name | Description |
|-------|------|-------------|
| P | Plan | Design and planning |
| R | Review | Code and architecture review |
| E | Execute | Implementation |
| V | Verify | Testing and validation |
| C | Commit | Documentation and completion |

## Using Skills

1. **Identify the task type** - What are you trying to accomplish?
2. **Select the appropriate skill** - Match task to skill
3. **Follow the skill guidelines** - Apply project-specific patterns
4. **Use provided templates** - Maintain consistency

## Project-Specific Customizations

All skills are customized for this codebase:
- React + TypeScript patterns
- Feature-based folder structure
- TanStack Query for server state
- Prisma for database access
- Clerk for authentication
- shadcn/ui components

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](../agents/README.md)
- [AGENTS.md](../../AGENTS.md)
