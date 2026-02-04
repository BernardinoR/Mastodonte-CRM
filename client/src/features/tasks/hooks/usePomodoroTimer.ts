import { useState, useCallback, useRef, useEffect } from "react";
import { POMODORO_DURATION } from "../lib/turboModeConfig";

export interface UsePomodoroTimerReturn {
  remainingSeconds: number;
  timerRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
}

export function usePomodoroTimer(
  isActive: boolean,
  onTimerEnd?: () => void,
): UsePomodoroTimerReturn {
  const [remainingSeconds, setRemainingSeconds] = useState(POMODORO_DURATION);
  const [timerRunning, setTimerRunning] = useState(false);

  const timerStartTimeRef = useRef<number>(0);
  const remainingAtStartRef = useRef<number>(POMODORO_DURATION);
  const timerIntervalRef = useRef<number | null>(null);
  const timerEndTriggeredRef = useRef<boolean>(false);

  // Timer countdown effect
  useEffect(() => {
    if (timerRunning && isActive) {
      timerIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStartTimeRef.current) / 1000);
        const remaining = Math.max(0, remainingAtStartRef.current - elapsed);
        setRemainingSeconds(remaining);
      }, 200);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerRunning, isActive]);

  // Watch for timer reaching zero
  useEffect(() => {
    if (isActive && remainingSeconds === 0 && !timerEndTriggeredRef.current) {
      timerEndTriggeredRef.current = true;
      setTimerRunning(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      onTimerEnd?.();
    }
  }, [isActive, remainingSeconds, onTimerEnd]);

  // Reset timer when Turbo Mode starts
  useEffect(() => {
    if (isActive) {
      setRemainingSeconds(POMODORO_DURATION);
      remainingAtStartRef.current = POMODORO_DURATION;
      setTimerRunning(false);
      timerEndTriggeredRef.current = false;
    }
  }, [isActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const startTimer = useCallback(() => {
    remainingAtStartRef.current = remainingSeconds;
    timerStartTimeRef.current = Date.now();
    setTimerRunning(true);
  }, [remainingSeconds]);

  const pauseTimer = useCallback(() => {
    if (timerRunning) {
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
    remainingSeconds,
    timerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
  };
}
