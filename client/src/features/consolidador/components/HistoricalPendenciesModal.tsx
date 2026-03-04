import { History, CheckCircle } from "lucide-react";
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

const clientColors: Record<string, { bg: string; border: string }> = {
  AS: { bg: "bg-violet-600", border: "border-violet-800" },
  RM: { bg: "bg-blue-600", border: "border-blue-800" },
  JP: { bg: "bg-emerald-600", border: "border-emerald-800" },
  MO: { bg: "bg-rose-600", border: "border-rose-800" },
  CS: { bg: "bg-amber-600", border: "border-amber-800" },
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
            {Object.entries(grouped).map(([monthLabel, items]) => {
              const pendingCount = items.filter(
                (i) => i.status === "Pendente" || i.status === "Solicitado",
              ).length;

              return (
                <div key={monthLabel}>
                  <div className="mb-2 flex items-center gap-2 rounded border border-gray-700 bg-gray-800/50 px-3 py-1">
                    <span className="text-xs font-semibold uppercase text-gray-400">
                      {monthLabel}
                    </span>
                    <div className="flex-1" />
                    {pendingCount > 0 ? (
                      <span className="text-xs font-medium text-orange-400">
                        {pendingCount} Pendente{pendingCount > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-green-400">Tudo OK</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {items.length === 0 ? (
                      <div className="flex items-center gap-2 px-4 py-3">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm italic text-gray-500">
                          Nenhuma pendência neste mês
                        </span>
                      </div>
                    ) : (
                      items.map((item) => {
                        const colors = clientColors[item.clientInitials] || {
                          bg: "bg-gray-600",
                          border: "border-gray-700",
                        };
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded border border-border bg-background/50 px-4 py-3 transition-colors hover:bg-white/5"
                          >
                            <Avatar className={`h-6 w-6 rounded-lg border ${colors.border}`}>
                              <AvatarFallback
                                className={`rounded-lg text-[10px] font-semibold text-white ${colors.bg}`}
                              >
                                {item.clientInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white">{item.clientName}</p>
                              <p className="text-xs text-gray-500">{item.institution}</p>
                            </div>
                            <ExtratoStatusBadge extrato={item} />
                            <button className="text-xs font-medium text-blue-400 hover:text-blue-300">
                              {item.status === "Pendente" ? "Resolver" : "Cobrar"}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
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
