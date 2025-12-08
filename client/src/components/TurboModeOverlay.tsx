import { memo, useEffect, useCallback, useState, useRef } from "react";
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
  Zap,
  CheckCircle2,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UseTurboModeReturn } from "@/hooks/useTurboMode";
import type { Task } from "@/types/task";

// Motivational phrases for Turbo Mode
const MOTIVATIONAL_PHRASES = [
  "Você está arrasando!",
  "Foco total!",
  "Uma de cada vez!",
  "Mais perto do objetivo!",
  "Continue assim!",
  "Você consegue!",
  "Progresso constante!",
  "Excelente trabalho!",
  "Mantenha o ritmo!",
  "Quase lá!",
];

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

  // Motivational phrase state - changes on task completion
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const prevActionPerformed = useRef(actionPerformed);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flash animation and phrase change when action is performed (edge detection)
  useEffect(() => {
    // Only trigger on rising edge: false -> true
    if (actionPerformed && !prevActionPerformed.current) {
      // Action just completed - trigger flash and change phrase
      setShowFlash(true);
      setPhraseIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
      
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

  // Stop event propagation to prevent Dialog from closing
  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  // Orange color palette for Turbo Mode
  const TURBO_COLORS = {
    orange: "#F97316",
    orangeLight: "#FB923C",
    orangeDark: "#EA580C",
    amber: "#F59E0B",
    green: "#22C55E",
  };

  // Calculate progress color based on completion
  const getProgressColor = () => {
    if (showFlash) return TURBO_COLORS.green;
    if (progress > 75) return TURBO_COLORS.amber;
    return TURBO_COLORS.orange;
  };

  // Timer bar and arrows rendered via portal to appear after Dialog in DOM
  const timerBar = (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-[9999] pointer-events-auto",
        "transition-all duration-300"
      )}
      data-testid="turbo-mode-bar"
      onPointerDown={stopPropagation}
      onClick={stopPropagation}
    >
      {/* Large progress bar at top with gradient */}
      <div className="h-1.5 bg-[#1a1a1a]">
        <div 
          className={cn(
            "h-full transition-all duration-500 ease-out",
            showFlash && "turbo-progress-pulse"
          )}
          style={{ 
            width: `${progress}%`, 
            background: `linear-gradient(90deg, ${TURBO_COLORS.orangeDark}, ${getProgressColor()})`,
            boxShadow: showFlash ? `0 0 12px ${TURBO_COLORS.green}` : `0 0 8px ${TURBO_COLORS.orange}40`
          }}
        />
      </div>

      {/* Main bar content */}
      <div 
        className={cn(
          "bg-gradient-to-r from-[#1E1F24] via-[#1E1F24] to-[#1E1F24] border-b",
          showFlash ? "border-emerald-500/50" : "border-orange-500/30"
        )}
      >
        <div className="flex items-center justify-between px-6 py-3 gap-6">
          
          {/* Left Panel: Identity */}
          <div className="flex items-center gap-4">
            {/* Turbo label with flame icon */}
            <div 
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                "bg-gradient-to-r from-orange-500/20 to-amber-500/10",
                "border border-orange-500/30"
              )}
            >
              <Zap 
                className={cn(
                  "w-5 h-5 text-orange-400",
                  showFlash && "animate-pulse"
                )} 
              />
              <span 
                className="font-bold text-sm tracking-wider"
                style={{ color: TURBO_COLORS.orange }}
              >
                TURBO
              </span>
            </div>
          </div>

          {/* Center Panel: Progress Info + Motivational */}
          <div className="flex-1 flex flex-col items-center gap-1">
            {/* Task Progress */}
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-orange-400/70" />
              <span className="text-base font-semibold text-foreground">
                {currentIndex + 1} <span className="text-[#6B6B6B] font-normal">de</span> {totalTasks}
              </span>
              
              {completedInSession > 0 && (
                <div 
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  )}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{completedInSession} feitas</span>
                </div>
              )}
            </div>
            
            {/* Motivational phrase */}
            <span 
              className={cn(
                "text-sm font-medium transition-all duration-300",
                showFlash ? "text-emerald-400" : "text-orange-300/80"
              )}
              data-testid="text-motivational-phrase"
            >
              {showFlash ? "Muito bem!" : MOTIVATIONAL_PHRASES[phraseIndex]}
            </span>
          </div>

          {/* Right Panel: Timer and Controls */}
          <div className="flex items-center gap-3">
            {/* Timer display - prominent */}
            <div 
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                "bg-[#252730] border",
                timerSeconds <= 60 ? "border-red-500/50" : 
                timerSeconds <= 300 ? "border-amber-500/30" : 
                "border-[#363842]"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); timerRunning ? pauseTimer() : startTimer(); }}
                className="h-7 w-7 text-[#9B9A97] hover:text-foreground"
                data-testid="button-timer-toggle"
              >
                {timerRunning ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <span 
                className={cn(
                  "font-mono text-lg font-semibold tabular-nums min-w-[60px]",
                  timerSeconds <= 60 && "text-red-400",
                  timerSeconds <= 300 && timerSeconds > 60 && "text-amber-400",
                  timerSeconds > 300 && "text-foreground"
                )}
                data-testid="text-timer"
              >
                {formatTime(timerSeconds)}
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); resetTimer(); }}
                className="h-7 w-7 text-[#64666E] hover:text-foreground"
                data-testid="button-timer-reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Exit button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); exitTurboMode(); }}
              className="h-8 w-8 text-[#64666E] hover:text-red-400"
              data-testid="button-turbo-exit"
            >
              <X className="w-4 h-4" />
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
            "h-12 w-12 rounded-full",
            "bg-[#252730] border border-orange-500/30",
            "text-orange-400/70 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50",
            "transition-all duration-200",
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
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          disabled={isLastTask}
          className={cn(
            "h-12 w-12 rounded-full",
            "bg-[#252730] border border-orange-500/30",
            "text-orange-400/70 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50",
            "transition-all duration-200",
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
