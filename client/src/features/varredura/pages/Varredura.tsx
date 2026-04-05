import { useState, useMemo, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";
import { useToast } from "@/shared/hooks/use-toast";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";
import { DaySelector } from "../components/DaySelector";
import { ProgressBar } from "../components/ProgressBar";
import { InstitutionCard } from "../components/InstitutionCard";
import { ManagerGroupCard } from "../components/ManagerGroupCard";
import {
  buildDirectInstitutions,
  buildManagerGroups,
  formatCompetencia,
  type VarreduraConta,
} from "../utils/buildVarredura";

const CONTA_SELECT = `
  id, client_id, type, start_date, end_date, account_name,
  manager_phone, manager_email, manager_name,
  sweep_active, sweep_frequency,
  client:clients!client_id(name, initials, emails, primary_email_index, phone),
  institution:institutions!institution_id(id, name, attachment_count, currency, access_url),
  extrato_statuses(id, status, requested_at, received_at, consolidated_at, updated_at, competencia)
`;

export default function Varredura() {
  const { toast } = useToast();
  const { data: userData } = useCurrentUser();
  const userId = userData?.user?.id;
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [contas, setContas] = useState<VarreduraConta[]>([]);
  const [checkedInstitutionIds, setCheckedInstitutionIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const competencia = useMemo(() => formatCompetencia(selectedDay), [selectedDay]);

  const dateStr = useMemo(() => {
    const y = selectedDay.getFullYear();
    const m = String(selectedDay.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDay.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDay]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [contasResult, checksResult] = await Promise.all([
        supabase.from("contas").select(CONTA_SELECT).eq("status", "Ativa"),
        supabase.from("varredura_checks").select("institution_id").eq("date", dateStr),
      ]);

      if (contasResult.error) throw contasResult.error;
      setContas((contasResult.data ?? []) as unknown as VarreduraConta[]);

      const ids = new Set(
        (checksResult.data ?? []).map((c: { institution_id: number }) => c.institution_id),
      );
      setCheckedInstitutionIds(ids);
    } catch (error) {
      console.error("Failed to fetch varredura data:", error);
      setContas([]);
      setCheckedInstitutionIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const directInstitutions = useMemo(
    () => buildDirectInstitutions(contas, competencia, checkedInstitutionIds),
    [contas, competencia, checkedInstitutionIds],
  );

  const managerGroups = useMemo(
    () => buildManagerGroups(contas, competencia),
    [contas, competencia],
  );

  const checkedDirect = directInstitutions.filter((i) => i.checked).length;
  const totalDirect = directInstitutions.length;

  const solicitedManager = managerGroups.reduce(
    (s, g) => s + g.clients.filter((c) => c.status === "solicitado").length,
    0,
  );
  const totalManagerClients = managerGroups.reduce((s, g) => s + g.clients.length, 0);

  const toggleInstitution = useCallback(
    async (institutionId: number, currentlyChecked: boolean) => {
      if (!userId) return;

      // Optimistic update
      setCheckedInstitutionIds((prev) => {
        const next = new Set(prev);
        if (currentlyChecked) {
          next.delete(institutionId);
        } else {
          next.add(institutionId);
        }
        return next;
      });

      try {
        if (currentlyChecked) {
          const { error } = await supabase
            .from("varredura_checks")
            .delete()
            .match({ user_id: userId, institution_id: institutionId, date: dateStr });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("varredura_checks")
            .insert({ user_id: userId, institution_id: institutionId, date: dateStr });
          if (error) throw error;
        }
      } catch (error) {
        console.error("Failed to toggle institution:", error);
        toast({
          title: "Erro ao atualizar status",
          description: "Tente novamente.",
          variant: "destructive",
        });
        fetchData();
      }
    },
    [userId, dateStr, toast, fetchData],
  );

  const pendingManagerCount = managerGroups.reduce(
    (s, g) => s + g.clients.filter((c) => c.status !== "verificado").length,
    0,
  );

  return (
    <div className="flex flex-col gap-6 px-8 pb-32 pt-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-[#ededed]" data-testid="text-page-title">
          Varredura de Saldo
        </h1>
        <div className="h-6 w-px bg-[#333]" />
        <DaySelector value={selectedDay} onChange={setSelectedDay} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#8c8c8c]" />
        </div>
      ) : (
        <>
          <ProgressBar
            checkedDirect={checkedDirect}
            totalDirect={totalDirect}
            solicitedManager={solicitedManager}
            totalManager={totalManagerClients}
          />

          {totalDirect > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-3">
                <h2
                  className="text-xs font-black uppercase tracking-[0.2em] text-[#666]"
                  data-testid="text-section-direct"
                >
                  Acesso Direto
                </h2>
                <span className="inline-flex items-center rounded-md bg-[rgba(110,207,142,0.1)] px-2 py-0.5 text-[10px] font-bold text-[#6ecf8e]">
                  {checkedDirect}/{totalDirect}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {directInstitutions.map((inst) => (
                  <InstitutionCard
                    key={inst.institutionName}
                    institutionName={inst.institutionName}
                    initials={inst.initials}
                    checked={inst.checked}
                    onToggle={() => toggleInstitution(inst.institutionId, inst.checked)}
                    accessUrl={inst.accessUrl}
                  />
                ))}
              </div>
            </section>
          )}

          {managerGroups.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-3">
                <h2
                  className="text-xs font-black uppercase tracking-[0.2em] text-[#666]"
                  data-testid="text-section-manager"
                >
                  Via Gerente
                </h2>
                <span className="inline-flex items-center rounded-md bg-[rgba(220,176,146,0.1)] px-2 py-0.5 text-[10px] font-bold text-[#dcb092]">
                  {pendingManagerCount} pendentes
                </span>
              </div>
              <div className="space-y-3">
                {managerGroups.map((group, idx) => (
                  <ManagerGroupCard
                    key={group.institutionName}
                    group={group}
                    defaultExpanded={idx === 0}
                  />
                ))}
              </div>
            </section>
          )}

          {totalDirect === 0 && managerGroups.length === 0 && (
            <div className="py-12 text-center text-sm text-[#8c8c8c]">
              Nenhuma conta ativa encontrada para este período.
            </div>
          )}
        </>
      )}
    </div>
  );
}
