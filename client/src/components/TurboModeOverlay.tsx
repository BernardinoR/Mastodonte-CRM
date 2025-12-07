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
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UI_COLORS } from "@/lib/statusConfig";
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
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-auto bg-[#1E1F24] border-b border-[#363842]"
      data-testid="turbo-mode-bar"
      onPointerDown={stopPropagation}
      onClick={stopPropagation}
    >
      {/* Subtle progress bar with blue accent matching card border */}
      <div className="h-0.5 bg-[#2a2a2a]">
        <div 
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: UI_COLORS.taskBorderBlue }}
        />
      </div>

      <div className="flex items-center justify-between px-5 py-2 gap-4">
        {/* Left section: Turbo Mode label and task counter */}
        <div className="flex items-center gap-4">
          {/* Turbo label - using card border blue */}
          <div className="flex items-center gap-2" style={{ color: UI_COLORS.taskBorderBlue }}>
            <Rocket className="w-4 h-4" />
            <span className="font-medium text-sm tracking-wide">TURBO</span>
          </div>
          
          {/* Separator */}
          <div className="w-px h-4 bg-[#363842]" />
          
          {/* Task counter - minimal */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#9B9A97] tabular-nums">
              <span className="text-foreground font-medium">{currentIndex + 1}</span>
              <span className="mx-1">/</span>
              <span>{totalTasks}</span>
            </span>
            
            {completedInSession > 0 && (
              <>
                <div className="w-px h-4 bg-[#363842]" />
                <span className="flex items-center gap-1.5 text-emerald-500/80 text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{completedInSession}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right section: Timer and controls */}
        <div className="flex items-center gap-1">
          {/* Timer section */}
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); timerRunning ? pauseTimer() : startTimer(); }}
              className="h-8 w-8 text-[#9B9A97] hover:text-foreground"
              data-testid="button-timer-toggle"
            >
              {timerRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            {/* Timer display - clean monospace */}
            <div className="px-2 py-0.5 rounded bg-[#252730] border border-[#363842] min-w-[60px] text-center">
              <span 
                className={cn(
                  "font-mono text-sm tabular-nums",
                  timerSeconds <= 60 && "text-red-400",
                  timerSeconds <= 300 && timerSeconds > 60 && "text-amber-400",
                  timerSeconds > 300 && "text-[#9B9A97]"
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
              className="h-8 w-8 text-[#9B9A97] hover:text-foreground"
              data-testid="button-timer-reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Separator */}
          <div className="w-px h-4 bg-[#363842] mx-1" />

          {/* Exit button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); exitTurboMode(); }}
            className="h-8 w-8 text-[#64666E] hover:text-foreground"
            data-testid="button-turbo-exit"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Navigation arrows - matching card aesthetic
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
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
          disabled={isFirstTask}
          className={cn(
            "h-11 w-11 rounded-full",
            "bg-[#252730] border border-[#363842]",
            "text-[#9B9A97] hover:text-foreground hover:bg-[#2a2a2a] hover:border-[#4a4a4a]",
            "transition-all duration-200",
            isFirstTask && "opacity-30 cursor-not-allowed"
          )}
          data-testid="button-turbo-prev"
        >
          <ChevronLeft className="w-5 h-5" />
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
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          disabled={isLastTask}
          className={cn(
            "h-11 w-11 rounded-full",
            "bg-[#252730] border border-[#363842]",
            "text-[#9B9A97] hover:text-foreground hover:bg-[#2a2a2a] hover:border-[#4a4a4a]",
            "transition-all duration-200",
            isLastTask && "opacity-30 cursor-not-allowed"
          )}
          data-testid="button-turbo-next"
        >
          <ChevronRight className="w-5 h-5" />
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
