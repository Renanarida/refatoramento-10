import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { setCpfHeader } from "../services/api";
import { maskCpf } from "../utils/masks";

const normalizeCpf = (v="") => String(v).replace(/\D+/g, "").slice(0,11);

export default function ParticipanteCpf() {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    const puro = normalizeCpf(cpf);
    if (puro.length !== 11) {
      setMsg("Informe um CPF com 11 dígitos.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/participante/check-cpf", { cpf: puro });
      if (data?.ok && data?.exists) {
        setCpfHeader(puro);          // salva e injeta X-CPF
        // se você usa useAuth().asParticipant, pode chamar aqui também
        navigate("/dashboard-participante");
      } else {
        setMsg("CPF não encontrado em nenhuma reunião.");
      }
    } catch (err) {
      if (err?.response?.status === 422) {
        setMsg("CPF inválido. Verifique os dígitos.");
      } else {
        setMsg("Erro ao verificar CPF. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center" style={{ background:'#0a2f87' }}>
      <div className="bg-white rounded-3 shadow p-4" style={{ width:'min(420px, 92vw)' }}>
        <h1 className="h4 text-center mb-3" style={{ color:'#0a2f87' }}>Acesso do Participante</h1>
        <p className="text-muted text-center mb-4">Informe seu CPF para verificar o acesso.</p>

        <form onSubmit={handleSubmit} className="d-grid gap-3">
          <input
            type="text"
            className="form-control"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            inputMode="numeric"
          />
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Verificando..." : "Continuar"}
          </button>
          {msg && <div className="alert alert-warning m-0 mt-2">{msg}</div>}
        </form>
      </div>
    </div>
  );
}
