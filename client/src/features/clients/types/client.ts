import type { ClientStatus } from "@features/tasks/lib/statusConfig";

export interface Address {
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Client {
  id: string;
  name: string;
  initials: string;
  cpf: string;
  phone: string;
  emails: string[];
  primaryEmailIndex: number;
  advisor: string;
  lastMeeting: Date;
  address: Address;
  foundationCode: string;
  clientSince: string;
  status: ClientStatus;
  folderLink?: string;
  schedulingMessageSentAt?: Date | null;
  peculiarities: string[];
  monthlyMeetingDisabled: boolean;
}

export interface ClientStats {
  value: string;
  label: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export interface ClientMeeting {
  id: string;
  name: string;
  type: string;
  status: "Agendada" | "Realizada" | "Cancelada";
  date: Date;
  assignees: string[];
}

export interface WhatsAppGroup {
  id: string;
  name: string;
  purpose: string;
  link: string | null;
  createdAt: Date;
  status: "Ativo" | "Inativo";
}

export interface ClientFullData {
  client: Client;
  stats: ClientStats[];
  meetings: ClientMeeting[];
  whatsappGroups: WhatsAppGroup[];
}

/**
 * Cliente enriquecido com dados calculados (sem modificar tipo base)
 */
export interface EnrichedClient extends Client {
  aum: number;
  aumFormatted: string;
  daysSinceLastMeeting: number;
  meetingDelayStatus: 'ok' | 'warning' | 'critical';
  urgentTasksCount: number;
  cityState: string;
}

/**
 * Estatísticas agregadas da página de clientes
 */
export interface ClientsPageStats {
  totalAUM: number;
  averageAUM: number;
  activeClients: number;
  noMeeting30Days: number;
  urgentTasksClients: number;
  newClientsMonth: number;
  meetingsThisWeek: number;
  retentionRate: string;
}

/**
 * Modo de visualização da página de clientes
 */
export type ClientsViewMode = 'cards' | 'list';

/**
 * Modo de filtro da página de clientes
 */
export type ClientsFilterMode = 'all' | 'noMeeting' | 'urgentTasks' | 'byAum';
