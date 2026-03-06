export type ContaHistoricoStatus = "Consolidado" | "Pedir Extrato" | "Em Andamento" | "Aguardando";

export interface ContaHistoricoEntry {
  id: string;
  competencia: string;
  status: ContaHistoricoStatus;
  description?: string;
}
