import { TaskStatus, TaskPriority, TaskType } from "../types/task";

// Cores centralizadas da UI
export const UI_COLORS = {
  // Backgrounds
  popoverBg: "#2a2a2a",
  panelBg: "#222222",
  cardBg: "#252730",
  elementBg: "#333333",
  hoverBg: "#333333",

  // Borders
  border: "#3a3a3a",
  borderLight: "#3a3a3a",
  avatarBorder: "#3a3a3a",

  // Text
  textMuted: "#64666E",
  textLight: "#9B9A97",

  // Contact buttons
  contactBtnBg: "white/5",
  contactBtnBorder: "#3a3a3a",

  // Modal
  modalBg: "#1a1a1a",
  borderSubtle: "#333333",
  surfaceDark: "#222222",

  // Task card borders (RGB for inline styles)
  taskBorderBlue: "rgb(66, 129, 220)",
  taskBorderRed: "rgb(185, 28, 28)",
  taskBorderDone: "rgb(16, 185, 129)",
} as const;

// Classes Tailwind pré-definidas para reutilização
export const UI_CLASSES = {
  popover: "bg-[#202020] border-[#333333]",
  panel: "bg-[#222222]",
  card: "bg-[#252730] border-[#3a3a3a]",
  hoverItem: "hover:bg-[#333333]",
  selectedItem: "bg-[#333333]",
  border: "border-[#3a3a3a]",
  borderLight: "border-[#3a3a3a]",
  labelText: "text-[#64666E]",
  contactBtn: "bg-white/5 border border-[#3a3a3a] hover:bg-white/10",
  historyPanel: "bg-[#1e1e1e] border-l border-[#333333]",
  historyEvent: "bg-[#2a2a2a] border border-[#3a3a3a]",
  historyTimeline: "bg-[#3a3a3a]",
  historyIcon: "bg-[#333333] border-2 border-[#222222]",
  commentInput: "bg-[#1a1a1a] border border-[#3a3a3a]",
  // Modal specific
  clientBadge: "bg-[#333333] px-2.5 py-1 rounded text-xs text-gray-400",
  avatarBorder: "border-2 border-[#3a3a3a]",
  dropdownItem:
    "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#333333] transition-colors",
  dropdownItemSelected:
    "flex items-center gap-2 px-2 py-1.5 cursor-pointer bg-[#333333] rounded-md",
  // Modal specific - new design
  modalContainer: "bg-[#1a1a1a] border-[#333333]",
  sectionLabel: "text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3",
  descriptionContainer: "bg-[#222222] border border-[#333333] rounded-lg p-5 shadow-inner",
  quickActionBtn:
    "bg-transparent hover:bg-white/5 border border-[#333333] rounded-md text-xs font-semibold text-gray-300 px-4 py-2 flex items-center gap-2 transition-all hover:border-gray-500 group",
  assigneeChip:
    "flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-md bg-[#333333] border border-[#333333] hover:border-gray-500 transition-colors cursor-pointer group",
  assigneeAddBtn:
    "w-9 h-9 rounded-md bg-transparent hover:bg-white/5 border border-[#333333] border-dashed flex items-center justify-center transition-colors text-gray-500 hover:text-white hover:border-gray-500",
  meetingLinkCard:
    "bg-[#262626] border border-[#333333] rounded-lg flex items-center w-full p-2 shadow-sm hover:border-gray-500 hover:bg-[#2a2a2a] transition-all cursor-pointer group",
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
  Done: {
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
  Urgente: {
    label: "Urgente",
    bgColor: "bg-red-900",
    borderColor: "border-red-900",
    textColor: "text-white",
    dotColor: "bg-red-500",
  },
  Importante: {
    label: "Importante",
    bgColor: "bg-amber-900",
    borderColor: "border-amber-900",
    textColor: "text-white",
    dotColor: "bg-amber-500",
  },
  Normal: {
    label: "Normal",
    bgColor: "bg-blue-800",
    borderColor: "border-blue-800",
    textColor: "text-white",
    dotColor: "bg-blue-400",
  },
  Baixa: {
    label: "Baixa",
    bgColor: "bg-gray-800",
    borderColor: "border-gray-800",
    textColor: "text-white",
    dotColor: "bg-gray-500",
  },
};

export const MODAL_STATUS_BADGE_STYLES: Record<
  TaskStatus,
  { bg: string; border: string; text: string; dot: string }
> = {
  "To Do": {
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    text: "text-gray-400",
    dot: "bg-gray-400",
  },
  "In Progress": {
    bg: "bg-[#2eaadc]/10",
    border: "border-[#2eaadc]/20",
    text: "text-[#2eaadc]",
    dot: "bg-[#2eaadc]",
  },
  Done: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-400",
    dot: "bg-green-400",
  },
};

export const MODAL_PRIORITY_BADGE_STYLES: Record<
  TaskPriority,
  { bg: string; border: string; text: string; dot: string }
> = {
  Urgente: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
    dot: "bg-red-400",
  },
  Importante: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  Normal: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  Baixa: {
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    text: "text-gray-400",
    dot: "bg-gray-400",
  },
};

export interface TaskTypeConfig {
  label: string;
  className: string;
}

export const TASK_TYPE_CONFIG: Record<TaskType, TaskTypeConfig> = {
  Tarefa: {
    label: "Tarefa",
    className: "bg-gray-700/40 text-gray-400 border border-gray-700/50",
  },
  Alocação: {
    label: "Alocação",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  Experiência: {
    label: "Experiência",
    className: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  },
};

export const getTaskTypeConfig = (taskType: TaskType): TaskTypeConfig => {
  return TASK_TYPE_CONFIG[taskType] || TASK_TYPE_CONFIG["Tarefa"];
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
  Ativo: {
    label: "Ativo",
    bgColor: "bg-[#203828]",
    textColor: "text-[#6ecf8e]",
  },
  Prospect: {
    label: "Prospect",
    bgColor: "bg-[#2a2a38]",
    textColor: "text-[#a78bfa]",
  },
  Distrato: {
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
  Done: "bg-[#203828] text-[#6ecf8e]",
};

export const TASK_PRIORITY_BADGE_COLORS: Record<TaskPriority, string> = {
  Urgente: "bg-[#3d2626] text-[#e07a7a]",
  Importante: "bg-[#3d2e1a] text-[#d4a574]",
  Normal: "bg-[#1c3847] text-[#6db1d4]",
  Baixa: "bg-[#333333] text-[#a0a0a0]",
};

export const MEETING_STATUS_BADGE_COLORS: Record<string, string> = {
  Agendada: "bg-[#1c3847] text-[#2eaadc]",
  Realizada: "bg-[#203828] text-[#6ecf8e]",
  Cancelada: "bg-[#3d2828] text-[#dc6b6b]",
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
  Ativo: "bg-green-500/10 text-green-500 border-green-500/20",
  Prospect: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Distrato: "bg-red-500/10 text-red-500 border-red-500/20",
  Inativo: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export const getClientStatusOutlineColor = (status: string): string => {
  return CLIENT_STATUS_OUTLINE_COLORS[status] || "";
};
