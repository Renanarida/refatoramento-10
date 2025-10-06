import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import logo from "../assets/Reuniao-email.png";

export default function NovaSenha() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => params.get("token") || "", [params]);
  const emailParam = useMemo(() => params.get("email") || "", [params]);

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!token) { setErro("Token ausente."); return; }
    if (password !== confirm) { setErro("As senhas não coincidem."); return; }

    try {
      setLoading(true);
      const payload = { token, email, password, password_confirmation: confirm };
      const { data } = await API.post("/reset-password", payload);
      setSucesso(data?.message || "Senha redefinida com sucesso!");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.email?.[0]
        || "Não foi possível redefinir a senha.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#0b1aa5" }}>
      <div className="card p-4" style={{ width: 350 }}>
        <h3 className="mb-3">Definir nova senha</h3>
        <img src={logo} alt="Nova Senha" className="mb-3 mx-auto d-block" style={{ width: "100%", borderRadius: 12 }} />

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

          <div className="mb-3">
            <label className="form-label" htmlFor="pass">Nova senha</label>
            <input
              id="pass"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="conf">Confirmar senha</label>
            <input
              id="conf"
              type="password"
              className="form-control"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
