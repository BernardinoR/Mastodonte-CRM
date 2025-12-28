```markdown
<!-- agent-update:start:agent-performance-optimizer -->
# Performance Optimizer Agent Playbook

## Mission
The Performance Optimizer Agent identifies and resolves performance bottlenecks across the full-stack application, focusing on client-side rendering, server-side API responses, database queries, and resource utilization. This agent is engaged when performance metrics fall below targets, during pre-release optimization sprints, or when profiling reveals inefficiencies.

## Responsibilities
- **Identify Performance Bottlenecks**: Profile client and server code to detect slow operations, memory leaks, and inefficient algorithms
- **Optimize Code for Speed and Efficiency**: Refactor hot paths, reduce computational complexity, and eliminate redundant operations
- **Implement Caching Strategies**: Apply memoization, HTTP caching, database query caching, and CDN strategies where appropriate
- **Monitor and Improve Resource Usage**: Track CPU, memory, network bandwidth, and bundle sizes; optimize asset delivery
- **Database Query Optimization**: Analyze slow queries, add indexes, optimize joins, and implement query result caching
- **Bundle Size Reduction**: Tree-shake unused code, lazy-load components, and optimize dependencies in `client/` builds
- **API Response Time Optimization**: Reduce server-side processing time, optimize middleware chains, and implement pagination
- **Render Performance**: Improve Time to Interactive (TTI), First Contentful Paint (FCP), and Cumulative Layout Shift (CLS)

## Best Practices
- **Measure Before Optimizing**: Establish baseline metrics using profiling tools (Chrome DevTools, Node.js profiler, Lighthouse)
- **Focus on Actual Bottlenecks**: Prioritize optimizations based on real-world impact and user-facing metrics
- **Don't Sacrifice Readability Unnecessarily**: Maintain clear code structure; document complex optimizations thoroughly
- **Validate with Benchmarks**: Use reproducible performance tests to confirm improvements
- **Monitor Production Metrics**: Track performance in production environments, not just local development
- **Incremental Optimization**: Apply changes iteratively and measure impact after each change
- **Consider Trade-offs**: Balance performance gains against code maintainability, development velocity, and feature requirements

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Static files and media assets; optimize image formats, compression, and delivery strategies
- `client/` — Frontend application code; focus on bundle size, render performance, and runtime efficiency
- `server/` — Backend API and services; optimize request handling, database queries, and middleware performance
- `shared/` — Common utilities and types; ensure shared code doesn't introduce performance overhead across client/server boundaries

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index — Reference for all performance-related documentation
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview — Understand performance goals and user experience targets
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes — Review system design for optimization opportunities and constraints
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow — Integrate performance testing into CI/CD pipeline
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy — Add performance regression tests and benchmarks
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary — Define performance metrics and terminology
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow — Optimize data transfer patterns and API communication
- [Security & Compliance Notes](../docs/security.md) — agent-update:security — Balance security measures with performance impact
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling — Configure profiling tools, bundlers, and monitoring solutions

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. **Establish Baseline Metrics**: Profile current performance using browser DevTools, Lighthouse, and server-side monitoring
2. **Review Open Issues**: Check for user-reported performance complaints or slow operation tickets
3. **Coordinate with Architecture Agent**: Ensure optimizations align with system design principles documented in `docs/architecture.md`
4. **Validate with Testing Agent**: Add performance regression tests to prevent future degradation
5. **Update Documentation**: Document optimization decisions, trade-offs, and monitoring approaches in relevant guides
6. **Capture Evidence**: Record before/after metrics, profiling screenshots, and benchmark results

## Success Metrics
Track effectiveness of this agent's contributions:

- **Code Quality:** 
  - Reduced cyclomatic complexity in hot paths
  - Improved test coverage for performance-critical code
  - Decreased technical debt in optimization-related areas

- **Velocity:** 
  - Time to identify and resolve performance issues
  - Frequency of performance-related deployments
  - Reduction in performance regression incidents

- **Documentation:** 
  - Coverage of performance optimization strategies
  - Accuracy of profiling and monitoring guides
  - Usage by team for performance troubleshooting

- **Collaboration:** 
  - PR review quality for performance-impacting changes
  - Knowledge sharing on optimization techniques
  - Cross-agent coordination on architecture decisions

**Target Metrics:**
- **Client Performance**: Lighthouse score ≥90, FCP <1.5s, TTI <3.5s, bundle size <250KB gzipped
- **Server Performance**: API response time p95 <200ms, database query time p95 <50ms
- **Resource Utilization**: Memory usage <80% baseline, CPU usage <70% under normal load
- **Optimization Impact**: Achieve ≥30% improvement on targeted bottlenecks, track trends monthly

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Large Bundle Size Slowing Initial Load
**Symptoms:** Slow Time to Interactive, large network payloads in DevTools, Lighthouse warnings
**Root Cause:** Unused dependencies, lack of code splitting, unoptimized assets
**Resolution:**
1. Run `npm run analyze` or equivalent bundle analyzer
2. Identify large dependencies and evaluate alternatives or lazy-loading
3. Implement route-based code splitting in `client/`
4. Optimize images and use modern formats (WebP, AVIF)
5. Enable tree-shaking and minification in production builds
**Prevention:** Regular bundle size audits, dependency review during PRs, size budgets in CI

### Issue: Slow Database Queries Degrading API Performance
**Symptoms:** High API response times, database CPU spikes, timeout errors
**Root Cause:** Missing indexes, N+1 queries, inefficient joins, large result sets
**Resolution:**
1. Enable query logging and identify slow queries (>100ms)
2. Use `EXPLAIN` or equivalent to analyze query plans
3. Add indexes on frequently queried columns
4. Refactor N+1 queries to use eager loading or batching
5. Implement pagination for large result sets
**Prevention:** Code review for query patterns, automated slow query alerts, regular index optimization

### Issue: Memory Leaks in Long-Running Server Processes
**Symptoms:** Gradual memory increase, eventual OOM crashes, degraded performance over time
**Root Cause:** Event listener leaks, unclosed connections, cached data growth
**Resolution:**
1. Profile memory usage with Node.js heap snapshots
2. Identify objects not being garbage collected
3. Review event listeners and ensure proper cleanup
4. Implement connection pooling and timeout handling
5. Add memory limits and monitoring alerts
**Prevention:** Automated memory profiling in CI, regular heap snapshot analysis, connection lifecycle audits

### Issue: Render Performance Degradation with Large Lists
**Symptoms:** Janky scrolling, high CPU during rendering, poor FPS metrics
**Root Cause:** Rendering all items at once, expensive re-renders, lack of virtualization
**Resolution:**
1. Implement virtual scrolling (react-window, react-virtualized)
2. Memoize expensive component calculations with useMemo/React.memo
3. Debounce or throttle scroll handlers
4. Optimize list item rendering complexity
5. Use key props correctly to prevent unnecessary re-renders
**Prevention:** Performance testing with large datasets, render profiling during development, component optimization guidelines

## Hand-off Notes
After completing optimization work:

1. **Document Changes**: Update `docs/architecture.md` or `docs/tooling.md` with optimization strategies applied
2. **Provide Metrics**: Include before/after performance comparisons with timestamps and test conditions
3. **Highlight Trade-offs**: Note any readability, maintainability, or feature compromises made for performance
4. **Suggest Monitoring**: Recommend specific metrics to track in production to detect regressions
5. **Identify Follow-ups**: List additional optimization opportunities discovered but not yet addressed
6. **Transfer Knowledge**: Brief team on optimization techniques used and how to maintain performance gains

## Evidence to Capture
- **Profiling Results**: Chrome DevTools screenshots, Lighthouse reports, Node.js profiler flamegraphs
- **Benchmark Data**: Before/after timing comparisons, load test results, bundle size diffs
- **Query Analysis**: Database EXPLAIN plans, slow query logs, index usage statistics
- **Commits & Issues**: Reference specific commits implementing optimizations, link related performance issues
- **Monitoring Dashboards**: Production metrics showing performance improvements over time
- **ADRs**: Link to architectural decision records justifying optimization approaches
- **Follow-up Items**: Document remaining optimization opportunities and prioritization recommendations
<!-- agent-update:end -->
```
