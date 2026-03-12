import type { Client, Meeting, Task, User, Group } from "@prisma/client";

// Re-exportar tipos do Prisma
export type { Client, Meeting, Task, User, Group };

// Tipos com relações
export type ClientWithRelations = Client & {
  owner?: User | null;
  meetings?: Meeting[];
  tasks?: Task[];
};

export type MeetingWithRelations = Meeting & {
  client?: Client;
  creator?: User | null;
  tasks?: Task[];
};

export type TaskWithRelations = Task & {
  client?: Client | null;
  meeting?: Meeting | null;
  assignee?: User | null;
  creator?: User | null;
};

// Enums (constantes)
export const USER_ROLES = ["administrador", "consultor", "alocador", "concierge"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const TASK_STATUS = ["A fazer", "Em andamento", "Concluída", "Cancelada"] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];

export const TASK_PRIORITY = ["Baixa", "Média", "Alta", "Urgente"] as const;
export type TaskPriority = (typeof TASK_PRIORITY)[number];

export const MEETING_STATUS = ["Agendada", "Realizada", "Cancelada"] as const;
export type MeetingStatus = (typeof MEETING_STATUS)[number];

export interface Institution {
  id: number;
  name: string;
  currency: "Real" | "Dolar" | "Euro";
  attachmentCount: number;
  referenceFile: string | null;
}

export const CONTA_TIPOS = ["Automático", "Manual", "Manual Cliente"] as const;
export type ContaTipo = (typeof CONTA_TIPOS)[number];

export const CONTA_STATUS = ["Ativa", "Desativada"] as const;
export type ContaStatus = (typeof CONTA_STATUS)[number];

export const MEETING_TYPE = [
  "Prospecção",
  "Acompanhamento",
  "Apresentação",
  "Negociação",
  "Fechamento",
] as const;
export type MeetingType = (typeof MEETING_TYPE)[number];
