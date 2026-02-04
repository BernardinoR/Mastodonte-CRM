import { useState, useCallback } from "react";
import type { Task, TaskStatus } from "../types/task";

interface UseTaskSelectionProps {
  tasks: Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
}

export function useTaskSelection({ tasks, getTasksByStatus }: UseTaskSelectionProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const handleSelectTask = useCallback(
    (taskId: string, shiftKey: boolean, ctrlKey: boolean = false) => {
      const clickedTask = tasks.find((t) => t.id === taskId);
      if (!clickedTask) return;

      if (shiftKey && lastSelectedId) {
        const lastTask = tasks.find((t) => t.id === lastSelectedId);

        if (lastTask && lastTask.status === clickedTask.status) {
          // Range selection within same column
          const columnTasks = getTasksByStatus(clickedTask.status);
          const lastIndex = columnTasks.findIndex((t) => t.id === lastSelectedId);
          const currentIndex = columnTasks.findIndex((t) => t.id === taskId);

          if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            const rangeIds = columnTasks.slice(start, end + 1).map((t) => t.id);

            setSelectedTaskIds((prev) => {
              const newSet = new Set(prev);
              rangeIds.forEach((id) => newSet.add(id));
              return newSet;
            });
            setLastSelectedId(taskId);
            return;
          }
        } else {
          // Different column with Shift: toggle individual selection
          setSelectedTaskIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
              newSet.delete(taskId);
            } else {
              newSet.add(taskId);
            }
            return newSet;
          });
          setLastSelectedId(taskId);
        }
      } else if (ctrlKey) {
        // Ctrl+click: Toggle individual selection (add/remove from current selection)
        setSelectedTaskIds((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(taskId)) {
            newSet.delete(taskId);
          } else {
            newSet.add(taskId);
          }
          return newSet;
        });
        setLastSelectedId(taskId);
      } else {
        // Regular click: Select only this card (clear others)
        setSelectedTaskIds(new Set([taskId]));
        setLastSelectedId(taskId);
      }
    },
    [lastSelectedId, tasks, getTasksByStatus],
  );

  const clearSelection = useCallback(() => {
    setSelectedTaskIds(new Set());
    setLastSelectedId(null);
  }, []);

  const selectAll = useCallback(
    (taskList?: Task[]) => {
      const targetTasks = taskList ?? tasks;
      setSelectedTaskIds(new Set(targetTasks.map((t) => t.id)));
      setLastSelectedId(null);
    },
    [tasks],
  );

  const toggleSelectAll = useCallback(
    (taskList?: Task[]) => {
      const targetTasks = taskList ?? tasks;
      const allSelected =
        targetTasks.length > 0 && targetTasks.every((t) => selectedTaskIds.has(t.id));
      if (allSelected) {
        setSelectedTaskIds(new Set());
      } else {
        setSelectedTaskIds(new Set(targetTasks.map((t) => t.id)));
      }
      setLastSelectedId(null);
    },
    [tasks, selectedTaskIds],
  );

  const isSelected = useCallback(
    (taskId: string) => {
      return selectedTaskIds.has(taskId);
    },
    [selectedTaskIds],
  );

  // Apply selection with optional lastId update (for table view checkboxes)
  const applySelection = useCallback((newIds: Set<string>, lastId?: string) => {
    setSelectedTaskIds(newIds);
    if (lastId !== undefined) {
      setLastSelectedId(lastId);
    }
  }, []);

  const selectedCount = selectedTaskIds.size;
  const selectedTasks = tasks.filter((t) => selectedTaskIds.has(t.id));

  return {
    selectedTaskIds,
    setSelectedTaskIds,
    applySelection,
    selectedCount,
    selectedTasks,
    handleSelectTask,
    clearSelection,
    selectAll,
    toggleSelectAll,
    isSelected,
  };
}
