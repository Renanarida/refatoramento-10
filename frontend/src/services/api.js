import axios from "axios";

/** Base da API: use VITE_API_BASE_URL (ex.: http://localhost:8000/api) */
const BASE_URL = "http://localhost:8000/api";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // necessário p/ Sanctum
  headers: { Accept: "application/json" },
});

// --- helpers de storage ---
const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem("token"));
const getCpf   = () => (typeof window === "undefined" ? null : localStorage.getItem("cpf"));

// --- interceptor: sempre anexa Bearer e X-CPF se existirem ---
API.interceptors.request.use((cfg) => {
  const t = getToken();
  const c = getCpf();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  else delete cfg.headers.Authorization;

  if (c) cfg.headers["X-CPF"] = c;
  else delete cfg.headers["X-CPF"];

  return cfg;
});

// --- CSRF (Sanctum) ---
const ROOT_URL = BASE_URL.replace(/\/api\/?$/, "/"); // transforma .../api -> .../
const bare = axios.create({ baseURL: ROOT_URL, withCredentials: true });
export async function ensureCsrf() {
  try { await bare.get("sanctum/csrf-cookie"); } catch { /* ignora em dev */ }
}

// --- Token: setters/clearers ---
export function setAuthHeaderFromStorage() {
  const t = getToken();
  if (t) API.defaults.headers.common["Authorization"] = `Bearer ${t}`;
  else delete API.defaults.headers.common["Authorization"];
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("token", token);
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete API.defaults.headers.common["Authorization"];
  }
}

export function clearAuth() {
  localStorage.removeItem("token");
  delete API.defaults.headers.common["Authorization"];
}

// --- CPF: setters/clearers ---
export function setCpfHeaderFromStorage() {
  const c = getCpf();
  if (c) API.defaults.headers.common["X-CPF"] = c;
  else delete API.defaults.headers.common["X-CPF"];
}

export function setCpfHeader(cpf) {
  if (cpf) {
    localStorage.setItem("cpf", cpf);
    API.defaults.headers.common["X-CPF"] = cpf;
  } else {
    localStorage.removeItem("cpf");
    delete API.defaults.headers.common["X-CPF"];
  }
}

export function clearCpfHeader() {
  localStorage.removeItem("cpf");
  delete API.defaults.headers.common["X-CPF"];
}

// --- inicializa cabeçalhos ao carregar o módulo ---
setAuthHeaderFromStorage();
setCpfHeaderFromStorage();

export default API;
