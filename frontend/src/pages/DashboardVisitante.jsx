import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../services/useAuth";

export default function DashboardVisitante() {
  const { mode } = useAuth(); // opcional: para checagens/UX
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await API.get("/public/reunioes", {
        params: { page, per_page: perPage },
      });

      const rows = Array.isArray(data) ? data : (data.data ?? []);
      const lp = data?.meta?.last_page ?? data?.last_page ?? 1;
      const tt = data?.meta?.total ?? data?.total ?? rows.length ?? 0;

      setItens(rows);
      setLastPage(lp);
      setTotal(tt);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [page, perPage]);

  return (
    <div className="container py-4">
      <h2 className="mb-3">Reuniões (modo visitante)</h2>
      <p className="text-muted">Você está visualizando informações públicas e limitadas.</p>

      <div className="card">
        <div className="card-body p-0">
          {loading && <div className="p-4 text-center text-muted">Carregando…</div>}
          {err && !loading && <div className="alert alert-danger m-3">{String(err)}</div>}
          {!loading && !err && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Local</th>
                    {/* Sem ações no modo visitante */}
                  </tr>
                </thead>
                <tbody>
                  {itens.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        Nenhuma reunião pública encontrada.
                      </td>
                    </tr>
                  ) : (
                    itens.map((r) => (
                      <tr key={r.id}>
                        <td>{r.titulo}</td>
                        <td>{r.data || ""}</td>
                        <td>{r.hora || ""}</td>
                        <td>{r.local || ""}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-footer d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {total} registro{total === 1 ? "" : "s"} • Página {page} de {lastPage}
          </small>
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              ‹ Anterior
            </button>
            <button className="btn btn-outline-secondary btn-sm" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>
              Próxima ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
