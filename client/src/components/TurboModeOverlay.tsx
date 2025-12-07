import { memo, useEffect } from "react";
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
import type { Task } from "@/types/task";

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

  const { isActive, currentIndex, timerSeconds, timerRunning, showCompletionAnimation, actionPerformed } = state;

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

  // Handle task update and mark action performed
  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    onUpdateTask(taskId, updates);
    markActionPerformed();
  };

  if (!isActive || !currentTask) return null;

  const isFirstTask = currentIndex === 0;
  const isLastTask = currentIndex === totalTasks - 1;
  const progress = totalTasks > 0 ? ((currentIndex + 1) / totalTasks) * 100 : 0;
  const timerProgress = (timerSeconds / (25 * 60)) * 100;

  return (
    <>
      {/* Fixed top bar - positioned above everything */}
      <div 
        className="fixed top-0 left-0 right-0 z-[200] bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-orange-500/10 backdrop-blur-md border-b"
        data-testid="turbo-mode-bar"
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
                onClick={timerRunning ? pauseTimer : startTimer}
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
                onClick={resetTimer}
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
              onClick={exitTurboMode}
              className="h-9 w-9"
              data-testid="button-turbo-exit"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation arrows on the sides - z-index above radix dialog (z-50) */}
      {/* Left arrow - fixed to left edge */}
      <Button
        variant="outline"
        size="icon"
        onClick={goToPrevious}
        disabled={isFirstTask}
        className={cn(
          "fixed left-4 top-1/2 -translate-y-1/2 z-[100] h-14 w-14 rounded-full",
          "bg-background/95 backdrop-blur-sm shadow-lg border-2",
          "hover:bg-background hover:scale-105 transition-all duration-200",
          isFirstTask && "opacity-30 cursor-not-allowed"
        )}
        data-testid="button-turbo-prev"
      >
        <ChevronLeft className="w-7 h-7" />
      </Button>
      
      {/* Right arrow - fixed to right edge */}
      <Button
        variant="outline"
        size="icon"
        onClick={goToNext}
        disabled={isLastTask}
        className={cn(
          "fixed right-4 top-1/2 -translate-y-1/2 z-[100] h-14 w-14 rounded-full",
          "bg-background/95 backdrop-blur-sm shadow-lg border-2",
          "hover:bg-background hover:scale-105 transition-all duration-200",
          isLastTask && "opacity-30 cursor-not-allowed"
        )}
        data-testid="button-turbo-next"
      >
        <ChevronRight className="w-7 h-7" />
      </Button>

      {/* Completion animation - green left sidebar + center message */}
      {showCompletionAnimation && (
        <>
          {/* Green left sidebar indicator */}
          <div 
            className="fixed left-0 top-0 bottom-0 w-2 z-[250] bg-emerald-500"
            style={{
              boxShadow: "0 0 20px 5px rgba(16, 185, 129, 0.5)",
              animation: "pulse 1s ease-in-out infinite",
            }}
          />
          
          {/* Center completion message */}
          <div className="fixed inset-0 z-[245] pointer-events-none flex items-center justify-center">
            <div 
              className="flex items-center gap-3 px-6 py-4 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30"
              style={{
                boxShadow: "0 0 30px 10px rgba(16, 185, 129, 0.2)",
                animation: "bounce 0.6s ease-in-out",
              }}
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="text-xl font-bold text-emerald-500">Atualização registrada!</span>
            </div>
          </div>
        </>
      )}

      {/* Persistent green indicator when action was performed (only when animation is not showing) */}
      {actionPerformed && !showCompletionAnimation && (
        <div 
          className="fixed left-0 top-0 bottom-0 w-1 z-[250] bg-emerald-500/70"
        />
      )}

      {/* Task Detail Modal - using existing component */}
      <TaskDetailModal
        task={currentTask}
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            exitTurboMode();
          }
        }}
        onUpdateTask={handleTaskUpdate}
      />
    </>
  );
});
