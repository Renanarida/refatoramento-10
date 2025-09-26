// src/components/reunioes/CardsReunioes.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";

export default function CardsReunioes() {
  const [stats, setStats] = useState({ total: 0, hoje: 0, amanha: 0, prox_48h: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr(null);

      // tenta /reunioes/stats e cai para /reunioes/cards se precisar
      const endpoints = ["/reunioes/stats", "/reunioes/cards"];

      for (const ep of endpoints) {
        try {
          const { data } = await API.get(ep);

          // payload pode vir como {resumo:{...}} ou direto {...}
          const payload = data?.resumo ?? data ?? {};
          const prox48 = payload.prox_48h ?? payload.proximas_48h ?? 0;

          if (!alive) return;
          setStats({
            total: Number(payload.total ?? 0),
            hoje: Number(payload.hoje ?? 0),
            amanha: Number(payload.amanha ?? 0),
            prox_48h: Number(prox48),
          });
          setLoading(false);
          return; // sucesso, sai do laço
        } catch (e) {
          // se falhar neste endpoint, tenta o próximo
          if (ep === endpoints[endpoints.length - 1]) {
            const msg =
              e?.response?.status === 401
                ? "Sua sessão expirou. Faça login novamente."
                : e?.response?.data?.message || e.message || "Erro ao carregar.";
            if (!alive) return;
            setErr(msg);
            setLoading(false);
          }
        }
      }
    })();

    return () => {
      alive = false;
    };
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
        <Cell label="Total" value={stats.total} />
        <Cell label="Hoje" value={stats.hoje} />
        <Cell label="Amanhã" value={stats.amanha} />
        <Cell label="Próx. 48h" value={stats.prox_48h} />
      </div>
    </>
  );
}
