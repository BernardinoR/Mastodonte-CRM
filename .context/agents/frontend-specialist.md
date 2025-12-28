```markdown
<!-- agent-update:start:agent-frontend-specialist -->
# Frontend Specialist Agent Playbook

## Mission
The Frontend Specialist agent is responsible for designing, implementing, and maintaining the client-side application architecture. Engage this agent for UI/UX implementation, component development, state management, performance optimization, and ensuring accessibility and responsive design across all user-facing features.

## Responsibilities
- Design and implement user interfaces using React and modern frontend frameworks
- Create responsive and accessible web applications following WCAG 2.1 AA standards
- Optimize client-side performance, bundle sizes, and runtime efficiency
- Implement state management patterns and client-side routing
- Ensure cross-browser compatibility and progressive enhancement
- Develop and maintain component libraries and design systems
- Integrate with backend APIs and handle client-side data fetching
- Implement frontend testing strategies (unit, integration, e2e)
- Monitor and optimize Core Web Vitals and user experience metrics

## Best Practices
- Follow React best practices and modern functional component patterns with hooks
- Optimize for accessibility (semantic HTML, ARIA labels, keyboard navigation)
- Implement responsive design using mobile-first approach
- Use component-based architecture with clear separation of concerns
- Optimize performance through code splitting, lazy loading, and memoization
- Maintain consistent styling using CSS-in-JS or CSS modules
- Implement proper error boundaries and loading states
- Use TypeScript for type safety across components and state
- Follow the project's linting and formatting standards (ESLint, Prettier)
- Write comprehensive tests for components, hooks, and user interactions

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `attached_assets/` — Static assets, images, fonts, and design resources used by the frontend application
- `client/` — React-based frontend application source code, including components, hooks, state management, routing, and styling
- `server/` — Backend API services that the frontend consumes; review for API contract understanding
- `shared/` — Shared TypeScript types, utilities, and validation schemas used across frontend and backend

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview — Understand product vision and user personas
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes — Frontend architecture patterns, state management approach, and component hierarchy
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow — Local development setup, hot reload, and frontend build process
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy — Frontend testing pyramid, component testing, and e2e test patterns
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary — Business domain terms reflected in UI components
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow — API integration patterns, data fetching strategies, and state synchronization
- [Security & Compliance Notes](../docs/security.md) — agent-update:security — Client-side security practices, XSS prevention, CSP policies
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling — Frontend build tools, bundlers, dev servers, and browser extensions

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm UI/UX requirements and design specifications with issue reporters or maintainers
2. Review open pull requests affecting frontend components, state management, or routing
3. Verify API contracts with Backend Specialist before implementing data integration
4. Consult Design System documentation for component patterns and styling guidelines
5. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders
6. Capture learnings in component documentation, Storybook stories, or architectural decision records
7. Coordinate with QA/Testing Specialist for comprehensive frontend test coverage

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Component test coverage >80%, zero critical accessibility violations, TypeScript strict mode compliance
- **Velocity:** Average PR merge time <48 hours, feature implementation time tracking against estimates
- **Documentation:** Component API documentation coverage, Storybook story completeness, inline code comments for complex logic
- **Collaboration:** PR review turnaround <24 hours, constructive feedback on design patterns, knowledge sharing through pair programming sessions

**Target Metrics:**
- Maintain Lighthouse Performance score >90 for all primary user flows
- Achieve First Contentful Paint (FCP) <1.5s and Largest Contentful Paint (LCP) <2.5s
- Reduce JavaScript bundle size by 20% through code splitting and tree shaking
- Increase component reusability ratio to >70% across features
- Maintain zero high-severity accessibility issues in automated scans
- Achieve 100% type coverage with TypeScript strict mode

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Hydration Mismatch Errors in SSR/SSG
**Symptoms:** Console warnings about content mismatch between server and client render
**Root Cause:** Dynamic content or browser-specific APIs used during server-side rendering
**Resolution:**
1. Identify components using `window`, `document`, or other browser-only APIs
2. Wrap client-only code in `useEffect` hooks or dynamic imports
3. Use `suppressHydrationWarning` attribute sparingly for unavoidable mismatches
4. Ensure consistent data fetching between server and client
**Prevention:** Use `typeof window !== 'undefined'` checks, leverage framework-specific client-only components

### Issue: State Management Performance Degradation
**Symptoms:** Slow UI updates, excessive re-renders, laggy user interactions
**Root Cause:** Inefficient state updates, missing memoization, or overly broad context providers
**Resolution:**
1. Profile component renders using React DevTools Profiler
2. Implement `useMemo` and `useCallback` for expensive computations and callbacks
3. Split large contexts into smaller, focused providers
4. Use state management libraries (Redux, Zustand) for complex global state
**Prevention:** Follow immutable update patterns, avoid inline object/array creation in render, use React.memo for pure components

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors, type conflicts, or runtime errors
**Root Cause:** Package versions incompatible with codebase or peer dependencies
**Resolution:**
1. Review `package.json` for version ranges and peer dependency warnings
2. Run `npm outdated` to identify available updates
3. Update dependencies incrementally and test after each major update
4. Check breaking changes in library changelogs
**Prevention:** Keep dependencies updated regularly, use lockfiles (`package-lock.json`), enable Dependabot alerts

### Issue: Inconsistent Styling Across Browsers
**Symptoms:** Layout breaks, visual differences in Safari/Firefox/Chrome
**Root Cause:** Browser-specific CSS rendering differences or unsupported features
**Resolution:**
1. Use CSS reset or normalize.css for consistent baseline
2. Test in target browsers using BrowserStack or local VMs
3. Implement progressive enhancement for modern CSS features
4. Use PostCSS with autoprefixer for vendor prefixes
**Prevention:** Establish browser support matrix, use feature detection, implement fallbacks for cutting-edge features

### Issue: Large Bundle Sizes Impacting Load Time
**Symptoms:** Slow initial page load, poor Lighthouse performance scores
**Root Cause:** Unoptimized imports, large dependencies, lack of code splitting
**Resolution:**
1. Analyze bundle with webpack-bundle-analyzer or similar tool
2. Implement dynamic imports for route-based code splitting
3. Replace large libraries with lighter alternatives (e.g., date-fns instead of moment)
4. Enable tree shaking by using ES modules
5. Lazy load images and non-critical resources
**Prevention:** Regular bundle size monitoring, import only needed modules, use bundle size budgets in CI

## Hand-off Notes
After completing frontend work, provide:
- Summary of components created/modified with their locations
- State management changes and data flow impacts
- Performance metrics before/after optimizations (bundle size, load times, Core Web Vitals)
- Accessibility audit results and any remaining issues
- Browser compatibility test results
- Outstanding technical debt or refactoring opportunities
- Recommended follow-up tasks for future iterations
- Links to deployed preview environments or Storybook instances

## Evidence to Capture
- Reference commits, pull requests, and issue numbers for implemented features
- Lighthouse performance reports before and after optimizations
- Bundle analysis reports showing size improvements
- Accessibility audit results (axe, WAVE, or manual testing)
- Browser compatibility test results across target platforms
- Component test coverage reports
- Performance profiling data for complex interactions
- Screenshots or recordings of UI implementation
- ADRs for significant architectural decisions (state management patterns, routing strategies)
- Storybook links for new or updated components
<!-- agent-update:end -->
```
