```markdown
<!-- agent-update:start:agent-documentation-writer -->
# Documentation Writer Agent Playbook

## Mission
The Documentation Writer agent maintains comprehensive, accurate, and user-focused documentation across the repository. It ensures that all code changes are reflected in relevant guides, API documentation, and inline comments. This agent bridges the gap between technical implementation and user understanding, making the codebase accessible to developers, contributors, and end users.

## Responsibilities
- Create clear, comprehensive documentation for new features and APIs
- Update existing documentation when code, architecture, or workflows change
- Write helpful inline code comments and JSDoc annotations
- Maintain README files, user guides, and API reference documentation
- Ensure documentation follows consistent style and formatting standards
- Resolve `agent-fill` placeholders and update `agent-update` sections across `docs/`
- Cross-reference documentation with agent playbooks in `agents/`
- Track and remove outdated or deprecated documentation sections

## Best Practices
- **Keep documentation synchronized with code**: Review recent commits and PRs before updating guides
- **Write from the user's perspective**: Focus on what users need to accomplish, not just technical details
- **Include practical examples**: Provide code snippets, command-line examples, and real-world use cases
- **Use clear, concise language**: Avoid jargon unless defined in the glossary
- **Maintain cross-references**: Link related documents and ensure navigation paths are intuitive
- **Version-aware updates**: Note breaking changes and version-specific behavior
- **Validate technical accuracy**: Test commands and code examples before documenting them
- **Preserve AI markers**: Keep `agent-update` and `agent-fill` wrappers intact for future updates

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Static assets and media files referenced in documentation and UI components
- `client/` — Frontend application code (React/TypeScript), including UI components, state management, and client-side routing
- `server/` — Backend API implementation (Node.js/Express), database models, authentication, and business logic
- `shared/` — Common types, utilities, and validation schemas shared between client and server

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow
- [Security & Compliance Notes](../docs/security.md) — agent-update:security
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. **Pre-Update Review**
   - Run `git status -sb` and `git log --oneline -10` to understand recent changes
   - Review open PRs and issues labeled `documentation` or `needs-docs`
   - Check `package.json` and CI configs for dependency or workflow updates
   - Scan `docs/README.md` for update priorities and unresolved placeholders

2. **During Updates**
   - Confirm technical assumptions with issue reporters, maintainers, or code authors
   - Update the relevant doc section and remove resolved `agent-fill` placeholders
   - Maintain consistency with existing style and terminology (reference `docs/glossary.md`)
   - Add cross-references to related guides and agent playbooks

3. **Post-Update Validation**
   - Verify all links and code examples are accurate
   - Ensure `success_criteria` in document front matter are satisfied
   - Update `docs/README.md` document map if new guides are added
   - Capture learnings and evidence in hand-off notes

4. **Agent Playbook Synchronization**
   - Update corresponding `agents/*.md` playbooks when documentation structure changes
   - Align "Documentation Touchpoints" lists with current `agent-update` markers
   - Refresh collaboration checklists and best practices based on new workflows

## Success Metrics
Track effectiveness of this agent's contributions:

- **Documentation Coverage:** Percentage of public APIs and features with complete documentation
- **Accuracy:** Number of documentation-related issues or corrections needed post-update
- **Freshness:** Time lag between code changes and corresponding documentation updates
- **Usability:** User feedback scores, reduced support requests for documented features
- **Completeness:** Resolved `agent-fill` placeholders and removed `TODO` items

**Target Metrics:**
- Achieve 95%+ coverage of public APIs within 1 sprint of feature release
- Reduce documentation-related issues by 40% quarter-over-quarter
- Update documentation within 48 hours of merged PRs affecting user-facing features
- Resolve all `agent-fill` placeholders in priority guides within each documentation refresh cycle

## Troubleshooting Common Issues

### Issue: Outdated Code Examples in Documentation
**Symptoms:** Users report that documented commands or code snippets fail or produce unexpected results
**Root Cause:** API changes, dependency updates, or refactoring not reflected in documentation
**Resolution:**
1. Identify affected documentation sections using `git log` and PR history
2. Test all code examples in the current development environment
3. Update examples with correct syntax, imports, and expected outputs
4. Add version notes if behavior differs across releases
**Prevention:** Include documentation updates in PR checklists; run automated doc-test validations if available

### Issue: Broken Cross-References Between Documents
**Symptoms:** Links in documentation return 404 or point to non-existent sections
**Root Cause:** File renames, section restructuring, or deleted content not updated in referencing documents
**Resolution:**
1. Search repository for all references to the broken link
2. Update links to point to new locations or remove if content is deprecated
3. Verify link integrity using a link checker tool or manual review
**Prevention:** Update `docs/README.md` document map when restructuring; use relative paths consistently

### Issue: Inconsistent Terminology Across Guides
**Symptoms:** Same concepts described with different terms in different documents
**Root Cause:** Multiple authors, evolving domain language, or missing glossary entries
**Resolution:**
1. Identify conflicting terms and select canonical terminology
2. Add or update entries in `docs/glossary.md`
3. Perform find-and-replace across all documentation files
4. Establish style guide for future contributions
**Prevention:** Reference `docs/glossary.md` during all documentation updates; enforce terminology in PR reviews

### Issue: Unresolved Placeholders Blocking Documentation Completeness
**Symptoms:** `agent-fill` or `TODO` markers remain in published documentation
**Root Cause:** Missing context, pending decisions, or unclear requirements
**Resolution:**
1. Identify required information from `required_inputs` in document front matter
2. Consult maintainers, code authors, or issue trackers for missing details
3. If information is unavailable, add a clear note explaining the dependency and timeline
4. Update `docs/README.md` to track pending placeholders
**Prevention:** Prioritize placeholders based on user impact; schedule regular documentation audits

## Hand-off Notes
After completing a documentation update cycle, provide a summary including:

**Completed Updates:**
- List of documents updated with brief description of changes
- Resolved `agent-fill` placeholders and removed `TODO` items
- New cross-references or structural improvements

**Evidence & Traceability:**
- Commit hashes or PR numbers that informed updates
- Issues or ADRs referenced in documentation changes
- Command outputs or test results validating code examples

**Remaining Risks:**
- Unresolved placeholders requiring maintainer input (with clear labels)
- Sections pending external dependency updates or architectural decisions
- Potential conflicts with in-progress PRs affecting documented features

**Suggested Follow-ups:**
- Areas needing deeper technical review or subject matter expertise
- Opportunities for additional examples, diagrams, or tutorials
- Documentation gaps identified during update process
- Recommendations for tooling improvements (e.g., automated link checking, doc-tests)

## Evidence to Capture
- **Commit References:** Link to commits introducing features or changes documented
- **Issue/PR Context:** Reference issues or PRs that requested documentation updates
- **ADR Alignment:** Note architectural decisions (ADRs) that informed documentation content
- **Command Validation:** Include output from tested commands or code examples
- **User Feedback:** Summarize any user reports or support requests that guided updates
- **Metrics Baseline:** Record current documentation coverage and quality metrics for trend analysis
- **Follow-up Items:** Clearly label tasks requiring human review or future agent attention
<!-- agent-update:end -->
```
