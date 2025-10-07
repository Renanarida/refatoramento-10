import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, NavLink, Link, useLocation } from "react-router-dom";
// import { doLogout } from "../services/Auth"; // <- se quiser usar, descomente e use
import EditUserModal from "../components/reunioes/EditaUSerModal.jsx"; // ✅ case e extensão corrigidos
import "../style/header-sidebar.css";
import menuIcon from "../assets/menu.png";

const API = "http://localhost:8000/api";

export default function HeaderComSidebar({ userName: userNameProp }) {
  const [open, setOpen] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false); // controla o modal
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

  // fecha sidebar quando troca de rota
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // carrega /api/me
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setMe(data?.user || data || null);
        const nome = (data?.user?.name ?? data?.name);
        if (nome) localStorage.setItem("user_name", nome);
      })
      .catch(() => { /* silencioso */ });
  }, []);

  const toggle = () => setOpen((v) => !v);

  // 🔒 se quiser usar logout por função, descomente o import e esta função
  // const handleLogout = () => {
  //   doLogout(navigate);
  // };

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
      e.target.value = ""; // reseta input
    }
  };

  // 👉 abre modal e fecha sidebar
  const openEditUser = () => {
    setShowEditUser(true);
    setOpen(false);
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
            <img className="menu-icon" src="/menu.png" alt="menu" />
          </button>
        </div>

        <nav className="hsd-nav">
          <NavLink to="/reunioes" className={({ isActive }) => `hsd-nav__link ${isActive ? "hsd-nav__link--active" : ""}`}>
            🗓️ Reuniões
          </NavLink>

          <NavLink to="/dashboard" className={({ isActive }) => `hsd-nav__link ${isActive ? "hsd-nav__link--active" : ""}`}>
            🏠 Dashboard
          </NavLink>

          <button type="button" onClick={openEditUser} className="hsd-nav__link">
            ✏️ Editar Usuário
          </button>

          <NavLink to="/configuracoes" className={({ isActive }) => `hsd-nav__link ${isActive ? "hsd-nav__link--active" : ""}`}>
            ⚙️ Configurações
          </NavLink>
        </nav>

        <div className="hsd-sidebar__footer">
          {/* Se quiser usar função de logout, troque por onClick={handleLogout} */}
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
                style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", marginRight: 8 }}
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

      {/* Modal de edição de usuário - agora com user e onSaved */}
      <EditUserModal
        open={showEditUser}
        onClose={() => setShowEditUser(false)}
        user={me}
        onSaved={async () => {
          try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const r = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (r.ok) {
              const data = await r.json();
              setMe(data?.user || data || null);
              const nome = (data?.user?.name ?? data?.name);
              if (nome) localStorage.setItem("user_name", nome);
            }
          } catch { }
        }}
      />

      {/* espaçador para o conteúdo não ficar por baixo do header fixo */}
      <div className="hsd-header-spacer" />
    </>
  );
}
