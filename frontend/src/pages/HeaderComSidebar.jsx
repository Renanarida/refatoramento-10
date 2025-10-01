import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
// import { useNavigate, Link, useLocation } from "react-router-dom";
// import { doLogout } from "../services/Auth"; // <- minúsculo
import "../style/header-sidebar.css";
import menuIcon from "../assets/menu.png";

const API = "http://localhost:8000/api";

export default function HeaderComSidebar({ userName: userNameProp }) {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);            // dados do usuário autenticado
  const [busy, setBusy] = useState(false);       // estado de upload
  const fileRef = useRef(null);                  // input de arquivo
  const navigate = useNavigate();
  const location = useLocation();

  // nome: prop > localStorage > /api/me > fallback
  const userNameFromStorage = useMemo(() => {
    return (
      (userNameProp && String(userNameProp).trim()) ||
      localStorage.getItem("user_name") ||
      (JSON.parse(localStorage.getItem("user") || "{}").name) ||
      "Usuário"
    );
  }, [userNameProp]);

  const userName = me?.name || userNameFromStorage;

  useEffect(() => { setOpen(false); }, [location.pathname]);

  // carrega /api/me para descobrir avatar_url (e nome, se quiser)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setMe(data);
        if (data?.name) localStorage.setItem("user_name", data.name);
      })
      .catch(() => { });
  }, []);

  const toggle = () => setOpen((v) => !v);

  // usa o helper (faz POST /logout, limpa storage e navega)
  const handleLogout = () => {
    doLogout(navigate);
  };

  const initials = (userName || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  // abre o seletor
  const openPicker = () => {
    if (busy) return;
    fileRef.current?.click();
  };

  // faz upload do avatar
  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Faça login para trocar a foto.");
      e.target.value = "";
      return;
    }
    try {
      setBusy(true);
      const form = new FormData();
      form.append("avatar", file);

      const resp = await fetch(`${API}/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // não setar Content-Type manual
        body: form,
      });

      if (!resp.ok) throw new Error("Falha ao enviar imagem");
      const data = await resp.json();
      setMe((prev) => ({ ...(prev || {}), avatar_url: data.avatar_url }));
    } catch (err) {
      console.error(err);
      alert("Não foi possível enviar a imagem.");
    } finally {
      setBusy(false);
      e.target.value = ""; // reseta input para permitir mesmo arquivo de novo
    }
  };

  return (
    <>
      {/* overlay para fechar a sidebar ao clicar fora */}
      <div
        className={`hsd-overlay ${open ? "hsd-overlay--show" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* sidebar lateral */}
      <aside className={`hsd-sidebar ${open ? "hsd-sidebar--open" : ""}`} aria-hidden={!open}>
        <div className="hsd-sidebar__header">
          <span className="hsd-brand">Reuniões</span>
          <button className="hsd-icon-btn" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <img
              className="menu-icon"
              src="/menu.png"
              alt="menu"
            />
          </button>
        </div>

        <nav className="hsd-nav">
          <Link to="/" className="hsd-nav__link">🏠 Dashboard</Link>
          <Link to="/reunioes" className="hsd-nav__link">🗓️ Reuniões</Link>
          <Link to="/participantes" className="hsd-nav__link">👥 Participantes</Link>
          <Link to="/configuracoes" className="hsd-nav__link">⚙️ Configurações</Link>
        </nav>

        <div className="hsd-sidebar__footer">
          <Link to="/logout" className="hsd-logout-btn btn btn-danger w-100 d-block">
            Sair
          </Link>
        </div>
      </aside>

      {/* HEADER FULL-WIDTH FIXO NO TOPO */}
      <header className="hsd-header hsd-header--fixed">
        <div className="hsd-left">
          <button
            className="hsd-burger"
            onClick={toggle}
            aria-label="Abrir navegação"
            aria-controls="sidebar"
            aria-expanded={open}
          >
            <img src={menuIcon} alt="menu" className="hsd-burger-icon" />
          </button>
          <h1 className="hsd-title">Reuniões</h1>
        </div>

        <div className="hsd-right">
          {/* CHIP CLICÁVEL PARA TROCAR A FOTO */}
          <div
            className="hsd-user"
            onClick={openPicker}
            title={busy ? "Enviando..." : "Clique para trocar a foto"}
            style={{ cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1 }}
          >
            {/* Avatar ou iniciais */}
            {me?.avatar_url ? (
              <img
                src={me.avatar_url}
                alt="avatar"
                className="hsd-avatar-img"
                style={{
                  width: 28, height: 28, borderRadius: "50%", objectFit: "cover",
                  marginRight: 8
                }}
              />
            ) : (
              <div className="hsd-avatar" aria-hidden="true">{initials || "U"}</div>
            )}

            <span className="hsd-username" title={userName}>{userName}</span>

            {/* input de arquivo escondido */}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onPick}
              style={{ display: "none" }}
              disabled={busy}
            />
          </div>
        </div>
      </header>

      {/* espaçador para o conteúdo não ficar por baixo do header fixo */}
      <div className="hsd-header-spacer" />
    </>
  );
}
