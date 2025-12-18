import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Client, ClientFullData, ClientStats, ClientMeeting, WhatsAppGroup } from "@/types/client";

interface ClientsContextType {
  clients: Client[];
  getClientById: (id: string) => Client | undefined;
  getClientByName: (name: string) => Client | undefined;
  getFullClientData: (id: string) => ClientFullData | undefined;
  getAllClients: () => Client[];
  addWhatsAppGroup: (clientId: string, group: Omit<WhatsAppGroup, 'id'>) => void;
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
    email: "mazer.ale@hotmail.com",
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-25'),
    aum: "R$ 2.800.000,00",
    riskProfile: "Moderado",
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
    email: "ademar.grieger@email.com",
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-22'),
    aum: "R$ 12.450.000,00",
    riskProfile: "Moderado / Agressivo",
    clientSince: "Dezembro de 2022",
    status: "Ativo",
  },
  {
    id: "3",
    name: "Fernanda Carolina De Faria",
    initials: "FF",
    cpf: "***.123.456-**",
    phone: "+55 (21) 99999-8888",
    email: "fernanda.faria@email.com",
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-15'),
    aum: "R$ 5.200.000,00",
    riskProfile: "Conservador",
    clientSince: "Março de 2021",
    status: "Ativo",
  },
  {
    id: "4",
    name: "Gustavo Samconi Soares",
    initials: "GS",
    cpf: "***.789.012-**",
    phone: "+55 (11) 98888-7777",
    email: "gustavo@example.com",
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-10-30'),
    aum: "R$ 800.000,00",
    riskProfile: "Moderado",
    clientSince: "Outubro de 2025",
    status: "Prospect",
  },
  {
    id: "5",
    name: "Israel Schuster Da Fonseca",
    initials: "IF",
    cpf: "***.234.567-**",
    phone: "+55 (11) 97777-6666",
    email: "israel.fonseca@email.com",
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-18'),
    aum: "R$ 8.900.000,00",
    riskProfile: "Arrojado",
    clientSince: "Fevereiro de 2022",
    status: "Ativo",
  },
  {
    id: "6",
    name: "Marcia Mozzato Ciampi De Andrade",
    initials: "MA",
    cpf: "***.345.678-**",
    phone: "+55 (11) 96666-5555",
    email: "marcia.andrade@email.com",
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-20'),
    aum: "R$ 3.500.000,00",
    riskProfile: "Conservador",
    clientSince: "Agosto de 2022",
    status: "Ativo",
  },
  {
    id: "7",
    name: "Rodrigo Weber Rocha da Silva",
    initials: "RS",
    cpf: "***.567.890-**",
    phone: "+55 (11) 95555-4444",
    email: "rodrigo.weber@email.com",
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-10'),
    aum: "R$ 4.200.000,00",
    riskProfile: "Moderado",
    clientSince: "Janeiro de 2024",
    status: "Ativo",
  },
  {
    id: "8",
    name: "Fernanda Garcia Rodrigues de Souza",
    initials: "FS",
    cpf: "***.678.901-**",
    phone: "+55 (11) 94444-3333",
    email: "fernanda.garcia@email.com",
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-05'),
    aum: "R$ 1.800.000,00",
    riskProfile: "Conservador",
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
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-25'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Reunião Mensal - Outubro", type: "Mensal", status: "Realizada", date: new Date('2025-10-20'), consultant: "Rafael Bernardino Silveira" },
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
      { id: "1", name: "Reunião Mensal - Dezembro", type: "Mensal", status: "Agendada", date: new Date('2025-12-18'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-22'), consultant: "Rafael Bernardino Silveira" },
      { id: "3", name: "Reunião Mensal - Outubro", type: "Mensal", status: "Realizada", date: new Date('2025-10-22'), consultant: "Rafael Bernardino Silveira" },
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
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-15'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Follow-up Investimentos", type: "Follow-up", status: "Realizada", date: new Date('2025-11-08'), consultant: "Rafael Bernardino Silveira" },
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
      { id: "1", name: "Reunião de Prospecção", type: "Especial", status: "Realizada", date: new Date('2025-10-30'), consultant: "Rafael Bernardino Silveira" },
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
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-18'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Reunião de Estratégia", type: "Especial", status: "Realizada", date: new Date('2025-11-05'), consultant: "Rafael Bernardino Silveira" },
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
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-20'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Follow-up Previdência", type: "Follow-up", status: "Realizada", date: new Date('2025-11-05'), consultant: "Rafael Bernardino Silveira" },
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
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-10'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Reunião Mensal - Outubro", type: "Mensal", status: "Realizada", date: new Date('2025-10-15'), consultant: "Rafael Bernardino Silveira" },
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
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-05'), consultant: "Rafael Bernardino Silveira" },
    ],
    whatsappGroups: [
      { id: "1", name: "Fernanda G. | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/bcd890", createdAt: new Date('2024-05-10'), status: "Ativo" },
    ],
  },
};

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients] = useState<Client[]>(INITIAL_CLIENTS);
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

  const addWhatsAppGroup = useCallback((clientId: string, group: Omit<WhatsAppGroup, 'id'>) => {
    setExtendedData(prev => {
      const clientData = prev[clientId] || { stats: [], meetings: [], whatsappGroups: [] };
      const newGroup: WhatsAppGroup = {
        ...group,
        id: `${Date.now()}`,
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

  return (
    <ClientsContext.Provider value={{
      clients,
      getClientById,
      getClientByName,
      getFullClientData,
      getAllClients,
      addWhatsAppGroup,
      dataVersion,
    }}>
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
