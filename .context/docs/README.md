```markdown
---
ai_update_goal: Maintain an accurate index of all documentation guides and repository structure
required_inputs:
  - Current repository file tree
  - List of all docs/*.md files
  - package.json for project metadata
  - Latest git commits touching documentation
success_criteria:
  - All existing guides are listed with correct paths
  - Document map table is complete and accurate
  - Repository snapshot reflects actual top-level structure
  - Cross-links are valid and up-to-date
  - No placeholder or TODO sections remain
---

<!-- agent-update:start:docs-index -->
# Documentation Index

Welcome to the repository knowledge base. Start with the project overview, then dive into specific guides as needed.

## Core Guides
- [Project Overview](./project-overview.md) - High-level vision, goals, and stakeholder context
- [Architecture Notes](./architecture.md) - System design, service boundaries, and technical decisions
- [Development Workflow](./development-workflow.md) - Branching strategy, PR process, and CI/CD pipeline
- [Testing Strategy](./testing-strategy.md) - Test organization, coverage requirements, and quality gates
- [Glossary & Domain Concepts](./glossary.md) - Business terminology, user personas, and domain model
- [Data Flow & Integrations](./data-flow.md) - System interactions, API contracts, and data pipelines
- [Security & Compliance Notes](./security.md) - Authentication, authorization, and security practices
- [Tooling & Productivity Guide](./tooling.md) - Development tools, scripts, and automation workflows

## Repository Snapshot
Based on the current repository structure (215 files, ~1.87 MB):

### Top-Level Directories
- `attached_assets/` - Static assets and media files
- `client/` - Frontend application code (React/Vite)
- `server/` - Backend application code (Express/Node.js)
- `shared/` - Shared types, utilities, and constants
- `docs/` - Documentation guides (this directory)
- `agents/` - AI agent playbooks and collaboration guides

### Configuration Files
- `components.json` - shadcn/ui component configuration
- `design_guidelines.md` - UI/UX design standards
- `drizzle.config.ts` - Database ORM configuration
- `package.json` - Project dependencies and scripts
- `package-lock.json` - Locked dependency versions
- `postcss.config.js` - PostCSS transformation rules
- `tailwind.config.ts` - Tailwind CSS customization
- `tsconfig.json` - TypeScript compiler options
- `vite.config.ts` - Vite build tool configuration
- `replit.md` - Replit deployment instructions

## Document Map
| Guide | File | AI Marker | Primary Inputs | Status |
| --- | --- | --- | --- | --- |
| Project Overview | `project-overview.md` | agent-update:project-overview | Roadmap, README, stakeholder notes, package.json | Active |
| Architecture Notes | `architecture.md` | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs, tsconfig | Active |
| Development Workflow | `development-workflow.md` | agent-update:development-workflow | Branching rules, CI config, contributing guide, package.json scripts | Active |
| Testing Strategy | `testing-strategy.md` | agent-update:testing-strategy | Test configs, CI gates, coverage reports, Vitest setup | Active |
| Glossary & Domain Concepts | `glossary.md` | agent-update:glossary | Business terminology, user personas, domain rules | Active |
| Data Flow & Integrations | `data-flow.md` | agent-update:data-flow | System diagrams, integration specs, API routes, database schema | Active |
| Security & Compliance Notes | `security.md` | agent-update:security | Auth model, secrets management, compliance requirements | Active |
| Tooling & Productivity Guide | `tooling.md` | agent-update:tooling | CLI scripts, IDE configs, automation workflows, package.json | Active |

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Gather context with `git status -sb` plus the latest commits touching `docs/` or `agents/`.
2. Compare the current directory tree against the table above; add or retire rows accordingly.
3. Update cross-links if guides moved or were renamed; keep anchor text concise.
4. Record sources consulted inside the commit or PR description for traceability.
5. Verify all listed files exist and paths are correct.
6. Ensure status column reflects current maintenance state (Active, Draft, Deprecated).

<!-- agent-readonly:sources -->
## Acceptable Sources
- Repository tree scan results (215 files, 1.87 MB total)
- `package.json` scripts for canonical command names and project metadata
- Maintainer-approved issues, RFCs, or product briefs referenced in the repo
- Release notes or changelog entries that announce documentation changes
- Git history for `docs/` and `agents/` directories
- Configuration files (tsconfig.json, vite.config.ts, drizzle.config.ts) for technical context

## Navigation Tips
- **New to the project?** Start with [Project Overview](./project-overview.md)
- **Setting up development?** See [Development Workflow](./development-workflow.md) and [Tooling Guide](./tooling.md)
- **Understanding the codebase?** Review [Architecture Notes](./architecture.md) and [Glossary](./glossary.md)
- **Contributing code?** Check [Testing Strategy](./testing-strategy.md) and [Development Workflow](./development-workflow.md)
- **Security concerns?** Consult [Security & Compliance Notes](./security.md)

## Maintenance Notes
- All guides use YAML front matter with `ai_update_goal`, `required_inputs`, and `success_criteria`
- Agent update markers follow the pattern `<!-- agent-update:start:marker-name -->` ... `<!-- agent-update:end -->`
- Agent fill placeholders use `<!-- agent-fill:description -->` and should be resolved or documented
- Cross-references between guides are maintained through relative links
- Evidence and traceability requirements are documented in individual guide front matter

<!-- agent-update:end -->
```
