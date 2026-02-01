# Documentation Skill

Generate and maintain documentation for the Task Management System.

## Documentation Structure

```
.context/
├── docs/                 # Technical documentation
│   ├── README.md        # Documentation index
│   ├── architecture.md  # System architecture
│   ├── data-flow.md     # Data flow diagrams
│   └── ...
├── agents/              # AI agent playbooks
└── skills/              # Skill definitions
```

## Code Documentation

### TypeScript/JSDoc
```typescript
/**
 * Calculates if a task is overdue based on its due date.
 * @param dueDate - The task's due date
 * @returns true if the due date has passed
 */
export function calculateIsOverdue(dueDate: Date | null): boolean {
  if (!dueDate) return false;
  return new Date() > dueDate;
}
```

### Interface Documentation
```typescript
/**
 * Represents a task in the system.
 */
export interface Task {
  /** Unique identifier */
  id: number;
  /** Task title - required, max 255 chars */
  title: string;
  /** Current task status */
  status: TaskStatus;
  /** Task priority level */
  priority: TaskPriority;
  /** Assigned user ID (optional) */
  assigneeId?: number;
}
```

### Component Documentation
```typescript
/**
 * TaskCard displays a single task with status and actions.
 * 
 * @example
 * <TaskCard
 *   task={task}
 *   onStatusChange={(status) => updateTask(task.id, { status })}
 * />
 */
export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  // ...
}
```

## README Standards

### Feature README Template
```markdown
# Feature Name

Brief description of the feature.

## Components
- `ComponentName` - Description

## Hooks
- `useHookName` - Description

## Usage
\`\`\`tsx
// Example usage
\`\`\`

## Related
- Link to related features
```

## API Documentation

### Endpoint Documentation
```markdown
## GET /api/tasks

Retrieves tasks for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status
- `clientId` (optional): Filter by client

**Response:**
\`\`\`json
{
  "tasks": [
    { "id": 1, "title": "Task", "status": "pending" }
  ]
}
\`\`\`
```

## Documentation Checklist

- [ ] Public APIs documented with JSDoc
- [ ] Complex logic has inline comments
- [ ] README exists for each feature
- [ ] Architecture decisions recorded
- [ ] Examples provided where helpful
