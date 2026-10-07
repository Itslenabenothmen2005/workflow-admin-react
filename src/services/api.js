const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8089/api";
const TOKEN_KEY = "token";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getErrorMessage(status, payload) {
  if (payload?.message) return payload.message;
  if (payload?.error) return payload.error;

  if (status === 401) return "Votre session a expiré. Reconnectez-vous.";
  if (status === 403) return "Accès refusé";
  if (status === 404) return "Ressource non trouvée";
  if (status === 500) return "Une erreur est survenue sur le serveur.";

  return "Une erreur est survenue. Réessayez dans un moment.";
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const message = getErrorMessage(response.status, payload);
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("currentUser");
      window.dispatchEvent(new Event("workflow:unauthorized"));
    }
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

export const api = {
  get(path) {
    return request(path, {method: "GET"});
  },
  post(path, body) {
    return request(path, {method: "POST", body: JSON.stringify(body)});
  },
  put(path, body) {
    return request(path, {method: "PUT", body: JSON.stringify(body)});
  },
  delete(path) {
    return request(path, {method: "DELETE"});
  }
};

export {API_BASE_URL, TOKEN_KEY};
