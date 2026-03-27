import type { DirectInstitution, ManagerGroup, ManagerClient, VarreduraStatus } from "../types/varredura";

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
  attachment_count: number;
  currency: string;
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
  client: DbClient;
  institution: DbInstitution;
  extrato_statuses: DbExtratoStatus[];
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

function getStatusForConta(conta: VarreduraConta, competencia: string): VarreduraStatus {
  const es = conta.extrato_statuses.find((s) => s.competencia === competencia);
  if (!es) return "pendente";

  if (es.status === "Consolidado" || es.status === "Recebido") return "verificado";
  if (es.status === "Solicitado") return "solicitado";
  return "pendente";
}

export function buildDirectInstitutions(
  contas: VarreduraConta[],
  competencia: string,
): DirectInstitution[] {
  const autoContas = contas.filter(
    (c) => c.type === "Automático" && isMonthInRange(competencia, c.start_date, c.end_date),
  );

  const grouped = new Map<string, VarreduraConta[]>();
  for (const c of autoContas) {
    const key = c.institution.name;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(c);
  }

  const result: DirectInstitution[] = [];
  for (const [name, instituionContas] of grouped) {
    const allChecked = instituionContas.every(
      (c) => getStatusForConta(c, competencia) === "verificado",
    );
    result.push({
      contaId: instituionContas[0].id,
      institutionName: name,
      initials: name.substring(0, 2).toUpperCase(),
      checked: allChecked,
    });
  }

  return result.sort((a, b) => a.institutionName.localeCompare(b.institutionName));
}

export function buildManagerGroups(
  contas: VarreduraConta[],
  competencia: string,
): ManagerGroup[] {
  const manualContas = contas.filter(
    (c) =>
      (c.type === "Manual" || c.type === "Manual Cliente") &&
      isMonthInRange(competencia, c.start_date, c.end_date),
  );

  const grouped = new Map<string, ManagerClient[]>();
  for (const c of manualContas) {
    const key = c.institution.name;
    if (!grouped.has(key)) grouped.set(key, []);

    const status = getStatusForConta(c, competencia);

    let contactPhone: string | undefined;
    let contactEmail: string | undefined;

    if (c.type === "Manual") {
      contactPhone = c.manager_phone ?? undefined;
      contactEmail = c.manager_email ?? undefined;
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
