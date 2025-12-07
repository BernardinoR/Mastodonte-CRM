import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

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
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    if (timerRunning && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerRunning, timerSeconds]);

  const startTurboMode = useCallback(() => {
    setIsActive(true);
    setCurrentIndex(0);
    setTimerSeconds(POMODORO_DURATION);
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
  }, []);

  const resetActionPerformed = useCallback(() => {
    setActionPerformed(false);
  }, []);

  const startTimer = useCallback(() => {
    setTimerRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerSeconds(POMODORO_DURATION);
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
