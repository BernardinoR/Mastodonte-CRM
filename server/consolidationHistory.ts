import { prisma } from "./db";
import { externalSupabase } from "./externalSupabase";

interface ContaHistoricoEntry {
  id: string;
  competencia: string;
  status: "Consolidado" | "Pedir Extrato";
  description?: string;
}

interface ConsolidadoRecord {
  Competencia: string;
  Data: string;
  Instituicao: string;
  Nome?: string;
  nomeConta?: string;
}

const CONSOLIDADO_SELECT = "Competencia, Data, Instituicao, Nome, nomeConta" as const;

function getDefaultExtratoData(contaType: string): { status: string; receivedAt?: Date } {
  if (contaType === "Automático") {
    return { status: "Recebido", receivedAt: new Date() };
  }
  return { status: "Pendente" };
}

function removeAccents(str: string): string {
  return str
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function parseConsolidatedDate(data?: string | null): Date {
  if (!data) return new Date();
  const parts = data.split("/");
  if (parts.length !== 3) return new Date();
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return new Date();
  return new Date(year, month - 1, day);
}

function parseMonthYear(str: string): { month: number; year: number } | null {
  const parts = str.split("/");
  if (parts.length !== 2) return null;
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);
  if (isNaN(month) || isNaN(year)) return null;
  return { month, year };
}

