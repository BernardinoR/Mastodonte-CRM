import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
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
import { apiRequest } from "@/shared/lib/queryClient";
import { supabase } from "@/shared/lib/supabase";
import { useToast } from "@/shared/hooks/use-toast";
import {
  buildExtratos,
  buildPendencias,
  getAllPendingMonths,
  getPendingMonthsForConta,
  type DbConta,
  type DbWhatsappGroup,
} from "../utils/buildExtratos";
import type {
  Extrato,
  ExtratoStatus,
  ExtratoCollectionMethod,
  ClientExtratoGroup as ClientGroupType,
  ExtratoStatusSummary,
  VerificationResult,
} from "../types/extrato";
import { verificationKey } from "../types/extrato";
import { getVisibleContaTypes } from "../utils/contaVisibility";

function formatMonthParam(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${yyyy}`;
}

const CONTA_SELECT = `
  id, client_id, type, start_date, end_date, account_name, canais,
  manager_phone, manager_email, manager_name,
  whatsapp_group_id, whatsapp_group_linked,
  client:clients!client_id(name, initials, emails, primary_email_index, phone),
  institution:institutions!institution_id(name, attachment_count, currency),
  extrato_statuses(id, status, requested_at, received_at, consolidated_at, updated_at, competencia)
`;

export default function Consolidador() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [groupBy, setGroupBy] = useState<"client" | "institution">("client");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExtratoStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    let m = now.getMonth(); // 0-indexed, previous month = current getMonth() value as 1-indexed
    let y = now.getFullYear();
    if (m === 0) {
      m = 12;
      y--;
    } else {
      /* m is already the previous month (1-indexed) */
    }
    const lastClosedStr = `${String(m).padStart(2, "0")}/${y}`;
    // If no types visible for the latest month, go one month further back
    if (getVisibleContaTypes(lastClosedStr).size === 0) {
      m--;
      if (m === 0) {
        m = 12;
        y--;
      }
    }
    return new Date(y, m - 1, 1);
  });
  const [historicalOpen, setHistoricalOpen] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [methodOverrides, setMethodOverrides] = useState<Map<string, ExtratoCollectionMethod>>(
    new Map(),
  );
  const [consolidadosOpen, setConsolidadosOpen] = useState(false);
  const [verificationFilter, setVerificationFilter] = useState(false);
  const [consolidarExtrato, setConsolidarExtrato] = useState<Extrato | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [visibleConsolidatedCount, setVisibleConsolidatedCount] = useState(20);

  const [extratos, setExtratos] = useState<Extrato[]>([]);
  const [historicalPendencies, setHistoricalPendencies] = useState<Extrato[]>([]);
  const [rawContas, setRawContas] = useState<DbConta[]>([]);
  const [verificationMap, setVerificationMap] = useState<Map<string, VerificationResult>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);
  const [syncingVerification, setSyncingVerification] = useState(false);

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  // Fetch extratos and pendencias via Supabase direct
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const month = formatMonthParam(selectedMonth);

      const [contasResult, whatsappResult] = await Promise.all([
        supabase.from("contas").select(CONTA_SELECT).eq("status", "Ativa"),
        supabase.from("whatsapp_groups").select("id, name, link").eq("status", "Ativo"),
      ]);

      if (contasResult.error) throw contasResult.error;

      const contas = (contasResult.data ?? []) as unknown as DbConta[];
      const whatsappGroups = (whatsappResult.data ?? []) as unknown as DbWhatsappGroup[];

      setRawContas(contas);
      setExtratos(buildExtratos(contas, whatsappGroups, month));

      const historicalMonths = getAllPendingMonths(contas);
      setHistoricalPendencies(buildPendencias(contas, whatsappGroups, historicalMonths));

      // Verification is supplementary — fetch separately to not block main data
      try {
        const headers = await authHeaders();
        const res = await fetch("/api/consolidador/verification-summary", { headers });
        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const verificationData = (await res.json()) as VerificationResult[];
            const vMap = new Map<string, VerificationResult>();
            for (const v of verificationData) {
              vMap.set(
                verificationKey(v.client_name, v.competencia, v.instituicao, v.nome_conta),
                v,
              );
            }
            setVerificationMap(vMap);
          }
        }
      } catch {
        // Silently ignore — verification indicator is optional
      }
    } catch (error) {
      console.error("Failed to fetch consolidador data:", error);
      setExtratos([]);
      setHistoricalPendencies([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, authHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setVisibleCount(20);
    setVisibleConsolidatedCount(20);
  }, [statusFilter, typeFilter, searchTerm]);

  const extratosWithOverrides: Extrato[] = useMemo(() => {
    return extratos.map((e) => {
      const methodOverride = methodOverrides.get(e.contaId);
      if (methodOverride) return { ...e, collectionMethod: methodOverride };
      return e;
    });
  }, [extratos, methodOverrides]);

  const summary: ExtratoStatusSummary = useMemo(() => {
    return extratosWithOverrides.reduce(
      (acc, e) => {
        if (e.status === "Pendente") acc.pendentes++;
        else if (e.status === "Solicitado") acc.solicitados++;
        else if (e.status === "Recebido") acc.recebidos++;
        else if (e.status === "Consolidado") acc.consolidados++;
        return acc;
      },
      { pendentes: 0, solicitados: 0, recebidos: 0, consolidados: 0 },
    );
  }, [extratosWithOverrides]);

  const verificationRedCount = useMemo(() => {
    const month = formatMonthParam(selectedMonth);
    let count = 0;
    verificationMap.forEach((v) => {
      if (v.competencia === month && !v.all_green) count++;
    });
    return count;
  }, [verificationMap, selectedMonth]);

  const filteredExtratos = useMemo(() => {
    return extratosWithOverrides.filter((e) => {
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
  }, [extratosWithOverrides, searchTerm, statusFilter, typeFilter]);

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
      const consolidatedExtratos = g.extratos.filter((e) => e.status === "Consolidado");
      const actionExtratos = g.extratos.filter((e) => e.status !== "Consolidado");

      if (actionExtratos.length > 0) {
        action.push({
          ...g,
          extratos: actionExtratos,
          pendingCount: g.pendingCount,
        });
      }

      if (consolidatedExtratos.length > 0) {
        consolidated.push({
          ...g,
          extratos: consolidatedExtratos,
          pendingCount: 0,
        });
      }
    }

    return { actionGroups: action, consolidatedGroups: consolidated };
  }, [filteredExtratos, groupBy]);

  const verificationRedGroups = useMemo(() => {
    if (!verificationFilter) return [];
    const groups: ClientGroupType[] = [];
    for (const g of consolidatedGroups) {
      const redExtratos = g.extratos.filter((e) => {
        const v = verificationMap.get(
          verificationKey(e.clientName, e.referenceMonth, e.institution, e.accountType),
        );
        return v && !v.all_green;
      });
      if (redExtratos.length > 0) {
        groups.push({ ...g, extratos: redExtratos, pendingCount: 0 });
      }
    }
    return groups;
  }, [verificationFilter, consolidatedGroups, verificationMap]);

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

  const pendingMonthsMap = useMemo(() => {
    const allMonths = getAllPendingMonths(rawContas);
    const map = new Map<string, string[]>();
    for (const conta of rawContas) {
      const pending = getPendingMonthsForConta(conta, allMonths);
      if (pending.length > 0) map.set(conta.id, pending);
    }
    return map;
  }, [rawContas]);

  const handleBatchStatusChange = useCallback(
    async (contaId: string, months: string[], newStatus: ExtratoStatus) => {
      // Snapshot previous statuses for revert
      const prevExtratos = extratos.filter((e) => e.contaId === contaId);
      const prevHistorical = historicalPendencies.filter((e) => e.contaId === contaId);

      const now = new Date().toISOString();
      const timestamps: Partial<Extrato> = {};
      if (newStatus === "Solicitado") timestamps.requestedAt = now;
      if (newStatus === "Recebido") timestamps.receivedAt = now;
      if (newStatus === "Consolidado") timestamps.consolidatedAt = now;

      // Optimistic update for current month extratos
      setExtratos((prev) =>
        prev.map((e) =>
          e.contaId === contaId && months.includes(e.referenceMonth)
            ? { ...e, status: newStatus, ...timestamps }
            : e,
        ),
      );

      // Optimistic update for historical pendencies
      setHistoricalPendencies((prev) =>
        prev.map((e) =>
          e.contaId === contaId && months.includes(e.referenceMonth)
            ? { ...e, status: newStatus, ...timestamps }
            : e,
        ),
      );

      try {
        const headers = await authHeaders();
        await apiRequest(
          "PATCH",
          `/api/consolidador/extratos/${contaId}/status-batch`,
          { competencias: months, status: newStatus },
          headers,
        );
      } catch (error) {
        console.error("Failed to batch update statuses:", error);
        toast({
          title: "Erro ao atualizar status",
          description: "As alterações foram revertidas. Tente novamente.",
          variant: "destructive",
        });
        // Revert
        setExtratos((prev) =>
          prev.map((e) => {
            const orig = prevExtratos.find((o) => o.id === e.id);
            return orig ? { ...e, status: orig.status } : e;
          }),
        );
        setHistoricalPendencies((prev) =>
          prev.map((e) => {
            const orig = prevHistorical.find((o) => o.id === e.id);
            return orig ? { ...e, status: orig.status } : e;
          }),
        );
      }
    },
    [extratos, historicalPendencies, authHeaders, toast],
  );

  const handleConsolidar = useCallback((extrato: Extrato) => {
    setConsolidarExtrato(extrato);
  }, []);

  const updateExtratoStatus = useCallback(
    async (extratoId: string, newStatus: ExtratoStatus) => {
      const extrato = extratos.find((e) => e.id === extratoId);
      if (!extrato) return;

      const previousStatus = extrato.status;

      // Optimistic timestamps (mirroring server/routes.ts L783-786)
      const now = new Date().toISOString();
      const timestamps: Partial<Extrato> = {};
      if (newStatus === "Solicitado") timestamps.requestedAt = now;
      if (newStatus === "Recebido") timestamps.receivedAt = now;
      if (newStatus === "Consolidado") timestamps.consolidatedAt = now;

      // 1. Optimistic update — instant UI (only the affected row)
      setExtratos((prev) =>
        prev.map((e) => (e.id === extratoId ? { ...e, status: newStatus, ...timestamps } : e)),
      );

      // 2. Sync with server
      try {
        const headers = await authHeaders();
        await apiRequest(
          "PATCH",
          `/api/consolidador/extratos/${extrato.contaId}/status`,
          { competencia: formatMonthParam(selectedMonth), status: newStatus },
          headers,
        );
      } catch (error) {
        console.error("Failed to update status:", error);
        toast({
          title: "Erro ao atualizar status",
          description: "A alteração foi revertida. Tente novamente.",
          variant: "destructive",
        });
        // 3. Revert only the affected row (no refetch)
        setExtratos((prev) =>
          prev.map((e) => (e.id === extratoId ? { ...e, status: previousStatus } : e)),
        );
      }
    },
    [extratos, selectedMonth, authHeaders, toast],
  );

  const handleConfirmConsolidar = useCallback(
    async (extratoId: string) => {
      setConsolidarExtrato(null);
      await updateExtratoStatus(extratoId, "Consolidado");
    },
    [updateExtratoStatus],
  );

  const handleStatusChange = useCallback(
    (extratoId: string, status: ExtratoStatus) => {
      updateExtratoStatus(extratoId, status);
    },
    [updateExtratoStatus],
  );

  const handleMethodChange = useCallback((extratoId: string, method: ExtratoCollectionMethod) => {
    setMethodOverrides((prev) => new Map(prev).set(extratoId, method));
  }, []);

  const handleSync = useCallback(
    async (extrato: Extrato) => {
      try {
        const headers = await authHeaders();
        await apiRequest(
          "POST",
          `/api/consolidador/extratos/${extrato.contaId}/sync`,
          { competencia: formatMonthParam(selectedMonth) },
          headers,
        );
        fetchData();
      } catch (error) {
        console.error("Failed to sync:", error);
      }
    },
    [selectedMonth, authHeaders, fetchData],
  );

  const handleSyncVerification = useCallback(async () => {
    setSyncingVerification(true);
    try {
      const headers = await authHeaders();
      const competencia = formatMonthParam(selectedMonth);
      await apiRequest("POST", "/api/consolidador/sync-verification", { competencia }, headers);
      await fetchData();
      toast({ title: "Verificação sincronizada", description: `Competência ${competencia}` });
    } catch (error) {
      console.error("Failed to sync verification:", error);
      toast({
        title: "Erro ao sincronizar verificação",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSyncingVerification(false);
    }
  }, [selectedMonth, authHeaders, fetchData, toast]);

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
        verificationRedCount={verificationRedCount}
        verificationFilterActive={verificationFilter}
        onVerificationFilterToggle={() => setVerificationFilter((prev) => !prev)}
        onSyncVerification={handleSyncVerification}
        syncingVerification={syncingVerification}
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

      {loading && (
        <div className="py-12 text-center text-sm text-gray-500">Carregando extratos...</div>
      )}

      {!loading && verificationFilter && verificationRedGroups.length > 0 && (
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-3 py-3">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-400">
              Verificação com Problema
            </h2>
            <span className="inline-flex items-center rounded-md bg-red-500/20 px-2 py-0.5 text-[10px] font-black text-red-400">
              {verificationRedGroups.reduce((sum, g) => sum + g.extratos.length, 0)}
            </span>
          </div>
          {verificationRedGroups.map((group) => (
            <ClientExtratoGroup
              key={group.clientId}
              group={group}
              isExpanded={expandedClients.has(group.clientId)}
              onToggle={() => toggleClient(group.clientId)}
              onConsolidar={handleConsolidar}
              onSync={handleSync}
              labelField={groupBy === "institution" ? "client" : "institution"}
              groupBy={groupBy}
              verificationMap={verificationMap}
            />
          ))}
        </div>
      )}

      {!loading && verificationFilter && verificationRedGroups.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-500">
          Nenhuma verificação com problema encontrada.
        </div>
      )}

      {!loading && !verificationFilter && actionGroups.length > 0 && (
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-3 py-3">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Ação Necessária
            </h2>
            <span className="inline-flex items-center rounded-md bg-orange-500/20 px-2 py-0.5 text-[10px] font-black text-orange-400">
              {actionGroups.reduce((sum, g) => sum + g.extratos.length, 0)}
            </span>
          </div>
          {actionGroups.slice(0, visibleCount).map((group) => (
            <ClientExtratoGroup
              key={group.clientId}
              group={group}
              isExpanded={expandedClients.has(group.clientId)}
              onToggle={() => toggleClient(group.clientId)}
              onConsolidar={handleConsolidar}
              onStatusChange={handleStatusChange}
              onMethodChange={handleMethodChange}
              onSync={handleSync}
              pendingMonthsMap={pendingMonthsMap}
              onBatchStatusChange={handleBatchStatusChange}
              labelField={groupBy === "institution" ? "client" : "institution"}
              groupBy={groupBy}
              verificationMap={verificationMap}
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

      {!loading &&
        !verificationFilter &&
        actionGroups.length === 0 &&
        consolidatedGroups.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            Nenhum extrato encontrado para os filtros selecionados.
          </div>
        )}

      {!loading && !verificationFilter && consolidatedGroups.length > 0 && (
        <div className="flex flex-col gap-0 opacity-50">
          <div className="pt-4">
            <Collapsible open={consolidadosOpen} onOpenChange={setConsolidadosOpen}>
              <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-600 hover:bg-white/5">
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${consolidadosOpen ? "rotate-90" : ""}`}
                />
                <span>Consolidados</span>
                <span className="inline-flex items-center rounded-md bg-emerald-950/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
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
                      onSync={handleSync}
                      labelField={groupBy === "institution" ? "client" : "institution"}
                      verificationMap={verificationMap}
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
        verificationMap={verificationMap}
        onMonthClick={(monthKey) => {
          const [mm, yyyy] = monthKey.split("/");
          setSelectedMonth(new Date(parseInt(yyyy), parseInt(mm) - 1, 1));
          setHistoricalOpen(false);
        }}
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
