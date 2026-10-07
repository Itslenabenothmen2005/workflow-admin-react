import {api} from "./api";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function firstList(response, keys) {
  if (Array.isArray(response)) return response;
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }
  return [];
}

export async function getDashboard() {
  const response = await api.get("/admin/dashboard");
  return {
    projects: firstList(response, ["projects", "data"]),
    alerts: firstList(response?.alerts, ["alerts"]),
    activity: firstList(response?.activity, ["activity", "recentActivity"]),
    metrics: response?.metrics || response?.statistics || {},
    statistics: response?.statistics || response?.metrics || {}
  };
}

export async function getStatistics() {
  const response = await api.get("/admin/statistics");
  return response?.statistics || response?.data || response || {};
}

export async function getUsers(role) {
  const response = await api.get("/users");
  const users = firstList(response, ["users", "data"]);
  return role ? users.filter(user => String(user.role || user.roleName || "").toUpperCase() === role) : users;
}

export async function getProjects() {
  const response = await api.get("/projects");
  return firstList(response, ["projects", "data"]);
}

export async function getAlerts() {
  const response = await api.get("/alerts");
  return firstList(response, ["alerts", "data"]);
}

export async function updateNotification(id, changes) {
  return api.put(`/alerts/${id}`, changes);
}
