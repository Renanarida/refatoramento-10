import React from "react";
import ReunioesTable from "../components/reunioes/ReunioesTable"; // ou "../components/reunioes/ReunioesTable"

export default function DashboardParticipante() {
  return (
    <div className="container py-4">
      <div className="text-center mb-3">
        <h2 className="m-0">Minhas Reuniões (Participante)</h2>
        <small className="text-muted">Você esta visualizando reuniões em que esta cadastrado com seu CPF</small>
      </div>

      {/* A tabela detecta mode=participant via useAuth */}
      <ReunioesTable />
    </div>
  );
}