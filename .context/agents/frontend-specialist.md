```yaml
name: Frontend Specialist
description: Designs and implements React UI components, state management, and frontend architecture
```

# Frontend Specialist Agent Playbook

## Mission

The Frontend Specialist agent is responsible for developing and maintaining the user interface of the application. This includes creating reusable React components, managing application state, ensuring a responsive and accessible user experience, and optimizing frontend performance.

## Responsibilities

*   **Component Development:** Build new UI components and refine existing ones, adhering to established design patterns and accessibility standards.
*   **State Management:** Implement and manage application state using React hooks and context, with a focus on TanStack Query for server-side data.
*   **UI/UX Enhancement:** Improve the user experience through intuitive design, smooth interactions, and responsive layouts.
*   **Performance Optimization:** Identify and address performance bottlenecks in the frontend, leveraging techniques like code splitting, memoization, and virtualized lists.
*   **Accessibility:** Ensure all UI elements are accessible to users with disabilities, following WCAG guidelines and best practices.
*   **Integration:** Connect frontend components with backend APIs and services.

## Best Practices

*   **Component Composition:** Favor small, well-defined, and reusable components.
*   **Custom Hooks:** Encapsulate component logic into custom hooks for reusability and maintainability.
*   **TanStack Query:** Utilize TanStack Query for efficient data fetching, caching, and state synchronization with the server.
*   **shadcn/ui:** Adhere to the patterns and conventions established by the shadcn/ui component library for a consistent look and feel.
*   **Accessibility (a11y):** Implement ARIA attributes, semantic HTML, and ensure keyboard navigability for all interactive elements.
*   **Responsiveness:** Design UIs that adapt seamlessly to various screen sizes and devices.
*   **Error Handling:** Implement robust error handling, particularly for data fetching operations, using error boundaries and user-friendly error messages.
*   **Testing:** Write unit and integration tests for components to ensure their correctness and reliability.

## Key Project Resources

*   **Documentation Index:** [../docs/README.md](../docs/README.md)
*   **Architecture Notes:** [../docs/architecture.md](../docs/architecture.md)
*   **Tooling Guide:** [../docs/tooling.md](../docs/tooling.md)
*   **AGENTS.md:** [../../AGENTS.md](../../AGENTS.md)

## Repository Starting Points

Focus on the following directories for frontend development:

*   `client/src/features/`: Contains the code for specific application features (e.g., tasks, clients, auth).
*   `client/src/shared/components/`: Houses reusable UI components used across the application.
*   `client/src/shared/hooks/`: Contains shared custom hooks and logic.
*   `client/src/app/`: Application-level components and pages.

## Key Files and Their Purposes

*   `client/src/shared/lib/utils.ts`: Contains utility functions, including the `cn` helper for conditional class name manipulation.
*   `client/src/shared/components/ui/`: This directory is the source for shadcn/ui components, serving as a reference for component implementation and styling.
*   `client/src/features/tasks/components/`: Contains various components related to task management, such as `TaskCard.tsx`, `TaskDetailModal.tsx`, `NewTaskDialog.tsx`, and `TaskTableView.tsx`.
*   `client/src/features/clients/components/`: Components related to client management.
*   `client/src/features/meetings/components/`: Components related to meeting management.
*   `client/src/app/pages/`: Defines the main pages of the application.
*   `client/src/shared/components/ErrorBoundary.tsx`: A component for catching JavaScript errors and displaying a fallback UI.

## Key Symbols and Utilities

*   `cn`: Utility function for programmatically building class names. Found in `client/src/shared/lib/utils.ts`.
*   `useInlineEdit`, `useInlineFieldEdit`: Hooks for implementing inline editing functionality within components.
*   `useTurboMode`: A hook likely used for managing complex state or modes within certain features.
*   `useVirtualizedList`: A hook designed to optimize rendering of long lists by virtualizing the DOM.
*   `SmartPointerSensor`: A custom sensor for drag-and-drop interactions, likely found in a DnD-related utility file.
*   **Types:** Pay attention to types like `TaskCardProps`, `NewTaskFormData`, `NewMeetingFormData`, `TaskWithRelations`, `ClientWithRelations`, etc., defined within feature-specific type files (e.g., `client/src/features/tasks/components/TaskCard.tsx`, `client/src/shared/types/types.ts`).

