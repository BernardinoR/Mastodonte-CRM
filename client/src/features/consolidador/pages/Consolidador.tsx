import { useState, useMemo, useCallback, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { ConsolidadorHeader } from "../components/ConsolidadorHeader";
import { ConsolidadorFilters } from "../components/ConsolidadorFilters";
import { ClientExtratoGroup } from "../components/ClientExtratoGroup";
import { HistoricalPendenciesModal } from "../components/HistoricalPendenciesModal";
import { ConsolidarModal } from "../components/ConsolidarModal";
import { getMockExtratos, getMockHistoricalPendencies } from "../lib/extratoMockData";
import type {
  Extrato,
  ExtratoStatus,
  ExtratoAccountType,
  ClientExtratoGroup as ClientGroupType,
  ExtratoStatusSummary,
} from "../types/extrato";

export default function Consolidador() {
  const [groupBy, setGroupBy] = useState<"client" | "institution">("client");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExtratoStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<ExtratoAccountType | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date(2026, 1, 1));
  const [historicalOpen, setHistoricalOpen] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [consolidatedIds, setConsolidatedIds] = useState<Set<string>>(new Set());
  const [consolidadosOpen, setConsolidadosOpen] = useState(false);
  const [consolidarExtrato, setConsolidarExtrato] = useState<Extrato | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [visibleConsolidatedCount, setVisibleConsolidatedCount] = useState(20);

  useEffect(() => {
    setVisibleCount(20);
    setVisibleConsolidatedCount(20);
  }, [statusFilter, typeFilter, searchTerm]);

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
      const key = groupBy === "client" ? e.clientId : e.institution;
      let group = groupMap.get(key);
      if (!group) {
        if (groupBy === "client") {
          group = {
            clientId: e.clientId,
            clientName: e.clientName,
            clientInitials: e.clientInitials,
            extratos: [],
            pendingCount: 0,
          };
        } else {
          group = {
            clientId: e.institution,
            clientName: e.institution,
            clientInitials: e.institution.slice(0, 2).toUpperCase(),
            extratos: [],
            pendingCount: 0,
          };
        }
        groupMap.set(key, group);
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
  }, [filteredExtratos, groupBy]);

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

  const handleConsolidar = useCallback((extrato: Extrato) => {
    setConsolidarExtrato(extrato);
  }, []);

  const handleConfirmConsolidar = useCallback((extratoId: string) => {
    setConsolidatedIds((prev) => new Set(prev).add(extratoId));
    setConsolidarExtrato(null);
  }, []);

  const consolidatedCount = consolidatedGroups.reduce((sum, g) => sum + g.extratos.length, 0);

  return (
    <div className="flex flex-col gap-6 px-8 pb-32 pt-6">
      <ConsolidadorHeader
        summary={summary}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        historicalCount={historicalPendencies.length}
        onOpenHistorical={() => setHistoricalOpen(true)}
        activeStatusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <ConsolidadorFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />

      {actionGroups.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="sticky top-0 z-10 -mx-2 bg-background/95 px-2 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">Ação Necessária</h2>
              <span className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-orange-400">
                {actionGroups.reduce((sum, g) => sum + g.extratos.length, 0)}
              </span>
            </div>
          </div>
          {actionGroups.slice(0, visibleCount).map((group) => (
            <ClientExtratoGroup
              key={group.clientId}
              group={group}
              isExpanded={expandedClients.has(group.clientId)}
              onToggle={() => toggleClient(group.clientId)}
              onConsolidar={handleConsolidar}
              labelField={groupBy === "institution" ? "client" : "institution"}
            />
          ))}
          {actionGroups.length > visibleCount && (
            <button
              onClick={() => setVisibleCount((prev) => prev + 20)}
              className="mx-auto mt-2 rounded-lg border border-border bg-white/5 px-6 py-2 text-sm font-medium text-gray-300 hover:bg-white/10"
            >
              Carregar mais ({actionGroups.length - visibleCount} restantes)
            </button>
          )}
        </div>
      )}

      {actionGroups.length === 0 && consolidatedGroups.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-500">
          Nenhum extrato encontrado para os filtros selecionados.
        </div>
      )}

      {consolidatedGroups.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="border-t border-border pt-4">
            <Collapsible open={consolidadosOpen} onOpenChange={setConsolidadosOpen}>
              <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-400 hover:bg-white/5">
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${consolidadosOpen ? "rotate-90" : ""}`}
                />
                <span>Consolidados</span>
                <span className="inline-flex items-center rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-400">
                  {consolidatedCount}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-col gap-1">
                  {consolidatedGroups.slice(0, visibleConsolidatedCount).map((group) => (
                    <ClientExtratoGroup
                      key={group.clientId}
                      group={group}
                      isExpanded={expandedClients.has(group.clientId)}
                      onToggle={() => toggleClient(group.clientId)}
                      onConsolidar={handleConsolidar}
                      labelField={groupBy === "institution" ? "client" : "institution"}
                    />
                  ))}
                  {consolidatedGroups.length > visibleConsolidatedCount && (
                    <button
                      onClick={() => setVisibleConsolidatedCount((prev) => prev + 20)}
                      className="mx-auto mt-2 rounded-lg border border-border bg-white/5 px-6 py-2 text-sm font-medium text-gray-300 hover:bg-white/10"
                    >
                      Carregar mais ({consolidatedGroups.length - visibleConsolidatedCount}{" "}
                      restantes)
                    </button>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      )}

      <HistoricalPendenciesModal
        open={historicalOpen}
        onOpenChange={setHistoricalOpen}
        pendencies={historicalPendencies}
      />

      <ConsolidarModal
        open={!!consolidarExtrato}
        onOpenChange={(open) => {
          if (!open) setConsolidarExtrato(null);
        }}
        extrato={consolidarExtrato}
        onConfirm={handleConfirmConsolidar}
      />
    </div>
  );
}
