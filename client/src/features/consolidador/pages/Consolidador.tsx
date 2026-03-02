import { useState, useMemo, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { ConsolidadorHeader } from "../components/ConsolidadorHeader";
import { ConsolidadorFilters } from "../components/ConsolidadorFilters";
import { ClientExtratoGroup } from "../components/ClientExtratoGroup";
import { HistoricalPendenciesModal } from "../components/HistoricalPendenciesModal";
import { getMockExtratos, getMockHistoricalPendencies } from "../lib/extratoMockData";
import type {
  Extrato,
  ExtratoStatus,
  ExtratoAccountType,
  ClientExtratoGroup as ClientGroupType,
  ExtratoStatusSummary,
} from "../types/extrato";

export default function Consolidador() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExtratoStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<ExtratoAccountType | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date(2026, 1, 1));
  const [historicalOpen, setHistoricalOpen] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [consolidatedIds, setConsolidatedIds] = useState<Set<string>>(new Set());
  const [consolidadosOpen, setConsolidadosOpen] = useState(false);

  const rawExtratos = useMemo(() => getMockExtratos(selectedMonth), [selectedMonth]);
  const historicalPendencies = useMemo(() => getMockHistoricalPendencies(), []);

  const extratos: Extrato[] = useMemo(() => {
    return rawExtratos.map((e) =>
      consolidatedIds.has(e.id) ? { ...e, status: "Consolidado" as const } : e,
    );
  }, [rawExtratos, consolidatedIds]);

  const summary: ExtratoStatusSummary = useMemo(() => {
    return extratos.reduce(
      (acc, e) => {
        if (e.status === "Pendente") acc.pendentes++;
        else if (e.status === "Solicitado") acc.solicitados++;
        else if (e.status === "Recebido") acc.recebidos++;
        else if (e.status === "Consolidado") acc.consolidados++;
        return acc;
      },
      { pendentes: 0, solicitados: 0, recebidos: 0, consolidados: 0 },
    );
  }, [extratos]);

  const filteredExtratos = useMemo(() => {
    return extratos.filter((e) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !e.clientName.toLowerCase().includes(term) &&
          !e.institution.toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      if (statusFilter && e.status !== statusFilter) return false;
      if (typeFilter && e.accountType !== typeFilter) return false;
      return true;
    });
  }, [extratos, searchTerm, statusFilter, typeFilter]);

  const { actionGroups, consolidatedGroups } = useMemo(() => {
    const groupMap = new Map<string, ClientGroupType>();

    for (const e of filteredExtratos) {
      let group = groupMap.get(e.clientId);
      if (!group) {
        group = {
          clientId: e.clientId,
          clientName: e.clientName,
          clientInitials: e.clientInitials,
          extratos: [],
          pendingCount: 0,
        };
        groupMap.set(e.clientId, group);
      }
      group.extratos.push(e);
      if (e.status === "Pendente" || e.status === "Solicitado") {
        group.pendingCount++;
      }
    }

    const allGroups = Array.from(groupMap.values());

    const action: ClientGroupType[] = [];
    const consolidated: ClientGroupType[] = [];

    for (const g of allGroups) {
      const allConsolidated = g.extratos.every((e) => e.status === "Consolidado");
      if (allConsolidated) {
        consolidated.push(g);
      } else {
        action.push(g);
      }
    }

    return { actionGroups: action, consolidatedGroups: consolidated };
  }, [filteredExtratos]);

  const toggleClient = useCallback((clientId: string) => {
    setExpandedClients((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  }, []);

  const handleConsolidar = useCallback((extratoId: string) => {
    setConsolidatedIds((prev) => new Set(prev).add(extratoId));
  }, []);

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <ConsolidadorHeader
          summary={summary}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          historicalCount={historicalPendencies.length}
          onOpenHistorical={() => setHistoricalOpen(true)}
        />

        <ConsolidadorFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />

        <div className="flex flex-col gap-1">
          {actionGroups.length === 0 && consolidatedGroups.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500">
              Nenhum extrato encontrado para os filtros selecionados.
            </div>
          )}

          {actionGroups.map((group) => (
            <ClientExtratoGroup
              key={group.clientId}
              group={group}
              isExpanded={expandedClients.has(group.clientId)}
              onToggle={() => toggleClient(group.clientId)}
              onConsolidar={handleConsolidar}
            />
          ))}
        </div>

        {consolidatedGroups.length > 0 && (
          <Collapsible open={consolidadosOpen} onOpenChange={setConsolidadosOpen}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-400 hover:bg-white/5">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${consolidadosOpen ? "" : "-rotate-90"}`}
              />
              Consolidados ({consolidatedGroups.reduce((sum, g) => sum + g.extratos.length, 0)})
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-1">
                {consolidatedGroups.map((group) => (
                  <ClientExtratoGroup
                    key={group.clientId}
                    group={group}
                    isExpanded={expandedClients.has(group.clientId)}
                    onToggle={() => toggleClient(group.clientId)}
                    onConsolidar={handleConsolidar}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <HistoricalPendenciesModal
          open={historicalOpen}
          onOpenChange={setHistoricalOpen}
          pendencies={historicalPendencies}
        />
      </div>
    </div>
  );
}
