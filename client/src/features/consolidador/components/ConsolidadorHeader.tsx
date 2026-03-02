import { AlertTriangle, Mail, CheckCircle } from "lucide-react";
import type { ExtratoStatusSummary } from "../types/extrato";
import { MonthSelector } from "./MonthSelector";

interface ConsolidadorHeaderProps {
  summary: ExtratoStatusSummary;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  historicalCount: number;
  onOpenHistorical: () => void;
}

export function ConsolidadorHeader({
  summary,
  selectedMonth,
  onMonthChange,
  historicalCount,
  onOpenHistorical,
}: ConsolidadorHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Extratos</h1>
        {historicalCount > 0 && (
          <button
            onClick={onOpenHistorical}
            className="relative inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
            <AlertTriangle className="h-3.5 w-3.5" />
            {historicalCount} pendência{historicalCount > 1 ? "s" : ""} histórica
            {historicalCount > 1 ? "s" : ""}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 pl-3 pr-4 text-xs font-medium text-orange-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          {summary.pendentes} Pendentes
        </span>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 pl-3 pr-4 text-xs font-medium text-blue-400">
          <Mail className="h-3.5 w-3.5" />
          {summary.solicitados} Solicitados
        </span>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 pl-3 pr-4 text-xs font-medium text-green-400">
          <CheckCircle className="h-3.5 w-3.5" />
          {summary.recebidos} Recebidos
        </span>
        <div className="h-6 w-px bg-border" />
        <MonthSelector value={selectedMonth} onChange={onMonthChange} />
      </div>
    </div>
  );
}
