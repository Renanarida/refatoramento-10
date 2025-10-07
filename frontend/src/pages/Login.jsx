import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { setAuthHeaderFromStorage } from "../services/api";
import { useAuth } from "../services/useAuth";    
import logo from "../assets/Reuniao-email.png";
import "../style/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // campo padrão "password"
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { asUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    try {
      // Envia apenas { email, password }
      const res = await API.post("/login", { email, password });

      // token (aceita vários formatos)
      const token = (
        res?.data?.token ||
        res?.data?.plainTextToken ||
        res?.data?.access_token ||
        ""
      ).toString().trim();

      if (token) {
        localStorage.setItem("token", token);
        setAuthHeaderFromStorage?.();
      } else {
        localStorage.removeItem("token");
      }

      // pega o usuário: prioriza resposta do login; se não tiver role, busca /me
      let user = res?.data?.user;
      if (!user?.role) {
        const me = await API.get("/me"); // backend deve retornar { id, name, email, role, ... }
        user = me?.data || user;
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (user.name) localStorage.setItem("user_name", user.name);
        asUser(user);
      }

      setSucesso("Login realizado com sucesso!");
      navigate("/reunioes", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
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
      <div className="card p-4" style={{ width: "350px", borderRadius: "12px", border: "1px solid #ccc" }}>
        <h3 className="mb-3">Login</h3>
        <img className="img-login mb-3 mx-auto d-block" src={logo} alt="Login" />

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
              autoComplete="email"
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
              autoComplete="current-password"
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
