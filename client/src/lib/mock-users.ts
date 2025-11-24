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
  },
  {
    id: "ana-paula",
    name: "Ana Paula Santos",
    initials: "AP",
    avatarColor: "bg-slate-500",
  },
  {
    id: "carlos-eduardo",
    name: "Carlos Eduardo Lima",
    initials: "CE",
    avatarColor: "bg-slate-400",
  },
];

export function getUserByName(name: string): MockUser | undefined {
  return MOCK_USERS.find(user => user.name === name);
}

export function getUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find(user => user.id === id);
}
