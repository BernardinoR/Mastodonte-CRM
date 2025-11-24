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
];

export function getUserByName(name: string): MockUser | undefined {
  return MOCK_USERS.find(user => user.name === name);
}

export function getUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find(user => user.id === id);
}
