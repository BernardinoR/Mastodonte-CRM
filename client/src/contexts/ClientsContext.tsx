import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { Client, ClientFullData, ClientStats, ClientMeeting, WhatsAppGroup, Address } from "@/types/client";
import type { ClientStatus } from "@/lib/statusConfig";
import type { MeetingDetail } from "@/types/meeting";

function deriveInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();
  return first + last;
}

interface ClientsContextType {
  clients: Client[];
  getClientById: (id: string) => Client | undefined;
  getClientByName: (name: string) => Client | undefined;
  getFullClientData: (id: string) => ClientFullData | undefined;
  getAllClients: () => Client[];
  getMeetingDetail: (clientId: string, meetingId: string) => MeetingDetail | undefined;
  addWhatsAppGroup: (clientId: string, group: Omit<WhatsAppGroup, 'id'>) => void;
  updateWhatsAppGroup: (clientId: string, groupId: string, updates: Partial<Omit<WhatsAppGroup, 'id'>>) => void;
  deleteWhatsAppGroup: (clientId: string, groupId: string) => void;
  updateClientStatus: (clientId: string, status: ClientStatus) => void;
  updateClientName: (clientId: string, name: string) => void;
  updateClientCpf: (clientId: string, cpf: string) => void;
  updateClientPhone: (clientId: string, phone: string) => void;
  updateClientEmails: (clientId: string, emails: string[], primaryEmailIndex: number) => void;
  addClientEmail: (clientId: string, email: string) => void;
  removeClientEmail: (clientId: string, emailIndex: number) => void;
  updateClientEmail: (clientId: string, emailIndex: number, newEmail: string) => void;
  setClientPrimaryEmail: (clientId: string, emailIndex: number) => void;
  updateClientAdvisor: (clientId: string, advisor: string) => void;
  updateClientAddress: (clientId: string, address: Address) => void;
  updateClientFoundationCode: (clientId: string, foundationCode: string) => void;
  addClientMeeting: (clientId: string, meeting: Omit<ClientMeeting, 'id'>) => void;
  updateClientMeeting: (clientId: string, meetingId: string, updates: Partial<Omit<ClientMeeting, 'id'>>) => void;
  deleteClientMeeting: (clientId: string, meetingId: string) => void;
  dataVersion: number;
}

const ClientsContext = createContext<ClientsContextType | null>(null);

