import { useState, useCallback } from "react";
import type { Task, TaskStatus } from "@/types/task";

interface UseTaskSelectionProps {
  tasks: Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
}

export function useTaskSelection({ tasks, getTasksByStatus }: UseTaskSelectionProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const handleSelectTask = useCallback((taskId: string, shiftKey: boolean) => {
    const clickedTask = tasks.find(t => t.id === taskId);
    if (!clickedTask) return;

    if (shiftKey && lastSelectedId) {
      const lastTask = tasks.find(t => t.id === lastSelectedId);
      
      if (lastTask && lastTask.status === clickedTask.status) {
        const columnTasks = getTasksByStatus(clickedTask.status);
        const lastIndex = columnTasks.findIndex(t => t.id === lastSelectedId);
        const currentIndex = columnTasks.findIndex(t => t.id === taskId);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          const rangeIds = columnTasks.slice(start, end + 1).map(t => t.id);
          
          setSelectedTaskIds(prev => {
            const newSet = new Set(prev);
            rangeIds.forEach(id => newSet.add(id));
            return newSet;
          });
          setLastSelectedId(taskId);
          return;
        }
      } else {
        setSelectedTaskIds(prev => {
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
    } else {
      setSelectedTaskIds(prev => {
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
  }, [lastSelectedId, tasks, getTasksByStatus]);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds(new Set());
    setLastSelectedId(null);
  }, []);

  const isSelected = useCallback((taskId: string) => {
    return selectedTaskIds.has(taskId);
  }, [selectedTaskIds]);

  const selectedCount = selectedTaskIds.size;
  const selectedTasks = tasks.filter(t => selectedTaskIds.has(t.id));

  return {
    selectedTaskIds,
    selectedCount,
    selectedTasks,
    handleSelectTask,
    clearSelection,
    isSelected,
  };
}
