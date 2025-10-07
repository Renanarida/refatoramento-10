import React, { useState } from "react";
import API from "../services/api";
import logo from "../assets/Reuniao-email.png";


export default function ResetSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      setLoading(true);
      const { data } = await API.post("/forgot-password", { email });
      setSucesso(data?.message || "Enviamos um link de redefinição para seu e-mail.");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.email?.[0] || "Não foi possível enviar o e-mail.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ backgroundColor: "#0b1aa5" }}>
      <div className="card p-4" style={{ width: 350 }}>
        <h3 className="mb-3">Redefinir senha</h3>
        <img src={logo} alt="Reset" className="mb-3 mx-auto d-block" style={{ width: "100%", borderRadius: 12 }} />

        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link"}
          </button>
        </form>
      </div>
    </div>
  );
}