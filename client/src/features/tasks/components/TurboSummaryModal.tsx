import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/shared/components/ui/button";
import { CheckCircle2, Clock, History, Zap } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { TurboSessionStats } from "../hooks/useTurboMode";

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
        className={cn("max-w-sm overflow-hidden p-0", "border-none bg-transparent shadow-none")}
        hideCloseButton
      >
        <VisuallyHidden>
          <DialogTitle>Resumo da Sessão Turbo</DialogTitle>
          <DialogDescription>Estatísticas da sessão Turbo Mode</DialogDescription>
        </VisuallyHidden>

        <div className="space-y-5 p-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
                <Zap className="h-7 w-7 text-white" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white">Sessão Turbo Finalizada</h2>
            <p className="text-sm text-white/60">
              Duração total: {formatTime(stats.sessionDurationSeconds)}
            </p>
          </div>

          {/* Stats Cards - each with distinct styling */}
          <div className="space-y-3">
            {/* Tarefas com histórico - Blue/Purple theme */}
            <div
              className={cn(
                "flex items-center gap-4 rounded-xl p-4",
                "bg-violet-500/20 backdrop-blur-sm",
                "border border-violet-400/30",
              )}
            >
              <div className="rounded-lg bg-violet-500/30 p-2.5">
                <History className="h-5 w-5 text-violet-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/70">Tarefas com histórico</p>
                <p className="text-2xl font-bold text-violet-300">
                  {stats.tasksWithHistory}
                  <span className="text-lg font-normal text-white/40">/{stats.totalTasks}</span>
                </p>
              </div>
            </div>

            {/* Movidas para Done - Green theme with X/Y format */}
            <div
              className={cn(
                "flex items-center gap-4 rounded-xl p-4",
                "bg-emerald-500/20 backdrop-blur-sm",
                "border border-emerald-400/30",
              )}
            >
              <div className="rounded-lg bg-emerald-500/30 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/70">Movidas para Done</p>
                <p className="text-2xl font-bold text-emerald-300">
                  {stats.tasksMovedToDone}
                  <span className="text-lg font-normal text-white/40">/{stats.totalTasks}</span>
                </p>
              </div>
            </div>

            {/* Tempo médio - Orange theme */}
            <div
              className={cn(
                "flex items-center gap-4 rounded-xl p-4",
                "bg-orange-500/20 backdrop-blur-sm",
                "border border-orange-400/30",
              )}
            >
              <div className="rounded-lg bg-orange-500/30 p-2.5">
                <Clock className="h-5 w-5 text-orange-300" />
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
                "h-11 w-full",
                "bg-white/10 hover:bg-white/15",
                "border border-white/20",
                "font-medium text-white/80",
              )}
              data-testid="button-close-summary"
            >
              <span>Finalizar</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
