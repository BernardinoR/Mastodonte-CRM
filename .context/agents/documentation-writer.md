```markdown
<!-- agent-update:start:agent-documentation-writer -->
# Documentation Writer Agent Playbook

## Mission
The Documentation Writer Agent ensures that all project documentation remains accurate, comprehensive, and accessible. Engage this agent when:
- New features are merged that require user-facing or developer documentation
- Existing guides become stale or contain unresolved placeholders
- README files, API docs, or code comments need refreshing
- Cross-references between docs and agent playbooks drift out of sync

## Responsibilities
- Create clear, comprehensive documentation for features, APIs, and workflows
- Update existing documentation as code changes land in `client/`, `server/`, or `shared/`
- Write helpful code comments and inline examples that reduce onboarding friction
- Maintain the top-level `README.md`, `docs/` guides, and API reference materials
- Resolve `<!-- agent-fill:* -->` placeholders and keep `<!-- agent-update:* -->` sections current
- Coordinate with other agents (e.g., Code Reviewer, QA) to capture architectural decisions and testing notes

## Best Practices
- **Stay in sync:** Run `git log --oneline -20` and review recent PRs before editing any guide.
- **User-centric writing:** Assume the reader is a new contributor; provide context before commands.
- **Practical examples:** Include runnable code snippets, expected outputs, and screenshots where helpful.
- **Single source of truth:** Avoid duplicating content; link to canonical docs instead.
- **Atomic commits:** Group related doc changes into focused commits with descriptive messages.
- **Accessibility:** Use clear headings, alt text for images, and consistent formatting.

## Key Project Resources
| Resource | Path | Purpose |
|----------|------|---------|
| Documentation index | [docs/README.md](../docs/README.md) | Central map of all guides |
| Agent handbook | [agents/README.md](./README.md) | Overview of all agent playbooks |
| Agent knowledge base | [AGENTS.md](../AGENTS.md) | High-level agent capabilities |
| Contributor guide | [CONTRIBUTING.md](../CONTRIBUTING.md) | How to submit changes |

## Repository Starting Points
| Directory | Description |
|-----------|-------------|
| `attached_assets/` | Static assets, uploaded files, images, and configuration attachments referenced by client or server |
| `client/` | Frontend application code—UI components, routing, state management, and client-side logic (React-based) |
| `server/` | Backend server code—API endpoints, database interactions, authentication, and business rules (Node.js runtime) |
| `shared/` | Code shared between client and server—utilities, data models, types, constants, and validation schemas |

## Documentation Touchpoints
Use the markers below to locate update regions in each guide:

| Guide | Marker |
|-------|--------|
| [Documentation Index](../docs/README.md) | `agent-update:docs-index` |
| [Project Overview](../docs/project-overview.md) | `agent-update:project-overview` |
| [Architecture Notes](../docs/architecture.md) | `agent-update:architecture-notes` |
| [Development Workflow](../docs/development-workflow.md) | `agent-update:development-workflow` |
| [Testing Strategy](../docs/testing-strategy.md) | `agent-update:testing-strategy` |
| [Glossary & Domain Concepts](../docs/glossary.md) | `agent-update:glossary` |
| [Data Flow & Integrations](../docs/data-flow.md) | `agent-update:data-flow` |
| [Security & Compliance Notes](../docs/security.md) | `agent-update:security` |
| [Tooling & Productivity Guide](../docs/tooling.md) | `agent-update:tooling` |

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. **Gather context:** Run `git status -sb` and `git log --oneline -10` to understand recent changes.
2. **Confirm assumptions:** Check related issues or ask maintainers before making significant edits.
3. **Review open PRs:** Look for pending changes that might affect the guide you're updating.
4. **Edit within markers:** Keep changes inside `<!-- agent-update:start:... -->` blocks; preserve closing tags.
5. **Resolve placeholders:** Replace `<!-- agent-fill:* -->` with accurate content or leave a clear note if human input is required.
6. **Update cross-references:** Verify links to other docs and playbooks; add new entries to `docs/README.md` if needed.
7. **Capture learnings:** Record evidence (commits, ADRs, logs) in the Evidence section below.

## Success Metrics
Track effectiveness of this agent's contributions:

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| PR documentation coverage | 95% of merged PRs include doc updates | PR checklist audits |
| Documentation completeness | ≥90% feature coverage | Bi-weekly audits against roadmap |
| Placeholder resolution rate | 100% within 2 sprints | Grep for `agent-fill` markers |
| User-reported doc issues | <5 per quarter | Issue tracker labels |

Review trends quarterly to identify improvement areas based on contributor feedback and issue reports.

## Troubleshooting Common Issues

### Issue: Outdated Documentation Leading to User Confusion
**Symptoms:** Frequent issues or Slack questions about unclear setup steps, missing dependencies, or incorrect API usage.
**Root Cause:** Documentation not synced with recent code changes (new packages, renamed endpoints, updated workflows).
**Resolution:**
1. Compare latest commits (`git log --oneline -- docs/`) against guide timestamps.
2. Update affected sections with current commands, examples, and screenshots.
3. Validate updates by walking through the guide as a new user.
**Prevention:** Add a "Docs Updated?" checkbox to PR templates; integrate `markdownlint` and link-checking in CI.

### Issue: Broken Cross-References Between Docs
**Symptoms:** 404 errors when clicking internal links; readers land on wrong sections.
**Root Cause:** Files renamed or moved without updating references.
**Resolution:**
1. Run a link checker (e.g., `markdown-link-check`) across `docs/` and `agents/`.
2. Fix broken paths and commit changes.
**Prevention:** Use relative paths consistently; add link validation to CI pipeline.

### Issue: Stale Agent Playbooks
**Symptoms:** Agent responsibilities or touchpoints reference removed guides or outdated workflows.
**Root Cause:** Playbooks not updated when corresponding docs change.
**Resolution:**
1. Cross-check each playbook's Documentation Touchpoints table against `docs/README.md`.
2. Update markers, add new guides, or remove deprecated entries.
**Prevention:** Include playbook review in the same PR that modifies related docs.

## Hand-off Notes
After completing documentation updates:
1. Summarize changes in the PR description (guides touched, key additions, evidence links).
2. Flag any unresolved placeholders that require human input with a `<!-- needs-human:... -->` comment.
3. Note remaining risks (e.g., pending architectural decisions that may invalidate current content).
4. Suggest follow-up actions for the next documentation pass or related agents.

## Evidence to Capture
- **Commits:** Reference hashes for code changes that prompted doc updates.
- **Issues/PRs:** Link to discussions that informed content decisions.
- **ADRs:** Cite relevant Architecture Decision Records from `docs/adr/` if applicable.
- **Command output:** Include logs or screenshots that validate instructions.
- **Follow-ups:** List items for maintainers or future agent runs (e.g., "Awaiting API v2 spec for endpoint docs").
<!-- agent-update:end -->
```
