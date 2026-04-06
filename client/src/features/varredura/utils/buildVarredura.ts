import type {
  DirectInstitution,
  ManagerGroup,
  ManagerClient,
  VarreduraStatus,
} from "../types/varredura";

interface DbClient {
  name: string;
  initials: string | null;
  emails: string[] | null;
  primary_email_index: number | null;
  phone: string | null;
}

interface DbInstitution {
  id?: number;
  name: string;
  attachment_count: number;
  currency: string;
  access_url?: string;
}

export interface VarreduraConta {
  id: string;
  client_id: string;
  type: string;
  start_date: string;
  end_date: string | null;
  account_name: string | null;
  manager_phone: string | null;
  manager_email: string | null;
  manager_name: string | null;
  sweep_active: boolean;
  sweep_frequency: string | null;
  whatsapp_group_id: string | null;
  whatsapp_group_linked: boolean;
  client: DbClient;
  institution: DbInstitution & { id?: number };
}

function computeInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function isMonthInRange(month: string, startDate: string, endDate: string | null): boolean {
  const parts = month.split("/");
  const startParts = startDate.split("/");
  if (parts.length !== 2 || startParts.length !== 2) return false;

  const mVal = parseInt(parts[1], 10) * 12 + parseInt(parts[0], 10);
  const sVal = parseInt(startParts[1], 10) * 12 + parseInt(startParts[0], 10);
  if (mVal < sVal) return false;

  if (endDate) {
    const endParts = endDate.split("/");
    if (endParts.length === 2) {
      const eVal = parseInt(endParts[1], 10) * 12 + parseInt(endParts[0], 10);
      if (mVal > eVal) return false;
    }
  }
  return true;
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function isDueOnDate(frequency: string | null, date: Date): boolean {
  if (!frequency) return true;
  const day = date.getDay();
  switch (frequency) {
    case "2dias":
      return day === 1 || day === 3 || day === 5; // seg, qua, sex
    case "semanal":
      return day === 1; // segunda
    case "quinzenal": {
      if (day !== 1) return false;
      return getISOWeek(date) % 2 === 0;
    }
    default:
      return true;
  }
}

export function buildDirectInstitutions(
  contas: VarreduraConta[],
  competencia: string,
  checkedInstitutionIds: Set<number>,
): DirectInstitution[] {
  const autoContas = contas.filter(
    (c) =>
      c.type === "Automático" &&
      c.institution.name !== "Smart" &&
      isMonthInRange(competencia, c.start_date, c.end_date),
  );

  const grouped = new Map<string, VarreduraConta[]>();
  for (const c of autoContas) {
    const key = c.institution.name;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(c);
  }

  const result: DirectInstitution[] = [];
  for (const [name, institutionContas] of grouped) {
    const instId = institutionContas[0].institution.id ?? 0;
    result.push({
      contaId: institutionContas[0].id,
      institutionId: instId,
      institutionName: name,
      initials: name.substring(0, 2).toUpperCase(),
      checked: checkedInstitutionIds.has(instId),
      accessUrl: institutionContas[0].institution.access_url ?? undefined,
    });
  }

  return result.sort((a, b) => a.institutionName.localeCompare(b.institutionName));
}

export function buildManagerGroups(
  contas: VarreduraConta[],
  competencia: string,
  whatsappGroupLinkMap?: Map<string, string | null>,
  solicitedContaIds?: Set<string>,
  selectedDate?: Date,
): ManagerGroup[] {
  const manualContas = contas.filter(
    (c) =>
      (c.type === "Manual" || c.type === "Manual Cliente") &&
      c.sweep_active &&
      isMonthInRange(competencia, c.start_date, c.end_date) &&
      (!selectedDate || isDueOnDate(c.sweep_frequency, selectedDate)),
  );

  const grouped = new Map<string, ManagerClient[]>();
  for (const c of manualContas) {
    const key = c.institution.name;
    if (!grouped.has(key)) grouped.set(key, []);

    const status: VarreduraStatus = solicitedContaIds?.has(c.id) ? "solicitado" : "pendente";

    let contactPhone: string | undefined;
    let contactEmail: string | undefined;
    let whatsappIsGroup = false;
    let whatsappGroupLink: string | undefined;

    if (c.type === "Manual") {
      const groupIdStr = c.whatsapp_group_id != null ? String(c.whatsapp_group_id) : null;
      contactPhone =
        c.whatsapp_group_linked && groupIdStr
          ? (whatsappGroupLinkMap?.get(groupIdStr) ?? c.manager_phone ?? undefined)
          : (c.manager_phone ?? undefined);
      contactEmail = c.manager_email ?? undefined;
      whatsappIsGroup = !!c.whatsapp_group_linked;
      whatsappGroupLink =
        c.whatsapp_group_linked && groupIdStr
          ? (whatsappGroupLinkMap?.get(groupIdStr) ?? undefined)
          : undefined;
    } else {
      contactPhone = c.client.phone ?? undefined;
      contactEmail = c.client.emails?.[c.client.primary_email_index ?? 0] ?? undefined;
    }

    grouped.get(key)!.push({
      contaId: c.id,
      clientId: c.client_id,
      clientName: c.client.name,
      clientInitials: c.client.initials || computeInitials(c.client.name),
      accountName: c.account_name || "",
      status,
      phone: contactPhone,
      email: contactEmail,
      contactType: c.type === "Manual" ? "manager" : "client",
      managerName: c.manager_name ?? undefined,
      whatsappIsGroup,
      whatsappGroupLink,
    });
  }

  const result: ManagerGroup[] = [];
  for (const [name, clients] of grouped) {
    result.push({
      institutionName: name,
      initials: name.substring(0, 2).toUpperCase(),
      clients,
    });
  }

  return result.sort((a, b) => a.institutionName.localeCompare(b.institutionName));
}

export function getContaIdsForInstitution(
  contas: VarreduraConta[],
  institutionName: string,
  competencia: string,
): string[] {
  return contas
    .filter(
      (c) =>
        c.type === "Automático" &&
        c.institution.name !== "Smart" &&
        c.institution.name === institutionName &&
        isMonthInRange(competencia, c.start_date, c.end_date),
    )
    .map((c) => c.id);
}

export function formatCompetencia(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${yyyy}`;
}
