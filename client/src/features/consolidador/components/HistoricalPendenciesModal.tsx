import { History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import type { Extrato } from "../types/extrato";
import { ExtratoStatusBadge } from "./ExtratoStatusBadge";

interface HistoricalPendenciesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendencies: Extrato[];
}

function groupByMonth(pendencies: Extrato[]): Record<string, Extrato[]> {
  const groups: Record<string, Extrato[]> = {};
  for (const p of pendencies) {
    const key = format(p.referenceMonth, "MMMM yyyy", { locale: ptBR });
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }
  return groups;
}

const clientColors: Record<string, string> = {
  AS: "bg-violet-600",
  RM: "bg-blue-600",
  JP: "bg-emerald-600",
  MO: "bg-rose-600",
  CS: "bg-amber-600",
};

export function HistoricalPendenciesModal({
  open,
  onOpenChange,
  pendencies,
}: HistoricalPendenciesModalProps) {
  const grouped = groupByMonth(pendencies);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-gray-700 bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <History className="h-5 w-5 text-orange-400" />
            Pendências Históricas
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="flex flex-col gap-4 pr-4">
            {Object.entries(grouped).map(([monthLabel, items]) => (
              <div key={monthLabel}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-gray-400">
                    {monthLabel}
                  </span>
                  <div className="h-px flex-1 bg-gray-700" />
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((item) => {
                    const avatarColor = clientColors[item.clientInitials] || "bg-gray-600";
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5"
                      >
                        <Avatar className="h-6 w-6 rounded-lg">
                          <AvatarFallback
                            className={`rounded-lg text-[10px] font-semibold text-white ${avatarColor}`}
                          >
                            {item.clientInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">{item.clientName}</p>
                          <p className="text-xs text-gray-500">{item.institution}</p>
                        </div>
                        <ExtratoStatusBadge status={item.status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-gray-600"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
