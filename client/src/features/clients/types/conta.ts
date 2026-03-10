export type ContaTipo = "Automático" | "Manual" | "Manual Cliente";
export type ContaStatus = "Ativa" | "Desativada";

export interface Conta {
  id: string;
  clientId: string;
  institution: string;
  accountName: string;
  numeroConta?: string;
  tipo: ContaTipo;
  competencia: string;
  status: ContaStatus;
  esporadico: boolean;
  ativoDesde?: string;
  desativadoDesde?: string;
}
