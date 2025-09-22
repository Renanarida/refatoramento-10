import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../style/header-sidebar.css"; // <- está em src/style
import menuIcon from "../assets/menu-white.svg";

export default function HeaderComSidebar({ userName: userNameProp }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // nome do usuário (prop > localStorage > fallback)
  const userName = useMemo(() => {
    if (userNameProp && String(userNameProp).trim()) return userNameProp;
    const saved =
      localStorage.getItem("user_name") ||
      (JSON.parse(localStorage.getItem("user") || "{}").name);
    return saved || "Usuário";
  }, [userNameProp]);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const toggle = () => setOpen((v) => !v);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_name");
    navigate("/login");
  };

  const initials = (userName || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

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
            ✕
          </button>
        </div>

        <nav className="hsd-nav">
          <Link to="/" className="hsd-nav__link">🏠 Dashboard</Link>
          <Link to="/reunioes" className="hsd-nav__link">🗓️ Reuniões</Link>
          <Link to="/participantes" className="hsd-nav__link">👥 Participantes</Link>
          <Link to="/configuracoes" className="hsd-nav__link">⚙️ Configurações</Link>
        </nav>

        <div className="hsd-sidebar__footer">
          <button className="hsd-logout-btn" onClick={logout}>Sair</button>
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
          <div className="hsd-user">
            <div className="hsd-avatar" aria-hidden="true">{initials || "U"}</div>
            <span className="hsd-username" title={userName}>{userName}</span>
          </div>
        </div>
      </header>

      {/* espaçador para o conteúdo não ficar por baixo do header fixo */}
      <div className="hsd-header-spacer" />
    </>
  );
}
