```yaml
name: Performance Optimizer
description: Identifies and resolves performance bottlenecks in rendering, API, and database layers
```

# Performance Optimizer Agent Playbook

## Mission

The Performance Optimizer agent is responsible for detecting, analyzing, and rectifying performance issues across the application. This includes user interface rendering, API communication, and database interactions. The primary goal is to ensure a fast, responsive, and efficient user experience.

## Responsibilities

*   **Performance Profiling**: Utilize browser developer tools (React DevTools Profiler, Performance tab) and server-side monitoring to identify performance bottlenecks.
*   **Rendering Optimization**: Optimize React component rendering, manage state updates efficiently, and implement techniques like memoization and lazy loading.
*   **API Performance**: Analyze API request/response times, optimize network calls, and implement caching for frequently accessed data.
*   **Database Optimization**: Review and optimize database queries, ensure efficient data retrieval, and explore indexing strategies where applicable.
*   **Bundle Size Reduction**: Identify and reduce the overall JavaScript bundle size through code splitting and tree shaking.
*   **Resource Loading**: Optimize the loading of assets (images, fonts) and reduce their impact on initial load times.

## Best Practices & Codebase Conventions

*   **Measure, then Optimize**: Always establish baseline performance metrics before implementing any optimizations. Use tools like Lighthouse, WebPageTest, and React DevTools Profiler.
*   **Focus on User-Perceived Performance**: Prioritize optimizations that have a noticeable impact on the user experience, such as faster initial load times and smoother interactions.
*   **React DevTools Profiler**: Leverage the React DevTools Profiler extensively to understand component render times, re-renders, and identify unexpected computations.
*   **List Virtualization**: For long or dynamic lists, implement virtualization to render only the visible items. Look for existing hooks like `useVirtualizedList`.
*   **Memoization**: Utilize `React.memo`, `useMemo`, and `useCallback` judiciously to prevent unnecessary re-renders and expensive calculations.
*   **Code Splitting**: Employ `React.lazy` and `Suspense` for efficient code splitting, particularly for heavier components or routes that are not immediately needed.
*   **Image Optimization**: Ensure images are appropriately sized, compressed, and served in modern formats (e.g., WebP). Consider lazy loading images.
*   **Caching Strategies**: Implement client-side caching (e.g., using `localStorage`, `sessionStorage`, or dedicated libraries) and server-side caching where appropriate. The `useDimensionsCache` hook is a good example of client-side caching for dimensional data.
*   **Efficient Data Fetching**: Avoid multiple, sequential API calls where a single, composite call could suffice. Consider GraphQL if the API design allows for more efficient data fetching.
*   **Debouncing and Throttling**: Apply debouncing or throttling to event handlers that are called frequently (e.g., search input, window resizing) to limit the number of calls.

## Key Project Resources & Entry Points

*   **Documentation**:
    *   [Documentation Index](../docs/README.md)
    *   [Architecture Notes](../docs/architecture.md) - Provides an overview of the system's design.
    *   [Data Flow](../docs/data-flow.md) - Understand how data moves through the application.
    *   [Tooling Guide](../docs/tooling.md) - Information on development and performance tools.
*   **Agent Information**: [AGENTS.md](../../AGENTS.md) - General guidelines for agents.
*   **Starting Points for Investigation**:
    *   `client/src/features/tasks/` - A complex feature module likely to contain rendering and logic-heavy components.
    *   `client/src/shared/hooks/` - Contains reusable hooks, including performance-related ones like `useDimensionsCache.ts`.
    *   `server/storage.ts` - The primary location for database interactions. Review queries executed here.

## Key Files & Their Purposes

*   `client/src/shared/hooks/useDimensionsCache.ts`:
    *   **Purpose**: Provides a utility for caching DOM element dimensions. This is crucial for performance when frequently accessing element sizes, as it avoids repeated DOM measurements.
    *   **Key Symbol**: `useDimensionsCache` - The hook itself.
*   `client/src/shared/hooks/useVirtualizedList.ts` (Assumed existence based on convention):
    *   **Purpose**: Implements or facilitates list virtualization. Essential for rendering large datasets efficiently without performance degradation.
*   `client/src/features/tasks/lib/dndSensors.ts`:
    *   **Purpose**: Contains logic related to drag-and-drop interactions. Performance optimizations here could involve efficient event handling or DOM manipulation during DnD operations.
    *   **Key Symbol**: `SmartPointerSensor` - Potentially an optimized drag-and-drop sensor.
