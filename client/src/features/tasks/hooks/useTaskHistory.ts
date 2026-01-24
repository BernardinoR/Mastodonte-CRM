import { useState, useRef, useCallback, useEffect } from "react";
import type { Task } from "../types/task";

const MAX_HISTORY = 20;

export function useTaskHistory(initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const historyRef = useRef<Task[][]>([]);

  const setTasksWithHistory = useCallback((updater: (prev: Task[]) => Task[]) => {
    setTasks(prevTasks => {
      // Deep copy each task object to prevent mutation issues with undo
      const deepCopy = prevTasks.map(task => ({
        ...task,
        assignees: [...task.assignees],
      }));
      historyRef.current.push(deepCopy);
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current.shift();
      }
      return updater(prevTasks);
    });
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length > 0) {
      const previousState = historyRef.current.pop();
      if (previousState) {
        setTasks(previousState);
      }
    }
  }, []);

  const canUndo = historyRef.current.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  return {
    tasks,
    setTasks,
    setTasksWithHistory,
    undo,
    canUndo,
  };
}
