```markdown
---
ai_update_goal: Keep the documentation index current with repository structure and guide status
required_inputs:
  - Repository directory tree
  - Current documentation files in docs/
  - Configuration files (package.json, tsconfig.json, etc.)
  - Recent commits touching docs/ or agents/
success_criteria:
  - Document map reflects all existing guides
  - Repository snapshot accurately represents top-level structure
  - All cross-links are valid and point to existing files
  - AI update checklist provides actionable guidance
last_updated: 2025-01-15
evidence_sources:
  - Repository scan: 476 files, 18.21 MB
  - Top-level directories: attached_assets, client, server, shared
---

<!-- agent-update:start:docs-index -->
# Documentation Index

Welcome to the repository knowledge base. This index serves as the entry point for understanding the project's architecture, workflows, and conventions. Start with the project overview, then dive into specific guides based on your needs.

## Quick Navigation

| Getting Started | Development | Reference |
|-----------------|-------------|-----------|
| [Project Overview](./project-overview.md) | [Development Workflow](./development-workflow.md) | [Glossary](./glossary.md) |
| [Architecture Notes](./architecture.md) | [Testing Strategy](./testing-strategy.md) | [Data Flow](./data-flow.md) |
| [Tooling Guide](./tooling.md) | [Security Notes](./security.md) | [Agent Playbooks](../agents/) |

## Core Guides

### Foundation
- **[Project Overview](./project-overview.md)** — Mission, goals, stakeholders, and roadmap summary
- **[Architecture Notes](./architecture.md)** — System design, service boundaries, and key architectural decisions
- **[Glossary & Domain Concepts](./glossary.md)** — Business terminology, user personas, and domain rules

### Development
- **[Development Workflow](./development-workflow.md)** — Branching strategy, PR process, CI/CD pipeline, and contribution guidelines
- **[Testing Strategy](./testing-strategy.md)** — Test pyramid, coverage targets, CI gates, and debugging flaky tests
- **[Tooling & Productivity Guide](./tooling.md)** — CLI scripts, IDE configurations, and automation workflows

### Operations & Security
- **[Data Flow & Integrations](./data-flow.md)** — System diagrams, API contracts, and third-party integration specifications
- **[Security & Compliance Notes](./security.md)** — Authentication model, secrets management, and compliance requirements

## Repository Structure

```
├── attached_assets/     # Static assets, design files, and media resources
├── client/              # Frontend application (React/TypeScript)
├── server/              # Backend services and API layer
├── shared/              # Shared types, utilities, and constants
├── docs/                # Documentation (this directory)
├── agents/              # AI agent playbooks and instructions
```

### Key Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | Project dependencies, scripts, and metadata |
| `package-lock.json` | Locked dependency versions |
| `tsconfig.json` | TypeScript compiler configuration |
| `vite.config.ts` | Vite bundler configuration for client |
| `tailwind.config.ts` | Tailwind CSS theme and plugin settings |
| `postcss.config.js` | PostCSS processing pipeline |
| `drizzle.config.ts` | Database ORM configuration |

### Supporting Documentation
| File | Description |
|------|-------------|
| `design_guidelines.md` | UI/UX design principles and component standards |
| `replit.md` | Replit-specific setup and deployment instructions |

## Document Map

| Guide | File | AI Marker | Primary Inputs | Status |
|-------|------|-----------|----------------|--------|
| Project Overview | `project-overview.md` | `agent-update:project-overview` | Roadmap, README, stakeholder notes | Active |
| Architecture Notes | `architecture.md` | `agent-update:architecture-notes` | ADRs, service boundaries, dependency graphs | Active |
| Development Workflow | `development-workflow.md` | `agent-update:development-workflow` | Branching rules, CI config, contributing guide | Active |
| Testing Strategy | `testing-strategy.md` | `agent-update:testing-strategy` | Test configs, CI gates, known flaky suites | Active |
| Glossary & Domain Concepts | `glossary.md` | `agent-update:glossary` | Business terminology, user personas, domain rules | Active |
| Data Flow & Integrations | `data-flow.md` | `agent-update:data-flow` | System diagrams, integration specs, queue topics | Active |
| Security & Compliance Notes | `security.md` | `agent-update:security` | Auth model, secrets management, compliance requirements | Active |
| Tooling & Productivity Guide | `tooling.md` | `agent-update:tooling` | CLI scripts, IDE configs, automation workflows | Active |

## Agent Playbooks

AI agents assisting with this repository should reference the playbooks in `agents/`:

| Playbook | Purpose |
|----------|---------|
| `agents/documentation-agent.md` | Guidelines for updating and maintaining docs |
| `agents/code-review-agent.md` | Standards for reviewing pull requests |
| `agents/testing-agent.md` | Protocols for test creation and maintenance |

<!-- agent-readonly:guidance -->
## AI Update Checklist

When updating this documentation index:

1. **Gather Context**
   - Run `git status -sb` to identify pending changes
   - Review recent commits touching `docs/` or `agents/` directories
   - Check for new or removed files in the repository structure

2. **Validate Structure**
   - Compare the current directory tree against the Repository Structure section
   - Add new top-level directories or remove deprecated ones
   - Update the Key Configuration Files table if configs changed

3. **Maintain Document Map**
   - Verify all listed guides exist in `docs/`
   - Add rows for new guides with appropriate AI markers
   - Mark deprecated guides or update their status

4. **Check Cross-Links**
   - Ensure all internal links resolve to existing files
   - Update anchor text if guide titles changed
   - Verify agent playbook references are accurate

5. **Record Evidence**
   - Note commit hashes or PR numbers in the update
   - Reference any issues or RFCs that drove changes
   - Update the `last_updated` field in front matter

<!-- agent-readonly:sources -->
## Acceptable Sources

When updating documentation, reference only:

- **Repository artifacts**: Directory tree, `package.json` scripts, configuration files
- **Approved documents**: Maintainer-approved issues, RFCs, ADRs, or product briefs in the repo
- **Release materials**: Changelog entries, release notes, or migration guides
- **CI/CD outputs**: Build logs, test reports, or deployment manifests (for workflow docs)

Do not incorporate external sources without explicit maintainer approval.

## Maintenance Notes

- **Last full review**: 2025-01-15
- **Repository stats**: 476 files, ~18.21 MB total size
- **Primary stack**: TypeScript, React (client), Node.js (server), Drizzle ORM

<!-- agent-update:end -->
```
