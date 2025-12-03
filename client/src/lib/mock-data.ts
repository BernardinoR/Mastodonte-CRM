import type { Task, TaskStatus, TaskPriority, TaskHistoryEvent } from "@/types/task";

export const MOCK_CLIENTS = [
  "Fernanda Carolina De Faria",
  "Marcos Roberto Neves Monteiro",
  "Luciene Della Libera",
  "Marco Alexandre Rodrigues Oliveira",
  "Erick Soares De Oliveira",
  "João Pedro Zanetti De Carvalho",
  "Iatan Oliveira Cardoso dos Reis",
  "Rafael Bernardino Silveira",
  "Ademar João Gréguer",
  "Gustavo Samconi Soares",
  "Israel Schuster Da Fonseca",
  "Marcia Mozzato Ciampi De Andrade",
  "Fernanda Garcia Rodrigues de Souza",
  "Rodrigo Weber Rocha da Silva",
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Ademar plan fin",
    clientName: "Ademar João Gréguer",
    priority: "Normal",
    status: "To Do",
    assignees: ["Rafael Bernardino Silveira"],
    dueDate: new Date('2025-11-19'),
    order: 0,
  },
  {
    id: "2",
    title: "Atualizar plano financeiro da Fernanda",
    clientName: "Fernanda Carolina De Faria",
    priority: "Importante",
    status: "To Do",
    assignees: ["Rafael Bernardino Silveira", "Maria Santos"],
    dueDate: new Date('2025-11-15'),
    order: 1,
  },
  {
    id: "3",
    title: "Aguardar retorno sobre apresentação do Ariel",
    status: "To Do",
    assignees: ["Rafael Bernardino Silveira"],
    dueDate: new Date('2025-11-16'),
    order: 2,
  },
  {
    id: "4",
    title: "Receber documentação da Viva",
    clientName: "Israel Schuster Da Fonseca",
    priority: "Baixa",
    status: "To Do",
    assignees: ["Rafael Bernardino Silveira", "João Silva", "Ana Costa"],
    dueDate: new Date('2025-11-20'),
    order: 3,
  },
  {
    id: "5",
    title: "REALOCAR MARCOS",
    clientName: "Marcia Mozzato Ciampi De Andrade",
    clientEmail: "marcia.mozzato@email.com",
    clientPhone: "+5511999887766",
    priority: "Urgente",
    status: "In Progress",
    assignees: ["Rafael Bernardino Silveira"],
    dueDate: new Date('2025-01-20'),
    description: "Cliente solicitou realocação urgente dos ativos de renda fixa. Verificar disponibilidade de lastro em debêntures incentivadas e enviar opções até o final do dia.\n\nObs: Cliente prefere contato após as 14h.",
    order: 0,
    history: [
      {
        id: "h1",
        type: "created",
        content: "Tarefa criada",
        author: "Rafael Bernardino Silveira",
        timestamp: new Date('2025-01-15T10:30:00'),
      },
      {
        id: "h2",
        type: "comment",
        content: "Entrei em contato com a cliente, ela confirmou interesse em debêntures incentivadas com prazo de 5 anos.",
        author: "Rafael Bernardino Silveira",
        timestamp: new Date('2025-01-16T14:45:00'),
      },
      {
        id: "h3",
        type: "status_change",
        content: "Status alterado de 'A Fazer' para 'Em Progresso'",
        author: "Rafael Bernardino Silveira",
        timestamp: new Date('2025-01-17T09:00:00'),
      },
      {
        id: "h4",
        type: "comment",
        content: "Aguardando retorno da mesa de operações sobre disponibilidade de lastro.",
        author: "Pedro Oliveira",
        timestamp: new Date('2025-01-18T11:20:00'),
      },
    ],
  },
  {
    id: "6",
    title: "Falar com Marcia",
    clientName: "Marcia Mozzato Ciampi De Andrade",
    priority: "Urgente",
    status: "In Progress",
    assignees: ["Rafael Bernardino Silveira", "Pedro Oliveira"],
    dueDate: new Date('2025-01-20'),
    order: 1,
  },
  {
    id: "7",
    title: "Macter",
    clientName: "Marcia Mozzato Ciampi De Andrade",
    priority: "Urgente",
    status: "In Progress",
    assignees: ["Rafael Bernardino Silveira"],
    dueDate: new Date('2025-01-20'),
    order: 2,
  },
  {
    id: "8",
    title: "Receber IRPF Fernanda",
    clientName: "Fernanda Garcia Rodrigues de Souza",
    priority: "Urgente",
    status: "In Progress",
    assignees: ["Rafael Bernardino Silveira"],
    dueDate: new Date('2025-01-20'),
    order: 3,
  },
  {
    id: "9",
    title: "Ajustar luiza",
    clientName: "Rodrigo Weber Rocha da Silva",
    priority: "Urgente",
    status: "In Progress",
    assignees: ["Rafael Bernardino Silveira", "Carla Mendes"],
    dueDate: new Date('2025-01-21'),
    order: 4,
  },
];

export const createNewTask = (partial: Partial<Task>, existingTasks: Task[], author: string = "Sistema"): Task => {
  const maxId = existingTasks.reduce((max, t) => Math.max(max, parseInt(t.id)), 0);
  const statusTasks = existingTasks.filter(t => t.status === (partial.status || "To Do"));
  const maxOrder = statusTasks.reduce((max, t) => Math.max(max, t.order), -1);
  const newTaskId = String(maxId + 1);
  
  const createdEvent: TaskHistoryEvent = {
    id: `h-${newTaskId}-created`,
    type: "created",
    content: "Tarefa criada",
    author,
    timestamp: new Date(),
  };
  
  return {
    id: newTaskId,
    title: partial.title || "Nova tarefa",
    clientName: partial.clientName,
    priority: partial.priority,
    status: partial.status || "To Do",
    assignees: partial.assignees || [],
    dueDate: partial.dueDate || new Date(),
    description: partial.description,
    notes: partial.notes || [],
    history: [createdEvent, ...(partial.history || [])],
    order: maxOrder + 1,
  };
};
