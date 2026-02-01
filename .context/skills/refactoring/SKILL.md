# Refactoring Skill

Safe code refactoring guidelines for the Task Management System.

## Refactoring Patterns

### Extract Custom Hook
**Before:**
```typescript
function TaskList() {
  const [filters, setFilters] = useState([]);
  const [sortField, setSortField] = useState('dueDate');
  const filteredTasks = useMemo(() => {
    // Complex filtering logic
  }, [tasks, filters]);
  // More logic...
}
```

**After:**
```typescript
// New hook in client/src/features/tasks/hooks/useTaskFilters.ts
export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState([]);
  const [sortField, setSortField] = useState('dueDate');
  const filteredTasks = useMemo(() => {
    // Complex filtering logic
  }, [tasks, filters]);
  return { filters, setFilters, filteredTasks, sortField, setSortField };
}

// Component becomes simpler
function TaskList() {
  const { filters, filteredTasks } = useTaskFilters(tasks);
}
```

### Extract Component
**When:** Component exceeds ~150 lines or has distinct sections

```typescript
// Before: Large TaskCard with inline actions
// After: Extract TaskCardActions component
```

### Consolidate Types
**When:** Similar types defined in multiple places

```typescript
// Move to client/src/shared/types/types.ts
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
```

## Safe Refactoring Steps

1. **Ensure test coverage exists**
   - Run existing tests
   - Add tests if missing

2. **Make incremental changes**
   - One refactoring at a time
   - Commit after each step

3. **Verify after each change**
   - Run tests
   - Check TypeScript compilation
   - Manual smoke test

4. **Update imports**
   - Use IDE refactoring tools
   - Check for broken imports

## Code Smells to Address

| Smell | Refactoring |
|-------|-------------|
| Duplicate code | Extract to shared utility |
| Long function | Extract helper functions |
| Large component | Split into sub-components |
| Magic numbers | Create constants |
| Deep nesting | Early returns, extract functions |
| Implicit types | Add TypeScript interfaces |

## Project-Specific Patterns

### Hook Extraction Locations
- Feature-specific: `client/src/features/{feature}/hooks/`
- Shared: `client/src/shared/hooks/`

### Utility Extraction Locations
- Feature-specific: `client/src/features/{feature}/lib/`
- Shared: `client/src/shared/lib/`

### Component Extraction
- Keep in same feature folder
- Create sub-folder if complex (e.g., `task-card/`)

## Checklist

- [ ] Tests pass before starting
- [ ] Incremental commits
- [ ] No behavior changes
- [ ] Tests pass after each step
- [ ] Imports updated
- [ ] TypeScript compiles
