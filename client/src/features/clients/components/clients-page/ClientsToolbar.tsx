import { LayoutGrid, List, Minimize2, Maximize2, Users, CalendarX, TrendingUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ClientsViewMode, ClientsFilterMode } from "@features/clients";

interface ClientsToolbarProps {
  viewMode: ClientsViewMode;
  onViewModeChange: (mode: ClientsViewMode) => void;
  filterMode: ClientsFilterMode;
  onFilterModeChange: (mode: ClientsFilterMode) => void;
  isCompact: boolean;
  onCompactChange: (isCompact: boolean) => void;
  totalClients: number;
  noMeetingCount: number;
}

export function ClientsToolbar({
  viewMode,
  onViewModeChange,
  filterMode,
  onFilterModeChange,
  isCompact,
  onCompactChange,
  totalClients,
  noMeetingCount,
}: ClientsToolbarProps) {
  return (
    <div className="mb-5 flex items-center gap-4">
      {/* View Toggle Container */}
      <div className="flex rounded-md border border-[#333333] bg-[#1a1a1a] p-1">
        <button
          onClick={() => onViewModeChange("cards")}
          className={cn(
            "flex items-center gap-1.5 rounded px-3 py-1.5 text-[13px] transition-colors",
            viewMode === "cards"
              ? "bg-[#333333] text-[#ededed]"
              : "text-[#8c8c8c] hover:text-[#ededed]",
          )}
          data-testid="button-view-cards"
        >
          <LayoutGrid className="h-4 w-4" />
          Cards
        </button>

        <button
          onClick={() => onViewModeChange("list")}
          className={cn(
            "flex items-center gap-1.5 rounded px-3 py-1.5 text-[13px] transition-colors",
            viewMode === "list"
              ? "bg-[#333333] text-[#ededed]"
              : "text-[#8c8c8c] hover:text-[#ededed]",
          )}
          data-testid="button-view-list"
        >
          <List className="h-4 w-4" />
          Lista
        </button>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-[#333333]" />

      {/* Compact Toggle Button */}
      <button
        onClick={() => onCompactChange(!isCompact)}
        className={cn(
          "flex items-center gap-1.5 rounded px-3 py-1.5 text-[13px] transition-colors",
          isCompact ? "bg-[#333333] text-[#ededed]" : "text-[#8c8c8c] hover:text-[#ededed]",
        )}
        title={isCompact ? "Expandir cards" : "Compactar cards"}
        data-testid="button-compact-mode"
      >
        {isCompact ? (
          <>
            <Maximize2 className="h-4 w-4" />
            Expandir
          </>
        ) : (
          <>
            <Minimize2 className="h-4 w-4" />
            Compactar
          </>
        )}
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-[#333333]" />

      {/* Mode Pills */}
      <div className="flex items-center gap-2">
        {/* Todos */}
        <button
          onClick={() => onFilterModeChange("all")}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
            filterMode === "all"
              ? "border-[#3a5068] bg-[#243041] text-[#6db1d4]"
              : "border-[#333333] bg-[#1a1a1a] text-[#8c8c8c] hover:border-[#444444] hover:text-[#ededed]",
          )}
          data-testid="filter-all"
        >
          <Users className="h-3.5 w-3.5" />
          Todos
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              filterMode === "all" ? "bg-white/10" : "bg-white/10",
            )}
          >
            {totalClients}
          </span>
        </button>

        {/* Sem reunião 30+ dias */}
        <button
          onClick={() => onFilterModeChange("noMeeting")}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
            filterMode === "noMeeting"
              ? "border-[#5a3d2d] bg-[#422c24] text-[#dcb092]"
              : "border-[#333333] bg-[#1a1a1a] text-[#8c8c8c] hover:border-[#444444] hover:text-[#ededed]",
          )}
          data-testid="filter-noMeeting"
        >
          <CalendarX className="h-3.5 w-3.5" />
          Sem reunião 30+ dias
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              filterMode === "noMeeting" ? "bg-white/10" : "bg-white/10",
            )}
          >
            {noMeetingCount}
          </span>
        </button>

        {/* Por AUM */}
        <button
          onClick={() => onFilterModeChange("byAum")}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
            filterMode === "byAum"
              ? "border-[#3a5068] bg-[#243041] text-[#6db1d4]"
              : "border-[#333333] bg-[#1a1a1a] text-[#8c8c8c] hover:border-[#444444] hover:text-[#ededed]",
          )}
          data-testid="filter-byAum"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Por AUM
        </button>
      </div>
    </div>
  );
}
