// src/components/reunioes/ProtegerRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../services/useAuth";
import API from "../../services/api";

export default function ProtegerRoute({
  allow = ["user", "admin"],
  redirectTo = "/login",
}) {
  const auth = useAuth(); // pode ser null se faltar AuthProvider
  const [checando, setChecando] = useState(true);
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    let cancel = false;

    async function checar() {
      setChecando(true);

      // 1) VISITANTE: sempre pode
      if (allow.includes("visitor")) {
        if (!cancel) { setPermitido(true); setChecando(false); }
        return;
      }

      // 2) PARTICIPANTE: precisa ter CPF no storage
      const cpfLocal = localStorage.getItem("cpf");
      const temCPF = !!(cpfLocal && cpfLocal.replace(/\D+/g, "").length >= 11);

      // 3) USER/ADMIN: precisa de token válido
      const precisaAuth = allow.some(r => r === "user" || r === "admin");
      let tokenValido = false;

      if (precisaAuth) {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            await API.get("/me"); // valida no backend
            tokenValido = true;
          } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            tokenValido = false;
          }
        }
      }

      // Combinações:
      // - só participant -> temCPF
      // - só user/admin -> tokenValido
      // - ambos -> temCPF OU tokenValido
      const permiteParticipant = allow.includes("participant");
      let ok = false;

      if (permiteParticipant && !precisaAuth) ok = temCPF;
      else if (!permiteParticipant && precisaAuth) ok = tokenValido;
      else if (permiteParticipant && precisaAuth) ok = temCPF || tokenValido;

      if (!cancel) {
        setPermitido(ok);
        setChecando(false);
      }
    }

    checar();
    return () => { cancel = true; };
  }, [allow]);

  if (checando) {
    return <div className="d-flex justify-content-center align-items-center p-5">Carregando...</div>;
  }

  return permitido ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
