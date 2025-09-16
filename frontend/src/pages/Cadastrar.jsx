import React, { useState } from "react";
import axios from "axios";
import logo from "../assets/Reuniao-email.png";
import "../style/cadastrar.css"; // seu CSS customizado

const Cadastrar = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (senha !== senhaConfirm) {
      setErro("As senhas não coincidem!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/usuarios", {
        nome,
        email,
        senha,
      });

      setSucesso("Usuário cadastrado com sucesso!");
      console.log(response.data);

      setNome("");
      setEmail("");
      setSenha("");
      setSenhaConfirm("");
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      setErro(error.response?.data?.message || "Erro ao cadastrar usuário.");
    }
  };

  return (
    <div id="body-box" className="d-flex justify-content-center align-items-center vh-100">
      <div id="box-cadastro" className="w-100" style={{ maxWidth: "400px" }}>
        <h3 className="mb-3 text-center text-white">Cadastro</h3>

        <img
          className="img-login mb-3 mx-auto d-block"
          src={logo}
          alt="Cadastro"
        />

        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Confirmar Senha"
              value={senhaConfirm}
              onChange={(e) => setSenhaConfirm(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-light w-100 fw-bold">
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Cadastrar;