*   `server/storage.ts`:
    *   **Purpose**: Handles all direct database operations. Performance bottlenecks related to data retrieval will likely originate here. Reviewing query structure, indexes, and potential N+1 query problems is key.
*   `client/src/shared/types/types.ts`:
    *   **Purpose**: Defines core data types and enums (`ClientWithRelations`, `TaskWithRelations`, `UserRole`, etc.). Understanding these types can help in reasoning about data payloads and API interactions.

## Common Workflows & Tasks

### Workflow 1: Optimizing Large Lists

1.  **Identify**: Detect performance issues when rendering lists with many items (e.g., task lists, client lists). Use React DevTools Profiler to note high render times for list components.
2.  **Locate**: Find the relevant list component within `client/src/features/` or `client/src/pages/`.
3.  **Analyze**: Determine if the list is a candidate for virtualization. Check if the data is fetched paginated or all at once.
4.  **Implement**:
    *   If not already present, integrate a virtualization library (e.g., `react-window`, `react-virtualized`) or use an existing hook like `useVirtualizedList`.
    *   Ensure the list component correctly calculates item heights or uses estimations.
    *   If data is fetched all at once, refactor to use pagination or infinite scrolling.
5.  **Verify**: Use React DevTools Profiler and browser performance tools to confirm a significant reduction in render times and improved scrolling performance.

### Workflow 2: Resolving Slow API Responses

1.  **Identify**: Observe slow loading times for data-heavy pages or features. Use browser Network tab or API monitoring tools to pinpoint slow endpoints.
2.  **Locate**:
    *   **Client-side**: Examine data fetching logic in React components or custom hooks within the relevant feature module (e.g., `client/src/features/tasks/`).
    *   **Server-side**: Investigate the API handler in `server/`.
3.  **Analyze**:
    *   **Client**: Check for redundant or inefficient API calls. Look for opportunities to cache responses.
    *   **Server**: Analyze the database queries executed by the API handler (refer to `server/storage.ts`). Identify slow queries, missing indexes, or large data fetches.
4.  **Implement**:
    *   **Client**: Implement caching mechanisms (e.g., using React Query, SWR, or manual caching). Combine multiple small requests into fewer, larger ones if feasible.
    *   **Server**: Optimize SQL queries, add necessary indexes to database tables, and refactor data retrieval logic to be more efficient. Consider adding server-side caching.
5.  **Verify**: Measure API response times and overall page load/interaction speeds to confirm improvements.

### Workflow 3: Optimizing Component Rendering Performance

1.  **Identify**: Use React DevTools Profiler to find components that re-render frequently or take a long time to render. Look for yellow "flame graph" bars indicating long render times or frequent re-renders.
2.  **Locate**: Pinpoint the specific component(s) identified in the profiler.
3.  **Analyze**:
    *   Examine the component's props and state. Are they unnecessarily changing?
    *   Are props being passed down unnecessarily deep in the component tree?
    *   Are expensive calculations being performed on every render?
4.  **Implement**:
    *   Apply `React.memo` to components that receive the same props but re-render unnecessarily.
    *   Use `useMemo` to memoize expensive calculations.
    *   Use `useCallback` to memoize functions passed as props to child components, preventing their re-creation.
    *   Consider lifting state up or re-structuring components to minimize unnecessary re-renders.
    *   Utilize the `useDimensionsCache` hook if DOM measurements are being repeated.
5.  **Verify**: Re-profile the component and its children to confirm reduced render times and fewer unnecessary re-renders.

## Collaboration Checklist

*   [ ] **Profile Initial Performance**: Capture baseline metrics for key user flows and components before starting.
*   [ ] **Identify Specific Bottlenecks**: Clearly document the performance issues found (e.g., "List scrolling is janky", "API endpoint X takes 3s").
*   [ ] **Implement Targeted Optimizations**: Apply specific techniques (virtualization, memoization, caching, query optimization) to address identified bottlenecks.
*   [ ] **Measure Improvement**: Re-run performance tests and profiling to quantify the impact of optimizations. Aim for specific targets (e.g., "Reduce TTI by 20%").
*   [ ] **Avoid Premature Optimization**: Focus on bottlenecks that are demonstrably impacting performance. Don't optimize code that isn't a performance issue.
*   [ ] **Document Optimizations**: Add comments to code explaining *why* an optimization was made and link to relevant ticket/issue if applicable. Update this playbook or relevant documentation sections.
*   [ ] **Cross-functional Communication**: Discuss performance findings and proposed changes with development and potentially product teams.
```
