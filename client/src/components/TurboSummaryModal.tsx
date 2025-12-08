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

  const statsItems = [
    {
      icon: History,
      label: "Tarefas com histórico",
      value: stats.tasksWithHistory,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
    },
    {
      icon: CheckCircle2,
      label: "Movidas para Done",
      value: stats.tasksMovedToDone,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      icon: Clock,
      label: "Tempo médio por tarefa",
      value: formatTime(stats.averageTimePerTask),
      isTime: true,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className={cn(
          "max-w-md p-0 overflow-hidden",
          "bg-[#18181B] border-[#363842]"
        )}
        hideCloseButton
      >
        <VisuallyHidden>
          <DialogTitle>Resumo da Sessão Turbo</DialogTitle>
          <DialogDescription>Estatísticas da sessão Turbo Mode</DialogDescription>
        </VisuallyHidden>
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Sessão Turbo Finalizada
            </h2>
            <p className="text-sm text-[#9B9A97]">
              Duração total: {formatTime(stats.sessionDurationSeconds)}
            </p>
          </div>

          <div className="space-y-3">
            {statsItems.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border",
                  item.bgColor,
                  item.borderColor
                )}
              >
                <div className={cn("p-2 rounded-lg", item.bgColor)}>
                  <item.icon className={cn("w-5 h-5", item.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#9B9A97]">{item.label}</p>
                  <p className={cn("text-2xl font-bold", item.color)}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              onClick={onClose}
              className={cn(
                "w-full h-12",
                "bg-gradient-to-r from-orange-500 to-amber-500",
                "hover:from-orange-600 hover:to-amber-600",
                "text-white font-medium"
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