function generateMonthRange(startDate: string): string[] {
  const parsed = parseMonthYear(startDate);
  if (!parsed) return [];

  const now = new Date();
  let lastClosedMonth = now.getMonth(); // getMonth() is 0-indexed, so without +1 gives previous month
  let lastClosedYear = now.getFullYear();
  if (lastClosedMonth === 0) {
    lastClosedMonth = 12;
    lastClosedYear--;
  }

  const months: string[] = [];
  let { month, year } = parsed;

  while (year < lastClosedYear || (year === lastClosedYear && month <= lastClosedMonth)) {
    const mm = String(month).padStart(2, "0");
    months.push(`${mm}/${year}`);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return months.reverse();
}

const MONTH_ABBR: Record<string, string> = {
  "01": "Jan",
  "02": "Fev",
  "03": "Mar",
  "04": "Abr",
  "05": "Mai",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Set",
  "10": "Out",
  "11": "Nov",
  "12": "Dez",
};

function formatCompetencia(mmYyyy: string): string {
  const [mm, yyyy] = mmYyyy.split("/");
  const abbr = MONTH_ABBR[mm] || mm;
  return `${abbr}/${yyyy.slice(2)}`;
}

function matchesAccount(
  record: ConsolidadoRecord,
  normalizedClientName: string,
  normalizedInst: string,
  accountName: string | null,
): boolean {
  if (removeAccents(record.Nome || "") !== normalizedClientName) return false;
  if (removeAccents(record.Instituicao) !== normalizedInst) return false;
  if (accountName) {
    return removeAccents(record.nomeConta || "") === removeAccents(accountName);
  }
  return !record.nomeConta || record.nomeConta.trim() === "";
}

async function upsertExtratoFromMatch(
  contaId: string,
  contaType: string,
  competencia: string,
  match: ConsolidadoRecord | undefined,
) {
  if (match) {
    const consolidatedAt = parseConsolidatedDate(match.Data);
    return prisma.extratoStatus.upsert({
      where: { contaId_competencia: { contaId, competencia } },
      create: { contaId, competencia, status: "Consolidado", consolidatedAt },
      update: { status: "Consolidado", consolidatedAt },
    });
  }
  // Sem match — reverter "Consolidado" falso, preservar outros status
  const existing = await prisma.extratoStatus.findUnique({
    where: { contaId_competencia: { contaId, competencia } },
  });
  if (existing && existing.status === "Consolidado") {
    return prisma.extratoStatus.update({
      where: { id: existing.id },
      data: { ...getDefaultExtratoData(contaType), consolidatedAt: null },
    });
  }
  // Automático nunca deve ficar Pendente — corrigir para Recebido
  if (existing && contaType === "Automático" && existing.status === "Pendente") {
    return prisma.extratoStatus.update({
      where: { id: existing.id },
      data: { status: "Recebido", receivedAt: new Date() },
    });
  }
  if (existing) return existing;
  return prisma.extratoStatus.create({
    data: { contaId, competencia, ...getDefaultExtratoData(contaType) },
  });
}

// ============================================
// Sync Functions
// ============================================

function getRelevantMonths(n: number): string[] {
  const now = new Date();
  let month = now.getMonth(); // 0-indexed, so this gives previous month number
  let year = now.getFullYear();
  if (month === 0) {
    month = 12;
    year--;
  }

  const months: string[] = [];
  for (let i = 0; i < n; i++) {
    const mm = String(month).padStart(2, "0");
    months.push(`${mm}/${year}`);
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
  }

  return months;
}

export async function syncAllExtratoStatuses(): Promise<{ synced: number }> {
  const months = getRelevantMonths(12);
  console.log(
    `[sync] Syncing ${months.length} months: ${months[0]} to ${months[months.length - 1]}`,
  );

  const contas = await prisma.conta.findMany({
    where: { status: "Ativa" },
    include: { client: true, institution: true },
  });

  if (contas.length === 0) return { synced: 0 };

  let totalSynced = 0;

  for (const month of months) {
    const eligibleContas = contas.filter((c) => isMonthInRange(month, c.startDate, c.endDate));
    if (eligibleContas.length === 0) continue;

    const contaIds = eligibleContas.map((c) => c.id);

    // 1 query por mês — usado como mapa para evitar writes desnecessários
    const existingStatuses = await prisma.extratoStatus.findMany({
      where: { contaId: { in: contaIds }, competencia: month },
    });
    const statusMap = new Map(existingStatuses.map((s) => [s.contaId, s]));

    // Single Supabase query per month
    const { data: allRecords, error } = await externalSupabase
      .from("ConsolidadoPerformance")
      .select(CONSOLIDADO_SELECT)
      .eq("Competencia", month);

    if (error) {
      console.error(`[sync] Supabase error for month ${month}:`, error);
      continue;
    }

    const supabaseRecords = (allRecords as ConsolidadoRecord[]) || [];

    for (const conta of eligibleContas) {
      const normalizedClientName = removeAccents(conta.client.name);
      const normalizedInst = removeAccents(conta.institution.name);

      const match = supabaseRecords.find((r) =>
        matchesAccount(r, normalizedClientName, normalizedInst, conta.accountName),
      );

      const existing = statusMap.get(conta.id);

      if (match) {
        // Tem match no Supabase → marcar Consolidado (só se ainda não está)
        if (existing?.status !== "Consolidado") {
          const consolidatedAt = parseConsolidatedDate(match.Data);
          await prisma.extratoStatus.upsert({
            where: { contaId_competencia: { contaId: conta.id, competencia: month } },
            create: {
              contaId: conta.id,
              competencia: month,
              status: "Consolidado",
              consolidatedAt,
            },
            update: { status: "Consolidado", consolidatedAt },
          });
          totalSynced++;
        }
      } else if (existing?.status === "Consolidado") {
        // Sem match mas estava Consolidado → REVERTER para Pendente
        await prisma.extratoStatus.update({
          where: { id: existing.id },
          data: { ...getDefaultExtratoData(conta.type), consolidatedAt: null },
        });
        totalSynced++;
      } else if (existing && conta.type === "Automático" && existing.status === "Pendente") {
        // Automático nunca deve ficar Pendente — corrigir para Recebido
        await prisma.extratoStatus.update({
          where: { id: existing.id },
          data: { status: "Recebido", receivedAt: new Date() },
        });
        totalSynced++;
      } else if (!existing) {
        // Sem match e sem registro → criar com status padrão
        await prisma.extratoStatus.create({
          data: { contaId: conta.id, competencia: month, ...getDefaultExtratoData(conta.type) },
        });
        totalSynced++;
      }
      // Sem match + status manual (Solicitado/Recebido/Pendente) → não toca
    }
  }

  console.log(`[sync] Total synced: ${totalSynced} records`);
  return { synced: totalSynced };
}

export async function syncContaExtratoStatuses(contaId: string): Promise<{ synced: number }> {
  const conta = await prisma.conta.findUnique({
    where: { id: contaId },
    include: { client: true, institution: true },
  });
  if (!conta) throw new Error("Conta not found");

  const monthRange = generateMonthRange(conta.startDate);
  if (monthRange.length === 0) return { synced: 0 };

  // Query Supabase for all records (no name filter in SQL — accents break ILIKE)
  const { data: records, error } = await externalSupabase
    .from("ConsolidadoPerformance")
    .select(CONSOLIDADO_SELECT)
    .in("Competencia", monthRange);

  if (error) {
    console.error(`[sync-conta] Supabase error for conta ${contaId}:`, error);
    throw new Error(`Failed to query consolidation data: ${error.message}`);
  }

  const normalizedClientName = removeAccents(conta.client.name);
  const normalizedInst = removeAccents(conta.institution.name);
  const matchMap = new Map<string, ConsolidadoRecord>();
  for (const r of (records as ConsolidadoRecord[]) || []) {
    if (matchesAccount(r, normalizedClientName, normalizedInst, conta.accountName)) {
      matchMap.set(r.Competencia, r);
    }
  }

  let synced = 0;
  for (const month of monthRange) {
    await upsertExtratoFromMatch(contaId, conta.type, month, matchMap.get(month));
    synced++;
  }

  return { synced };
}

// ============================================
// Consolidador Functions
// ============================================

export async function syncContaWithSupabase(contaId: string, competencia: string) {
  const conta = await prisma.conta.findUnique({
    where: { id: contaId },
    include: { client: true, institution: true },
  });
  if (!conta) throw new Error("Conta not found");

  const normalizedClientName = removeAccents(conta.client.name);
  const normalizedInst = removeAccents(conta.institution.name);

  // No name filter in SQL — accents break ILIKE; match by name in JS with removeAccents
  const { data: records, error } = await externalSupabase
    .from("ConsolidadoPerformance")
    .select(CONSOLIDADO_SELECT)
    .eq("Competencia", competencia);

  if (error) {
    console.error("Supabase sync error:", error);
    throw new Error(`Failed to query consolidation data: ${error.message}`);
  }

  const match = ((records as ConsolidadoRecord[]) || []).find((r) =>
    matchesAccount(r, normalizedClientName, normalizedInst, conta.accountName),
  );

  const result = await upsertExtratoFromMatch(contaId, conta.type, competencia, match);

  if (match) {
    try {
      await triggerVerification(match.Nome, competencia);
    } catch (err) {
      console.error("Failed to trigger verification:", err);
    }
  }

  return result;
}

function isMonthInRange(month: string, startDate: string, endDate: string | null): boolean {
  const parsed = parseMonthYear(month);
  const parsedStart = parseMonthYear(startDate);
  if (!parsed || !parsedStart) return false;

  const monthVal = parsed.year * 12 + parsed.month;
  const startVal = parsedStart.year * 12 + parsedStart.month;
  if (monthVal < startVal) return false;

  if (endDate) {
    const parsedEnd = parseMonthYear(endDate);
    if (parsedEnd) {
      const endVal = parsedEnd.year * 12 + parsedEnd.month;
      if (monthVal > endVal) return false;
    }
  }
  return true;
}

export async function triggerVerification(clientName: string, competencia: string) {
  const { error } = await externalSupabase.rpc("calculate_verification", {
    p_client_name: clientName,
    p_competencia: competencia,
  });
  if (error) throw new Error(`Verification trigger error: ${error.message}`);
}

export async function getVerificationResults() {
  const { data, error } = await externalSupabase
    .from("verification_results")
    .select(
      "client_name,competencia,instituicao,nome_conta,patrimonio_status,diferenca,has_unclassified,unclassified_count,has_missing_yield,missing_yield_count,has_new_assets,new_asset_count,all_green,verified_at",
    );
  if (error) throw new Error(`Verification results error: ${error.message}`);
  return data || [];
}

export async function getContaHistorico(contaId: string): Promise<ContaHistoricoEntry[]> {
  const conta = await prisma.conta.findUnique({
    where: { id: contaId },
    include: { client: true, institution: true },
  });

  if (!conta) throw new Error("Conta not found");

  const monthRange = generateMonthRange(conta.startDate);
  if (monthRange.length === 0) return [];

  const statuses = await prisma.extratoStatus.findMany({
    where: { contaId },
  });
  const statusMap = new Map(statuses.map((s) => [s.competencia, s]));

  return monthRange.map((comp, i) => {
    const es = statusMap.get(comp);
    if (es?.status === "Consolidado" && es.consolidatedAt) {
      return {
        id: `${contaId}-hist-${i}`,
        competencia: formatCompetencia(comp),
        status: "Consolidado" as const,
        description: `Consolidado em ${es.consolidatedAt.toISOString().split("T")[0]}`,
      };
    }
    return {
      id: `${contaId}-hist-${i}`,
      competencia: formatCompetencia(comp),
      status: "Pedir Extrato" as const,
    };
  });
}