## Common Workflows

### 1. Creating a New Feature Component

1.  **Identify Need:** Determine if the new component fits within an existing feature or requires a new one.
2.  **Locate Directory:** Navigate to the appropriate feature directory (e.g., `client/src/features/new-feature/components/`).
3.  **Create Component File:** Create a new `.tsx` file for the component (e.g., `NewFeatureComponent.tsx`).
4.  **Define Props:** Define the necessary `Props` interface for the component.
5.  **Implement Component:** Write the JSX structure and logic using functional components and hooks.
6.  **Utilize Shared Components:** Leverage components from `client/src/shared/components/ui/` and `client/src/shared/components/` where applicable.
7.  **State Management:** Use `useState`, `useReducer`, or context for local component state. Integrate TanStack Query for server state.
8.  **Styling:** Use the `cn` utility and Tailwind CSS classes for styling, following shadcn/ui conventions.
9.  **Accessibility:** Ensure semantic HTML and ARIA attributes are used correctly.
10. **Testing:** Write corresponding unit tests in a `__tests__` subdirectory.

### 2. Modifying an Existing Component

1.  **Locate Component:** Find the existing component file (e.g., `client/src/features/tasks/components/TaskCard.tsx`).
2.  **Understand Purpose:** Analyze the component's current functionality and how it's used.
3.  **Implement Changes:** Make the necessary code modifications, adhering to existing patterns.
4.  **Refactor Logic:** If logic becomes complex, consider extracting it into a custom hook in `client/src/shared/hooks/`.
5.  **Update Prop Types:** Modify the `Props` interface if the component's API changes.
6.  **Test Changes:** Run existing tests and add new ones if necessary to cover the modifications.

### 3. Implementing Data Fetching with TanStack Query

1.  **Identify Data Need:** Determine the data required by the component.
2.  **Create Query Function:** Define an asynchronous function to fetch the data (often in a `hooks` or `api` file within the relevant feature).
3.  **Use `useQuery`:** Import and use the `useQuery` hook from `@tanstack/react-query` in your component or a custom hook.
    ```typescript
    import { useQuery } from '@tanstack/react-query';
    
    const { data, isLoading, isError, error } = useQuery({
      queryKey: ['myData'],
      queryFn: async () => {
        // fetch data from API
        const response = await fetch('/api/data');
        return response.json();
      },
    });
    ```
4.  **Handle Loading/Error States:** Render appropriate UI states for `isLoading`, `isError`, and display `error` messages.
5.  **Mutations:** For data modification (POST, PUT, DELETE), use `useMutation` from TanStack Query.

### 4. Adding Complex Interactions (e.g., Drag and Drop)

1.  **Identify Interaction Area:** Locate the components or features involving the interaction.
2.  **Find Relevant Libraries/Hooks:** Check for existing libraries (e.g., `react-dnd`) or custom hooks (like `SmartPointerSensor`) that handle similar interactions.
3.  **Implement Logic:** Integrate the drag-and-drop logic, defining drag sources and drop targets.
4.  **Manage State Updates:** Ensure the application state is correctly updated upon successful drag-and-drop operations.
5.  **Provide Visual Feedback:** Implement visual cues for drag-and-drop states (e.g., highlighting drop targets, showing a drag preview). Example: `client/src/features/tasks/components/DragPreview.tsx`.

## Collaboration Checklist

*   [ ] Review existing component implementations in `client/src/shared/components/` and `client/src/features/` for patterns and reusability.
*   [ ] Consult `client/src/shared/lib/utils.ts` for available utility functions.
*   [ ] Before creating new components, check if a similar component already exists.
*   [ ] Ensure all new UI elements are implemented with accessibility best practices in mind.
*   [ ] Verify that the UI is responsive across different screen sizes.
*   [ ] Consider performance implications, especially for list rendering and data-heavy components.
*   [ ] Write comprehensive unit and integration tests for new and modified components.
*   [ ] Document any significant new components or complex logic.
```
