import { useState, useCallback, useRef, useEffect } from "react";
import type { Task } from "@/types/task";
import { usePomodoroTimer } from "./usePomodoroTimer";
import { useAudioNotification } from "./useAudioNotification";
import { useTurboNavigation } from "./useTurboNavigation";
import { type TaskTurboStatus, type TurboSessionStats } from "@/lib/turboModeConfig";

export { type TaskTurboStatus, type TurboSessionStats } from "@/lib/turboModeConfig";

export interface TurboModeState {
  isActive: boolean;
  currentIndex: number;
  timerSeconds: number;
  timerRunning: boolean;
  actionPerformed: boolean;
  showCompletionAnimation: boolean;
  taskStatuses: Record<string, TaskTurboStatus>;
  showSummary: boolean;
  sessionStats: TurboSessionStats | null;
}

export interface UseTurboModeReturn {
  state: TurboModeState;
  sortedTasks: Task[];
  currentTask: Task | null;
  totalTasks: number;
  completedInSession: number;
  startTurboMode: () => void;
  exitTurboMode: () => void;
  closeSummary: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  markActionPerformed: () => void;
  resetActionPerformed: () => void;
  markTaskMovedToDone: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
}

export function useTurboMode(tasks: Task[]): UseTurboModeReturn {
  const [isActive, setIsActive] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [completedInSession, setCompletedInSession] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState<TurboSessionStats | null>(null);
  const [tasksMovedToDone, setTasksMovedToDone] = useState(0);

  const sessionStartTimeRef = useRef<number>(0);
  const animationTimeoutRef = useRef<number | null>(null);

  const { playTimerEndSound } = useAudioNotification();

  const navigation = useTurboNavigation(tasks);

  const handleTimerEnd = useCallback(() => {
    playTimerEndSound();

    const sessionDuration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
    const tasksWithHistory = Object.values(navigation.taskStatuses).filter((s) => s.hadAction).length;
    const totalVisited = Object.values(navigation.taskStatuses).filter((s) => s.visited).length;
    const avgTime = totalVisited > 0 ? Math.floor(sessionDuration / totalVisited) : 0;

    setSessionStats({
      tasksWithHistory,
      tasksMovedToDone,
      totalTasksVisited: totalVisited,
      totalTasks: navigation.totalTasks,
      sessionDurationSeconds: sessionDuration,
      averageTimePerTask: avgTime,
    });

    setIsActive(false);
    setShowSummary(true);
  }, [playTimerEndSound, navigation.taskStatuses, navigation.totalTasks, tasksMovedToDone]);

  const timer = usePomodoroTimer(isActive, handleTimerEnd);

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Handle empty task list while active
  useEffect(() => {
    if (isActive && navigation.totalTasks === 0) {
      setIsActive(false);
    }
  }, [isActive, navigation.totalTasks]);

  const startTurboMode = useCallback(() => {
    navigation.initializeSession(navigation.sessionTasks);
    sessionStartTimeRef.current = Date.now();
    setIsActive(true);
    setCompletedInSession(0);
    setShowCompletionAnimation(false);
    setTasksMovedToDone(0);
    setShowSummary(false);
    setSessionStats(null);
    // Reset timer to full duration then auto-start
    timer.resetTimer();
    setTimeout(() => timer.startTimer(), 0);
  }, [navigation, timer]);

  const exitTurboMode = useCallback(() => {
    const sessionDuration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
    const tasksWithHistory = Object.values(navigation.taskStatuses).filter((s) => s.hadAction).length;
    const totalVisited = Object.values(navigation.taskStatuses).filter((s) => s.visited).length;
    const avgTime = totalVisited > 0 ? Math.floor(sessionDuration / totalVisited) : 0;

    setSessionStats({
      tasksWithHistory,
      tasksMovedToDone,
      totalTasksVisited: totalVisited,
      totalTasks: navigation.totalTasks,
      sessionDurationSeconds: sessionDuration,
      averageTimePerTask: avgTime,
    });

    setIsActive(false);
    setShowSummary(true);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  }, [navigation.taskStatuses, navigation.totalTasks, tasksMovedToDone]);

  const closeSummary = useCallback(() => {
    setShowSummary(false);
    setSessionStats(null);
    navigation.resetSession();
  }, [navigation]);

  const goToNext = useCallback(() => {
    if (navigation.actionPerformed) {
      setCompletedInSession((prev) => prev + 1);
    }
    navigation.goToNext();
  }, [navigation]);

  const goToPrevious = useCallback(() => {
    navigation.goToPrevious();
    navigation.markCurrentAsVisited();
  }, [navigation]);

  const markActionPerformed = useCallback(() => {
    navigation.markActionPerformed();
    setShowCompletionAnimation(true);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = window.setTimeout(() => {
      setShowCompletionAnimation(false);
    }, 2000);
  }, [navigation]);

  const markTaskMovedToDone = useCallback(() => {
    setTasksMovedToDone((prev) => prev + 1);
  }, []);

  return {
    state: {
      isActive,
      currentIndex: navigation.currentIndex,
      timerSeconds: timer.remainingSeconds,
      timerRunning: timer.timerRunning,
      actionPerformed: navigation.actionPerformed,
      showCompletionAnimation,
      taskStatuses: navigation.taskStatuses,
      showSummary,
      sessionStats,
    },
    sortedTasks: navigation.sessionTasks,
    currentTask: navigation.currentTask,
    totalTasks: navigation.totalTasks,
    completedInSession,
    startTurboMode,
    exitTurboMode,
    closeSummary,
    goToNext,
    goToPrevious,
    markActionPerformed,
    resetActionPerformed: navigation.resetActionPerformed,
    markTaskMovedToDone,
    startTimer: timer.startTimer,
    pauseTimer: timer.pauseTimer,
    resetTimer: timer.resetTimer,
    formatTime: timer.formatTime,
  };
}
