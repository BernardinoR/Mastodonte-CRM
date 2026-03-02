import { Search, Filter, Layers, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import type { ExtratoStatus, ExtratoAccountType } from "../types/extrato";

interface ConsolidadorFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ExtratoStatus | null;
  onStatusFilterChange: (value: ExtratoStatus | null) => void;
  typeFilter: ExtratoAccountType | null;
  onTypeFilterChange: (value: ExtratoAccountType | null) => void;
}

const statuses: ExtratoStatus[] = ["Pendente", "Solicitado", "Recebido", "Consolidado"];
const types: ExtratoAccountType[] = ["Principal", "Holding", "Filho"];

export function ConsolidadorFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: ConsolidadorFiltersProps) {
  const hasFilters = statusFilter !== null || typeFilter !== null || searchTerm !== "";

  return (
    <div className="flex items-center gap-3">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Buscar por cliente, gerente ou instituição..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 rounded-lg border-gray-700 bg-gray-900/50 pl-9 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-2 border-dashed border-gray-600 text-sm ${
            statusFilter ? "border-solid border-blue-500/50 bg-blue-500/10 text-blue-400" : ""
          }`}
          onClick={() => {
            if (statusFilter) {
              const currentIndex = statuses.indexOf(statusFilter);
              const nextIndex = (currentIndex + 1) % statuses.length;
              onStatusFilterChange(nextIndex === 0 ? null : statuses[nextIndex]);
            } else {
              onStatusFilterChange(statuses[0]);
            }
          }}
        >
          <Filter className="h-3.5 w-3.5" />
          {statusFilter ? statusFilter : "Status"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-2 border-dashed border-gray-600 text-sm ${
            typeFilter ? "border-solid border-blue-500/50 bg-blue-500/10 text-blue-400" : ""
          }`}
          onClick={() => {
            if (typeFilter) {
              const currentIndex = types.indexOf(typeFilter);
              const nextIndex = (currentIndex + 1) % types.length;
              onTypeFilterChange(nextIndex === 0 ? null : types[nextIndex]);
            } else {
              onTypeFilterChange(types[0]);
            }
          }}
        >
          <Layers className="h-3.5 w-3.5" />
          {typeFilter ? typeFilter : "Tipo"}
        </Button>
      </div>
      {hasFilters && (
        <button
          onClick={() => {
            onSearchChange("");
            onStatusFilterChange(null);
            onTypeFilterChange(null);
          }}
          className="ml-2 text-sm font-medium text-gray-400 hover:text-white"
        >
          <span className="flex items-center gap-1">
            <X className="h-3 w-3" />
            Limpar filtros
          </span>
        </button>
      )}
    </div>
  );
}
