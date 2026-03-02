import type { ExtratoStatus, ExtratoCollectionMethod } from "../types/extrato";

export interface StatusStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
  glow: string;
}

export const statusStyles: Record<ExtratoStatus, StatusStyle> = {
  Pendente: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
    dot: "bg-orange-500",
    glow: "shadow-[0_0_8px_rgba(249,115,22,0.6)]",
  },
  Solicitado: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
    glow: "shadow-[0_0_8px_rgba(59,130,246,0.6)]",
  },
  Recebido: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
    dot: "bg-green-500",
    glow: "shadow-[0_0_8px_rgba(34,197,94,0.6)]",
  },
  Consolidado: {
    bg: "bg-green-600/20",
    text: "text-green-300",
    border: "border-green-500/30",
    dot: "bg-green-400",
    glow: "shadow-[0_0_8px_rgba(74,222,128,0.6)]",
  },
};

export const collectionMethodStyles: Record<ExtratoCollectionMethod, string> = {
  Automático: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Manual: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};
