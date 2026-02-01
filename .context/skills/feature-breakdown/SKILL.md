# Feature Breakdown Skill

Break down features into implementable tasks for the Task Management System.

## Feature Decomposition Approach

### 1. Understand Requirements
- What problem does this solve?
- Who are the users?
- What are the acceptance criteria?

### 2. Identify Components
Based on the project structure:

```
Feature Implementation:
├── Database (if needed)
│   └── Prisma schema changes
├── Backend
│   ├── Storage methods (server/storage.ts)
│   └── API routes
├── Frontend
│   ├── Types (types/*.ts)
│   ├── API hooks (hooks/use*.ts)
│   ├── UI components (components/*.tsx)
│   └── Page integration
└── Testing
    └── Unit and integration tests
```

### 3. Define Tasks

## Task Template

```markdown
### [Component] Task Title

**Description:** Brief description of the task

**Files to modify:**
- `path/to/file.ts`

**Dependencies:**
- Task X must be completed first

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
```

## Example: Add Task Priority Filter

### Task 1: Add Priority Filter Type
**Files:** `client/src/features/tasks/types/task.ts`
- Add `PriorityFilterValue` type
- Update `FilterType` union

### Task 2: Implement Priority Filter Logic
**Files:** `client/src/features/tasks/hooks/useTaskFilters.ts`
- Add `isPriorityFilter` type guard
- Implement filter application
**Dependencies:** Task 1

### Task 3: Create Priority Filter UI
**Files:** `client/src/features/tasks/components/PriorityFilter.tsx`
- Create filter dropdown component
- Integrate with filter hook
**Dependencies:** Task 2

### Task 4: Add to Filter Bar
**Files:** `client/src/features/tasks/components/FilterBar.tsx`
- Add PriorityFilter to bar
- Handle filter state
**Dependencies:** Task 3

### Task 5: Write Tests
**Files:** `client/src/features/tasks/__tests__/`
- Test filter type guard
- Test filter hook
- Test filter component

## Integration Points

### Frontend ↔ Backend
- API endpoint contracts
- Request/response types
- Error handling

### Feature ↔ Shared
- Reusable hooks needed?
- Shared components?
- Common types?

### Database ↔ Backend
- Schema changes needed?
- Migration strategy
- Data backfill?

## Estimation Guidelines

| Task Type | Typical Size |
|-----------|--------------|
| Type definitions | Small |
| Hook implementation | Medium |
| Component creation | Medium-Large |
| API endpoint | Medium |
| Database migration | Small-Medium |
| Integration/testing | Medium |
