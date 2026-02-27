import { useState, useCallback, useMemo, useRef } from "react";
import type { Task } from "../types/task";
import {
  PRIORITY_ORDER,
  type TaskTurboStatus,
  type TurboSuspendedNavigation,
} from "../lib/turboModeConfig";
import { useTasks } from "../contexts/TasksContext";

export interface UseTurboNavigationReturn {
  currentIndex: number;
  currentTask: Task | null;
  sessionTasks: Task[];
  totalTasks: number;
  taskStatuses: Record<string, TaskTurboStatus>;
  goToNext: () => void;
  goToPrevious: () => void;
  markCurrentAsVisited: () => void;
  markActionPerformed: () => void;
  resetActionPerformed: () => void;
  actionPerformed: boolean;
  initializeSession: (tasks: Task[]) => void;
  resetSession: () => void;
  getSessionSnapshot: () => TurboSuspendedNavigation;
  restoreSession: (snapshot: TurboSuspendedNavigation) => void;
}

export function useTurboNavigation(allTasks: Task[]): UseTurboNavigationReturn {
  const { tasks: contextTasks } = useTasks();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionPerformed, setActionPerformed] = useState(false);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskTurboStatus>>({});

  const [sessionTaskIds, setSessionTaskIds] = useState<string[]>([]);
  const [sessionTaskSnapshot, setSessionTaskSnapshot] = useState<Record<string, Task>>({});

  const animationTimeoutRef = useRef<number | null>(null);

  // Filter and sort tasks for Turbo Mode (To Do or In Progress only)
  const sortedTasks = useMemo(() => {
    const eligibleTasks = allTasks.filter(
      (task) => task.status === "To Do" || task.status === "In Progress",
    );

    const todoTasks = eligibleTasks.filter((t) => t.status === "To Do");
    const inProgressTasks = eligibleTasks.filter((t) => t.status === "In Progress");

    const sortByPriorityAndDate = (a: Task, b: Task) => {
      const priorityA = PRIORITY_ORDER[a.priority || "Normal"] ?? 2;
      const priorityB = PRIORITY_ORDER[b.priority || "Normal"] ?? 2;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return dateA - dateB;
    };

    const sortedTodo = [...todoTasks].sort(sortByPriorityAndDate);
    const sortedInProgress = [...inProgressTasks].sort(sortByPriorityAndDate);

    const result: Task[] = [];
    let todoIdx = 0;
    let inProgressIdx = 0;

    while (todoIdx < sortedTodo.length || inProgressIdx < sortedInProgress.length) {
      const todoTask = sortedTodo[todoIdx];
      const inProgressTask = sortedInProgress[inProgressIdx];

      if (!todoTask) {
        result.push(inProgressTask);
        inProgressIdx++;
        continue;
      }
      if (!inProgressTask) {
        result.push(todoTask);
        todoIdx++;
        continue;
      }

      const todoPriority = PRIORITY_ORDER[todoTask.priority || "Normal"] ?? 2;
      const inProgressPriority = PRIORITY_ORDER[inProgressTask.priority || "Normal"] ?? 2;
      const todoDate = todoTask.dueDate ? new Date(todoTask.dueDate).getTime() : Infinity;
      const inProgressDate = inProgressTask.dueDate
        ? new Date(inProgressTask.dueDate).getTime()
        : Infinity;

      if (todoPriority < inProgressPriority) {
        result.push(todoTask);
        todoIdx++;
      } else if (inProgressPriority < todoPriority) {
        result.push(inProgressTask);
        inProgressIdx++;
      } else if (todoDate < inProgressDate) {
        result.push(todoTask);
        todoIdx++;
      } else if (inProgressDate < todoDate) {
        result.push(inProgressTask);
        inProgressIdx++;
      } else {
        if (result.length === 0 || result[result.length - 1].status === "In Progress") {
          result.push(todoTask);
          todoIdx++;
        } else {
          result.push(inProgressTask);
          inProgressIdx++;
        }
      }
    }

    return result;
  }, [allTasks]);

  // Create lookup map for live task data (uses full context tasks, not filtered allTasks,
  // so tasks that move outside the active filter range still reflect updated data)
  const liveTasksMap = useMemo(() => {
    const map: Record<string, Task> = {};
    contextTasks.forEach((task) => {
      map[task.id] = task;
    });
    return map;
  }, [contextTasks]);

  // Build session tasks from snapshot, with live data overlay
  const sessionTasks = useMemo(() => {
    if (sessionTaskIds.length === 0) return sortedTasks;

    return sessionTaskIds
      .map((id) => liveTasksMap[id] || sessionTaskSnapshot[id])
      .filter((task): task is Task => task !== undefined);
  }, [sessionTaskIds, liveTasksMap, sessionTaskSnapshot, sortedTasks]);

  const totalTasks = sessionTasks.length;
  const currentTask = sessionTasks[currentIndex] || null;

  const initializeSession = useCallback((tasks: Task[]) => {
    const taskIds = tasks.map((t) => t.id);
    const snapshot: Record<string, Task> = {};
    tasks.forEach((t) => {
      snapshot[t.id] = { ...t };
    });

    setSessionTaskIds(taskIds);
    setSessionTaskSnapshot(snapshot);
    setCurrentIndex(0);
    setActionPerformed(false);

    const initialStatuses: Record<string, TaskTurboStatus> = {};
    tasks.forEach((task) => {
      initialStatuses[task.id] = { visited: false, hadAction: false };
    });
    if (tasks.length > 0) {
      initialStatuses[tasks[0].id] = { visited: true, hadAction: false };
    }
    setTaskStatuses(initialStatuses);
  }, []);

  const resetSession = useCallback(() => {
    setSessionTaskIds([]);
    setSessionTaskSnapshot({});
    setCurrentIndex(0);
    setActionPerformed(false);
    setTaskStatuses({});
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  }, []);

  const markCurrentAsVisited = useCallback(() => {
    if (currentTask) {
      setTaskStatuses((prev) => ({
        ...prev,
        [currentTask.id]: { ...prev[currentTask.id], visited: true },
      }));
    }
  }, [currentTask]);

  const goToNext = useCallback(() => {
    if (currentIndex < totalTasks - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setActionPerformed(false);

      const nextTask = sessionTasks[nextIndex];
      if (nextTask) {
        setTaskStatuses((prev) => ({
          ...prev,
          [nextTask.id]: { ...prev[nextTask.id], visited: true },
        }));
      }
    }
  }, [currentIndex, totalTasks, sessionTasks]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setActionPerformed(false);
    }
  }, [currentIndex]);

  const markActionPerformed = useCallback(() => {
    setActionPerformed(true);
    if (currentTask) {
      setTaskStatuses((prev) => ({
        ...prev,
        [currentTask.id]: { ...prev[currentTask.id], hadAction: true },
      }));
    }
  }, [currentTask]);

  const resetActionPerformed = useCallback(() => {
    setActionPerformed(false);
  }, []);

  const getSessionSnapshot = useCallback((): TurboSuspendedNavigation => {
    return {
      sessionTaskIds,
      currentIndex,
      taskStatuses,
      actionPerformed,
    };
  }, [sessionTaskIds, currentIndex, taskStatuses, actionPerformed]);

  const restoreSession = useCallback(
    (snapshot: TurboSuspendedNavigation) => {
      // Filter session task IDs against live context tasks
      const validIds = snapshot.sessionTaskIds.filter((id) => liveTasksMap[id]);
      if (validIds.length === 0) return;

      // Rebuild snapshot from live data
      const newSnapshot: Record<string, Task> = {};
      validIds.forEach((id) => {
        newSnapshot[id] = { ...liveTasksMap[id] };
      });

      setSessionTaskIds(validIds);
      setSessionTaskSnapshot(newSnapshot);

      // Clamp index to valid range
      const clampedIndex = Math.min(snapshot.currentIndex, validIds.length - 1);
      setCurrentIndex(Math.max(0, clampedIndex));

      // Restore statuses only for valid IDs
      const restoredStatuses: Record<string, TaskTurboStatus> = {};
      validIds.forEach((id) => {
        restoredStatuses[id] = snapshot.taskStatuses[id] || { visited: false, hadAction: false };
      });
      setTaskStatuses(restoredStatuses);

      setActionPerformed(snapshot.actionPerformed);
    },
    [liveTasksMap],
  );

  return {
    currentIndex,
    currentTask,
    sessionTasks,
    totalTasks,
    taskStatuses,
    goToNext,
    goToPrevious,
    markCurrentAsVisited,
    markActionPerformed,
    resetActionPerformed,
    actionPerformed,
    initializeSession,
    resetSession,
    getSessionSnapshot,
    restoreSession,
  };
}
