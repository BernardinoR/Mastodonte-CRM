# Code Review Skill

Guidelines for reviewing code quality in the Task Management System.

## Code Patterns to Check

### React Components
```typescript
// Good: Focused component with typed props
interface TaskCardProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  // Component logic
}
```

### Custom Hooks
```typescript
// Good: Hook with clear return type
export function useTaskFilters(): UseTaskFiltersReturn {
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  // Hook logic
  return { filters, setFilters, clearFilters };
}
```

### API Calls
```typescript
// Good: Using apiRequest with proper error handling
const data = await apiRequest<TaskWithRelations[]>('/api/tasks');
```

## Review Focus Areas

### TypeScript
- No `any` types (use `unknown` if needed)
- Interfaces for object shapes
- Explicit return types for functions
- Proper generic usage

### React
- Hooks at top level only
- Dependency arrays complete
- Memoization where beneficial
- Proper cleanup in effects

### Performance
- Virtualization for long lists (`useVirtualizedList`)
- Memoized callbacks where needed
- Avoid unnecessary re-renders

### Security
- Input validation present
- Auth checks on protected routes
- No sensitive data in logs

## Common Code Smells

| Smell | Solution |
|-------|----------|
| Large component | Extract sub-components |
| Duplicate logic | Create custom hook |
| Magic numbers | Use constants/config |
| Deep nesting | Early returns |
| Missing types | Add TypeScript interfaces |

## Project Conventions

- Use `cn()` for conditional class names
- Use shadcn/ui components
- Follow feature-based folder structure
- Keep hooks in `hooks/` directory
- Keep utilities in `lib/` directory
