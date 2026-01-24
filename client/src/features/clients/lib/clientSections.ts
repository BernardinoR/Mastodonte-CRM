import { 
  AlertCircle, 
  Lightbulb, 
  Target, 
  FileText, 
  History, 
  AlertTriangle, 
  GitBranch,
  type LucideIcon
} from "lucide-react";

export interface DisabledSectionConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
}

export const DISABLED_SECTIONS_TOP: DisabledSectionConfig[] = [
  { id: "farol", title: "Farol", icon: AlertCircle, description: "Indicador de acompanhamento do cliente" },
  { id: "guidance", title: "Guidance", icon: Lightbulb, description: "Orientações para próxima reunião" },
];

export const DISABLED_SECTIONS_BOTTOM: DisabledSectionConfig[] = [
  { id: "oportunidades", title: "Oportunidades", icon: Target, description: "Oportunidades identificadas" },
  { id: "metodo", title: "Método (Planejamento)", icon: FileText, description: "Planejamento financeiro" },
  { id: "timeline", title: "Linha do Tempo", icon: History, description: "Histórico de interações" },
  { id: "erros", title: "Erros e Ocorrências", icon: AlertTriangle, description: "Registro de erros e ocorrências" },
  { id: "pipeline", title: "Pipeline de Indicações", icon: GitBranch, description: "Gestão de indicações" },
];
