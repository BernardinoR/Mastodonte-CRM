export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Urgente" | "Importante" | "Normal" | "Baixa";

export interface TaskHistoryEvent {
  id: string;
  type: "comment" | "status_change" | "assignee_change" | "created";
  content: string;
  author: string;
  timestamp: Date;
}

export interface Task {
  id: string;
  title: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  dueDate: Date;
  description?: string;
  notes?: string[];
  history?: TaskHistoryEvent[];
  order: number;
}

export type TaskUpdates = Partial<Omit<Task, 'id'>>;

export const STATUS_OPTIONS: TaskStatus[] = ["To Do", "In Progress", "Done"];
export const PRIORITY_OPTIONS: TaskPriority[] = ["Urgente", "Importante", "Normal", "Baixa"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  "To Do": "A Fazer",
  "In Progress": "Em Progresso",
  "Done": "Concluído",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  "Urgente": "Urgente",
  "Importante": "Importante",
  "Normal": "Normal",
  "Baixa": "Baixa",
};
