/**
 * Configurações centralizadas para reuniões
 * Compartilhado entre client e server
 */

// Tipos de reunião disponíveis
export const MEETING_TYPE_OPTIONS = ["Mensal", "Esporádica"] as const;
export type MeetingType = (typeof MEETING_TYPE_OPTIONS)[number];

// Cores dos badges por tipo de reunião
export const MEETING_TYPE_COLORS: Record<string, string> = {
  Mensal: "bg-[#203828] text-[#6ecf8e]",
  Esporádica: "bg-[#422c24] text-[#dcb092]",
};

// Status de reunião disponíveis
export const MEETING_STATUS_OPTIONS = ["Agendada", "Realizada", "Cancelada"] as const;
export type MeetingStatus = (typeof MEETING_STATUS_OPTIONS)[number];

// Cores dos badges por status (referência ao design_guidelines)
export const MEETING_STATUS_COLORS: Record<MeetingStatus, string> = {
  Agendada: "bg-[#1c3847] text-[#2eaadc]",
  Realizada: "bg-[#203828] text-[#6ecf8e]",
  Cancelada: "bg-[#3d2828] text-[#dc6b6b]",
};

// Fallback color para tipos/status não reconhecidos
export const MEETING_FALLBACK_COLOR = "bg-[#333333] text-[#a0a0a0]";

// Locais de reunião disponíveis
export const MEETING_LOCATION_OPTIONS = [
  "Google Meet",
  "Zoom",
  "Microsoft Teams",
  "Presencial",
  "Telefone",
] as const;
export type MeetingLocation = (typeof MEETING_LOCATION_OPTIONS)[number];

// Cores dos badges por local de reunião (paleta oficial das marcas)
export const MEETING_LOCATION_COLORS: Record<MeetingLocation, string> = {
  "Google Meet": "bg-[#0d3d2e] text-[#34a853]",
  Zoom: "bg-[#0d2847] text-[#2d8cff]",
  "Microsoft Teams": "bg-[#1e1a3d] text-[#7b83eb]",
  Presencial: "bg-[#3d2e1a] text-[#f59e0b]",
  Telefone: "bg-[#1a2633] text-[#64748b]",
};
