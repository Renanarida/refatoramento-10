import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import API, {
  ensureCsrf,
  setAuthHeaderFromStorage,
  setAuthToken,
  clearAuth,
  setCpfHeader,
  clearCpfHeader,
} from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  // 'visitor' | 'participant' | 'user' | 'admin'
  const [mode, setMode] = useState("visitor");
  const [cpf, setCpf] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- utils ---
  const safeParse = (s) => {
    try {
      return JSON.parse(s || "null");
    } catch {
      return null;
    }
  };

  
  useEffect(() => {
    setAuthHeaderFromStorage(); 

    // Participante (X-CPF)
    const savedCpf = (localStorage.getItem("cpf") || "").replace(/\D+/g, "");
    if (savedCpf) {
      setMode("participant");
      setCpf(savedCpf);
      setCpfHeader(savedCpf);
    } else {
      clearCpfHeader();
    }

    const token = localStorage.getItem("token");
    const savedUser = safeParse(localStorage.getItem("user"));

    if (!token) {
      // sem token => visitante (ou participante se tiver CPF)
      setUser(null);
      setLoading(false);
      return;
    }

    // Se já temos user no storage, usa já para evitar flicker,
    // e em seguida confirma no /me.
    if (savedUser && (savedUser.role || savedUser.is_admin !== undefined)) {
      const role =
        savedUser.role || (savedUser.is_admin ? "admin" : "user");
      setUser(savedUser);
      setMode(role === "admin" ? "admin" : "user");
      // confirma /me
      API.get("/me")
        .then((res) => {
          const role2 =
            res?.data?.role || (res?.data?.is_admin ? "admin" : "user");
          const u = { ...(res?.data || {}), role: role2 };
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
          setMode(role2 === "admin" ? "admin" : "user");
        })
        .catch(() => {
          // token inválido
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setMode(savedCpf ? "participant" : "visitor");
        })
        .finally(() => setLoading(false));
    } else {
      // Não temos user salvo — busca /me direto
      API.get("/me")
        .then((res) => {
          const role =
            res?.data?.role || (res?.data?.is_admin ? "admin" : "user");
          const u = { ...(res?.data || {}), role };
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
          setMode(role === "admin" ? "admin" : "user");
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setMode(savedCpf ? "participant" : "visitor");
        })
        .finally(() => setLoading(false));
    }
  }, []);

  // Trocar para visitante
  function asVisitor() {
    setMode("visitor");
    setCpf("");
    clearCpfHeader();
  }

  // Entrar como participante (salva X-CPF)
  function asParticipant(cpfRaw) {
    const clean = String(cpfRaw || "").replace(/\D+/g, "");
    setMode("participant");
    setCpf(clean);
    setCpfHeader(clean);
  }

  // Setar user manualmente (ex.: após /me externo)
  function asUser(newUser) {
    const role = newUser?.role === "admin" ? "admin" : "user";
    setUser(newUser || null);
    localStorage.setItem("user", JSON.stringify(newUser || {}));
    setMode(role);
    // participante sai de cena quando entra user/admin
    setCpf("");
    clearCpfHeader();
  }

  // Fluxo de login completo
  async function login(email, password) {
    await ensureCsrf(); // Sanctum
    const res = await API.post("/login", { email, senha: password });
    const token =
      res?.data?.token || res?.data?.access_token || res?.data?.data?.token;
    if (token) setAuthToken(token);

    const me = await API.get("/me");
    const role = me?.data?.role || (me?.data?.is_admin ? "admin" : "user");
    const u = { ...(me?.data || {}), role };
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    setMode(role === "admin" ? "admin" : "user");

    // se estava como participante, limpa X-CPF
    setCpf("");
    clearCpfHeader();

    return u;
  }

  // Logout geral
  async function logout() {
    try {
      await API.post("/logout");
    } catch {}
    clearAuth();
    clearCpfHeader();
    localStorage.removeItem("user");
    setUser(null);
    setMode("visitor");
    setCpf("");
  }

  const value = useMemo(() => {
    const isAdmin = mode === "admin";
    const isAuthenticated = mode === "user" || mode === "admin";
    return {
      mode,
      isAdmin,
      isAuthenticated,
      loading,
      user,
      cpf,
      // actions
      login,
      logout,
      asVisitor,
      asParticipant,
      asUser,
    };
  }, [mode, loading, user, cpf]);

  // *** sem JSX para evitar erro de parser no build ***
  return React.createElement(AuthCtx.Provider, { value }, children);
}

export const useAuth = () => useContext(AuthCtx);
