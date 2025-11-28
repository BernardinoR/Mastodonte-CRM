export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Urgente" | "Importante" | "Normal" | "Baixa";

export interface Task {
  id: string;
  title: string;
  clientName?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  dueDate: Date;
  description?: string;
  notes?: string[];
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
