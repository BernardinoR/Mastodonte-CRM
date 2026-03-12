import type { Institution } from "@shared/types";

export type ContaTipo = "Automático" | "Manual" | "Manual Cliente";
export type ContaStatus = "Ativa" | "Desativada";

export interface Conta {
  id: string;
  clientId: string;
  institutionId: number;
  institution: Institution;
  accountName: string;
  numeroConta?: string;
  tipo: ContaTipo;
  competencia: string;
  competenciaDesativacao?: string;
  status: ContaStatus;
  ativoDesde?: string;
  desativadoDesde?: string;
  gerenteNome?: string;
  gerenteEmail?: string;
  gerenteTelefone?: string;
  whatsappGroupId?: string;
  whatsappGroupAtivo?: boolean;
}
