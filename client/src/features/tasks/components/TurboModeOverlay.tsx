import { memo, useEffect, useCallback, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/ui/button";
import { TaskDetailModal } from "./TaskDetailModal";
import { ChevronLeft, ChevronRight, X, Play, Pause, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { UseTurboModeReturn } from "../hooks/useTurboMode";
import type { Task } from "../types/task";

interface TurboModeOverlayProps {
  turboMode: UseTurboModeReturn;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const TurboModeOverlay = memo(function TurboModeOverlay({
  turboMode,
  onUpdateTask,
}: TurboModeOverlayProps) {
  const {
    state,
    currentTask,
    totalTasks,
    sortedTasks,
    exitTurboMode,
    goToNext,
    goToPrevious,
    markActionPerformed,
    markTaskMovedToDone,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
  } = turboMode;

  const { isActive, currentIndex, timerSeconds, timerRunning, actionPerformed, taskStatuses } =
    state;

  // Flash animation state for visual feedback
  const [showFlash, setShowFlash] = useState(false);
  const prevActionPerformed = useRef(actionPerformed);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flash animation when action is performed (edge detection)
  useEffect(() => {
    // Only trigger on rising edge: false -> true
    if (actionPerformed && !prevActionPerformed.current) {
      setShowFlash(true);

      // Clear any existing timer
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }

      // Remove flash after animation completes
      flashTimerRef.current = setTimeout(() => {
        setShowFlash(false);
        flashTimerRef.current = null;
      }, 600);

      // Update ref immediately to prevent re-triggering
      prevActionPerformed.current = true;
    }

    // Track when actionPerformed goes back to false
    if (!actionPerformed && prevActionPerformed.current) {
      prevActionPerformed.current = false;
    }
  }, [actionPerformed]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts when user is typing
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "Escape") {
        exitTurboMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, goToNext, goToPrevious, exitTurboMode]);

  // Handle task update - only mark action performed for history additions
  const handleTaskUpdate = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      // Check if task is being moved to Done
      if (updates.status === "Done" && currentTask?.status !== "Done") {
        markTaskMovedToDone();
      }

      // Check if this is a history addition (not deletion)
      if (updates.history) {
        const newHistoryLength = updates.history.length;
        const currentHistoryLength = currentTask?.history?.length ?? 0;

        // Only mark action performed if history grew (addition, not deletion)
        if (newHistoryLength > currentHistoryLength) {
          onUpdateTask(taskId, updates);
          markActionPerformed();
          return;
        }
      }

      // For other updates, just update without marking action
      onUpdateTask(taskId, updates);
    },
    [currentTask, onUpdateTask, markActionPerformed, markTaskMovedToDone],
  );

  if (!isActive || !currentTask) return null;

  const isFirstTask = currentIndex === 0;
  const isLastTask = currentIndex === totalTasks - 1;

  // Stop event propagation to prevent Dialog from closing
  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  // Color palette for Turbo Mode
  const TURBO_COLORS = {
    orange: "#F97316",
    orangeLight: "#FB923C",
    orangeDark: "#EA580C",
    green: "#10B981",
    greenLight: "#34D399",
    red: "#EF4444",
    gray: "#3F3F46",
    grayLight: "#52525B",
  };

  // Get step color based on task status
  const getStepColor = (taskId: string, index: number) => {
    const status = taskStatuses[taskId];

    if (index === currentIndex) {
      // Current task - check if action was performed
      if (status?.hadAction) {
        // Current task with action - green with glow
        return {
          bg: TURBO_COLORS.green,
          border: TURBO_COLORS.green,
          isCurrent: true,
          isGreen: true,
        };
      }
      // Current task without action yet - orange with glow
      return {
        bg: TURBO_COLORS.orange,
        border: TURBO_COLORS.orangeLight,
        isCurrent: true,
        isGreen: false,
      };
    }

    if (status?.visited) {
      if (status.hadAction) {
        // Visited with action - green
        return {
          bg: TURBO_COLORS.green,
          border: TURBO_COLORS.green,
          isCurrent: false,
          isGreen: true,
        };
      } else {
        // Visited without action - red
        return { bg: TURBO_COLORS.red, border: TURBO_COLORS.red, isCurrent: false, isGreen: false };
      }
    }

    // Future task - gray
    return {
      bg: TURBO_COLORS.gray,
      border: TURBO_COLORS.grayLight,
      isCurrent: false,
      isGreen: false,
    };
  };

  // Timer bar and arrows rendered via portal to appear after Dialog in DOM
  const timerBar = (
    <div
      className={cn(
        "pointer-events-auto fixed left-0 right-0 top-0 z-[9999]",
        "transition-all duration-300",
      )}
      data-testid="turbo-mode-bar"
      onPointerDown={stopPropagation}
      onClick={stopPropagation}
    >
      {/* Compact single-row bar */}
      <div
        className={cn(
          "h-12 border-b bg-background",
          showFlash ? "border-emerald-500/50" : "border-orange-500/30",
        )}
      >
        <div className="flex h-full items-center justify-between gap-4 px-4">
          {/* Left: Task Counter */}
          <div className="flex min-w-[100px] items-center gap-2">
            <Zap className={cn("h-4 w-4 text-orange-400", showFlash && "animate-pulse")} />
            <span className="whitespace-nowrap text-sm font-semibold text-foreground">
              {currentIndex + 1} <span className="font-normal text-[#6B6B6B]">de</span> {totalTasks}
            </span>
          </div>

          {/* Center: Steps Progress Strip */}
          <div className="flex max-w-[600px] flex-1 items-center justify-center gap-1 overflow-hidden">
            {sortedTasks.map((task, index) => {
              const stepColor = getStepColor(task.id, index);
              const glowColor = stepColor.isGreen ? TURBO_COLORS.green : TURBO_COLORS.orange;
              const ringColor = stepColor.isGreen ? "ring-emerald-500/60" : "ring-orange-400/50";
              return (
                <div
                  key={task.id}
                  className={cn(
                    "h-2 min-w-[8px] max-w-[40px] flex-1 rounded-sm transition-all duration-300",
                    stepColor.isCurrent &&
                      `ring-1 ${ringColor} ring-offset-1 ring-offset-[#18181B]`,
                  )}
                  style={{
                    backgroundColor: stepColor.bg,
                    boxShadow: stepColor.isCurrent ? `0 0 8px ${glowColor}80` : undefined,
                  }}
                  data-testid={`step-indicator-${index}`}
                />
              );
            })}
          </div>

          {/* Right: Timer and Controls */}
          <div className="flex min-w-[200px] items-center justify-end gap-3">
            {/* Timer display - more prominent */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5",
                "border-2 transition-all duration-300",
                timerSeconds <= 60
                  ? "border-red-500/70 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  : timerSeconds <= 300
                    ? "border-amber-500/50 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    : "border-orange-500/40 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]",
                timerRunning && timerSeconds <= 60 && "animate-pulse",
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  timerRunning ? pauseTimer() : startTimer();
                }}
                className={cn(
                  "h-7 w-7 rounded-full transition-colors",
                  timerSeconds <= 60
                    ? "text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    : timerSeconds <= 300
                      ? "text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                      : "text-orange-400 hover:bg-orange-500/20 hover:text-orange-300",
                )}
                data-testid="button-timer-toggle"
              >
                {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <span
                className={cn(
                  "font-mono text-base font-bold tabular-nums tracking-wider",
                  timerSeconds <= 60 && "text-red-400",
                  timerSeconds <= 300 && timerSeconds > 60 && "text-amber-400",
                  timerSeconds > 300 && "text-orange-400",
                )}
                data-testid="text-timer"
              >
                {formatTime(timerSeconds)}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  resetTimer();
                }}
                className={cn(
                  "h-7 w-7 rounded-full transition-colors",
                  timerSeconds <= 60
                    ? "text-red-400/60 hover:bg-red-500/20 hover:text-red-300"
                    : timerSeconds <= 300
                      ? "text-amber-400/60 hover:bg-amber-500/20 hover:text-amber-300"
                      : "text-orange-400/60 hover:bg-orange-500/20 hover:text-orange-300",
                )}
                data-testid="button-timer-reset"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Exit button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                exitTurboMode();
              }}
              className="h-7 w-7 text-[#64666E] hover:text-red-400"
              data-testid="button-turbo-exit"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Navigation arrows - matching orange Turbo theme
  const navigationArrows = (
    <>
      {/* Left arrow - positioned just outside the modal left edge */}
      <div
        className="pointer-events-auto fixed top-1/2 z-[9999] -translate-y-1/2"
        style={{
          left: "clamp(0.5rem, calc((100vw - min(1200px, 90vw)) / 2 - 4rem), calc(50% - 600px - 4rem))",
        }}
        onPointerDown={stopPropagation}
        onClick={stopPropagation}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
          disabled={isFirstTask}
          className={cn(
            "h-12 w-12 rounded-full",
            "border border-orange-500/30 bg-[#252730]",
            "text-orange-400/70 hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400",
            "transition-all duration-200",
            isFirstTask && "cursor-not-allowed opacity-30",
          )}
          data-testid="button-turbo-prev"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      {/* Right arrow - positioned just outside the modal right edge */}
      <div
        className="pointer-events-auto fixed top-1/2 z-[9999] -translate-y-1/2"
        style={{
          right:
            "clamp(0.5rem, calc((100vw - min(1200px, 90vw)) / 2 - 4rem), calc(50% - 600px - 4rem))",
        }}
        onPointerDown={stopPropagation}
        onClick={stopPropagation}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          disabled={isLastTask}
          className={cn(
            "h-12 w-12 rounded-full",
            "border border-orange-500/30 bg-[#252730]",
            "text-orange-400/70 hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400",
            "transition-all duration-200",
            isLastTask && "cursor-not-allowed opacity-30",
          )}
          data-testid="button-turbo-next"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Task Detail Modal first - this creates the dialog portal */}
      <TaskDetailModal
        task={currentTask}
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            exitTurboMode();
          }
        }}
        onUpdateTask={handleTaskUpdate}
        isTurboModeActive={true}
        turboActionPerformed={actionPerformed}
      />

      {/* Timer bar and arrows rendered via portal AFTER the dialog to ensure they're on top */}
      {createPortal(timerBar, document.body)}
      {createPortal(navigationArrows, document.body)}
    </>
  );
});
