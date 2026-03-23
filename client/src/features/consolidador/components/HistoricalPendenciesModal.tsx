import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { Extrato } from "../types/extrato";

interface HistoricalPendenciesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendencies: Extrato[];
  onMonthClick?: (monthKey: string) => void;
}

interface MonthSummary {
  key: string;
  label: string;
  pendentes: number;
  solicitados: number;
  recebidos: number;
  total: number;
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

      return { key, label, pendentes, solicitados, recebidos, total: items.length };
    });
}

function CountCell({ value, color }: { value: number; color: string }) {
  if (value === 0) return <span className="w-5 text-center text-[11px] tabular-nums text-zinc-700">-</span>;
  return (
    <span className={`flex w-5 items-center justify-center text-[11px] font-medium tabular-nums ${color}`}>
      {value}
    </span>
  );
}

export function HistoricalPendenciesModal({
  open,
  onOpenChange,
  pendencies,
  onMonthClick,
}: HistoricalPendenciesModalProps) {
  const summaries = useMemo(() => getMonthSummaries(pendencies), [pendencies]);

  const totalAll = useMemo(() => summaries.reduce((sum, m) => sum + m.total, 0), [summaries]);
  const totalRecebidos = useMemo(() => summaries.reduce((sum, m) => sum + m.recebidos, 0), [summaries]);
  const mesesComPendencia = useMemo(
    () => summaries.filter((m) => m.pendentes > 0 || m.solicitados > 0).length,
    [summaries],
  );
  const totalPendencias = totalAll - totalRecebidos;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] gap-0 border-zinc-800 bg-[#1a1a1a] p-0" aria-describedby={undefined}>
        <VisuallyHidden><DialogTitle>Pendências Históricas</DialogTitle></VisuallyHidden>
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/60 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-zinc-100" data-testid="text-modal-title">
              Pendências Históricas
            </h2>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              {totalRecebidos} de {totalAll} extratos recebidos
              <span className="mx-1.5 text-zinc-700">&middot;</span>
              <span className="text-zinc-400">
                {mesesComPendencia} {mesesComPendencia === 1 ? "mês" : "meses"} pendentes
              </span>
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-500/10">
            <span className="text-sm font-bold text-orange-400" data-testid="badge-total-pendentes">
              {totalPendencias}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-zinc-800/40 px-5 py-2">
          <span className="flex-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600">Mês</span>
          <div className="flex items-center gap-3">
            <span className="flex w-5 items-center justify-center" title="Pendentes">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            </span>
            <span className="flex w-5 items-center justify-center" title="Solicitados">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            </span>
            <span className="flex w-5 items-center justify-center" title="Recebidos">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
          </div>
          <span className="w-8" />
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: `${5 * 48}px` }}>
          {summaries.map((month) => {
            const [monthName, yearStr] = month.label.split(" ");
            return (
              <button
                key={month.key}
                className="group flex w-full items-center gap-1 border-b border-zinc-800/30 px-5 py-3 text-left transition-colors hover:bg-zinc-800/30"
                data-testid={`month-card-${month.key}`}
                onClick={() => onMonthClick?.(month.key)}
              >
                <span className="flex-1 text-[13px] capitalize text-zinc-300">
                  {monthName}
                  <span className="ml-1 text-zinc-600">{yearStr}</span>
                </span>

                <div className="flex items-center gap-3">
                  <CountCell value={month.pendentes} color="text-orange-400" />
                  <CountCell value={month.solicitados} color="text-sky-400" />
                  <CountCell value={month.recebidos} color="text-emerald-400" />
                </div>

                <ChevronRight className="ml-2 h-3.5 w-3.5 shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-400" />
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end border-t border-zinc-800/60 px-5 py-2.5">
          <button
            className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            data-testid="button-close-modal"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
