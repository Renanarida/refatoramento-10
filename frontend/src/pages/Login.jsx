import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { setAuthHeaderFromStorage } from "../services/api"; // ⬅️ importa o setter
import logo from "../assets/Reuniao-email.png";
import "../style/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    try {
      // 🔐 Backend deve retornar: { user, token }
      const res = await API.post("/login", { email, password });

      const token = res?.data?.token;
      const user  = res?.data?.user;

      if (!token) {
        throw new Error("Token ausente na resposta do login.");
      }

      localStorage.setItem("token", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (user.name) localStorage.setItem("user_name", user.name);
      }

      // garante o Authorization imediatamente nas próximas chamadas
      setAuthHeaderFromStorage();

      setSucesso("Login realizado com sucesso!");
      navigate("/reunioes", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Email ou senha incorretos.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="card p-4" style={{ width: "350px" }}>
        <h3 className="mb-3">Login</h3>
        <img className="img-login mb-3 mx-auto d-block" src={logo} alt="Cadastro" />

        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              required
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              type="password"
              id="password"
              required
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button disabled={loading} type="submit" className="btn btn-primary w-100">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-3 text-center">
          Esqueceu a senha? <Link to="/reset-senha">Clique aqui</Link>
        </div>

        <div className="mt-3 text-center">
          Ainda não tem conta? <Link to="/cadastrar">Cadastre-se aqui</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
