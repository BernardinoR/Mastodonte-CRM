import { useState } from "react";
import { Calendar, ChevronLeft, AlertTriangle, Mail, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { ExtratoRow } from "./ExtratoRow";
import type { Extrato, ExtratoStatus, ExtratoCollectionMethod } from "../types/extrato";

interface HistoricalPendenciesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendencies: Extrato[];
  onStatusChange?: (extratoId: string, status: ExtratoStatus) => void;
  onMethodChange?: (extratoId: string, method: ExtratoCollectionMethod) => void;
  onConsolidar?: (extrato: Extrato) => void;
  onSync?: (extrato: Extrato) => Promise<void>;
}

interface MonthSummary {
  key: string;
  label: string;
  pendentes: number;
  solicitados: number;
  recebidos: number;
  total: number;
  subtitle: string;
  extratos: Extrato[];
}

function parseReferenceMonth(ref: string): Date {
  const [mm, yyyy] = ref.split("/");
  return new Date(parseInt(yyyy), parseInt(mm) - 1, 1);
}

function getMonthSummaries(pendencies: Extrato[]): MonthSummary[] {
  const groups: Record<string, Extrato[]> = {};
  for (const p of pendencies) {
    const key = p.referenceMonth;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      const pendentes = items.filter((i) => i.status === "Pendente").length;
      const solicitados = items.filter((i) => i.status === "Solicitado").length;
      const recebidos = items.filter((i) => i.status === "Recebido").length;
      const monthDate = parseReferenceMonth(items[0].referenceMonth);
      const label = format(monthDate, "MMMM yyyy", { locale: ptBR });

      let subtitle = "Tudo em dia";
      if (pendentes > 0) subtitle = "Consolidação Pendente";
      else if (solicitados > 0) subtitle = "Ação Necessária";
      else if (recebidos > 0) subtitle = "Extratos recebidos";

      return { key, label, pendentes, solicitados, recebidos, total: items.length, subtitle, extratos: items };
    });
}

function MonthDetailView({
  month,
  onBack,
  onStatusChange,
  onMethodChange,
  onConsolidar,
  onSync,
}: {
  month: MonthSummary;
  onBack: () => void;
  onStatusChange?: (extratoId: string, status: ExtratoStatus) => void;
  onMethodChange?: (extratoId: string, method: ExtratoCollectionMethod) => void;
  onConsolidar?: (extrato: Extrato) => void;
  onSync?: (extrato: Extrato) => Promise<void>;
}) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-white/5 px-8 pb-5 pt-8">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar aos meses
        </button>
        <h2 className="text-[28px] font-bold capitalize text-white">
          {month.label}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{month.subtitle}</p>
        <div className="mt-4 flex items-center gap-3">
          {month.pendentes > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-950/30 px-3 py-1 text-[11px] font-black uppercase text-orange-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              {month.pendentes} Pendentes
            </span>
          )}
          {month.solicitados > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-950/30 px-3 py-1 text-[11px] font-black uppercase text-blue-400">
              <Mail className="h-3.5 w-3.5" />
              {month.solicitados} Solicitados
            </span>
          )}
          {month.recebidos > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-950/30 px-3 py-1 text-[11px] font-black uppercase text-green-400">
              <CheckCircle className="h-3.5 w-3.5" />
              {month.recebidos} Recebidos
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="max-h-[60vh] bg-[#111718]">
        <div className="px-6 py-2">
          <div className="mb-1 flex items-center gap-4 px-5 py-2">
            <span className="w-2" />
            <span className="w-48 text-[10px] font-black uppercase tracking-wider text-zinc-600">Cliente</span>
            <span className="w-16 text-[10px] font-black uppercase tracking-wider text-zinc-600">Tipo</span>
            <span className="w-24 text-[10px] font-black uppercase tracking-wider text-zinc-600">Método</span>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Status</span>
          </div>
          {month.extratos.map((extrato) => (
            <ExtratoRow
              key={extrato.id}
              extrato={extrato}
              onStatusChange={onStatusChange}
              onMethodChange={onMethodChange}
              onConsolidar={onConsolidar}
              onSync={onSync}
              labelField="client"
              groupBy="institution"
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export function HistoricalPendenciesModal({
  open,
  onOpenChange,
  pendencies,
  onStatusChange,
  onMethodChange,
  onConsolidar,
  onSync,
}: HistoricalPendenciesModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const summaries = getMonthSummaries(pendencies);
  const activeMonth = summaries.find((m) => m.key === selectedMonth);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setSelectedMonth(null);
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-[860px] border-[#3b4f54] bg-[#171b20] p-0">
        {activeMonth ? (
          <>
            <MonthDetailView
              month={activeMonth}
              onBack={() => setSelectedMonth(null)}
              onStatusChange={onStatusChange}
              onMethodChange={onMethodChange}
              onConsolidar={onConsolidar}
              onSync={onSync}
            />
            <div className="flex items-center justify-end border-t border-white/5 px-8 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMonth(null)}
                className="border-[#3b4f54] bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                Fechar
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="border-b border-white/5 px-8 pb-5 pt-8">
              <DialogTitle className="text-[28px] font-bold text-white">
                Pendências Históricas
              </DialogTitle>
              <p className="text-sm text-zinc-500">Acompanhamento de consolidações passadas</p>
              <div className="mt-3 inline-flex w-fit items-center rounded-md bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
                {pendencies.length} pendência{pendencies.length !== 1 ? "s" : ""} no total
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] bg-[#111718]">
              <div className="flex flex-col gap-3 p-6">
                {summaries.map((month) => (
                  <div
                    key={month.key}
                    className="flex cursor-pointer items-center gap-5 rounded-xl border border-[#3b4f54] bg-[#22262e] p-5 transition-all hover:border-[#4a6369]"
                    onClick={() => setSelectedMonth(month.key)}
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
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-medium text-zinc-400">{month.recebidos}</span>
                        </div>
                      )}
                    </div>

                    <span className="text-xs font-medium text-blue-400 hover:text-blue-300">
                      Ver Mês
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-end border-t border-white/5 px-8 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="border-[#3b4f54] bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
