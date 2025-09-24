// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// seta/remover o Authorization default a partir do localStorage
export function setAuthHeaderFromStorage() {
  const token = localStorage.getItem("token");
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }
}

// já tenta configurar no boot
setAuthHeaderFromStorage();

// Interceptor: garante Authorization se não estiver no config
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // DEBUG: loga se o header está presente nas rotas críticas
  const u = config.url || "";
  if (u.startsWith("/reunioes") || u === "/me") {
    // eslint-disable-next-line no-console
    console.debug(
      "[API]",
      (config.method || "GET").toUpperCase(),
      `${config.baseURL}${u}`,
      "Authorization?",
      !!config.headers.Authorization
    );
  }
  return config;
});

export default API;
