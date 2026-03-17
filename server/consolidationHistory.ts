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
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const months: string[] = [];
  let { month, year } = parsed;

  while (year < currentYear || (year === currentYear && month <= currentMonth)) {
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

export async function getContaHistorico(contaId: string): Promise<ContaHistoricoEntry[]> {
  const conta = await prisma.conta.findUnique({
    where: { id: contaId },
    include: { client: true, institution: true },
  });

  if (!conta) throw new Error("Conta not found");

  const monthRange = generateMonthRange(conta.startDate);
  if (monthRange.length === 0) return [];

  console.log(
    `[historico] Querying for client="${conta.client.name}", institution="${conta.institution.name}", startDate="${conta.startDate}"`,
  );

  const { data: records, error } = await externalSupabase
    .from("ConsolidadoPerformance")
    .select("Competencia, Data, Instituicao")
    .ilike("Nome", conta.client.name);

  if (error) {
    console.error("Supabase query error:", error);
    throw new Error(`Failed to query consolidation data: ${error.message}`);
  }

  const normalizedInst = removeAccents(conta.institution.name);
  const filtered = ((records as ConsolidadoRecord[]) || []).filter(
    (r) => removeAccents(r.Instituicao) === normalizedInst,
  );

  console.log(
    `[historico] Found ${records?.length ?? 0} records, ${filtered.length} after institution filter`,
  );

  const consolidatedMap = new Map<string, string>();
  for (const r of filtered) {
    if (r.Competencia && r.Data) {
      consolidatedMap.set(r.Competencia, r.Data);
    }
  }

  return monthRange.map((comp, i) => {
    const dataConsolidacao = consolidatedMap.get(comp);
    if (dataConsolidacao) {
      return {
        id: `${contaId}-hist-${i}`,
        competencia: formatCompetencia(comp),
        status: "Consolidado" as const,
        description: `Consolidado em ${dataConsolidacao}`,
      };
    }
    return {
      id: `${contaId}-hist-${i}`,
      competencia: formatCompetencia(comp),
      status: "Pedir Extrato" as const,
    };
  });
}
