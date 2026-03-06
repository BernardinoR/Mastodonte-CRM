import { Search, Filter, Layers, X, Users, Building2 } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import type { ExtratoStatus, ExtratoAccountType } from "../types/extrato";

interface ConsolidadorFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ExtratoStatus | null;
  onStatusFilterChange: (value: ExtratoStatus | null) => void;
  typeFilter: ExtratoAccountType | null;
  onTypeFilterChange: (value: ExtratoAccountType | null) => void;
  groupBy: "client" | "institution";
  onGroupByChange: (value: "client" | "institution") => void;
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
  groupBy,
  onGroupByChange,
}: ConsolidadorFiltersProps) {
  const hasFilters = statusFilter !== null || typeFilter !== null || searchTerm !== "";

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 items-center rounded-xl border border-white/5 bg-[#111] p-0.5">
        <button
          onClick={() => onGroupByChange("client")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            groupBy === "client" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Cliente
        </button>
        <button
          onClick={() => onGroupByChange("institution")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            groupBy === "institution"
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Instituição
        </button>
      </div>
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Buscar por cliente, gerente ou instituição..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-xl border-white/5 bg-[#111] py-2.5 pl-9 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          className={`inline-flex items-center gap-2 rounded-xl border bg-[#111] px-4 py-2 text-sm transition-colors ${
            statusFilter
              ? "border-blue-500/50 text-blue-400"
              : "border-white/5 text-zinc-400 hover:text-white"
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
        </button>
        <button
          className={`inline-flex items-center gap-2 rounded-xl border bg-[#111] px-4 py-2 text-sm transition-colors ${
            typeFilter
              ? "border-blue-500/50 text-blue-400"
              : "border-white/5 text-zinc-400 hover:text-white"
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
        </button>
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
