// src/components/reunioes/CardsReunioes.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";

export default function CardsReunioes() {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const token = localStorage.getItem("token");
        const { data } = await API.get("/reunioes/cards", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}, // força o Bearer
        });
        setResumo(data);
      } catch (e) {
        const msg =
          e?.response?.status === 401
            ? "Sua sessão expirou. Faça login novamente."
            : e?.response?.data?.message || e.message || "Erro ao carregar.";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const Cell = ({ label, value }) => (
    <div className="col-md-3">
      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="text-muted">{label}</h6>
          <div className="h3 m-0">{loading ? "—" : value ?? "—"}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {err && <div className="alert alert-danger mb-3">{err}</div>}

      <div className="row g-3">
        <Cell label="Total" value={resumo?.total} />
        <Cell label="Hoje" value={resumo?.hoje} />
        <Cell label="Amanhã" value={resumo?.amanha} />
        <Cell label="Próx. 48h" value={resumo?.proximas_48h} />
      </div>
    </>
  );
}
