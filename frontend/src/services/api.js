// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api", // backend Laravel
  withCredentials: true,            // necessário para Sanctum (cookies/CSRF)
  headers: {
    Accept: "application/json",
  },
});

// token (se usar Bearer)
API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Define/atualiza o header Authorization a partir do localStorage (quando houver)
export function setAuthHeaderFromStorage() {
  if (typeof window === "undefined") return; // evita erro no build/SSR

  const token = localStorage.getItem("token");
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
}

// Se quiser setar manualmente (ex.: depois do login)
export function setAuthToken(token) {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
}

// Já aplica ao carregar
setAuthHeaderFromStorage();

//novas funções paara cpf
const cpf = localStorage.getItem('cpf');
if (cpf) API.defaults.headers['X-CPF'] = cpf;

export default API;
