import { TaskStatus, TaskPriority } from "@/types/task";

// Cores centralizadas da UI
export const UI_COLORS = {
  // Backgrounds
  popoverBg: "#1a1a1a",
  panelBg: "#1E1F24",
  cardBg: "#252730",
  elementBg: "#333",
  hoverBg: "#2a2a2a",
  
  // Borders
  border: "#2a2a2a",
  borderLight: "#363842",
  avatarBorder: "#27282F",
  
  // Text
  textMuted: "#64666E",
  textLight: "#9B9A97",
  
  // Contact buttons
  contactBtnBg: "white/5",
  contactBtnBorder: "#363842",
  
  // Task card borders (RGB for inline styles)
  taskBorderBlue: "rgb(66, 129, 220)",
  taskBorderRed: "rgb(185, 28, 28)",
  taskBorderDone: "rgb(16, 185, 129)",
} as const;

// Classes Tailwind pré-definidas para reutilização
export const UI_CLASSES = {
  popover: "bg-[#1a1a1a] border-[#2a2a2a]",
  panel: "bg-[#1E1F24]",
  card: "bg-[#252730] border-[#363842]",
  hoverItem: "hover:bg-[#2a2a2a]",
  selectedItem: "bg-[#2a2a2a]",
  border: "border-[#2a2a2a]",
  borderLight: "border-[#363842]",
  labelText: "text-[#64666E]",
  contactBtn: "bg-white/5 border border-[#363842] hover:bg-white/10",
  historyPanel: "bg-[#1E1F24] border-l border-[#363842]",
  historyEvent: "bg-[#2B2D33] border border-[#363842]",
  historyTimeline: "bg-[#363842]",
  historyIcon: "bg-[#333] border-2 border-[#1E1F24]",
  commentInput: "bg-[#151619] border border-[#363842]",
  // Modal specific
  clientBadge: "bg-[#333] px-2.5 py-1 rounded text-xs text-gray-400",
  avatarBorder: "border-2 border-[#27282F]",
  dropdownItem: "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors",
  dropdownItemSelected: "flex items-center gap-2 px-2 py-1.5 cursor-pointer bg-[#2a2a2a] rounded-md",
} as const;

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
    bgColor: "bg-[#243041]",
    borderColor: "border-[#344151]",
    textColor: "text-white",
    dotColor: "bg-blue-500",
    columnBorderColor: "border-t-[#344151]",
    cardBgRgb: "rgba(36, 48, 65, 0.08)",
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

// Client Status Types and Configuration
export type ClientStatus = "Ativo" | "Prospect" | "Distrato";

export interface ClientStatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

export const CLIENT_STATUS_CONFIG: Record<ClientStatus, ClientStatusConfig> = {
  "Ativo": {
    label: "Ativo",
    bgColor: "bg-[#203828]",
    textColor: "text-[#6ecf8e]",
  },
  "Prospect": {
    label: "Prospect",
    bgColor: "bg-[#2a2a38]",
    textColor: "text-[#a78bfa]",
  },
  "Distrato": {
    label: "Distrato",
    bgColor: "bg-[#382020]",
    textColor: "text-[#f87171]",
  },
};

export const CLIENT_STATUS_OPTIONS: ClientStatus[] = ["Ativo", "Prospect", "Distrato"];

export const getClientStatusConfig = (status: ClientStatus): ClientStatusConfig => {
  return CLIENT_STATUS_CONFIG[status] || CLIENT_STATUS_CONFIG["Ativo"];
};

// Badge color classes for inline use (consolidated from multiple components)
export const TASK_STATUS_BADGE_COLORS: Record<TaskStatus, string> = {
  "To Do": "bg-[#333333] text-[#a0a0a0]",
  "In Progress": "bg-[#243041] text-[#6db1d4]",
  "Done": "bg-[#203828] text-[#6ecf8e]",
};

export const TASK_PRIORITY_BADGE_COLORS: Record<TaskPriority, string> = {
  "Urgente": "bg-[#3d2626] text-[#e07a7a]",
  "Importante": "bg-[#422c24] text-[#dcb092]",
  "Normal": "bg-[#333333] text-[#a0a0a0]",
  "Baixa": "bg-[#1c3847] text-[#6db1d4]",
};

export const MEETING_STATUS_BADGE_COLORS: Record<string, string> = {
  "Agendada": "bg-[#243041] text-[#6db1d4]",
  "Realizada": "bg-[#203828] text-[#6ecf8e]",
  "Cancelada": "bg-[#3d2626] text-[#e07a7a]",
};

export const getTaskStatusBadgeColor = (status: TaskStatus): string => {
  return TASK_STATUS_BADGE_COLORS[status] || TASK_STATUS_BADGE_COLORS["To Do"];
};

export const getTaskPriorityBadgeColor = (priority: TaskPriority): string => {
  return TASK_PRIORITY_BADGE_COLORS[priority] || TASK_PRIORITY_BADGE_COLORS["Normal"];
};

export const getMeetingStatusBadgeColor = (status: string): string => {
  return MEETING_STATUS_BADGE_COLORS[status] || MEETING_STATUS_BADGE_COLORS["Agendada"];
};

// Client status colors for outline badges (used in ClientCard, ClientProfile)
export const CLIENT_STATUS_OUTLINE_COLORS: Record<string, string> = {
  "Ativo": "bg-green-500/10 text-green-500 border-green-500/20",
  "Prospect": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Distrato": "bg-red-500/10 text-red-500 border-red-500/20",
  "Inativo": "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export const getClientStatusOutlineColor = (status: string): string => {
  return CLIENT_STATUS_OUTLINE_COLORS[status] || "";
};
