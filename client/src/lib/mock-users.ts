export interface MockUser {
  id: string;
  name: string;
  initials: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "rafael-bernardino",
    name: "Rafael Bernardino Silveira",
    initials: "RB",
  },
  {
    id: "marcia-mozzato",
    name: "Marcia Mozzato Ciampi De Andrade",
    initials: "MM",
  },
  {
    id: "alessandro-cuculin",
    name: "Alessandro Cuçulin Mazer",
    initials: "AC",
  },
  {
    id: "fernanda-carolina",
    name: "Fernanda Carolina De Faria",
    initials: "FC",
  },
  {
    id: "gustavo-samconi",
    name: "Gustavo Samconi Soares",
    initials: "GS",
  },
  {
    id: "israel-schuster",
    name: "Israel Schuster Da Fonseca",
    initials: "IS",
  },
];

export function getUserByName(name: string): MockUser | undefined {
  return MOCK_USERS.find(user => user.name === name);
}

export function getUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find(user => user.id === id);
}
