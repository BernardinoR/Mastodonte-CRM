/**
 * Mock data para clientes
 * Separado do contexto para manter o código limpo e facilitar testes
 */
import type { Client, ClientStats, ClientMeeting, WhatsAppGroup } from "@features/clients";
import type { MeetingDetail } from "@features/meetings";

// Clientes iniciais
export const INITIAL_CLIENTS: Client[] = [
  {
    id: "1",
    name: "Alessandro Cuçulin Mazer",
    initials: "AM",
    cpf: "XXX.XXX.XXX-XX",
    phone: "+55 (16) 99708-716",
    emails: ["mazer.ale@hotmail.com", "alessandro.mazer@empresa.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date("2025-11-25"),
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
    clientSinceDate: new Date("2023-06-01"),
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
    lastMeeting: new Date("2025-11-22"),
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
    clientSinceDate: new Date("2022-12-01"),
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
    lastMeeting: new Date("2025-11-15"),
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
    clientSinceDate: new Date("2021-03-01"),
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
    lastMeeting: new Date("2025-10-30"),
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
    clientSinceDate: new Date("2025-10-01"),
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
    lastMeeting: new Date("2025-11-18"),
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
    clientSinceDate: new Date("2022-02-01"),
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
    lastMeeting: new Date("2025-11-20"),
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
    clientSinceDate: new Date("2022-08-01"),
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
    lastMeeting: new Date("2025-11-10"),
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
    clientSinceDate: new Date("2024-01-01"),
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
    lastMeeting: new Date("2025-11-05"),
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
    clientSinceDate: new Date("2024-05-01"),
    status: "Ativo",
  },
];

// Tipo para dados estendidos de cliente
export interface ClientExtendedData {
  stats: ClientStats[];
  meetings: ClientMeeting[];
  whatsappGroups: WhatsAppGroup[];
}

// Dados estendidos por cliente (stats, meetings, whatsappGroups)
export const CLIENT_EXTENDED_DATA: Record<string, ClientExtendedData> = {
  "1": {
    stats: [
      { value: "R$ 2,8M", label: "AUM Total", change: "↑ +3.1% este mês", changeType: "positive" },
      { value: "4", label: "Reuniões em 2025", change: "↑ +1 vs 2024", changeType: "positive" },
      { value: "7", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
      { value: "1", label: "Indicações", change: "Em prospecção", changeType: "neutral" },
    ],
    meetings: [
      {
        id: "1",
        name: "Reunião Mensal - Novembro",
        type: "Mensal",
        status: "Realizada",
        date: new Date("2025-11-25"),
        assignees: ["Rafael Bernardino Silveira"],
      },
      {
        id: "2",
        name: "Reunião Mensal - Outubro",
        type: "Mensal",
        status: "Realizada",
        date: new Date("2025-10-20"),
        assignees: ["Rafael Bernardino Silveira"],
      },
    ],
    whatsappGroups: [
      {
        id: "1",
        name: "Alessandro | Mastodonte",
        purpose: "Atendimento principal do cliente",
        link: "https://chat.whatsapp.com/abc123",
        createdAt: new Date("2023-06-15"),
        status: "Ativo",
      },
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
      {
        id: "1",
        name: "Reunião Mensal - Dezembro",
        type: "Mensal",
        status: "Agendada",
        date: new Date("2025-12-18"),
        assignees: ["Rafael Bernardino Silveira"],
      },
      {
        id: "2",
        name: "Reunião Mensal - Novembro",
        type: "Mensal",
        status: "Realizada",
        date: new Date("2025-11-22"),
        assignees: ["Rafael Bernardino Silveira"],
      },
      {
        id: "3",
        name: "Reunião Mensal - Outubro",
        type: "Mensal",
        status: "Realizada",
        date: new Date("2025-10-22"),
        assignees: ["Rafael Bernardino Silveira"],
      },
    ],
    whatsappGroups: [
      {
        id: "1",
        name: "Ademar | Mastodonte & Bradesco",
        purpose: "Atendimento principal do cliente",
        link: "https://chat.whatsapp.com/def456",
        createdAt: new Date("2022-12-15"),
        status: "Ativo",
      },
      {
        id: "2",
        name: "Ademar | Grieger Holding",
        purpose: "Assuntos da empresa e holding familiar",
        link: "https://chat.whatsapp.com/ghi789",
        createdAt: new Date("2024-03-08"),
        status: "Ativo",
      },
      {
        id: "3",
        name: "Ademar & Cláudia | Família",
        purpose: "Planejamento sucessório com esposa",
        link: "https://chat.whatsapp.com/jkl012",
        createdAt: new Date("2025-09-22"),
        status: "Ativo",
      },
      {
        id: "4",
        name: "Ademar | Antiga XP",
        purpose: "Migração de antiga corretora (arquivado)",
        link: null,
        createdAt: new Date("2022-10-12"),
        status: "Inativo",
      },
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
      {
        id: "1",
        name: "Reunião Mensal - Novembro",
        type: "Mensal",
        status: "Realizada",
        date: new Date("2025-11-15"),
        assignees: ["Rafael Bernardino Silveira"],
      },
      {
        id: "2",
        name: "Follow-up Investimentos",
        type: "Esporádica",
        status: "Realizada",
        date: new Date("2025-11-08"),
        assignees: ["Rafael Bernardino Silveira"],
      },
    ],
    whatsappGroups: [
      {
        id: "1",
        name: "Fernanda | Mastodonte",
        purpose: "Atendimento principal",
        link: "https://chat.whatsapp.com/mno345",
        createdAt: new Date("2021-03-20"),
        status: "Ativo",
      },
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
      {
        id: "1",
        name: "Reunião de Prospecção",
        type: "Esporádica",
        status: "Realizada",
        date: new Date("2025-10-30"),
        assignees: ["Rafael Bernardino Silveira"],
      },
    ],
    whatsappGroups: [
      {
        id: "1",
        name: "Gustavo | Mastodonte",
        purpose: "Atendimento principal",
        link: "https://chat.whatsapp.com/xyz789",
        createdAt: new Date("2025-10-30"),
        status: "Ativo",
      },
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
      {
        id: "1",
        name: "Reunião Mensal - Novembro",
        type: "Mensal",
        status: "Realizada",
        date: new Date("2025-11-18"),
        assignees: ["Rafael Bernardino Silveira"],
      },
      {
        id: "2",
        name: "Reunião de Estratégia",
        type: "Esporádica",
        status: "Realizada",
        date: new Date("2025-11-05"),
        assignees: ["Rafael Bernardino Silveira"],
      },
    ],
    whatsappGroups: [
      {
        id: "1",
        name: "Israel | Mastodonte",
        purpose: "Atendimento principal",
        link: "https://chat.whatsapp.com/pqr678",
        createdAt: new Date("2022-02-15"),
        status: "Ativo",
      },
      {
        id: "2",
        name: "Israel | Investimentos",
        purpose: "Discussões sobre carteira",
        link: "https://chat.whatsapp.com/stu901",
        createdAt: new Date("2023-06-10"),
        status: "Ativo",
      },
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
      {
        id: "1",
        name: "Reunião de Acompanhamento - Setembro",
        type: "Mensal",
        status: "Realizada",
        date: new Date("2025-09-18"),
        assignees: ["Rafael Bernardino Silveira"],
      },
      {
        id: "2",
        name: "Reunião Mensal - Agosto",
        type: "Mensal",
        status: "Realizada",
        date: new Date("2025-08-15"),
        assignees: ["Rafael Bernardino Silveira"],
      },
      {
        id: "3",
        name: "Follow-up Previdência",
        type: "Esporádica",
        status: "Realizada",
        date: new Date("2025-07-10"),
        assignees: ["Rafael Bernardino Silveira"],
      },
    ],
    whatsappGroups: [
      {
        id: "1",
        name: "Marcia | Mastodonte",
        purpose: "Atendimento principal",
        link: "https://chat.whatsapp.com/vwx234",
        createdAt: new Date("2022-08-25"),
        status: "Ativo",
      },
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
      {
        id: "1",
        name: "Reunião Mensal - Novembro",
        type: "Mensal",
        status: "Realizada",
        date: new Date("2025-11-10"),
        assignees: ["Rafael Bernardino Silveira"],
      },
      {
        id: "2",
        name: "Reunião Mensal - Outubro",
        type: "Mensal",
        status: "Realizada",
        date: new Date("2025-10-15"),
        assignees: ["Rafael Bernardino Silveira"],
      },
    ],
    whatsappGroups: [
      {
        id: "1",
        name: "Rodrigo | Mastodonte",
        purpose: "Atendimento principal",
        link: "https://chat.whatsapp.com/yza567",
        createdAt: new Date("2024-01-15"),
        status: "Ativo",
      },
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
      {
        id: "1",
        name: "Reunião Mensal - Novembro",
        type: "Mensal",
        status: "Realizada",
        date: new Date("2025-11-05"),
        assignees: ["Rafael Bernardino Silveira"],
      },
    ],
    whatsappGroups: [
      {
        id: "1",
        name: "Fernanda G. | Mastodonte",
        purpose: "Atendimento principal",
        link: "https://chat.whatsapp.com/bcd890",
        createdAt: new Date("2024-05-10"),
        status: "Ativo",
      },
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
    date: new Date("2025-09-18"),
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
        {
          id: "1",
          icon: "AlertCircle",
          text: "Período desafiador nas finanças devido a obras e atrasos de clientes. Preocupação com saúde e custos adicionais.",
        },
        {
          id: "2",
          icon: "Home",
          text: "Desafios com reforma em andamento e necessidade de troca de fornecedores durante o processo.",
        },
        {
          id: "3",
          icon: "Plane",
          text: "Gosta de viajar com frequência e planeja viagem para janeiro/fevereiro do próximo ano.",
        },
        {
          id: "4",
          icon: "CreditCard",
          text: "Preza pela praticidade nas transações bancárias. Ajustando número de contas para facilitar controle.",
        },
      ],
    },
    highlights: [
      { id: "1", icon: "Building", text: "Fluxo de caixa apertado", type: "normal" },
      { id: "2", icon: "Plane", text: "Viagem Jan/Fev", type: "normal" },
      { id: "3", icon: "Truck", text: "Renovação de frota", type: "normal" },
      { id: "4", icon: "AlertTriangle", text: "Atenção: Banco Master", type: "warning" },
    ],
    agenda: [
      {
        id: "1",
        number: 1,
        title: "Situação Financeira e Fluxo de Caixa",
        status: "discussed",
        subitems: [
          {
            id: "1-1",
            title: "Dificuldades de caixa atuais",
            description:
              "Empresa enfrentando atrasos de recebimentos de clientes, impactando o fluxo de caixa mensal.",
          },
          {
            id: "1-2",
            title: "Custos com obras",
            description:
              "Reforma em andamento gerando custos extras. Necessidade de troca de fornecedores durante o processo.",
          },
          {
            id: "1-3",
            title: "Preocupações adicionais",
            description: "Questões de saúde e custos relacionados sendo monitorados.",
          },
        ],
      },
      {
        id: "2",
        number: 2,
        title: "Desempenho das Carteiras de Investimento",
        status: "discussed",
        subitems: [
          {
            id: "2-1",
            title: "Análise de performance",
            description:
              "Rafael apresentou o desempenho atual das carteiras e rentabilidade no período.",
          },
          {
            id: "2-2",
            title: "Estratégias de realocação",
            description: "Discussão sobre oportunidades de realocação para melhorar rentabilidade.",
          },
          {
            id: "2-3",
            title: "Carteira do Reinaldo",
            description:
              "Pendente recebimento da carteira para análise e sugestão de realocações mais rentáveis no Itaú.",
          },
        ],
      },
      {
        id: "3",
        number: 3,
        title: "Consórcios e Crédito para Renovação de Frota",
        status: "action_pending",
        subitems: [
          {
            id: "3-1",
            title: "Consórcio misto",
            description:
              "Cotação pode gerar economia relevante, especialmente com garantia em investimentos existentes.",
          },
          {
            id: "3-2",
            title: "Crédito para caminhões",
            description:
              "Avaliar melhores opções de financiamento para renovação da frota da empresa.",
          },
        ],
      },
      {
        id: "4",
        number: 4,
        title: "Gestão de Milhas e Planejamento de Viagens",
        status: "discussed",
        subitems: [
          {
            id: "4-1",
            title: "Serviço de concierge",
            description:
              "Potencial para reduzir custos de viagens dado a frequência de viagens da Márcia.",
          },
          {
            id: "4-2",
            title: "Viagem planejada",
            description:
              "Márcia planeja viagem para janeiro/fevereiro - oportunidade para uso do concierge.",
          },
        ],
      },
      {
        id: "5",
        number: 5,
        title: "Otimização Bancária e Cartões",
        status: "action_pending",
        subitems: [
          {
            id: "5-1",
            title: "Consolidação de contas",
            description:
              "Redução do número de contas para simplificar gestão e melhorar acúmulo de pontos/milhas.",
          },
          {
            id: "5-2",
            title: "Cartão C6",
            description:
              "Pontuação atual abaixo do esperado. Solicitar aumento para 3 ou 3,5 pontos + sala VIP ilimitada.",
          },
          {
            id: "5-3",
            title: "Conta Wise e Dólar",
            description:
              "Orientações sobre compra de dólar e uso da conta Wise para viagens internacionais.",
          },
        ],
      },
    ],
    decisions: [
      {
        id: "1",
        content:
          "Cotação de <strong>consórcio misto</strong> pode gerar economia relevante, principalmente com garantia em investimentos",
        type: "normal",
      },
      {
        id: "2",
        content:
          "Serviço de <strong>concierge de milhas e viagens</strong> tem potencial para reduzir custos, dada a frequência de viagens",
        type: "normal",
      },
      {
        id: "3",
        content:
          "<strong>Redução de contas bancárias</strong> pode simplificar a gestão financeira e melhorar o acúmulo de pontos/milhas",
        type: "normal",
      },
      {
        id: "4",
        content:
          "Pontuação do <strong>cartão C6 abaixo do esperado</strong> - solicitar upgrade para potencializar benefícios",
        type: "normal",
      },
      {
        id: "5",
        content:
          "<strong>Atenção ao cenário de crédito</strong> e desempenho do Banco Master - monitorar exposição",
        type: "warning",
      },
    ],
    linkedTasks: [
      {
        id: "1",
        title:
          "Verificar e solicitar aumento da pontuação do cartão C6 de Márcia para 3 ou 3,5 pontos e sala VIP ilimitada",
        dueDate: new Date("2025-09-25"),
        assignee: "Rafael",
        priority: "Importante",
        completed: false,
      },
      {
        id: "2",
        title:
          "Preparar comparativo das diferentes possibilidades de consórcio e crédito para renovação de frota",
        dueDate: new Date("2025-09-30"),
        assignee: "Rafael",
        priority: "Importante",
        completed: false,
      },
      {
        id: "3",
        title:
          "Apresentar serviço de concierge de viagens/milhas e viabilizar contato com o serviço",
        dueDate: new Date("2025-10-05"),
        assignee: "Rafael",
        priority: "Normal",
        completed: false,
      },
      {
        id: "4",
        title:
          "Receber carteira de investimentos do Reinaldo e sugerir realocações mais rentáveis no Itaú",
        dueDate: new Date("2025-10-10"),
        assignee: "Rafael",
        priority: "Normal",
        completed: false,
      },
    ],
    participants: [
      { id: "1", name: "Márcia", role: "Cliente", avatarColor: "#a78bfa", initials: "MA" },
      {
        id: "2",
        name: "Rafael",
        role: "Consultor de Investimentos",
        avatarColor: "#2563eb",
        initials: "RF",
      },
      { id: "3", name: "Reinaldo", role: "Mencionado", avatarColor: "#10b981", initials: "RE" },
    ],
    attachments: [
      {
        id: "1",
        name: "Relatório_Carteira_Setembro.pdf",
        type: "pdf",
        size: "2.4 MB",
        storagePath: "",
        addedAt: new Date("2025-09-18"),
      },
      {
        id: "2",
        name: "Comparativo_Consórcios.xlsx",
        type: "excel",
        size: "856 KB",
        storagePath: "",
        addedAt: new Date("2025-09-20"),
      },
      {
        id: "3",
        name: "Proposta_C6_Upgrade.docx",
        type: "doc",
        size: "320 KB",
        storagePath: "",
        addedAt: new Date("2025-09-19"),
      },
      {
        id: "4",
        name: "Concierge_Milhas_Apresentação.pdf",
        type: "pdf",
        size: "1.8 MB",
        storagePath: "",
        addedAt: new Date("2025-09-18"),
      },
    ],
  },
};
