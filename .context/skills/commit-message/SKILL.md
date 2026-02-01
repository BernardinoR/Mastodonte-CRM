# Commit Message Skill

Generate commit messages following Conventional Commits for the Task Management System.

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types

| Type | Description |
|------|-------------|
| `feat` | New feature (tasks, clients, meetings, auth) |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `test` | Adding or updating tests |
| `chore` | Maintenance, dependencies |

## Scopes

Project-specific scopes based on feature modules:

- `tasks` - Task management (`client/src/features/tasks/`)
- `clients` - Client management (`client/src/features/clients/`)
- `meetings` - Meeting features (`client/src/features/meetings/`)
- `auth` - Authentication (`client/src/features/auth/`, `server/auth.ts`)
- `users` - User management (`client/src/features/users/`)
- `api` - Backend endpoints (`server/`)
- `db` - Database/Prisma changes (`prisma/`)
- `ui` - Shared UI components (`client/src/shared/components/`)
- `hooks` - Shared hooks (`client/src/shared/hooks/`)

## Examples

```
feat(tasks): add turbo mode for bulk task processing
fix(auth): handle expired session tokens correctly
refactor(hooks): extract inline editing logic to useInlineEdit
docs(api): update endpoint documentation
chore(deps): update TanStack Query to v5
feat(meetings): integrate AI summary generation
fix(clients): correct date calculation for last meeting
```

## Guidelines

1. **Keep it concise**: First line under 72 characters
2. **Use imperative mood**: "add feature" not "added feature"
3. **Reference issues**: Include issue numbers in footer
4. **Explain why**: Use body for complex changes

## Body Format (for complex changes)

```
feat(tasks): implement drag-and-drop reordering

- Add SmartPointerSensor for improved touch handling
- Implement drop indicators for visual feedback
- Update task order in database on drop

Closes #123
```
