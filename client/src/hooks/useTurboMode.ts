import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { Task, TaskPriority } from "@/types/task";

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  "Urgente": 0,
  "Importante": 1,
  "Normal": 2,
  "Baixa": 3,
};

const POMODORO_DURATION = 25 * 60;

// Track status of each task in Turbo Mode
export interface TaskTurboStatus {
  visited: boolean;
  hadAction: boolean;
}

export interface TurboModeState {
  isActive: boolean;
  currentIndex: number;
  timerSeconds: number;
  timerRunning: boolean;
  actionPerformed: boolean;
  showCompletionAnimation: boolean;
  taskStatuses: Record<string, TaskTurboStatus>;
}

export interface UseTurboModeReturn {
  state: TurboModeState;
  sortedTasks: Task[];
  currentTask: Task | null;
  totalTasks: number;
  completedInSession: number;
  startTurboMode: () => void;
  exitTurboMode: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  markActionPerformed: () => void;
  resetActionPerformed: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
}

export function useTurboMode(tasks: Task[]): UseTurboModeReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [actionPerformed, setActionPerformed] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [completedInSession, setCompletedInSession] = useState(0);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskTurboStatus>>({});
  
  // Timestamp-based timer state
  // remainingSeconds is the authoritative remaining time (updated on tick and pause)
  const [remainingSeconds, setRemainingSeconds] = useState(POMODORO_DURATION);
  // Reference to when the timer was last started/resumed
  const timerStartTimeRef = useRef<number>(0);
  // Reference to remaining seconds at the moment timer was started
  const remainingAtStartRef = useRef<number>(POMODORO_DURATION);
  const timerIntervalRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);

  const sortedTasks = useMemo(() => {
    const eligibleTasks = tasks.filter(
      (task) => task.status === "To Do" || task.status === "In Progress"
    );

    const todoTasks = eligibleTasks.filter((t) => t.status === "To Do");
    const inProgressTasks = eligibleTasks.filter((t) => t.status === "In Progress");

    const sortByPriorityAndDate = (a: Task, b: Task) => {
      const priorityA = PRIORITY_ORDER[a.priority || "Normal"];
      const priorityB = PRIORITY_ORDER[b.priority || "Normal"];
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
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

      const todoPriority = PRIORITY_ORDER[todoTask.priority || "Normal"];
      const inProgressPriority = PRIORITY_ORDER[inProgressTask.priority || "Normal"];
      const todoDate = new Date(todoTask.dueDate).getTime();
      const inProgressDate = new Date(inProgressTask.dueDate).getTime();

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
  }, [tasks]);

  const currentTask = useMemo(() => {
    return sortedTasks[currentIndex] || null;
  }, [sortedTasks, currentIndex]);

  const totalTasks = sortedTasks.length;

  useEffect(() => {
    if (!isActive) return;
    
    if (sortedTasks.length === 0) {
      setIsActive(false);
      setTimerRunning(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      return;
    }
    
    if (currentIndex >= sortedTasks.length) {
      setCurrentIndex(Math.max(0, sortedTasks.length - 1));
    }
  }, [isActive, sortedTasks.length, currentIndex]);

  // Timestamp-based timer that works in background
  useEffect(() => {
    if (!timerRunning) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - timerStartTimeRef.current) / 1000);
      const remaining = Math.max(0, remainingAtStartRef.current - elapsed);
      
      setRemainingSeconds(remaining);
      
      if (remaining <= 0) {
        setTimerRunning(false);
      }
    };

    // Update immediately
    updateTimer();
    
    // Then update every second
    timerIntervalRef.current = window.setInterval(updateTimer, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerRunning]);

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const startTurboMode = useCallback(() => {
    setIsActive(true);
    setCurrentIndex(0);
    setRemainingSeconds(POMODORO_DURATION);
    remainingAtStartRef.current = POMODORO_DURATION;
    timerStartTimeRef.current = Date.now();
    setTimerRunning(true);
    setActionPerformed(false);
    setCompletedInSession(0);
    setShowCompletionAnimation(false);
    setTaskStatuses({});
  }, []);

  const exitTurboMode = useCallback(() => {
    setIsActive(false);
    setTimerRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < sortedTasks.length - 1) {
      const currentTaskId = sortedTasks[currentIndex]?.id;
      if (currentTaskId) {
        // Mark current task as visited with its action status
        setTaskStatuses((prev) => ({
          ...prev,
          [currentTaskId]: { visited: true, hadAction: actionPerformed },
        }));
      }
      if (actionPerformed) {
        setCompletedInSession((prev) => prev + 1);
      }
      setCurrentIndex((prev) => prev + 1);
      setActionPerformed(false);
    }
  }, [currentIndex, sortedTasks, actionPerformed]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const currentTaskId = sortedTasks[currentIndex]?.id;
      if (currentTaskId) {
        // Mark current task as visited with its action status
        setTaskStatuses((prev) => ({
          ...prev,
          [currentTaskId]: { visited: true, hadAction: actionPerformed },
        }));
      }
      setCurrentIndex((prev) => prev - 1);
      setActionPerformed(false);
    }
  }, [currentIndex, sortedTasks, actionPerformed]);

  const markActionPerformed = useCallback(() => {
    setActionPerformed(true);
    setShowCompletionAnimation(true);
    
    // Mark current task as having action immediately
    const currentTaskId = sortedTasks[currentIndex]?.id;
    if (currentTaskId) {
      setTaskStatuses((prev) => ({
        ...prev,
        [currentTaskId]: { visited: true, hadAction: true },
      }));
    }
    
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Hide animation after 2 seconds
    animationTimeoutRef.current = window.setTimeout(() => {
      setShowCompletionAnimation(false);
    }, 2000);
  }, [sortedTasks, currentIndex]);

  const resetActionPerformed = useCallback(() => {
    setActionPerformed(false);
  }, []);

  const startTimer = useCallback(() => {
    // Store current remaining as the starting point
    remainingAtStartRef.current = remainingSeconds;
    timerStartTimeRef.current = Date.now();
    setTimerRunning(true);
  }, [remainingSeconds]);

  const pauseTimer = useCallback(() => {
    if (timerRunning) {
      // Calculate actual remaining and update state
      const elapsed = Math.floor((Date.now() - timerStartTimeRef.current) / 1000);
      const remaining = Math.max(0, remainingAtStartRef.current - elapsed);
      setRemainingSeconds(remaining);
      remainingAtStartRef.current = remaining;
    }
    setTimerRunning(false);
  }, [timerRunning]);

  const resetTimer = useCallback(() => {
    setRemainingSeconds(POMODORO_DURATION);
    remainingAtStartRef.current = POMODORO_DURATION;
    setTimerRunning(false);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    state: {
      isActive,
      currentIndex,
      timerSeconds: remainingSeconds,
      timerRunning,
      actionPerformed,
      showCompletionAnimation,
      taskStatuses,
    },
    sortedTasks,
    currentTask,
    totalTasks,
    completedInSession,
    startTurboMode,
    exitTurboMode,
    goToNext,
    goToPrevious,
    markActionPerformed,
    resetActionPerformed,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
  };
}
