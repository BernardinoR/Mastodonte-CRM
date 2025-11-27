export interface MockUser {
  id: string;
  name: string;
  initials: string;
}

export interface MockResponsible {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  grayColor: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "rafael-bernardino",
    name: "Rafael Bernardino Silveira",
    initials: "RB",
  },
];

export const MOCK_RESPONSIBLES: MockResponsible[] = [
  {
    id: "rafael-bernardino",
    name: "Rafael Bernardino Silveira",
    initials: "RB",
    avatarColor: "bg-slate-600",
    grayColor: "bg-gray-400",
  },
  {
    id: "ana-paula",
    name: "Ana Paula Santos",
    initials: "AP",
    avatarColor: "bg-purple-600",
    grayColor: "bg-gray-500",
  },
  {
    id: "carlos-eduardo",
    name: "Carlos Eduardo Lima",
    initials: "CE",
    avatarColor: "bg-blue-600",
    grayColor: "bg-gray-600",
  },
  {
    id: "mariana-costa",
    name: "Mariana Costa Oliveira",
    initials: "MC",
    avatarColor: "bg-emerald-600",
    grayColor: "bg-gray-700",
  },
  {
    id: "pedro-henrique",
    name: "Pedro Henrique Almeida",
    initials: "PH",
    avatarColor: "bg-amber-600",
    grayColor: "bg-zinc-500",
  },
  {
    id: "juliana-ferreira",
    name: "Juliana Ferreira Rocha",
    initials: "JF",
    avatarColor: "bg-rose-600",
    grayColor: "bg-zinc-600",
  },
  {
    id: "lucas-martins",
    name: "Lucas Martins Souza",
    initials: "LM",
    avatarColor: "bg-cyan-600",
    grayColor: "bg-slate-500",
  },
  {
    id: "fernanda-silva",
    name: "Fernanda Silva Pereira",
    initials: "FS",
    avatarColor: "bg-indigo-600",
    grayColor: "bg-slate-600",
  },
];

export function getUserByName(name: string): MockUser | undefined {
  return MOCK_USERS.find(user => user.name === name);
}

export function getUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find(user => user.id === id);
}
