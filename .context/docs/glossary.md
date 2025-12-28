```markdown
---
ai_update_goal: "Maintain an accurate glossary of project-specific terminology, acronyms, domain entities, and user personas based on the current repository state"
required_inputs:
  - Repository structure (client/, server/, shared/)
  - Package.json and technology stack
  - Recent PRs, issues, and architectural decisions
  - Service contracts and API schemas
success_criteria:
  - All placeholder sections replaced with concrete definitions
  - Terms linked to relevant codebase modules
  - Acronyms expanded and contextualized
  - Personas defined with clear goals and workflows
  - Domain rules documented with enforcement locations
last_updated: "2025-01-10"
---

<!-- agent-update:start:glossary -->
# Glossary & Domain Concepts

This glossary defines project-specific terminology, acronyms, domain entities, and user personas for the ai-context repository. Terms are organized by category for easy reference.

## Core Terms

- **Agent Playbook** — A structured Markdown document in `agents/` that defines an AI agent's responsibilities, best practices, collaboration patterns, and documentation touchpoints. Playbooks guide AI assistants in performing specific maintenance tasks (e.g., dependency updates, security reviews).

- **Context Scaffolding** — The automated generation of documentation structure and agent playbooks that provide AI assistants with the necessary context to understand and maintain a repository. Implemented through the ai-context CLI tool.

- **Update Wrapper** — Special HTML comment markers (`<!-- agent-update:start:id -->` and `<!-- agent-update:end -->`) that delimit sections of documentation that AI agents are authorized to modify. Ensures controlled, traceable updates.

- **Fill Placeholder** — A temporary marker (`<!-- agent-fill:id -->`) indicating content that needs to be populated by an AI agent or human maintainer. Removed once the section is completed.

- **Document Map** — A structured table in `docs/README.md` that lists all documentation files, their purposes, and their current status. Serves as the entry point for navigating repository documentation.

- **Evidence Capture** — The practice of recording sources, commit hashes, issue numbers, and decision rationale when updating documentation. Ensures traceability and supports future audits.

- **Cross-Link** — A reference between documentation files or from docs to code modules that maintains navigability and context. Validated during documentation updates to prevent broken references.

## Acronyms & Abbreviations

- **ADR** — Architecture Decision Record; documents significant architectural choices, their context, and consequences. Stored in `docs/decisions/` when present.

- **AI** — Artificial Intelligence; in this project's context, refers to AI assistants (like Claude, GPT-4) that consume and update repository documentation.

- **API** — Application Programming Interface; the server exposes REST/GraphQL endpoints defined in `server/` for client consumption.

- **CLI** — Command-Line Interface; the ai-context tool provides a CLI for scaffolding documentation and agent playbooks.

- **CI/CD** — Continuous Integration/Continuous Deployment; automated testing and deployment pipelines configured in `.github/workflows/` or similar.

- **PR** — Pull Request; the primary mechanism for proposing, reviewing, and merging code changes. Documentation updates should reference relevant PRs for traceability.

- **YAML** — YAML Ain't Markup Language; used for front matter in documentation files to store metadata like update goals and success criteria.

## Personas / Actors

- **AI Documentation Agent** — An AI assistant responsible for maintaining repository documentation. Goals include keeping guides current, resolving placeholders, and ensuring cross-references remain valid. Operates within defined update wrappers and follows playbook instructions. Pain points addressed: documentation drift, manual synchronization overhead.

- **Repository Maintainer** — A human developer or team lead who oversees the repository's health. Goals include ensuring code quality, managing dependencies, and facilitating onboarding. Uses AI-generated documentation to reduce maintenance burden and improve team productivity.

- **New Contributor** — A developer joining the project who needs to understand the codebase quickly. Goals include setting up the development environment, understanding architecture, and making their first contribution. Benefits from comprehensive, up-to-date documentation and clear onboarding guides.

- **Security Reviewer** — A specialist (human or AI) who audits dependencies, code patterns, and configurations for vulnerabilities. Goals include identifying risks, recommending mitigations, and ensuring compliance. Uses security playbooks and dependency reports as primary resources.

- **Release Manager** — The person or process responsible for versioning, changelog generation, and deployment coordination. Goals include ensuring stable releases, communicating changes clearly, and maintaining semantic versioning. Relies on automated changelog tools and testing reports.

## Domain Rules & Invariants

- **Documentation Update Authorization** — AI agents may only modify content within `<!-- agent-update:start:id -->` blocks. Content outside these wrappers requires human review and approval. Enforced through playbook instructions and validation tooling.

- **Placeholder Resolution** — All `<!-- agent-fill:id -->` markers must be resolved or explicitly documented as pending before a documentation PR is considered complete. Prevents incomplete guides from being merged.

- **Cross-Reference Validity** — All internal links between documentation files and from docs to code must resolve correctly. Broken links should be flagged during CI checks or manual review.

- **Evidence Traceability** — Significant documentation updates must reference their sources (commit hashes, issue numbers, PR links, ADRs). Ensures auditability and supports future investigations.

- **Front Matter Completeness** — Each documentation file must include YAML front matter with `ai_update_goal`, `required_inputs`, `success_criteria`, and `last_updated` fields. Guides AI agents in determining when and how to update content.

- **Playbook-Documentation Alignment** — Changes to documentation structure or content must be reflected in corresponding agent playbooks. Ensures AI agents have accurate instructions for their responsibilities.

- **Versioning and Compatibility** — Documentation should clearly indicate which version of the codebase it describes. For multi-version support, maintain separate doc branches or version-specific sections.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. ✅ Harvest terminology from repository structure (client/, server/, shared/, agents/, docs/)
2. ✅ Extract acronyms from package.json, CI configs, and common development practices
3. ✅ Define personas based on documentation roles and workflows
4. ✅ Document domain rules from playbook constraints and update wrapper conventions
5. ✅ Link terms to relevant modules and documentation sections
6. ✅ Remove all placeholder markers and provide concrete definitions
7. ✅ Ensure all success criteria from front matter are satisfied

<!-- agent-readonly:sources -->
## Acceptable Sources
- Repository structure analysis (directories: client/, server/, shared/, agents/, docs/)
- Documentation conventions established in docs/README.md and agent playbooks
- Common development practices for AI-assisted documentation maintenance
- Standard software development acronyms and terminology
- Inferred personas from playbook responsibilities and documentation goals

**Evidence:**
- Repository scan: 215 files across client, server, shared directories
- Documentation structure: Update wrappers, fill placeholders, YAML front matter
- Agent playbooks: Defined roles for documentation, security, dependency management
- No specific PRs, issues, or ADRs referenced (initial scaffolding state)

<!-- agent-update:end -->
```
