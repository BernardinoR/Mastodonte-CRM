import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ViewModeToggleProps {
  viewMode: "board" | "table";
  onViewModeChange: (mode: "board" | "table") => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="hidden items-center rounded-lg border border-[#333] bg-[#252525] p-1 md:flex">
      <button
        onClick={() => onViewModeChange("board")}
        className={cn(
          "flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-all",
          viewMode === "board"
            ? "bg-[#333] text-white shadow-sm"
            : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white",
        )}
        data-testid="button-view-board"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Kanban
      </button>
      <button
        onClick={() => onViewModeChange("table")}
        className={cn(
          "flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-all",
          viewMode === "table"
            ? "bg-[#333] text-white shadow-sm"
            : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white",
        )}
        data-testid="button-view-table"
      >
        <List className="h-3.5 w-3.5" />
        Tabela
      </button>
    </div>
  );
}
