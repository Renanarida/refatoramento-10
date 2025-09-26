import { useEffect, useMemo, useState } from "react";
import API from "../../services/api"; // usa o client com interceptor
import { useAuth } from "../../services/useAuth"; // <- usamos para saber o mode

const EV_SALVA = "reuniao:salva";

export default function ReunioesTable({
  onNova = () => {},
  onEditar = () => {},
  refreshTick = 0,
}) {
  const { mode } = useAuth();               // 'admin' | 'user' | 'participant' | 'visitor'
  const isAdmin = mode === "admin";

  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // filtros
  const [q, setQ] = useState("");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");

  // paginação
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // ordenação client-side
  const [sortKey, setSortKey] = useState("data");
  const [sortDir, setSortDir] = useState("asc");

  // Escolhe endpoint conforme o perfil
  const endpoint =
    mode === "admin" || mode === "user"
      ? "/reunioes"
      : mode === "participant"
      ? "/participante/reunioes"
      : "/public/reunioes";

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      // garante header X-CPF se for participant (caso seu api.js não faça isso)
      if (mode === "participant") {
        const cpf = localStorage.getItem("cpf");
        if (cpf) API.defaults.headers["X-CPF"] = cpf;
      }

      const { data } = await API.get(endpoint, {
        params: {
          // filtros comuns — se os endpoints públicos/participante não usarem, o backend ignora
          q: q || undefined,
          data_ini: dataIni || undefined,
          data_fim: dataFim || undefined,
          page,
          per_page: perPage,
        },
      });

      const rows = Array.isArray(data) ? data : (data.data ?? []);
      const lp = data?.meta?.last_page ?? data?.last_page ?? 1;
      const tt = data?.meta?.total ?? data?.total ?? rows.length ?? 0;

      setItens(rows);
      setTotal(tt);
      setLastPage(lp);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, dataIni, dataFim, page, perPage, refreshTick, endpoint, mode]);

  useEffect(() => {
    const handler = () => {
      setPage(1);
      fetchData();
    };
    window.addEventListener(EV_SALVA, handler);
    return () => window.removeEventListener(EV_SALVA, handler);
    // eslint-disable-next-line
  }, []);

  const ordenar = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const itensOrdenados = useMemo(() => {
    const arr = [...itens];
    arr.sort((a, b) => {
      const va = a?.[sortKey];
      const vb = b?.[sortKey];

      if (sortKey === "data") {
        const da = va ? new Date(va) : new Date(0);
        const db = vb ? new Date(vb) : new Date(0);
        return sortDir === "asc" ? da - db : db - da;
      }
      if (sortKey === "hora") {
        const toMin = (h) => {
          if (!h) return -1;
          const [H = "0", M = "0"] = String(h).split(":");
          return parseInt(H, 10) * 60 + parseInt(M, 10);
        };
        const ha = toMin(va);
        const hb = toMin(vb);
        return sortDir === "asc" ? ha - hb : hb - ha;
      }

      const sva = (va ?? "") + "";
      const svb = (vb ?? "") + "";
      if (sva < svb) return sortDir === "asc" ? -1 : 1;
      if (sva > svb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [itens, sortKey, sortDir]);

  const excluir = async (id) => {
    if (!isAdmin) {
      alert("Ação permitida apenas para administradores.");
      return;
    }
    if (!confirm("Tem certeza que deseja excluir esta reunião?")) return;
    try {
      await API.delete(`/reunioes/${id}`);
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
        <div className="text-center">
          <strong className="h5 d-block m-0">Reuniões</strong>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-end mt-3">
          <div className="me-auto" />
          <div>
            <label className="form-label mb-1">Buscar</label>
            <input
              className="form-control"
              placeholder="Título/descrição…"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
          </div>
          <div>
            <label className="form-label mb-1">Data inicial</label>
            <input
              type="date"
              className="form-control"
              value={dataIni}
              onChange={(e) => {
                setPage(1);
                setDataIni(e.target.value);
              }}
            />
          </div>
          <div>
            <label className="form-label mb-1">Data final</label>
            <input
              type="date"
              className="form-control"
              value={dataFim}
              onChange={(e) => {
                setPage(1);
                setDataFim(e.target.value);
              }}
            />
          </div>
          <div>
            <label className="form-label mb-1">Por página</label>
            <select
              className="form-select"
              value={perPage}
              onChange={(e) => {
                setPage(1);
                setPerPage(Number(e.target.value));
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Botão Cadastrar só para ADMIN */}
          {isAdmin && (
            <div className="ms-auto">
              <label className="form-label mb-1 d-block invisible">.</label>
              <button className="btn btn-primary" onClick={onNova}>
                Cadastrar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-body p-0">
        {loading && (
          <div className="p-4 text-center text-muted">Carregando…</div>
        )}
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
                  {isAdmin && (
                    <th className="text-end" style={{ width: 160 }}>
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {itensOrdenados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 5 : 4}
                      className="text-center text-muted py-4"
                    >
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
                      {isAdmin && (
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
                      )}
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
