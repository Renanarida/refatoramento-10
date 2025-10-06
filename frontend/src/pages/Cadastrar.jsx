import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/Reuniao-email.png";
import "../style/cadastrar.css";

const Cadastrar = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (senha !== senhaConfirm) {
      setErro("As senhas não coincidem!");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("http://localhost:8000/api/usuarios", {
        nome,
        email,
        senha,
      });

      setSucesso("Usuário cadastrado com sucesso!");
      // limpa form
      setNome("");
      setEmail("");
      setSenha("");
      setSenhaConfirm("");

      // redireciona pro login
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (error) {
      setErro(error?.response?.data?.message || "Erro ao cadastrar usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#0b1aa5" }} // azul do print
    >
      <div className="card p-4" style={{ width: 350 }}>
        <h3 className="mb-3">Cadastro</h3>

        <img
          src={logo}
          alt="Cadastro"
          className="mb-3 mx-auto d-block"
          style={{ width: "100%", borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,.25)" }}
        />

        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              className="form-control"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email</label>
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
            <label className="form-label" htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              className="form-control"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="senha2">Confirmar Senha</label>
            <input
              id="senha2"
              type="password"
              className="form-control"
              value={senhaConfirm}
              onChange={(e) => setSenhaConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        {/* Linhas de ajuda no rodapé, no mesmo modelo do Login */}
        <div className="mt-2 text-center">
          Já tem conta? <Link to="/login">Faça login</Link>
        </div>
      </div>
    </div>
  );
};

export default Cadastrar;
