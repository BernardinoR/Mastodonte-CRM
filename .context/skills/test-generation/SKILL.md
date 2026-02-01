# Test Generation Skill

Generate tests for the Task Management System using Jest and React Testing Library.

## Testing Framework

- **Unit Tests**: Jest
- **Component Tests**: React Testing Library
- **API Tests**: Supertest (if applicable)

## Test File Organization

```
feature/
├── components/
│   └── TaskCard.tsx
├── hooks/
│   └── useTaskFilters.ts
├── lib/
│   └── date-utils.ts
└── __tests__/           # Tests mirror source structure
    ├── TaskCard.test.tsx
    ├── useTaskFilters.test.ts
    └── date-utils.test.ts
```

## Test Patterns

### Utility Function Tests
```typescript
import { calculateIsOverdue } from '../lib/date-utils';

describe('calculateIsOverdue', () => {
  it('returns true for past dates', () => {
    const pastDate = new Date('2020-01-01');
    expect(calculateIsOverdue(pastDate)).toBe(true);
  });

  it('returns false for future dates', () => {
    const futureDate = new Date('2030-01-01');
    expect(calculateIsOverdue(futureDate)).toBe(false);
  });

  it('handles null/undefined gracefully', () => {
    expect(calculateIsOverdue(null)).toBe(false);
  });
});
```

### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../TaskCard';

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  status: 'pending',
  priority: 'medium',
};

describe('TaskCard', () => {
  it('displays task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onStatusChange when status button clicked', () => {
    const onStatusChange = jest.fn();
    render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: /complete/i }));
    expect(onStatusChange).toHaveBeenCalledWith('completed');
  });
});
```

### Hook Tests
```typescript
import { renderHook, act } from '@testing-library/react';
import { useTaskFilters } from '../useTaskFilters';

describe('useTaskFilters', () => {
  it('initializes with empty filters', () => {
    const { result } = renderHook(() => useTaskFilters());
    expect(result.current.filters).toEqual([]);
  });

  it('adds filter correctly', () => {
    const { result } = renderHook(() => useTaskFilters());
    
    act(() => {
      result.current.addFilter({ type: 'status', value: 'pending' });
    });
    
    expect(result.current.filters).toHaveLength(1);
  });
});
```

## Mocking Strategies

### Mock API Requests
```typescript
jest.mock('@/shared/lib/queryClient', () => ({
  apiRequest: jest.fn(),
}));
```

### Mock Clerk Auth
```typescript
jest.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ user: { id: 'test-user' } }),
  useAuth: () => ({ isSignedIn: true }),
}));
```

## Coverage Goals

| Metric | Target |
|--------|--------|
| Statements | 70% |
| Branches | 60% |
| Functions | 70% |
| Lines | 70% |
