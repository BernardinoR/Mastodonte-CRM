import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Extratos</h1>
          {historicalCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenHistorical}
              className="relative h-8 gap-2 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>
              <AlertTriangle className="h-3.5 w-3.5" />
              {historicalCount} pendência{historicalCount > 1 ? "s" : ""} histórica
              {historicalCount > 1 ? "s" : ""}
            </Button>
          )}
        </div>
        <MonthSelector value={selectedMonth} onChange={onMonthChange} />
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          {summary.pendentes} Pendentes
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {summary.solicitados} Solicitados
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          {summary.recebidos} Recebidos
        </span>
      </div>
    </div>
  );
}
