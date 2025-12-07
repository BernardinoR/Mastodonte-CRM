import { memo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  Rocket,
  CheckCircle2,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UseTurboModeReturn } from "@/hooks/useTurboMode";
import type { Task, TaskHistoryEvent } from "@/types/task";

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
    completedInSession,
    exitTurboMode,
    goToNext,
    goToPrevious,
    markActionPerformed,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
  } = turboMode;

  const { isActive, currentIndex, timerSeconds, timerRunning, actionPerformed } = state;

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
  const handleTaskUpdate = useCallback((taskId: string, updates: Partial<Task>) => {
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
  }, [currentTask, onUpdateTask, markActionPerformed]);

  if (!isActive || !currentTask) return null;

  const isFirstTask = currentIndex === 0;
  const isLastTask = currentIndex === totalTasks - 1;
  const progress = totalTasks > 0 ? ((currentIndex + 1) / totalTasks) * 100 : 0;
  const timerProgress = (timerSeconds / (25 * 60)) * 100;

  // Stop event propagation to prevent Dialog from closing
  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  // Timer bar and arrows rendered via portal to appear after Dialog in DOM
  const timerBar = (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-auto bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-orange-500/10 backdrop-blur-md border-b"
      data-testid="turbo-mode-bar"
      onPointerDown={stopPropagation}
      onClick={stopPropagation}
    >
      {/* Progress bar */}
      <div className="h-1 bg-muted/50">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 gap-4">
        {/* Left section: Turbo Mode label and task counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-500">
            <Rocket className="w-4 h-4" />
            <span className="font-semibold text-sm">Modo Turbo</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-background/50">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">
              {currentIndex + 1} / {totalTasks}
            </span>
            {completedInSession > 0 && (
              <span className="flex items-center gap-1 text-emerald-500 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {completedInSession}
              </span>
            )}
          </div>
        </div>

        {/* Right section: Timer and exit */}
        <div className="flex items-center gap-2">
          {/* Pomodoro timer */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); timerRunning ? pauseTimer() : startTimer(); }}
              className="h-9 w-9"
              data-testid="button-timer-toggle"
            >
              {timerRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <div className="relative px-3 py-1 rounded-md bg-background/50 overflow-hidden min-w-[70px]">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 transition-all duration-1000"
                style={{ width: `${timerProgress}%` }}
              />
              <span 
                className={cn(
                  "relative font-mono text-sm font-semibold tabular-nums",
                  timerSeconds <= 60 && "text-red-500 animate-pulse",
                  timerSeconds <= 300 && timerSeconds > 60 && "text-amber-500"
                )}
                data-testid="text-timer"
              >
                {formatTime(timerSeconds)}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); resetTimer(); }}
              className="h-9 w-9"
              data-testid="button-timer-reset"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Exit button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); exitTurboMode(); }}
            className="h-9 w-9"
            data-testid="button-turbo-exit"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Navigation arrows
  const navigationArrows = (
    <>
      {/* Left arrow - positioned just outside the modal left edge */}
      <div 
        className="fixed top-1/2 -translate-y-1/2 z-[9999] pointer-events-auto"
        style={{ left: "clamp(0.5rem, calc((100vw - min(1200px, 90vw)) / 2 - 4rem), calc(50% - 600px - 4rem))" }}
        onPointerDown={stopPropagation}
        onClick={stopPropagation}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
          disabled={isFirstTask}
          className={cn(
            "h-12 w-12 rounded-full",
            "bg-background/95 backdrop-blur-sm shadow-xl border-2",
            "hover:bg-background hover:scale-110 transition-all duration-200",
            isFirstTask && "opacity-30 cursor-not-allowed"
          )}
          data-testid="button-turbo-prev"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>
      
      {/* Right arrow - positioned just outside the modal right edge */}
      <div 
        className="fixed top-1/2 -translate-y-1/2 z-[9999] pointer-events-auto"
        style={{ right: "clamp(0.5rem, calc((100vw - min(1200px, 90vw)) / 2 - 4rem), calc(50% - 600px - 4rem))" }}
        onPointerDown={stopPropagation}
        onClick={stopPropagation}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          disabled={isLastTask}
          className={cn(
            "h-12 w-12 rounded-full",
            "bg-background/95 backdrop-blur-sm shadow-xl border-2",
            "hover:bg-background hover:scale-110 transition-all duration-200",
            isLastTask && "opacity-30 cursor-not-allowed"
          )}
          data-testid="button-turbo-next"
        >
          <ChevronRight className="w-6 h-6" />
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
