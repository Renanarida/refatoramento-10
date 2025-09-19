import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000"; // ajuste se necessário

export default function CardsReunioes() {
  const [resumo, setResumo] = useState(null);

  const carregar = async () => {
    const { data: cards } = await axios.get(`${API}/api/reunioes/cards`, {
      headers: { Accept: "application/json" },
    });
    setResumo(cards.resumo);
  };

  useEffect(() => { carregar(); }, []);
  useEffect(() => {
    const handler = () => carregar();
    window.addEventListener("reuniao:salva", handler);
    return () => window.removeEventListener("reuniao:salva", handler);
  }, []);

  return (
    <div className="row g-3">
      <div className="col-md-3"><div className="card shadow-sm"><div className="card-body">
        <h6 className="text-muted">Total</h6>
        <div className="h3 m-0">{resumo?.total ?? "—"}</div>
      </div></div></div>

      <div className="col-md-3"><div className="card shadow-sm"><div className="card-body">
        <h6 className="text-muted">Hoje</h6>
        <div className="h3 m-0">{resumo?.hoje ?? "—"}</div>
      </div></div></div>

      <div className="col-md-3"><div className="card shadow-sm"><div className="card-body">
        <h6 className="text-muted">Amanhã</h6>
        <div className="h3 m-0">{resumo?.amanha ?? "—"}</div>
      </div></div></div>

      <div className="col-md-3"><div className="card shadow-sm"><div className="card-body">
        <h6 className="text-muted">Próx. 48h</h6>
        <div className="h3 m-0">{resumo?.proximas_48h ?? "—"}</div>
      </div></div></div>
    </div>
  );
}
