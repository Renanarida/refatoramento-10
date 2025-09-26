// src/services/useAuth.js
import React, { createContext, useContext, useEffect, useState } from "react";
import API from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [mode, setMode] = useState("visitor"); // 'visitor' | 'participant' | 'user' | 'admin'
  const [cpf, setCpf] = useState("");

  // hidrata do localStorage
  useEffect(() => {
    const savedCpf = (localStorage.getItem("cpf") || "").replace(/\D+/g, "");
    if (savedCpf) {
      setMode("participant");
      setCpf(savedCpf);
      API.defaults.headers["X-CPF"] = savedCpf;
      return;
    }

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (token && user && user.role) {
      setMode(user.role === "admin" ? "admin" : "user");
    } else if (token) {
      // se não tiver role no localStorage, tenta o /me pra descobrir
      API.get("/me")
        .then((res) => {
          const role = res?.data?.role === "admin" ? "admin" : "user";
          setMode(role);
          localStorage.setItem("user", JSON.stringify({ ...(res?.data || {}), role }));
        })
        .catch(() => setMode("visitor"));
    } else {
      setMode("visitor");
    }
  }, []);

  function asVisitor() {
    setMode("visitor");
    setCpf("");
    localStorage.removeItem("cpf");
    delete API.defaults.headers["X-CPF"];
  }

  function asParticipant(cpfRaw) {
    const clean = String(cpfRaw || "").replace(/\D+/g, "");
    setMode("participant");
    setCpf(clean);
    localStorage.setItem("cpf", clean);
    API.defaults.headers["X-CPF"] = clean;
  }

  function asUser(user) {
    const role = user?.role === "admin" ? "admin" : "user";
    setMode(role);
    delete API.defaults.headers["X-CPF"];
  }

  // *** sem JSX para evitar erro de parser no build ***
  return React.createElement(
    AuthCtx.Provider,
    { value: { mode, cpf, asVisitor, asParticipant, asUser } },
    children
  );
}

export const useAuth = () => useContext(AuthCtx);
