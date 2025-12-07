import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { Task, TaskPriority } from "@/types/task";

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  "Urgente": 0,
  "Importante": 1,
  "Normal": 2,
  "Baixa": 3,
};

const POMODORO_DURATION = 25 * 60;

export interface TurboModeState {
  isActive: boolean;
  currentIndex: number;
  timerSeconds: number;
  timerRunning: boolean;
  actionPerformed: boolean;
  showCompletionAnimation: boolean;
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
  const [timerSeconds, setTimerSeconds] = useState(POMODORO_DURATION);
  const [timerRunning, setTimerRunning] = useState(false);
  const [actionPerformed, setActionPerformed] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [completedInSession, setCompletedInSession] = useState(0);
  
  // Use timestamp-based timer that works even when tab is in background
  const timerStartTimeRef = useRef<number | null>(null);
  const timerRemainingRef = useRef<number>(POMODORO_DURATION);
  const timerIntervalRef = useRef<number | null>(null);

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

    // Store when timer started and remaining time
    timerStartTimeRef.current = Date.now();
    timerRemainingRef.current = timerSeconds;

    const updateTimer = () => {
      if (!timerStartTimeRef.current) return;
      
      const elapsed = Math.floor((Date.now() - timerStartTimeRef.current) / 1000);
      const remaining = Math.max(0, timerRemainingRef.current - elapsed);
      
      setTimerSeconds(remaining);
      
      if (remaining <= 0) {
        setTimerRunning(false);
      }
    };

    // Update immediately and then every second
    timerIntervalRef.current = window.setInterval(updateTimer, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerRunning]);

  const startTurboMode = useCallback(() => {
    setIsActive(true);
    setCurrentIndex(0);
    setTimerSeconds(POMODORO_DURATION);
    timerRemainingRef.current = POMODORO_DURATION;
    setTimerRunning(true);
    setActionPerformed(false);
    setCompletedInSession(0);
    setShowCompletionAnimation(false);
  }, []);

  const exitTurboMode = useCallback(() => {
    setIsActive(false);
    setTimerRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < sortedTasks.length - 1) {
      if (actionPerformed) {
        setCompletedInSession((prev) => prev + 1);
      }
      setShowCompletionAnimation(actionPerformed);
      setCurrentIndex((prev) => prev + 1);
      setActionPerformed(false);
      
      if (actionPerformed) {
        setTimeout(() => {
          setShowCompletionAnimation(false);
        }, 1500);
      }
    }
  }, [currentIndex, sortedTasks.length, actionPerformed]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setActionPerformed(false);
      setShowCompletionAnimation(false);
    }
  }, [currentIndex]);

  const markActionPerformed = useCallback(() => {
    setActionPerformed(true);
    setShowCompletionAnimation(true);
    setTimeout(() => {
      setShowCompletionAnimation(false);
    }, 2000);
  }, []);

  const resetActionPerformed = useCallback(() => {
    setActionPerformed(false);
  }, []);

  const startTimer = useCallback(() => {
    timerRemainingRef.current = timerSeconds;
    timerStartTimeRef.current = Date.now();
    setTimerRunning(true);
  }, [timerSeconds]);

  const pauseTimer = useCallback(() => {
    // Store remaining time before pausing
    if (timerStartTimeRef.current) {
      const elapsed = Math.floor((Date.now() - timerStartTimeRef.current) / 1000);
      timerRemainingRef.current = Math.max(0, timerRemainingRef.current - elapsed);
      setTimerSeconds(timerRemainingRef.current);
    }
    setTimerRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerSeconds(POMODORO_DURATION);
    timerRemainingRef.current = POMODORO_DURATION;
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
      timerSeconds,
      timerRunning,
      actionPerformed,
      showCompletionAnimation,
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
