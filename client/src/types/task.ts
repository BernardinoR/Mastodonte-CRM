export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Urgente" | "Importante" | "Normal" | "Baixa";

// Filter system types
export type FilterType = "date" | "status" | "priority" | "task" | "assignee" | "client";

export interface DateFilterValue {
  type: "all" | "preset" | "relative" | "range";
  preset?: string;
  relativeDirection?: "past" | "future";
  relativeAmount?: number;
  relativeUnit?: "weeks" | "months";
  startDate?: Date;
  endDate?: Date;
}

// Discriminated filter value types - type-safe values for each filter type
export interface FilterValueMap {
  date: DateFilterValue;
  status: TaskStatus[];
  priority: (TaskPriority | "none")[];
  task: string;
  assignee: string[];
  client: string[];
}

// Type-safe active filter with discriminated union
export type TypedActiveFilter = 
  | { id: string; type: "date"; value: DateFilterValue }
  | { id: string; type: "status"; value: TaskStatus[] }
  | { id: string; type: "priority"; value: (TaskPriority | "none")[] }
  | { id: string; type: "task"; value: string }
  | { id: string; type: "assignee"; value: string[] }
  | { id: string; type: "client"; value: string[] };

// Helper type to get value type for a specific filter type
export type FilterValueFor<T extends FilterType> = FilterValueMap[T];

// Default values for each filter type
export const DEFAULT_FILTER_VALUES: FilterValueMap = {
  date: { type: "all" },
  status: ["To Do", "In Progress", "Done"],
  priority: ["Urgente", "Importante", "Normal", "Baixa", "none"],
  task: "",
  assignee: [],
  client: [],
};

// Helper function to create a typed filter
export function createTypedFilter<T extends FilterType>(
  type: T,
  value?: FilterValueMap[T]
): TypedActiveFilter {
  const id = `${type}-${Date.now()}`;
  const filterValue = value ?? DEFAULT_FILTER_VALUES[type];
  return { id, type, value: filterValue } as TypedActiveFilter;
}

// Type guard functions for filter values
export function isDateFilter(filter: TypedActiveFilter): filter is { id: string; type: "date"; value: DateFilterValue } {
  return filter.type === "date";
}

export function isStatusFilter(filter: TypedActiveFilter): filter is { id: string; type: "status"; value: TaskStatus[] } {
  return filter.type === "status";
}

export function isPriorityFilter(filter: TypedActiveFilter): filter is { id: string; type: "priority"; value: (TaskPriority | "none")[] } {
  return filter.type === "priority";
}

export function isTaskFilter(filter: TypedActiveFilter): filter is { id: string; type: "task"; value: string } {
  return filter.type === "task";
}

export function isAssigneeFilter(filter: TypedActiveFilter): filter is { id: string; type: "assignee"; value: string[] } {
  return filter.type === "assignee";
}

export function isClientFilter(filter: TypedActiveFilter): filter is { id: string; type: "client"; value: string[] } {
  return filter.type === "client";
}

export interface TaskHistoryEvent {
  id: string;
  type: "comment" | "email" | "call" | "whatsapp" | "status_change" | "assignee_change" | "created";
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
