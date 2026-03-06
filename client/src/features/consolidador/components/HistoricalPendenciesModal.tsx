import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import type { Extrato } from "../types/extrato";

interface HistoricalPendenciesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendencies: Extrato[];
}

interface MonthSummary {
  key: string;
  label: string;
  pendentes: number;
  solicitados: number;
  recebidos: number;
  total: number;
  subtitle: string;
}

function getMonthSummaries(pendencies: Extrato[]): MonthSummary[] {
  const groups: Record<string, Extrato[]> = {};
  for (const p of pendencies) {
    const key = format(p.referenceMonth, "yyyy-MM");
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      const pendentes = items.filter((i) => i.status === "Pendente").length;
      const solicitados = items.filter((i) => i.status === "Solicitado").length;
      const recebidos = items.filter((i) => i.status === "Recebido").length;
      const label = format(items[0].referenceMonth, "MMMM yyyy", { locale: ptBR });

      let subtitle = "Tudo em dia";
      if (pendentes > 0) subtitle = "Consolidacao Pendente";
      else if (solicitados > 0) subtitle = "Acao Necessaria";
      else if (recebidos > 0) subtitle = "Extratos recebidos";

      return { key, label, pendentes, solicitados, recebidos, total: items.length, subtitle };
    });
}

export function HistoricalPendenciesModal({
  open,
  onOpenChange,
  pendencies,
}: HistoricalPendenciesModalProps) {
  const summaries = getMonthSummaries(pendencies);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] border-[#3b4f54] bg-[#171b20] p-0">
        <DialogHeader className="border-b border-white/5 px-8 pb-5 pt-8">
          <DialogTitle className="flex items-center gap-3 text-[28px] font-bold text-white">
            Pendencias Historicas
          </DialogTitle>
          <p className="text-sm text-zinc-500">Acompanhamento de consolidacoes passadas</p>
          <div className="mt-3 inline-flex w-fit items-center rounded-md bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
            {pendencies.length} pendencia{pendencies.length !== 1 ? "s" : ""} no total
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] bg-[#111718]">
          <div className="flex flex-col gap-3 p-6">
            {summaries.map((month) => (
              <div
                key={month.key}
                className="flex items-center gap-5 rounded-xl border border-[#3b4f54] bg-[#22262e] p-5 transition-all hover:border-[#4a6369]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5">
                  <Calendar className="h-5 w-5 text-zinc-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold capitalize text-white">{month.label}</p>
                  <p className="text-xs text-zinc-500">{month.subtitle}</p>
                </div>

                <div className="flex items-center gap-4 border-l border-white/10 pl-5">
                  {month.pendentes > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-orange-400" />
                      <span className="text-xs font-medium text-zinc-400">{month.pendentes}</span>
                    </div>
                  )}
                  {month.solicitados > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-400" />
                      <span className="text-xs font-medium text-zinc-400">{month.solicitados}</span>
                    </div>
                  )}
                  {month.recebidos > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      <span className="text-xs font-medium text-zinc-400">{month.recebidos}</span>
                    </div>
                  )}
                </div>

                <span className="cursor-pointer text-xs font-medium text-blue-400 hover:text-blue-300">
                  Ver Mes
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between border-t border-white/5 px-8 py-5">
          <button className="text-xs font-medium text-zinc-500 hover:text-zinc-300">
            Marcar tudo como consolidado
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-[#3b4f54] bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
