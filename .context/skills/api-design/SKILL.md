# API Design Skill

Design RESTful APIs for the Task Management System.

## API Patterns Used

### Endpoint Structure
```
GET    /api/{resource}          # List resources
GET    /api/{resource}/:id      # Get single resource
POST   /api/{resource}          # Create resource
PUT    /api/{resource}/:id      # Update resource (full)
PATCH  /api/{resource}/:id      # Update resource (partial)
DELETE /api/{resource}/:id      # Delete resource
```

### Current Endpoints
- `/api/tasks` - Task management
- `/api/clients` - Client management
- `/api/meetings` - Meeting management
- `/api/users` - User management

## Request/Response Standards

### Response Format
```typescript
// Success
{
  "data": { ... },          // or array for list
  "meta": {                 // optional pagination
    "total": 100,
    "page": 1,
    "limit": 20
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }      // optional field errors
  }
}
```

### Query Parameters
```
GET /api/tasks?status=pending&clientId=5&page=1&limit=20&sort=dueDate:asc
```

## Authentication

All endpoints require Clerk authentication:

```typescript
// server/auth.ts
app.use('/api/*', clerkAuthMiddleware);

// Role-based protection
app.get('/api/admin/*', requireAdmin);
app.get('/api/tasks', requireRole(['admin', 'manager', 'user']));
```

## Storage Layer Pattern

API routes use `DbStorage` for data access:

```typescript
// server/storage.ts
export class DbStorage implements IStorage {
  async getTasks(userId: number): Promise<TaskWithRelations[]> {
    return prisma.task.findMany({
      where: { assigneeId: userId },
      include: { client: true, assignee: true }
    });
  }
}
```

## New Endpoint Checklist

- [ ] Define route path following conventions
- [ ] Add authentication middleware
- [ ] Add authorization check if needed
- [ ] Implement in `DbStorage` class
- [ ] Validate input data
- [ ] Handle errors consistently
- [ ] Return appropriate status codes
- [ ] Add TypeScript types for request/response

## Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation) |
| 401 | Unauthorized (no auth) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 500 | Server Error |

## Type Definitions

```typescript
// server/storage.ts
export type InsertTask = {
  title: string;
  status: string;
  priority: string;
  clientId?: number;
  assigneeId?: number;
  dueDate?: Date;
};

export type TaskWithRelations = Task & {
  client?: Client;
  assignee?: User;
};
```
