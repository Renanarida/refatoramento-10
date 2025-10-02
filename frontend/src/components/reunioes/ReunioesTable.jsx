import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../services/useAuth";
import { maskCpf, maskTelefone } from "../../utils/masks";

const EV_SALVA = "reuniao:salva";

function normalizeCpf(v = "") {
  return String(v).replace(/\D+/g, "");
}

function ModalParticipantes({ open, onClose, reuniao, loading, error, participantes }) {
  if (!open) return null;
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ background: "rgba(0,0,0,0.35)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded shadow p-3"
        style={{
          width: "min(800px, 95vw)",
          maxHeight: "85vh",
          overflow: "auto",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="m-0">
            Participantes {reuniao ? `— ${reuniao.titulo ?? ""}` : ""}
          </h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>

        {loading && <div className="text-muted py-3">Carregando…</div>}
        {error && !loading && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <div className="row g-3">
            {Array.isArray(participantes) && participantes.length > 0 ? (
              participantes.map((p) => (
                <div key={p.id ?? `${p.nome}-${p.email}-${p.papel}`} className="col-12 col-md-6">
                  <div className="border rounded p-3 h-100">
                    <div className="fw-semibold">{p.nome || "(sem nome)"}</div>
                    <div className="text-muted small">{p.email || "-"}</div>
                    <div className="badge bg-secondary mt-2">{p.papel || "participante"}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted py-3">Nenhum participante encontrado.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReunioesTable({
  onNova = () => {},
  onEditar = () => {},
  refreshTick = 0,
}) {
  const { mode } = useAuth();
  const isAdmin = mode === "admin";
  const isParticipant = mode === "participant";
  const isUser = mode === "user";

  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [q, setQ] = useState("");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [sortKey, setSortKey] = useState("data");
  const [sortDir, setSortDir] = useState("asc");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalParticipantes, setModalParticipantes] = useState([]);
  const [modalReuniao, setModalReuniao] = useState(null);

  const endpoint =
    isAdmin || isUser
      ? "/reunioes"
      : isParticipant
      ? "/participante/reunioes"
      : "/public/reunioes";

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      if (isParticipant) {
        const cpf = localStorage.getItem("cpf");
        if (cpf) API.defaults.headers["X-CPF"] = cpf;
      }

      const { data } = await API.get(endpoint, {
        params: {
          q: q || undefined,
          data_ini: dataIni || undefined,
          data_fim: dataFim || undefined,
          page,
          per_page: perPage,
        },
      });

      const rows = Array.isArray(data) ? data : data.data ?? [];
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

  // Abre modal e busca participantes conforme o modo
  const abrirParticipantes = async (reuniao) => {
    setModalReuniao(reuniao);
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalParticipantes([]);

    try {
      if (isParticipant) {
        // participant -> endpoint com CPF
        const cpfRaw =
          localStorage.getItem("participant_cpf") ||
          localStorage.getItem("cpf") ||
          localStorage.getItem("participantCpf");
        const cpf = cpfRaw ? normalizeCpf(cpfRaw) : null;

        const { data } = await API.get(
          `/reunioes/${reuniao.id}/participantes-by-cpf`,
          { params: { cpf } }
        );
        setModalParticipantes(data?.participantes ?? []);
      } else {
        // user/admin -> usa show normal
        const { data } = await API.get(`/reunioes/${reuniao.id}`);
        const participantes = Array.isArray(data?.participantes) ? data.participantes : [];
        setModalParticipantes(participantes);
        // se o backend não devolver titulo por algum motivo, mantemos o do row
        setModalReuniao((prev) => ({ ...(prev || {}), titulo: data?.titulo ?? prev?.titulo }));
      }
    } catch (e) {
      setModalError(e?.response?.data?.message || e.message || "Erro ao carregar participantes");
    } finally {
      setModalLoading(false);
    }
  };

  const showActions = isAdmin || isUser || isParticipant;

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
                  {headerSort("descricao", "Descrição")}
                  {headerSort("data", "Data")}
                  {headerSort("hora", "Hora")}
                  {headerSort("local", "Local")}
                  {showActions && (
                    <th className="text-end" style={{ width: isAdmin ? 220 : 180 }}>
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {itensOrdenados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={showActions ? 6 : 5}
                      className="text-center text-muted py-4"
                    >
                      Nenhuma reunião encontrada.
                    </td>
                  </tr>
                ) : (
                  itensOrdenados.map((r) => (
                    <tr key={r.id}>
                      <td>{r.titulo}</td>
                      <td>
                        <span
                          title={r.descricao || ""}
                          className="d-inline-block text-truncate"
                          style={{ maxWidth: 360 }}
                        >
                          {r.descricao || "-"}
                        </span>
                      </td>
                      <td>{r.data || ""}</td>
                      <td>{r.hora || ""}</td>
                      <td>{r.local || ""}</td>

                      {showActions && (
                        <td className="text-end">
                          <div className="btn-group">
                            {isAdmin && (
                              <>
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => onEditar(r)}
                                >
                                  Editar
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => excluir(r.id)}
                                >
                                  Excluir
                                </button>
                              </>
                            )}

                            {(isUser || isAdmin || isParticipant) && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => abrirParticipantes(r)}
                              >
                                Ver participantes
                              </button>
                            )}
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

      <ModalParticipantes
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reuniao={modalReuniao}
        loading={modalLoading}
        error={modalError}
        participantes={modalParticipantes}
      />
    </div>
  );
}
