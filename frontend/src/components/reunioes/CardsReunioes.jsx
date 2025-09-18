import { useEffect, useState } from "react";
import axios from "axios";

export default function CardsReunioes({ onNova }) {
  const [resumo, setResumo] = useState(null);
  const [lista, setLista] = useState([]);

  const carregar = async () => {
    const { data: cards } = await axios.get("/api/reunioes/cards");
    setResumo(cards.resumo);
    const { data: list } = await axios.get("/api/reunioes?per_page=50");
    setLista(list.data ?? []);
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    const handler = () => carregar();
    window.addEventListener("reuniao:salva", handler);
    return () => window.removeEventListener("reuniao:salva", handler);
  }, []);

  return (
    <div className="row g-3">
      <div className="col-md-3">
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="text-muted">Total</h6>
            <div className="h3 m-0">{resumo?.total ?? "—"}</div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="text-muted">Hoje</h6>
            <div className="h3 m-0">{resumo?.hoje ?? "—"}</div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="text-muted">Amanhã</h6>
            <div className="h3 m-0">{resumo?.amanha ?? "—"}</div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="text-muted">Próx. 48h</h6>
            <div className="h3 m-0">{resumo?.proximas_48h ?? "—"}</div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>Próximas reuniões</strong>
            <button className="btn btn-sm btn-primary" onClick={onNova}>
              Nova
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Local</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((item) => (
                  <tr key={item.id}>
                    <td>{item.titulo}</td>
                    <td>{item.data || ""}</td>
                    <td>{item.hora || ""}</td>
                    <td>{item.local || ""}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("reuniao:editar", { detail: item })
                          )
                        }
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {lista.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Sem reuniões…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
