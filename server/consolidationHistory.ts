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
}

interface ConsolidadorExtrato {
  id: string;
  contaId: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  institution: string;
  accountType: string;
  collectionMethod: string;
  status: string;
  referenceMonth: string;
  requestedAt?: string;
  receivedAt?: string;
  consolidatedAt?: string;
}

function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
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

    const existingStatuses = await prisma.extratoStatus.findMany({
      where: { contaId: { in: contaIds }, competencia: month },
    });
    const existingSet = new Set(existingStatuses.map((s) => s.contaId));

    const contasWithoutStatus = eligibleContas.filter((c) => !existingSet.has(c.id));
    if (contasWithoutStatus.length === 0) continue;

    // Single Supabase query per month
    const { data: allRecords, error } = await externalSupabase
      .from("ConsolidadoPerformance")
      .select("Competencia, Data, Instituicao, Nome")
      .eq("Competencia", month);

    if (error) {
      console.error(`[sync] Supabase error for month ${month}:`, error);
      continue;
    }

    const supabaseRecords = (allRecords as ConsolidadoRecord[]) || [];

    for (const conta of contasWithoutStatus) {
      const normalizedClientName = removeAccents(conta.client.name);
      const normalizedInst = removeAccents(conta.institution.name);

      const match = supabaseRecords.find(
        (r) =>
          removeAccents(r.Nome || "") === normalizedClientName &&
          removeAccents(r.Instituicao) === normalizedInst,
      );

      if (match) {
        const consolidatedAt = match.Data ? new Date(match.Data) : new Date();
        await prisma.extratoStatus.upsert({
          where: { contaId_competencia: { contaId: conta.id, competencia: month } },
          create: { contaId: conta.id, competencia: month, status: "Consolidado", consolidatedAt },
          update: {},
        });
      } else {
        await prisma.extratoStatus.upsert({
          where: { contaId_competencia: { contaId: conta.id, competencia: month } },
          create: { contaId: conta.id, competencia: month, status: "Pendente" },
          update: {},
        });
      }

      totalSynced++;
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

  const existingStatuses = await prisma.extratoStatus.findMany({
    where: { contaId },
  });
  const existingSet = new Set(existingStatuses.map((s) => s.competencia));

  const missingMonths = monthRange.filter((m) => !existingSet.has(m));
  if (missingMonths.length === 0) return { synced: 0 };

  // Query Supabase for this client's records across all missing months
  const { data: records, error } = await externalSupabase
    .from("ConsolidadoPerformance")
    .select("Competencia, Data, Instituicao, Nome")
    .ilike("Nome", conta.client.name)
    .in("Competencia", missingMonths);

  if (error) {
    console.error(`[sync-conta] Supabase error for conta ${contaId}:`, error);
    throw new Error(`Failed to query consolidation data: ${error.message}`);
  }

  const normalizedInst = removeAccents(conta.institution.name);
  const matchMap = new Map<string, ConsolidadoRecord>();
  for (const r of (records as ConsolidadoRecord[]) || []) {
    if (removeAccents(r.Instituicao) === normalizedInst) {
      matchMap.set(r.Competencia, r);
    }
  }

  let synced = 0;
  for (const month of missingMonths) {
    const match = matchMap.get(month);
    if (match) {
      const consolidatedAt = match.Data ? new Date(match.Data) : new Date();
      await prisma.extratoStatus.upsert({
        where: { contaId_competencia: { contaId, competencia: month } },
        create: { contaId, competencia: month, status: "Consolidado", consolidatedAt },
        update: {},
      });
    } else {
      await prisma.extratoStatus.upsert({
        where: { contaId_competencia: { contaId, competencia: month } },
        create: { contaId, competencia: month, status: "Pendente" },
        update: {},
      });
    }
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

  const normalizedInst = removeAccents(conta.institution.name);

  const { data: records, error } = await externalSupabase
    .from("ConsolidadoPerformance")
    .select("Competencia, Data, Instituicao")
    .ilike("Nome", conta.client.name)
    .eq("Competencia", competencia);

  if (error) {
    console.error("Supabase sync error:", error);
    throw new Error(`Failed to query consolidation data: ${error.message}`);
  }

  const match = ((records as ConsolidadoRecord[]) || []).find(
    (r) => removeAccents(r.Instituicao) === normalizedInst,
  );

  if (match) {
    const consolidatedAt = match.Data ? new Date(match.Data) : new Date();
    return prisma.extratoStatus.upsert({
      where: { contaId_competencia: { contaId, competencia } },
      create: { contaId, competencia, status: "Consolidado", consolidatedAt },
      update: { status: "Consolidado", consolidatedAt },
    });
  }

  // Check if there's an existing record - only reset if it was Consolidado
  const existing = await prisma.extratoStatus.findUnique({
    where: { contaId_competencia: { contaId, competencia } },
  });

  if (existing && existing.status === "Consolidado") {
    return prisma.extratoStatus.update({
      where: { id: existing.id },
      data: { status: "Pendente", consolidatedAt: null },
    });
  }

  if (existing) return existing;

  return prisma.extratoStatus.create({
    data: { contaId, competencia, status: "Pendente" },
  });
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

function computeInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export async function getConsolidadorExtratos(month: string): Promise<ConsolidadorExtrato[]> {
  // Fetch all active contas with relations
  const contas = await prisma.conta.findMany({
    where: { status: "Ativa" },
    include: { client: true, institution: true },
  });

  // Filter contas whose date range includes the selected month
  const eligibleContas = contas.filter((c) => isMonthInRange(month, c.startDate, c.endDate));

  if (eligibleContas.length === 0) return [];

  const contaIds = eligibleContas.map((c) => c.id);

  // Fetch existing ExtratoStatus records for this month
  const existingStatuses = await prisma.extratoStatus.findMany({
    where: { contaId: { in: contaIds }, competencia: month },
  });

  const statusMap = new Map(existingStatuses.map((s) => [s.contaId, s]));

  return eligibleContas.map((conta) => {
    const es = statusMap.get(conta.id);
    return {
      id: es?.id || conta.id,
      contaId: conta.id,
      clientId: conta.clientId,
      clientName: conta.client.name,
      clientInitials: conta.client.initials || computeInitials(conta.client.name),
      institution: conta.institution.name,
      accountType: conta.accountName || "",
      collectionMethod: conta.type,
      status: es?.status || "Pendente",
      referenceMonth: month,
      requestedAt: es?.requestedAt?.toISOString(),
      receivedAt: es?.receivedAt?.toISOString(),
      consolidatedAt: es?.consolidatedAt?.toISOString(),
    };
  });
}

export async function getConsolidadorPendencias(
  beforeMonth: string,
): Promise<ConsolidadorExtrato[]> {
  const parsed = parseMonthYear(beforeMonth);
  if (!parsed) return [];

  // Calculate 3 months before
  const months: string[] = [];
  let { month: m, year: y } = parsed;
  for (let i = 0; i < 3; i++) {
    m--;
    if (m < 1) {
      m = 12;
      y--;
    }
    months.push(`${String(m).padStart(2, "0")}/${y}`);
  }

  const results = await Promise.all(months.map((month) => getConsolidadorExtratos(month)));
  const allExtratos = results.flatMap((extratos) =>
    extratos.filter((e) => e.status !== "Consolidado"),
  );

  return allExtratos;
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
