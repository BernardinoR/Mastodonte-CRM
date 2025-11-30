import type { Task, TaskStatus, TaskPriority } from "@/types/task";

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
    priority: "Urgente",
    status: "In Progress",
    assignees: ["Rafael Bernardino Silveira"],
    dueDate: new Date('2025-01-20'),
    order: 0,
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

export const createNewTask = (partial: Partial<Task>, existingTasks: Task[]): Task => {
  const maxId = existingTasks.reduce((max, t) => Math.max(max, parseInt(t.id)), 0);
  const statusTasks = existingTasks.filter(t => t.status === (partial.status || "To Do"));
  const maxOrder = statusTasks.reduce((max, t) => Math.max(max, t.order), -1);
  
  return {
    id: String(maxId + 1),
    title: partial.title || "Nova tarefa",
    clientName: partial.clientName,
    priority: partial.priority,
    status: partial.status || "To Do",
    assignees: partial.assignees || [],
    dueDate: partial.dueDate || new Date(),
    description: partial.description,
    notes: partial.notes || [],
    order: maxOrder + 1,
  };
};
