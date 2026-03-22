import type { Extrato } from "../types/extrato";

// ============================================
// Supabase row types (snake_case)
// ============================================

interface DbExtratoStatus {
  id: string;
  status: string;
  requested_at: string | null;
  received_at: string | null;
  consolidated_at: string | null;
  updated_at: string | null;
  competencia: string;
}

interface DbClient {
  name: string;
  initials: string | null;
  emails: string[] | null;
  primary_email_index: number | null;
  phone: string | null;
}

interface DbInstitution {
  name: string;
}

export interface DbConta {
  id: string;
  client_id: string;
  type: string;
  start_date: string;
  end_date: string | null;
  account_name: string | null;
  canais: string[] | null;
  manager_phone: string | null;
  manager_email: string | null;
  manager_name: string | null;
  whatsapp_group_id: string | null;
  whatsapp_group_linked: boolean;
  client: DbClient;
  institution: DbInstitution;
  extrato_statuses: DbExtratoStatus[];
}

export interface DbWhatsappGroup {
  id: string;
  name: string;
  link: string | null;
}

// ============================================
// Helpers
// ============================================

function parseMonthYear(str: string): { month: number; year: number } | null {
  const parts = str.split("/");
  if (parts.length !== 2) return null;
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);
  if (isNaN(month) || isNaN(year)) return null;
  return { month, year };
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

function getDefaultStatus(contaType: string): Extrato["status"] {
  return contaType === "Automático" ? "Recebido" : "Pendente";
}

function computeInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function mapContaToExtrato(
  conta: DbConta,
  status: DbExtratoStatus | undefined,
  month: string,
  whatsappGroupMap: Map<string, string>,
  whatsappGroupLinkMap: Map<string, string | null>,
): Extrato {
  const canais = conta.canais ?? ["WhatsApp", "Email"];

  let hasWhatsApp = false;
  let hasEmail = false;
  let contactPhone: string | undefined;
  let contactEmail: string | undefined;
  let clientEmail: string | undefined;
  let contactName: string | undefined;
  let whatsappIsGroup = false;
  let whatsappGroupLink: string | undefined;

  if (conta.type === "Manual") {
    hasWhatsApp =
      canais.includes("WhatsApp") && (conta.whatsapp_group_linked || !!conta.manager_phone);
    hasEmail = canais.includes("Email") && !!conta.manager_email;
    contactPhone =
      conta.whatsapp_group_linked && conta.whatsapp_group_id
        ? (whatsappGroupMap.get(conta.whatsapp_group_id) ?? conta.manager_phone ?? undefined)
        : (conta.manager_phone ?? undefined);
    contactEmail = conta.manager_email ?? undefined;
    contactName = conta.manager_name ?? undefined;
    clientEmail =
      conta.client.emails?.[conta.client.primary_email_index ?? 0] ?? undefined;
    whatsappIsGroup = !!conta.whatsapp_group_linked;
    whatsappGroupLink =
      conta.whatsapp_group_linked && conta.whatsapp_group_id
        ? (whatsappGroupLinkMap.get(conta.whatsapp_group_id) ?? undefined)
        : undefined;
  } else if (conta.type === "Manual Cliente") {
    hasWhatsApp = canais.includes("WhatsApp") && !!conta.client.phone;
    hasEmail = canais.includes("Email") && (conta.client.emails?.length ?? 0) > 0;
    contactPhone = conta.client.phone ?? undefined;
    contactEmail =
      conta.client.emails?.[conta.client.primary_email_index ?? 0] ?? undefined;
    contactName = conta.client.name.split(" ")[0];
    whatsappIsGroup = false;
  }
  // Automático: hasWhatsApp and hasEmail remain false

  return {
    id: status?.id || conta.id,
    contaId: conta.id,
    clientId: conta.client_id,
    clientName: conta.client.name,
    clientInitials: conta.client.initials || computeInitials(conta.client.name),
    institution: conta.institution.name,
    accountType: conta.account_name || "",
    collectionMethod: conta.type as Extrato["collectionMethod"],
    status: (status?.status as Extrato["status"]) || getDefaultStatus(conta.type),
    referenceMonth: month,
    requestedAt: status?.requested_at ?? undefined,
    receivedAt: status?.received_at ?? undefined,
    consolidatedAt: status?.consolidated_at ?? undefined,
    updatedAt: status?.updated_at ?? undefined,
    hasWhatsApp,
    hasEmail,
    contactPhone,
    contactEmail,
    clientEmail,
    contactName,
    whatsappIsGroup,
    whatsappGroupLink,
  };
}

function buildWhatsappMaps(
  groups: DbWhatsappGroup[],
): [Map<string, string>, Map<string, string | null>] {
  const nameMap = new Map(groups.map((g) => [g.id, g.name]));
  const linkMap = new Map(groups.map((g) => [g.id, g.link]));
  return [nameMap, linkMap];
}

// ============================================
// Public API
// ============================================

export function buildExtratos(
  contas: DbConta[],
  whatsappGroups: DbWhatsappGroup[],
  month: string,
): Extrato[] {
  const eligible = contas.filter((c) => isMonthInRange(month, c.start_date, c.end_date));
  if (eligible.length === 0) return [];

  const [whatsappGroupMap, whatsappGroupLinkMap] = buildWhatsappMaps(whatsappGroups);

  return eligible.map((conta) => {
    const es = conta.extrato_statuses.find((s) => s.competencia === month);
    return mapContaToExtrato(conta, es, month, whatsappGroupMap, whatsappGroupLinkMap);
  });
}

export function buildPendencias(
  contas: DbConta[],
  whatsappGroups: DbWhatsappGroup[],
  months: string[],
): Extrato[] {
  const [whatsappGroupMap, whatsappGroupLinkMap] = buildWhatsappMaps(whatsappGroups);

  const allExtratos: Extrato[] = [];
  for (const month of months) {
    const eligible = contas.filter((c) => isMonthInRange(month, c.start_date, c.end_date));
    for (const conta of eligible) {
      const es = conta.extrato_statuses.find((s) => s.competencia === month);
      const status = es?.status || getDefaultStatus(conta.type);
      if (status === "Consolidado") continue;

      allExtratos.push(
        mapContaToExtrato(conta, es, month, whatsappGroupMap, whatsappGroupLinkMap),
      );
    }
  }

  return allExtratos;
}

export function getPreviousMonths(beforeMonth: string, count: number): string[] {
  const parsed = parseMonthYear(beforeMonth);
  if (!parsed) return [];

  const months: string[] = [];
  let { month: m, year: y } = parsed;
  for (let i = 0; i < count; i++) {
    m--;
    if (m < 1) {
      m = 12;
      y--;
    }
    months.push(`${String(m).padStart(2, "0")}/${y}`);
  }
  return months;
}
