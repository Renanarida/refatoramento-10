// src/components/ProtegerRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import API from "../../services/api";

export default function ProtegerRoute({ redirectTo = "/login" }) {
  const [checando, setChecando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAutenticado(false);
      setChecando(false);
      return;
    }

    // Valida o token no backend
    API.get("/me")
      .then(() => setAutenticado(true))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAutenticado(false);
      })
      .finally(() => setChecando(false));
  }, []);

  if (checando) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        Carregando...
      </div>
    );
  }

  return autenticado ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
