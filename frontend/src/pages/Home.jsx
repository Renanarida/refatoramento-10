import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/home.css";
import { useAuth } from "../services/useAuth"; // ✅ usar o hook

// ✅ Imagens
import partnersIcon from "../assets/partners.png";
import videoConferenceIcon from "../assets/video-conference.png";
import sendIcon from "../assets/send.png";

const Home = () => {
  const navigate = useNavigate();
  const { asVisitor } = useAuth(); // 👈 não precisamos mais do asParticipant aqui

  const handleVisitante = () => {
    asVisitor();                 // seta mode="visitor"
    navigate("/dashboard-visitante");
  };

  const handleParticipante = () => {
    // Agora só navega para a página dedicada do CPF
    navigate("/participante"); // 👈 nova rota com o formulário de CPF
  };

  return (
    <div className="home-container" style={{ textAlign: "center", padding: "2rem" }}>
      <h1 id="titulo-1">Bem-vindo ao site de Reuniões</h1>

      <div className="box-texto" style={{ margin: "1rem 0" }}>
        <h2>Este site tem como intuito administrar suas reuniões de forma prática e fácil.</h2>
      </div>

      <h1 className="titulo-paragrafo">O que vamos encontrar dentro deste site?</h1>

      <div className="conteudo-ameacas" style={{ display: "flex", justifyContent: "center", gap: "2rem", margin: "2rem 0" }}>
        <div className="conteudo-box">
          <img src={partnersIcon} alt="Imagem de organização das reuniões" height="40" width="40" />
          <p>Prática organização das reuniões</p>
        </div>
        <div className="conteudo-box">
          <img src={videoConferenceIcon} alt="Imagem de participante em uma reunião" height="40" width="40" />
          <p>Listagem dos participantes com seus dados empresariais</p>
        </div>
        <div className="conteudo-box">
          <img src={sendIcon} alt="Imagem de envio" height="40" width="40" />
          <p>Envio de reuniões via WhatsApp</p>
        </div>
      </div>

      <div className="box-links" style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="/cadastrar" className="btn btn-primary">Cadastre-se</Link>
        <Link to="/login" className="btn btn-secondary">Login</Link>
        <button onClick={handleVisitante} className="btn btn-success">Entrar como visitante</button>

        {/* 👇 Botão simples que leva para a tela dedicada do CPF */}
        <button onClick={handleParticipante} className="btn btn-info">Participante</button>
      </div>
    </div>
  );
};

export default Home;
