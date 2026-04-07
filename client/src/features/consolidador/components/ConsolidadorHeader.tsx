import { AlertTriangle, Mail, CheckCircle, ShieldAlert } from "lucide-react";
import type { ExtratoStatus, ExtratoStatusSummary } from "../types/extrato";
import { MonthSelector } from "./MonthSelector";

interface ConsolidadorHeaderProps {
  summary: ExtratoStatusSummary;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  historicalCount: number;
  onOpenHistorical: () => void;
  activeStatusFilter: ExtratoStatus | null;
  onStatusFilterChange: (status: ExtratoStatus | null) => void;
  verificationRedCount?: number;
}

export function ConsolidadorHeader({
  summary,
  selectedMonth,
  onMonthChange,
  historicalCount,
  onOpenHistorical,
  activeStatusFilter,
  onStatusFilterChange,
  verificationRedCount,
}: ConsolidadorHeaderProps) {
  const handleBadgeClick = (status: ExtratoStatus) => {
    onStatusFilterChange(activeStatusFilter === status ? null : status);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="mb-2 text-3xl font-bold text-white">Extratos</h1>
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
        <button
          onClick={() => handleBadgeClick("Pendente")}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-950/30 px-4 py-1.5 text-[11px] font-black uppercase text-orange-400 transition-all hover:bg-orange-500/20 ${
            activeStatusFilter === "Pendente" ? "ring-2 ring-orange-500/40" : ""
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          {summary.pendentes} Pendentes
        </button>
        <button
          onClick={() => handleBadgeClick("Solicitado")}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-950/30 px-4 py-1.5 text-[11px] font-black uppercase text-blue-400 transition-all hover:bg-blue-500/20 ${
            activeStatusFilter === "Solicitado" ? "ring-2 ring-blue-500/40" : ""
          }`}
        >
          <Mail className="h-4 w-4" />
          {summary.solicitados} Solicitados
        </button>
        <button
          onClick={() => handleBadgeClick("Recebido")}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-950/30 px-4 py-1.5 text-[11px] font-black uppercase text-green-400 transition-all hover:bg-green-500/20 ${
            activeStatusFilter === "Recebido" ? "ring-2 ring-green-500/40" : ""
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          {summary.recebidos} Recebidos
        </button>
        {verificationRedCount != null && verificationRedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-1.5 text-[11px] font-black uppercase text-red-400">
            <ShieldAlert className="h-4 w-4" />
            {verificationRedCount} Verificado{verificationRedCount > 1 ? "s" : ""}
          </span>
        )}
        <div className="h-6 w-px bg-border" />
        <MonthSelector value={selectedMonth} onChange={onMonthChange} />
      </div>
    </div>
  );
}
