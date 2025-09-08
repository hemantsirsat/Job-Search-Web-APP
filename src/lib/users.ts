type User = {
  id: string;
  email: string;
  password: string;
};

const users: User[] = [];

export function findUserByEmail(email: string) {
  return users.find(user => user.email === email);
}

export function createUser(email: string, password: string) {
  const user = { id: Date.now().toString(), email, password };
  users.push(user);
  return user;
}

export function validateUser(email: string, password: string) {
  const user = findUserByEmail(email);
  if (user && user.password === password) return user;
  return null;
}
