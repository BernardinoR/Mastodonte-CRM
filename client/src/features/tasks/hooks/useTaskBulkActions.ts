import { useCallback } from "react";
import { Task, TaskStatus, TaskPriority, TaskUpdates } from "../types/task";

interface UseTaskBulkActionsProps {
  selectedTaskIds: Set<string>;
  setTasksWithHistory: (updater: (prev: Task[]) => Task[]) => void;
}

interface UseTaskBulkActionsReturn {
  handleBulkUpdate: (updates: TaskUpdates) => void;
  handleBulkDelete: () => void;
  handleBulkAppendTitle: (suffix: string) => void;
  handleBulkReplaceTitle: (newTitle: string) => void;
  handleBulkAddAssignee: (assignee: string) => void;
  handleBulkSetAssignees: (assignees: string[]) => void;
  handleBulkRemoveAssignee: (assignee: string) => void;
}

export function useTaskBulkActions({
  selectedTaskIds,
  setTasksWithHistory,
}: UseTaskBulkActionsProps): UseTaskBulkActionsReturn {
  const handleBulkUpdate = useCallback(
    (updates: TaskUpdates) => {
      setTasksWithHistory((prevTasks) =>
        prevTasks.map((task) => (selectedTaskIds.has(task.id) ? { ...task, ...updates } : task)),
      );
    },
    [selectedTaskIds, setTasksWithHistory],
  );

  const handleBulkDelete = useCallback(() => {
    setTasksWithHistory((prevTasks) => prevTasks.filter((task) => !selectedTaskIds.has(task.id)));
  }, [selectedTaskIds, setTasksWithHistory]);

  const handleBulkAppendTitle = useCallback(
    (suffix: string) => {
      setTasksWithHistory((prevTasks) =>
        prevTasks.map((task) => {
          if (!selectedTaskIds.has(task.id)) return task;
          const startsWithAlphanumeric = /^[a-zA-Z0-9\u00C0-\u024F]/.test(suffix);
          const needsSpace =
            task.title.length > 0 && !/\s$/.test(task.title) && startsWithAlphanumeric;
          return {
            ...task,
            title: task.title + (needsSpace ? " " : "") + suffix,
          };
        }),
      );
    },
    [selectedTaskIds, setTasksWithHistory],
  );

  const handleBulkReplaceTitle = useCallback(
    (newTitle: string) => {
      setTasksWithHistory((prevTasks) =>
        prevTasks.map((task) =>
          selectedTaskIds.has(task.id) ? { ...task, title: newTitle } : task,
        ),
      );
    },
    [selectedTaskIds, setTasksWithHistory],
  );

  const handleBulkAddAssignee = useCallback(
    (assignee: string) => {
      setTasksWithHistory((prevTasks) =>
        prevTasks.map((task) =>
          selectedTaskIds.has(task.id)
            ? {
                ...task,
                assignees: task.assignees.includes(assignee)
                  ? task.assignees
                  : [...task.assignees, assignee],
              }
            : task,
        ),
      );
    },
    [selectedTaskIds, setTasksWithHistory],
  );

  const handleBulkSetAssignees = useCallback(
    (assignees: string[]) => {
      setTasksWithHistory((prevTasks) =>
        prevTasks.map((task) => (selectedTaskIds.has(task.id) ? { ...task, assignees } : task)),
      );
    },
    [selectedTaskIds, setTasksWithHistory],
  );

  const handleBulkRemoveAssignee = useCallback(
    (assignee: string) => {
      setTasksWithHistory((prevTasks) =>
        prevTasks.map((task) =>
          selectedTaskIds.has(task.id)
            ? {
                ...task,
                assignees: task.assignees.filter((a) => a !== assignee),
              }
            : task,
        ),
      );
    },
    [selectedTaskIds, setTasksWithHistory],
  );

  return {
    handleBulkUpdate,
    handleBulkDelete,
    handleBulkAppendTitle,
    handleBulkReplaceTitle,
    handleBulkAddAssignee,
    handleBulkSetAssignees,
    handleBulkRemoveAssignee,
  };
}
