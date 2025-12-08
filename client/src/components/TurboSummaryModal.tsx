import { memo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  History, 
  Zap,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TurboSessionStats } from "@/hooks/useTurboMode";

interface TurboSummaryModalProps {
  open: boolean;
  onClose: () => void;
  stats: TurboSessionStats | null;
  formatTime: (seconds: number) => string;
}

export const TurboSummaryModal = memo(function TurboSummaryModal({
  open,
  onClose,
  stats,
  formatTime,
}: TurboSummaryModalProps) {
  if (!stats) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className={cn(
          "max-w-sm p-0 overflow-hidden",
          "bg-transparent border-none shadow-none"
        )}
        hideCloseButton
      >
        <VisuallyHidden>
          <DialogTitle>Resumo da Sessão Turbo</DialogTitle>
          <DialogDescription>Estatísticas da sessão Turbo Mode</DialogDescription>
        </VisuallyHidden>
        
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white">
              Sessão Turbo Finalizada
            </h2>
            <p className="text-sm text-white/60">
              Duração total: {formatTime(stats.sessionDurationSeconds)}
            </p>
          </div>

          {/* Stats Cards - each with distinct styling */}
          <div className="space-y-3">
            {/* Tarefas com histórico - Blue/Purple theme */}
            <div
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl",
                "bg-violet-500/20 backdrop-blur-sm",
                "border border-violet-400/30"
              )}
            >
              <div className="p-2.5 rounded-lg bg-violet-500/30">
                <History className="w-5 h-5 text-violet-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/70">Tarefas com histórico</p>
                <p className="text-2xl font-bold text-violet-300">
                  {stats.tasksWithHistory}
                </p>
              </div>
            </div>

            {/* Movidas para Done - Green theme with X/Y format */}
            <div
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl",
                "bg-emerald-500/20 backdrop-blur-sm",
                "border border-emerald-400/30"
              )}
            >
              <div className="p-2.5 rounded-lg bg-emerald-500/30">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/70">Movidas para Done</p>
                <p className="text-2xl font-bold text-emerald-300">
                  {stats.tasksMovedToDone}
                  <span className="text-lg text-white/40 font-normal">/{stats.totalTasks}</span>
                </p>
              </div>
            </div>

            {/* Tempo médio - Orange theme */}
            <div
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl",
                "bg-orange-500/20 backdrop-blur-sm",
                "border border-orange-400/30"
              )}
            >
              <div className="p-2.5 rounded-lg bg-orange-500/30">
                <Clock className="w-5 h-5 text-orange-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/70">Tempo médio por tarefa</p>
                <p className="text-2xl font-bold text-orange-300">
                  {formatTime(stats.averageTimePerTask)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-1">
            <Button
              onClick={onClose}
              className={cn(
                "w-full h-11",
                "bg-gradient-to-r from-orange-500 to-amber-500",
                "hover:from-orange-600 hover:to-amber-600",
                "text-white font-medium shadow-lg shadow-orange-500/25"
              )}
              data-testid="button-close-summary"
            >
              <span>Voltar ao Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
