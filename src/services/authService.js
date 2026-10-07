import {api, TOKEN_KEY} from "./api";

const USER_KEY = "currentUser";

function readUser() {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function writeUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function login(email, password) {
  const response = await api.post("/auth/login", {email, password});
  const token = response?.token;
  const user = response?.user;

  if (!token || !user) {
    throw new Error("Le serveur n'a pas renvoyé une session valide.");
  }

  localStorage.setItem(TOKEN_KEY, token);
  writeUser(user);
  return user;
}

export async function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function getCurrentUser() {
  const storedUser = readUser();
  if (!storedUser) return null;

  try {
    const response = await api.get("/users/me");
    const user = response?.user || response;
    writeUser(user);
    return user;
  } catch (error) {
    if (error.status === 401) await logout();
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  return readUser()?.role || null;
}

export function isAuthenticated() {
  return Boolean(getToken() && readUser());
}

export {USER_KEY};
