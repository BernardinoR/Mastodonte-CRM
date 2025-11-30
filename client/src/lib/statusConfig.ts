import { TaskStatus, TaskPriority } from "@/types/task";

export interface StatusConfig {
  label: string;
  labelPt: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
  columnBorderColor: string;
  cardBgRgb: string;
}

export interface PriorityConfig {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
}

export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  "To Do": {
    label: "To Do",
    labelPt: "A Fazer",
    bgColor: "bg-[#64635E]",
    borderColor: "border-[#64635E]",
    textColor: "text-white",
    dotColor: "bg-[#9B9A97]",
    columnBorderColor: "border-t-[#64635E]",
    cardBgRgb: "rgba(100, 99, 94, 0.08)",
  },
  "In Progress": {
    label: "In Progress",
    labelPt: "Em Progresso",
    bgColor: "bg-[rgb(64,97,145)]",
    borderColor: "border-[rgb(64,97,145)]",
    textColor: "text-white",
    dotColor: "bg-[rgb(64,97,145)]",
    columnBorderColor: "border-t-[rgb(64,97,145)]",
    cardBgRgb: "rgba(64, 97, 145, 0.08)",
  },
  "Done": {
    label: "Done",
    labelPt: "Concluído",
    bgColor: "bg-green-800",
    borderColor: "border-green-800",
    textColor: "text-white",
    dotColor: "bg-green-600",
    columnBorderColor: "border-t-green-800",
    cardBgRgb: "rgba(22, 101, 52, 0.08)",
  },
};

export const PRIORITY_CONFIG: Record<TaskPriority, PriorityConfig> = {
  "Urgente": {
    label: "Urgente",
    bgColor: "bg-red-900",
    borderColor: "border-red-900",
    textColor: "text-white",
    dotColor: "bg-red-500",
  },
  "Importante": {
    label: "Importante",
    bgColor: "bg-orange-800",
    borderColor: "border-orange-800",
    textColor: "text-white",
    dotColor: "bg-orange-500",
  },
  "Normal": {
    label: "Normal",
    bgColor: "bg-yellow-700",
    borderColor: "border-yellow-700",
    textColor: "text-white",
    dotColor: "bg-yellow-500",
  },
  "Baixa": {
    label: "Baixa",
    bgColor: "bg-blue-800",
    borderColor: "border-blue-800",
    textColor: "text-white",
    dotColor: "bg-blue-500",
  },
};

export const getStatusConfig = (status: TaskStatus): StatusConfig => {
  return STATUS_CONFIG[status] || STATUS_CONFIG["To Do"];
};

export const getPriorityConfig = (priority: TaskPriority): PriorityConfig => {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["Normal"];
};
