// Auth library - localStorage based user management with Prisma sync

export interface StoredUser {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
  createdAt: string;
}

const USERS_KEY = "optisize-users";
const CURRENT_USER_KEY = "optisize-current-user";

interface UserRecord {
  id: string;
  name: string;
  email?: string;
  password?: string;
  isGuest: boolean;
  createdAt: string;
}

function getUsers(): UserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: UserRecord[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

export function register(name: string, email: string, password: string): StoredUser {
  const users = getUsers();
  
  // Check if email already exists
  if (users.find((u) => u.email === email)) {
    throw new Error("البريد الإلكتروني مسجل بالفعل");
  }

  const user: UserRecord = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name,
    email,
    password,
    isGuest: false,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);

  const storedUser: StoredUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    isGuest: user.isGuest,
    createdAt: user.createdAt,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(storedUser));
  
  // Sync to database
  syncUserToDB(storedUser);

  return storedUser;
}

export function login(email: string, password: string): StoredUser | null {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) return null;

  const storedUser: StoredUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    isGuest: user.isGuest,
    createdAt: user.createdAt,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(storedUser));
  
  // Sync to database
  syncUserToDB(storedUser);

  return storedUser;
}

export function loginAsGuest(): StoredUser {
  const user: StoredUser = {
    id: `guest-${Date.now()}`,
    name: "زائر",
    isGuest: true,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  
  // Sync to database
  syncUserToDB(user);

  return user;
}

export function getCurrentUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function logout() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch {}
}

// Sync user data to the database via API
async function syncUserToDB(user: StoredUser) {
  try {
    await fetch("/api/users/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
  } catch {
    // Silently fail - localStorage is the primary store
  }
}
