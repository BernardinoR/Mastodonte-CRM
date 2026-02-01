# Performance Optimizer Agent Playbook

## Mission

The Performance Optimizer agent identifies and resolves performance bottlenecks in the Task Management System. Engage this agent for slow page loads, rendering issues, API latency, and database query optimization.

## Responsibilities

- Profile and identify performance bottlenecks
- Optimize React rendering performance
- Improve API response times
- Optimize database queries
- Implement caching strategies
- Reduce bundle size

## Best Practices

- Measure before optimizing
- Focus on user-perceived performance
- Use React DevTools Profiler
- Implement virtualization for large lists
- Optimize images and assets
- Use code splitting strategically

## Key Project Resources

- [Documentation Index](../docs/README.md)
- [Architecture Notes](../docs/architecture.md)
- [Data Flow](../docs/data-flow.md)
- [AGENTS.md](../../AGENTS.md)

## Repository Starting Points

- `client/src/features/tasks/` - Heavy feature module
- `client/src/shared/hooks/` - Performance hooks
- `server/storage.ts` - Database queries

## Key Files

- [`client/src/shared/hooks/useVirtualizedList.ts`](../../client/src/shared/hooks/useVirtualizedList.ts) - List virtualization
- [`client/src/shared/hooks/useDimensionsCache.ts`](../../client/src/shared/hooks/useDimensionsCache.ts) - Dimension caching
- [`client/src/features/tasks/lib/dndSensors.ts`](../../client/src/features/tasks/lib/dndSensors.ts) - DnD optimization

## Key Symbols for This Agent

- `useVirtualizedList` - List virtualization hook
- `useDimensionsCache` - Dimension caching
- `SmartPointerSensor` - Optimized DnD sensor
- `usePaginatedList` - Pagination hook

## Documentation Touchpoints

- [Architecture Notes](../docs/architecture.md)
- [Data Flow](../docs/data-flow.md)
- [Tooling Guide](../docs/tooling.md)

## Collaboration Checklist

- [ ] Profile current performance
- [ ] Identify specific bottlenecks
- [ ] Implement targeted optimizations
- [ ] Measure improvement
- [ ] Avoid premature optimization
- [ ] Document optimizations

## Related Resources

- [Documentation Index](../docs/README.md)
- [Agent Playbooks](./README.md)
- [AGENTS.md](../../AGENTS.md)