const INITIAL_CLIENTS: Client[] = [
  {
    id: "1",
    name: "Alessandro Cuçulin Mazer",
    initials: "AM",
    cpf: "XXX.XXX.XXX-XX",
    phone: "+55 (16) 99708-716",
    emails: ["mazer.ale@hotmail.com", "alessandro.mazer@empresa.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-25'),
    address: {
      street: "Rua das Flores, 123",
      complement: "Apto 501",
      neighborhood: "Centro",
      city: "Campo Bom",
      state: "RS",
      zipCode: "93700-000",
    },
    foundationCode: "652e3f56-10e6-4423-a667-fdd711f856f2",
    clientSince: "Junho de 2023",
    status: "Ativo",
    folderLink: "https://vault.repl.ai/file/com.google.drive/id/example",
  },
  {
    id: "2",
    name: "Ademar João Gréguer",
    initials: "AG",
    cpf: "***.456.789-**",
    phone: "+55 (47) 99123-4567",
    emails: ["ademar.grieger@email.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-22'),
    address: {
      street: "Rua XV de Novembro, 456",
      complement: "",
      neighborhood: "Centro",
      city: "Blumenau",
      state: "SC",
      zipCode: "89010-000",
    },
    foundationCode: "a1b2c3d4-5e6f-7890-abcd-ef1234567890",
    clientSince: "Dezembro de 2022",
    status: "Ativo",
  },
  {
    id: "3",
    name: "Fernanda Carolina De Faria",
    initials: "FF",
    cpf: "***.123.456-**",
    phone: "+55 (21) 99999-8888",
    emails: ["fernanda.faria@email.com", "fernanda.trabalho@corp.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-15'),
    address: {
      street: "Av. Atlântica, 1500",
      complement: "Cobertura",
      neighborhood: "Copacabana",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22021-000",
    },
    foundationCode: "b2c3d4e5-6f70-8901-bcde-f12345678901",
    clientSince: "Março de 2021",
    status: "Ativo",
  },
  {
    id: "4",
    name: "Gustavo Samconi Soares",
    initials: "GS",
    cpf: "***.789.012-**",
    phone: "+55 (11) 98888-7777",
    emails: ["gustavo@example.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-10-30'),
    address: {
      street: "Av. Paulista, 1000",
      complement: "Sala 2001",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
    },
    foundationCode: "c3d4e5f6-7081-9012-cdef-123456789012",
    clientSince: "Outubro de 2025",
    status: "Prospect",
  },
  {
    id: "5",
    name: "Israel Schuster Da Fonseca",
    initials: "IF",
    cpf: "***.234.567-**",
    phone: "+55 (11) 97777-6666",
    emails: ["israel.fonseca@email.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-18'),
    address: {
      street: "Rua Barão de Jaguara, 200",
      complement: "",
      neighborhood: "Centro",
      city: "Campinas",
      state: "SP",
      zipCode: "13015-001",
    },
    foundationCode: "d4e5f6a7-8192-0123-defa-234567890123",
    clientSince: "Fevereiro de 2022",
    status: "Ativo",
  },
  {
    id: "6",
    name: "Marcia Mozzato Ciampi De Andrade",
    initials: "MA",
    cpf: "***.345.678-**",
    phone: "+55 (11) 96666-5555",
    emails: ["marcia.andrade@email.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-20'),
    address: {
      street: "Av. Ana Costa, 300",
      complement: "Bloco B, Apto 12",
      neighborhood: "Gonzaga",
      city: "Santos",
      state: "SP",
      zipCode: "11060-001",
    },
    foundationCode: "e5f6a7b8-9203-1234-efab-345678901234",
    clientSince: "Agosto de 2022",
    status: "Ativo",
  },
  {
    id: "7",
    name: "Rodrigo Weber Rocha da Silva",
    initials: "RS",
    cpf: "***.567.890-**",
    phone: "+55 (11) 95555-4444",
    emails: ["rodrigo.weber@email.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-10'),
    address: {
      street: "Rua XV de Novembro, 700",
      complement: "",
      neighborhood: "Centro",
      city: "Curitiba",
      state: "PR",
      zipCode: "80020-310",
    },
    foundationCode: "f6a7b8c9-0314-2345-fabc-456789012345",
    clientSince: "Janeiro de 2024",
    status: "Ativo",
  },
  {
    id: "8",
    name: "Fernanda Garcia Rodrigues de Souza",
    initials: "FS",
    cpf: "***.678.901-**",
    phone: "+55 (11) 94444-3333",
    emails: ["fernanda.garcia@email.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-05'),
    address: {
      street: "Av. Ipiranga, 1200",
      complement: "Casa",
      neighborhood: "Azenha",
      city: "Porto Alegre",
      state: "RS",
      zipCode: "90160-093",
    },
    foundationCode: "a7b8c9d0-1425-3456-abcd-567890123456",
    clientSince: "Maio de 2024",
    status: "Ativo",
  },
];

const CLIENT_EXTENDED_DATA: Record<string, { stats: ClientStats[]; meetings: ClientMeeting[]; whatsappGroups: WhatsAppGroup[] }> = {
  "1": {
    stats: [
      { value: "R$ 2,8M", label: "AUM Total", change: "↑ +3.1% este mês", changeType: "positive" },
      { value: "4", label: "Reuniões em 2025", change: "↑ +1 vs 2024", changeType: "positive" },
      { value: "7", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
      { value: "1", label: "Indicações", change: "Em prospecção", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-25'), assignees: ["Rafael Bernardino Silveira"] },
      { id: "2", name: "Reunião Mensal - Outubro", type: "Mensal", status: "Realizada", date: new Date('2025-10-20'), assignees: ["Rafael Bernardino Silveira"] },
    ],
    whatsappGroups: [
      { id: "1", name: "Alessandro | Mastodonte", purpose: "Atendimento principal do cliente", link: "https://chat.whatsapp.com/abc123", createdAt: new Date('2023-06-15'), status: "Ativo" },
    ],
  },
  "2": {
    stats: [
      { value: "R$ 12,4M", label: "AUM Total", change: "↑ +5.2% este mês", changeType: "positive" },
      { value: "8", label: "Reuniões em 2025", change: "↑ +2 vs 2024", changeType: "positive" },
      { value: "15", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
      { value: "3", label: "Indicações", change: "1 convertida", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Dezembro", type: "Mensal", status: "Agendada", date: new Date('2025-12-18'), assignees: ["Rafael Bernardino Silveira"] },
      { id: "2", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-22'), assignees: ["Rafael Bernardino Silveira"] },
      { id: "3", name: "Reunião Mensal - Outubro", type: "Mensal", status: "Realizada", date: new Date('2025-10-22'), assignees: ["Rafael Bernardino Silveira"] },
    ],
    whatsappGroups: [
      { id: "1", name: "Ademar | Mastodonte & Bradesco", purpose: "Atendimento principal do cliente", link: "https://chat.whatsapp.com/def456", createdAt: new Date('2022-12-15'), status: "Ativo" },
      { id: "2", name: "Ademar | Grieger Holding", purpose: "Assuntos da empresa e holding familiar", link: "https://chat.whatsapp.com/ghi789", createdAt: new Date('2024-03-08'), status: "Ativo" },
      { id: "3", name: "Ademar & Cláudia | Família", purpose: "Planejamento sucessório com esposa", link: "https://chat.whatsapp.com/jkl012", createdAt: new Date('2025-09-22'), status: "Ativo" },
      { id: "4", name: "Ademar | Antiga XP", purpose: "Migração de antiga corretora (arquivado)", link: null, createdAt: new Date('2022-10-12'), status: "Inativo" },
    ],
  },
  "3": {
    stats: [
      { value: "R$ 5,2M", label: "AUM Total", change: "↑ +2.8% este mês", changeType: "positive" },
      { value: "6", label: "Reuniões em 2025", change: "Igual a 2024", changeType: "neutral" },
      { value: "12", label: "Tasks Concluídas", change: "92% no prazo", changeType: "positive" },
      { value: "2", label: "Indicações", change: "1 em análise", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-15'), assignees: ["Rafael Bernardino Silveira"] },
      { id: "2", name: "Follow-up Investimentos", type: "Follow-up", status: "Realizada", date: new Date('2025-11-08'), assignees: ["Rafael Bernardino Silveira"] },
    ],
    whatsappGroups: [
      { id: "1", name: "Fernanda | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/mno345", createdAt: new Date('2021-03-20'), status: "Ativo" },
    ],
  },
  "4": {
    stats: [
      { value: "R$ 800K", label: "AUM Total", change: "Novo cliente", changeType: "neutral" },
      { value: "2", label: "Reuniões em 2025", change: "Prospecção", changeType: "neutral" },
      { value: "3", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
      { value: "0", label: "Indicações", change: "-", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião de Prospecção", type: "Especial", status: "Realizada", date: new Date('2025-10-30'), assignees: ["Rafael Bernardino Silveira"] },
    ],
    whatsappGroups: [
      { id: "1", name: "Gustavo | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/xyz789", createdAt: new Date('2025-10-30'), status: "Ativo" },
    ],
  },
  "5": {
    stats: [
      { value: "R$ 8,9M", label: "AUM Total", change: "↑ +4.5% este mês", changeType: "positive" },
      { value: "9", label: "Reuniões em 2025", change: "↑ +3 vs 2024", changeType: "positive" },
      { value: "18", label: "Tasks Concluídas", change: "94% no prazo", changeType: "positive" },
      { value: "4", label: "Indicações", change: "2 convertidas", changeType: "positive" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-18'), assignees: ["Rafael Bernardino Silveira"] },
      { id: "2", name: "Reunião de Estratégia", type: "Especial", status: "Realizada", date: new Date('2025-11-05'), assignees: ["Rafael Bernardino Silveira"] },
    ],
    whatsappGroups: [
      { id: "1", name: "Israel | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/pqr678", createdAt: new Date('2022-02-15'), status: "Ativo" },
      { id: "2", name: "Israel | Investimentos", purpose: "Discussões sobre carteira", link: "https://chat.whatsapp.com/stu901", createdAt: new Date('2023-06-10'), status: "Ativo" },
    ],
  },
  "6": {
    stats: [
      { value: "R$ 3,5M", label: "AUM Total", change: "↑ +1.2% este mês", changeType: "positive" },
      { value: "6", label: "Reuniões em 2025", change: "Igual a 2024", changeType: "neutral" },
      { value: "11", label: "Tasks Concluídas", change: "91% no prazo", changeType: "positive" },
      { value: "2", label: "Indicações", change: "1 em análise", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião de Acompanhamento - Setembro", type: "Mensal", status: "Realizada", date: new Date('2025-09-18'), assignees: ["Rafael Bernardino Silveira"] },
      { id: "2", name: "Reunião Mensal - Agosto", type: "Mensal", status: "Realizada", date: new Date('2025-08-15'), assignees: ["Rafael Bernardino Silveira"] },
      { id: "3", name: "Follow-up Previdência", type: "Follow-up", status: "Realizada", date: new Date('2025-07-10'), assignees: ["Rafael Bernardino Silveira"] },
    ],
    whatsappGroups: [
      { id: "1", name: "Marcia | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/vwx234", createdAt: new Date('2022-08-25'), status: "Ativo" },
    ],
  },
  "7": {
    stats: [
      { value: "R$ 4,2M", label: "AUM Total", change: "↑ +2.5% este mês", changeType: "positive" },
      { value: "5", label: "Reuniões em 2025", change: "Novo cliente", changeType: "neutral" },
      { value: "8", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
      { value: "1", label: "Indicações", change: "Em prospecção", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-10'), assignees: ["Rafael Bernardino Silveira"] },
      { id: "2", name: "Reunião Mensal - Outubro", type: "Mensal", status: "Realizada", date: new Date('2025-10-15'), assignees: ["Rafael Bernardino Silveira"] },
    ],
    whatsappGroups: [
      { id: "1", name: "Rodrigo | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/yza567", createdAt: new Date('2024-01-15'), status: "Ativo" },
    ],
  },
  "8": {
    stats: [
      { value: "R$ 1,8M", label: "AUM Total", change: "↑ +1.8% este mês", changeType: "positive" },
      { value: "4", label: "Reuniões em 2025", change: "Novo cliente", changeType: "neutral" },
      { value: "5", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
      { value: "0", label: "Indicações", change: "-", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-05'), assignees: ["Rafael Bernardino Silveira"] },
    ],
    whatsappGroups: [
      { id: "1", name: "Fernanda G. | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/bcd890", createdAt: new Date('2024-05-10'), status: "Ativo" },
    ],
  },
};

// Detailed meeting data for specific meetings
export const MEETING_DETAILS_DATA: Record<string, MeetingDetail> = {
  // Márcia's September meeting - full example
  "6-1": {
    id: "1",
    name: "Reunião de Acompanhamento - Setembro",
    type: "Mensal",
    status: "Realizada",
    date: new Date('2025-09-18'),
    startTime: "10:00",
    endTime: "11:15",
    duration: "1h 15min",
    location: "Google Meet",
    assignees: ["Rafael Bernardino Silveira"],
    responsible: {
      name: "Rafael",
      initials: "RF",
    },
    clientName: "Márcia",
    summary: `Foi discutida a <strong>situação financeira da empresa</strong> e as dificuldades de caixa diante de atrasos de clientes e custos com obras, além da importância da <strong>gestão de milhas</strong> para economizar em viagens. Rafael apresentou o desempenho das <strong>carteiras de investimento</strong> e as estratégias de realocação, pontos sobre <strong>consórcios e crédito para caminhões</strong>, além de orientações sobre compra de dólar e conta Wise.`,
    clientContext: {
      points: [
        { id: "1", icon: "alert-circle", text: "Período desafiador nas finanças devido a obras e atrasos de clientes. Preocupação com saúde e custos adicionais." },
        { id: "2", icon: "home", text: "Desafios com reforma em andamento e necessidade de troca de fornecedores durante o processo." },
        { id: "3", icon: "plane", text: "Gosta de viajar com frequência e planeja viagem para janeiro/fevereiro do próximo ano." },
        { id: "4", icon: "credit-card", text: "Preza pela praticidade nas transações bancárias. Ajustando número de contas para facilitar controle." },
      ],
    },
    highlights: [
      { id: "1", icon: "building", text: "Fluxo de caixa apertado", type: "normal" },
      { id: "2", icon: "plane", text: "Viagem Jan/Fev", type: "normal" },
      { id: "3", icon: "truck", text: "Renovação de frota", type: "normal" },
      { id: "4", icon: "alert-triangle", text: "Atenção: Banco Master", type: "warning" },
    ],
    agenda: [
      {
        id: "1",
        number: 1,
        title: "Situação Financeira e Fluxo de Caixa",
        status: "discussed",
        subitems: [
          { id: "1-1", title: "Dificuldades de caixa atuais", description: "Empresa enfrentando atrasos de recebimentos de clientes, impactando o fluxo de caixa mensal." },
          { id: "1-2", title: "Custos com obras", description: "Reforma em andamento gerando custos extras. Necessidade de troca de fornecedores durante o processo." },
          { id: "1-3", title: "Preocupações adicionais", description: "Questões de saúde e custos relacionados sendo monitorados." },
        ],
      },
      {
        id: "2",
        number: 2,
        title: "Desempenho das Carteiras de Investimento",
        status: "discussed",
        subitems: [
          { id: "2-1", title: "Análise de performance", description: "Rafael apresentou o desempenho atual das carteiras e rentabilidade no período." },
          { id: "2-2", title: "Estratégias de realocação", description: "Discussão sobre oportunidades de realocação para melhorar rentabilidade." },
          { id: "2-3", title: "Carteira do Reinaldo", description: "Pendente recebimento da carteira para análise e sugestão de realocações mais rentáveis no Itaú." },
        ],
      },
      {
        id: "3",
        number: 3,
        title: "Consórcios e Crédito para Renovação de Frota",
        status: "action_pending",
        subitems: [
          { id: "3-1", title: "Consórcio misto", description: "Cotação pode gerar economia relevante, especialmente com garantia em investimentos existentes." },
          { id: "3-2", title: "Crédito para caminhões", description: "Avaliar melhores opções de financiamento para renovação da frota da empresa." },
        ],
      },
      {
        id: "4",
        number: 4,
        title: "Gestão de Milhas e Planejamento de Viagens",
        status: "discussed",
        subitems: [
          { id: "4-1", title: "Serviço de concierge", description: "Potencial para reduzir custos de viagens dado a frequência de viagens da Márcia." },
          { id: "4-2", title: "Viagem planejada", description: "Márcia planeja viagem para janeiro/fevereiro - oportunidade para uso do concierge." },
        ],
      },
      {
        id: "5",
        number: 5,
        title: "Otimização Bancária e Cartões",
        status: "action_pending",
        subitems: [
          { id: "5-1", title: "Consolidação de contas", description: "Redução do número de contas para simplificar gestão e melhorar acúmulo de pontos/milhas." },
          { id: "5-2", title: "Cartão C6", description: "Pontuação atual abaixo do esperado. Solicitar aumento para 3 ou 3,5 pontos + sala VIP ilimitada." },
          { id: "5-3", title: "Conta Wise e Dólar", description: "Orientações sobre compra de dólar e uso da conta Wise para viagens internacionais." },
        ],
      },
    ],
    decisions: [
      { id: "1", content: "Cotação de <strong>consórcio misto</strong> pode gerar economia relevante, principalmente com garantia em investimentos", type: "normal" },
      { id: "2", content: "Serviço de <strong>concierge de milhas e viagens</strong> tem potencial para reduzir custos, dada a frequência de viagens", type: "normal" },
      { id: "3", content: "<strong>Redução de contas bancárias</strong> pode simplificar a gestão financeira e melhorar o acúmulo de pontos/milhas", type: "normal" },
      { id: "4", content: "Pontuação do <strong>cartão C6 abaixo do esperado</strong> - solicitar upgrade para potencializar benefícios", type: "normal" },
      { id: "5", content: "<strong>Atenção ao cenário de crédito</strong> e desempenho do Banco Master - monitorar exposição", type: "warning" },
    ],
    linkedTasks: [
      {
        id: "1",
        title: "Verificar e solicitar aumento da pontuação do cartão C6 de Márcia para 3 ou 3,5 pontos e sala VIP ilimitada",
        dueDate: new Date('2025-09-25'),
        assignee: "Rafael",
        priority: "Importante",
        completed: false,
      },
      {
        id: "2",
        title: "Preparar comparativo das diferentes possibilidades de consórcio e crédito para renovação de frota",
        dueDate: new Date('2025-09-30'),
        assignee: "Rafael",
        priority: "Importante",
        completed: false,
      },
      {
        id: "3",
        title: "Apresentar serviço de concierge de viagens/milhas e viabilizar contato com o serviço",
        dueDate: new Date('2025-10-05'),
        assignee: "Rafael",
        priority: "Normal",
        completed: false,
      },
      {
        id: "4",
        title: "Receber carteira de investimentos do Reinaldo e sugerir realocações mais rentáveis no Itaú",
        dueDate: new Date('2025-10-10'),
        assignee: "Rafael",
        priority: "Normal",
        completed: false,
      },
    ],
    participants: [
      { id: "1", name: "Márcia", role: "Cliente", avatarColor: "#a78bfa", initials: "MA" },
      { id: "2", name: "Rafael", role: "Consultor de Investimentos", avatarColor: "#2563eb", initials: "RF" },
      { id: "3", name: "Reinaldo", role: "Mencionado", avatarColor: "#10b981", initials: "RE" },
    ],
    attachments: [
      { id: "1", name: "Relatório_Carteira_Setembro.pdf", type: "pdf", size: "2.4 MB", addedAt: new Date('2025-09-18') },
      { id: "2", name: "Comparativo_Consórcios.xlsx", type: "excel", size: "856 KB", addedAt: new Date('2025-09-20') },
      { id: "3", name: "Proposta_C6_Upgrade.docx", type: "doc", size: "320 KB", addedAt: new Date('2025-09-19') },
      { id: "4", name: "Concierge_Milhas_Apresentação.pdf", type: "pdf", size: "1.8 MB", addedAt: new Date('2025-09-18') },
    ],
  },
};

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [extendedData, setExtendedData] = useState<Record<string, { stats: ClientStats[]; meetings: ClientMeeting[]; whatsappGroups: WhatsAppGroup[] }>>(CLIENT_EXTENDED_DATA);
  const [dataVersion, setDataVersion] = useState(0);

  const getClientById = useCallback((id: string) => {
    return clients.find(c => c.id === id);
  }, [clients]);

  const getClientByName = useCallback((name: string) => {
    return clients.find(c => c.name.toLowerCase() === name.toLowerCase());
  }, [clients]);

  const getFullClientData = useCallback((id: string): ClientFullData | undefined => {
    const client = clients.find(c => c.id === id);
    if (!client) return undefined;
    
    const data = extendedData[id];
    if (!data) {
      return {
        client,
        stats: [],
        meetings: [],
        whatsappGroups: [],
      };
    }
    
    return {
      client,
      ...data,
    };
  }, [clients, extendedData]);

  const getAllClients = useCallback(() => {
    return clients;
  }, [clients]);

  const getMeetingDetail = useCallback((clientId: string, meetingId: string): MeetingDetail | undefined => {
    const key = `${clientId}-${meetingId}`;
    return MEETING_DETAILS_DATA[key];
  }, []);

  const addWhatsAppGroup = useCallback((clientId: string, group: Omit<WhatsAppGroup, 'id'>) => {
    setExtendedData(prev => {
      const clientData = prev[clientId] || { stats: [], meetings: [], whatsappGroups: [] };
      const newGroup: WhatsAppGroup = {
        ...group,
        id: crypto.randomUUID(),
      };
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          whatsappGroups: [...clientData.whatsappGroups, newGroup],
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const updateWhatsAppGroup = useCallback((clientId: string, groupId: string, updates: Partial<Omit<WhatsAppGroup, 'id'>>) => {
    setExtendedData(prev => {
      const clientData = prev[clientId];
      if (!clientData) return prev;
      
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          whatsappGroups: clientData.whatsappGroups.map(group =>
            group.id === groupId ? { ...group, ...updates } : group
          ),
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const deleteWhatsAppGroup = useCallback((clientId: string, groupId: string) => {
    setExtendedData(prev => {
      const clientData = prev[clientId];
      if (!clientData) return prev;
      
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          whatsappGroups: clientData.whatsappGroups.filter(group => group.id !== groupId),
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const updateClientStatus = useCallback((clientId: string, status: ClientStatus) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, status } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientName = useCallback((clientId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    setClients(prev => prev.map(client =>
      client.id === clientId 
        ? { ...client, name: trimmedName, initials: deriveInitials(trimmedName) } 
        : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientCpf = useCallback((clientId: string, cpf: string) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, cpf } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientPhone = useCallback((clientId: string, phone: string) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, phone } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientEmails = useCallback((clientId: string, emails: string[], primaryEmailIndex: number) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, emails, primaryEmailIndex } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const addClientEmail = useCallback((clientId: string, email: string) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId) return client;
      return { ...client, emails: [...client.emails, email] };
    }));
    setDataVersion(v => v + 1);
  }, []);

  const removeClientEmail = useCallback((clientId: string, emailIndex: number) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId) return client;
      if (client.emails.length <= 1) return client;
      
      const newEmails = client.emails.filter((_, i) => i !== emailIndex);
      let newPrimaryIndex = client.primaryEmailIndex;
      
      if (emailIndex === client.primaryEmailIndex) {
        newPrimaryIndex = 0;
      } else if (emailIndex < client.primaryEmailIndex) {
        newPrimaryIndex = client.primaryEmailIndex - 1;
      }
      
      return { ...client, emails: newEmails, primaryEmailIndex: newPrimaryIndex };
    }));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientEmail = useCallback((clientId: string, emailIndex: number, newEmail: string) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId) return client;
      const newEmails = [...client.emails];
      newEmails[emailIndex] = newEmail;
      return { ...client, emails: newEmails };
    }));
    setDataVersion(v => v + 1);
  }, []);

  const setClientPrimaryEmail = useCallback((clientId: string, emailIndex: number) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, primaryEmailIndex: emailIndex } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientAdvisor = useCallback((clientId: string, advisor: string) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, advisor } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientAddress = useCallback((clientId: string, address: Address) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, address } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientFoundationCode = useCallback((clientId: string, foundationCode: string) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, foundationCode } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const addClientMeeting = useCallback((clientId: string, meeting: Omit<ClientMeeting, 'id'>) => {
    setExtendedData(prev => {
      const clientData = prev[clientId] || { stats: [], meetings: [], whatsappGroups: [] };
      const newMeeting: ClientMeeting = {
        ...meeting,
        id: crypto.randomUUID(),
      };
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          meetings: [...clientData.meetings, newMeeting],
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const updateClientMeeting = useCallback((clientId: string, meetingId: string, updates: Partial<Omit<ClientMeeting, 'id'>>) => {
    setExtendedData(prev => {
      const clientData = prev[clientId];
      if (!clientData) return prev;
      
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          meetings: clientData.meetings.map(meeting =>
            meeting.id === meetingId ? { ...meeting, ...updates } : meeting
          ),
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const deleteClientMeeting = useCallback((clientId: string, meetingId: string) => {
    setExtendedData(prev => {
      const clientData = prev[clientId];
      if (!clientData) return prev;
      
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          meetings: clientData.meetings.filter(meeting => meeting.id !== meetingId),
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const contextValue = useMemo(() => ({
    clients,
    getClientById,
    getClientByName,
    getFullClientData,
    getAllClients,
    getMeetingDetail,
    addWhatsAppGroup,
    updateWhatsAppGroup,
    deleteWhatsAppGroup,
    updateClientStatus,
    updateClientName,
    updateClientCpf,
    updateClientPhone,
    updateClientEmails,
    addClientEmail,
    removeClientEmail,
    updateClientEmail,
    setClientPrimaryEmail,
    updateClientAdvisor,
    updateClientAddress,
    updateClientFoundationCode,
    addClientMeeting,
    updateClientMeeting,
    deleteClientMeeting,
    dataVersion,
  }), [clients, getClientById, getClientByName, getFullClientData, getAllClients, getMeetingDetail, addWhatsAppGroup, updateWhatsAppGroup, deleteWhatsAppGroup, updateClientStatus, updateClientName, updateClientCpf, updateClientPhone, updateClientEmails, addClientEmail, removeClientEmail, updateClientEmail, setClientPrimaryEmail, updateClientAdvisor, updateClientAddress, updateClientFoundationCode, addClientMeeting, updateClientMeeting, deleteClientMeeting, dataVersion]);

  return (
    <ClientsContext.Provider value={contextValue}>
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error("useClients must be used within a ClientsProvider");
  }
  return context;
}
