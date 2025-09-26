// src/pages/DashboardParticipante.jsx
import { useEffect, useState } from "react";
import API from "../services/api";

export default function DashboardParticipante() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const cpf = localStorage.getItem("cpf");
    if (cpf) {
      API.defaults.headers["X-CPF"] = cpf;
    }

    setLoading(true);
    API.get("/participante/reunioes")
      .then((res) => setItens(res.data?.data ?? []))
      .catch((e) => setErr(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-4">
      <h2>Minhas Reuniões (Participante)</h2>
      {loading && <p>Carregando...</p>}
      {err && <div className="alert alert-danger">{err}</div>}
      {!loading && !err && (
        <ul className="list-group">
          {itens.length === 0 ? (
            <li className="list-group-item text-muted">Nenhuma reunião encontrada</li>
          ) : (
            itens.map((r) => (
              <li key={r.id} className="list-group-item">
                <strong>{r.titulo}</strong> — {r.data} {r.hora}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
