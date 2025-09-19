import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000"; // ajuste se necessário

export default function ReunioesTable({ onNova = () => { }, onEditar = () => { } }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // filtros simples
  const [q, setQ] = useState("");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");

  // paginação (usa paginate do Laravel)
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // ordenação client-side simples
  const [sortKey, setSortKey] = useState("data");
  const [sortDir, setSortDir] = useState("asc");

  const fetchData = async () => {
    setLoading(true); setErr(null);
    try {
      const { data } = await axios.get(`${API}/api/reunioes`, {
        params: {
          q: q || undefined,
          data_ini: dataIni || undefined,
          data_fim: dataFim || undefined,
          page,
          per_page: perPage,
        },
        headers: { Accept: "application/json" },
      });
      setItens(data.data ?? []);
      setTotal(data.meta?.total ?? 0);
      setLastPage(data.meta?.last_page ?? 1);
    } catch (e) {
      setErr(e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [q, dataIni, dataFim, page, perPage]);
  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener("reuniao:salva", handler);
    return () => window.removeEventListener("reuniao:salva", handler);
  }, []);

  const ordenar = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const itensOrdenados = useMemo(() => {
    const arr = [...itens];
    arr.sort((a, b) => {
      const va = (a?.[sortKey] ?? "") + "";
      const vb = (b?.[sortKey] ?? "") + "";
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [itens, sortKey, sortDir]);

  const excluir = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta reunião?")) return;
    try {
      await axios.delete(`${API}/api/reunioes/${id}`, {
        headers: { Accept: "application/json" },
      });
      fetchData();
    } catch (e) {
      alert("Erro ao excluir: " + (e?.response?.data?.message || e.message));
    }
  };

  const headerSort = (key, label) => (
    <th
      role="button"
      onClick={() => ordenar(key)}
      title="Clique para ordenar"
      style={{ cursor: "pointer", whiteSpace: "nowrap" }}
    >
      {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
    </th>
  );

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header">
        {/* Linha 1: título CENTRALIZADO */}
        <div className="text-center">
          <strong className="h5 d-block m-0">Reuniões</strong>
        </div>

        {/* Linha 2: filtros + botão cadastrar à direita */}
        <div className="d-flex flex-wrap gap-2 align-items-end mt-3">
          <div className="me-auto" /> {/* empurra os filtros para a esquerda e libera espaço */}
          <div>
            <label className="form-label mb-1">Buscar</label>
            <input
              className="form-control"
              placeholder="Título/descrição…"
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value); }}
            />
          </div>
          <div>
            <label className="form-label mb-1">Data inicial</label>
            <input
              type="date"
              className="form-control"
              value={dataIni}
              onChange={(e) => { setPage(1); setDataIni(e.target.value); }}
            />
          </div>
          <div>
            <label className="form-label mb-1">Data final</label>
            <input
              type="date"
              className="form-control"
              value={dataFim}
              onChange={(e) => { setPage(1); setDataFim(e.target.value); }}
            />
          </div>
          <div>
            <label className="form-label mb-1">Por página</label>
            <select
              className="form-select"
              value={perPage}
              onChange={(e) => { setPage(1); setPerPage(Number(e.target.value)); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Botão foi movido pra cá */}
          <div className="ms-auto">
            {/* label invisível só pra alinhar verticalmente com os inputs */}
            <label className="form-label mb-1 d-block invisible">.</label>
            <button className="btn btn-primary" onClick={onNova}>Cadastrar</button>
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        {loading && <div className="p-4 text-center text-muted">Carregando…</div>}
        {err && !loading && (
          <div className="alert alert-danger m-3">
            Erro ao carregar: {typeof err === "string" ? err : JSON.stringify(err)}
          </div>
        )}
        {!loading && !err && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  {headerSort("titulo", "Título")}
                  {headerSort("data", "Data")}
                  {headerSort("hora", "Hora")}
                  {headerSort("local", "Local")}
                  <th className="text-end" style={{ width: 160 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Nenhuma reunião encontrada.
                    </td>
                  </tr>
                ) : (
                  itensOrdenados.map((r) => (
                    <tr key={r.id}>
                      <td>{r.titulo}</td>
                      <td>{r.data || ""}</td>
                      <td>{r.hora || ""}</td>
                      <td>{r.local || ""}</td>
                      <td className="text-end">
                        <div className="btn-group">
                          
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => onEditar(r)}
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => excluir(r.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
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
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹ Anterior
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page >= lastPage}
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
          >
            Próxima ›
          </button>
        </div>
      </div>
    </div>
  );
}
