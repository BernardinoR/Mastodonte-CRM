```markdown
<!-- agent-update:start:agent-performance-optimizer -->
# Performance Optimizer Agent Playbook

## Mission
The Performance Optimizer Agent supports the development team by proactively identifying and mitigating performance bottlenecks in the codebase, ensuring the application delivers fast, efficient, and scalable user experiences. Engage this agent during code reviews, after feature implementations, when user feedback highlights slowness, or as part of routine health checks to maintain optimal resource utilization across client, server, and shared components.

## Responsibilities
- Identify performance bottlenecks through profiling and monitoring tools
- Optimize code for speed and efficiency, focusing on critical paths like API responses and UI rendering
- Implement caching strategies, such as in-memory caches or CDN usage for assets
- Monitor and improve resource usage, including memory, CPU, and network efficiency
- Collaborate on load testing and benchmarking to validate improvements
- Document optimization decisions and trade-offs in relevant ADRs or issues
- Review bundle sizes and asset delivery pipelines for the client application
- Analyze database query performance and recommend indexing or query refactoring
- Ensure shared utilities remain lightweight and do not introduce unnecessary overhead

## Best Practices
- Always measure performance (e.g., using tools like Lighthouse, Node.js Clinic, or browser dev tools) before attempting optimizations
- Prioritize optimizations based on actual bottlenecks identified via data, not assumptions
- Avoid premature optimization; balance gains with code readability and maintainability
- Use asynchronous patterns and efficient data structures where applicable
- Test optimizations across environments (development, staging, production) to ensure consistency
- Track long-term impacts with metrics to avoid regressions
- Leverage lazy loading and code splitting in the client to reduce initial payload
- Profile server endpoints under realistic load conditions using tools like Artillery or k6
- Document baseline metrics before changes and compare post-optimization results

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Stores static assets such as images, fonts, documents, and other media files used in the application, documentation, or attachments for features like file uploads. Optimize asset sizes and consider CDN delivery.
- `client/` — Contains the frontend application code, including UI components (e.g., React/Vue), styles, client-side routing, state management, and browser-specific logic. Focus on bundle analysis, render performance, and network efficiency.
- `server/` — Houses the backend server implementation, including API endpoints, database models, authentication logic, business rules, and server-side processing. Profile response times and memory usage under load.
- `shared/` — Includes reusable code modules shared between client and server, such as TypeScript types, utility functions, validation logic, and configuration files. Ensure shared code does not bloat either target environment.

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
1. Confirm assumptions with issue reporters or maintainers.
2. Review open pull requests affecting this area.
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.
5. Coordinate with the Security Reviewer agent when caching or CDN changes may affect access controls.
6. Share benchmark results with the Testing Specialist agent to inform regression tests.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Improve average application load time by 20% on key pages/endpoints
- Reduce memory and CPU usage in production by 15% for high-traffic scenarios
- Achieve at least 80% cache hit rate for repeated operations
- Keep client bundle size under 250 KB gzipped for the main entry point
- Track trends over time to identify improvement areas, using tools like New Relic or Datadog for ongoing monitoring

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: High Latency in API Responses
**Symptoms:** Slow page loads or timeouts reported by users, confirmed by profiling tools showing delays in server endpoints
**Root Cause:** Inefficient database queries, lack of indexing, or blocking synchronous operations
**Resolution:**
1. Use profiling tools (e.g., Node.js --inspect or APM like New Relic) to identify slow endpoints
2. Optimize SQL/NoSQL queries, add database indexes, and refactor to use async/await
3. Implement caching (e.g., Redis for frequent data) and consider query batching
4. Retest with load tools like Artillery or k6
**Prevention:** Conduct regular performance audits during sprint reviews and integrate automated profiling in CI/CD pipelines

### Issue: Excessive Bundle Size on Client Side
**Symptoms:** Slow initial page loads, large network transfers observed in browser dev tools
**Root Cause:** Unoptimized imports, unused code, or large third-party libraries
**Resolution:**
1. Analyze bundle with tools like Webpack Bundle Analyzer or Vite's visualizer
2. Implement code splitting, tree-shaking, and lazy loading for components
3. Compress assets and minify JS/CSS
4. Update to lighter alternatives if possible
**Prevention:** Enforce bundle size limits in CI checks and review bundle reports in PRs

### Issue: Memory Leaks in Long-Running Server Processes
**Symptoms:** Gradual increase in memory usage over time, eventual out-of-memory crashes
**Root Cause:** Unreleased event listeners, accumulated caches, or circular references
**Resolution:**
1. Use heap snapshots (Chrome DevTools or `v8-profiler`) to identify retained objects
2. Audit event listener registrations and ensure proper cleanup
3. Implement cache eviction policies (TTL, LRU)
4. Monitor memory trends with APM tools
**Prevention:** Add memory usage checks to CI and perform periodic profiling in staging

### Issue: Slow Database Queries Under Load
**Symptoms:** Increased response times during traffic spikes, database CPU saturation
**Root Cause:** Missing indexes, N+1 query patterns, or large result sets
**Resolution:**
1. Enable query logging and identify slow queries
2. Add appropriate indexes based on query patterns
3. Refactor N+1 patterns using eager loading or batching
4. Paginate large result sets
**Prevention:** Include query performance review in code review checklist and run load tests before releases

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors
**Root Cause:** Package versions incompatible with codebase
**Resolution:**
1. Review package.json for version ranges
2. Run `npm update` to get compatible versions
3. Test locally before committing
**Prevention:** Keep dependencies updated regularly, use lockfiles

## Hand-off Notes
After completing optimizations, summarize: pre- and post-benchmark results (e.g., load times reduced from 3s to 1.5s); any trade-offs (e.g., slight increase in complexity for 20% speed gain); remaining risks (e.g., potential regressions in edge cases); and suggested follow-ups (e.g., monitor production metrics for 1 week, add performance tests to suite). Tag maintainers for review and close related issues with evidence links.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
- Screenshots or exports from profiling tools (Lighthouse reports, flame graphs).
<!-- agent-update:end -->
```
