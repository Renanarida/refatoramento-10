import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import API from "../../services/api";

export default function EditUserModal({
  open,
  isOpen,
  show,
  onClose,
  onHide,
  user,
  onSaved,
}) {
  // compat: aceita open | isOpen | show
  const opened =
    (typeof open !== "undefined"
      ? open
      : typeof isOpen !== "undefined"
      ? isOpen
      : show) || false;

  // compat: aceita onClose | onHide
  const close = onClose || onHide || (() => {});

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [err, setErr] = useState(null);
  const panelRef = useRef(null);

  // Carrega dados para o form:
  // 1) se veio via props `user`, usa;
  // 2) se não tiver user (ou campos vazios), busca no /me
  useEffect(() => {
    let ignore = false;

    async function hydrate() {
      try {
        setErr(null);

        // Prioriza o user recebido por props
        if (opened && user && (user.name || user.email)) {
          if (ignore) return;
          setForm({
            name: user.name || "",
            email: user.email || "",
            password: "",
          });
          return;
        }

        // Se abriu e não tem user suficiente, busca no /me
        if (opened) {
          setLoadingUser(true);
          // tenta via API.get (axios), com fallback de header
          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const resp = await API.get("/me", { headers }).catch(async (e) => {
            // alguns backends expõem /api/me — se o baseURL não tiver /api
            // tente o caminho absoluto
            try {
              const r2 = await fetch("http://localhost:8000/api/me", {
                headers,
              });
              if (!r2.ok) throw new Error("GET /me falhou");
              const data2 = await r2.json();
              return { data: data2 };
            } catch (e2) {
              throw e;
            }
          });

          const u = resp?.data?.user || resp?.data || {};
          if (!ignore) {
            setForm({
              name: u.name || "",
              email: u.email || "",
              password: "",
            });
          }
        }
      } catch (e) {
        if (!ignore) setErr("Não foi possível carregar o usuário.");
      } finally {
        if (!ignore) setLoadingUser(false);
      }
    }

    if (opened) hydrate();
    return () => {
      ignore = true;
    };
    // reidrata quando abrir ou quando mudar o `user` vindo de fora
  }, [opened, user]);

  // Trava scroll do body enquanto aberto
  useEffect(() => {
    if (!opened) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [opened]);

  // Fecha com ESC
  useEffect(() => {
    if (!opened) return;
    const onKey = (e) => {
      if (e.key === "Escape") close?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, close]);

  if (!opened) return null;

  async function salvar(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const payload = {
        name: form.name,
        email: form.email,
      };
      if (form.password) payload.password = form.password;

      // tenta via API.put (axios), com fallback de fetch + header
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        await API.put("/me", payload, { headers });
      } catch {
        const r = await fetch("http://localhost:8000/api/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error("Falha ao atualizar");
      }

      onSaved?.();
      close?.(); // fecha após salvar
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Erro ao atualizar usuário."
      );
    } finally {
      setBusy(false);
    }
  }

  const modal = (
    // Backdrop
    <div
      aria-hidden="true"
      role="presentation"
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1500,
      }}
    >
      {/* Painel FULLSCREEN */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()} // evita fechar ao clicar dentro
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          width: "100vw",
          height: "100vh",
          maxWidth: "100vw",
          maxHeight: "100vh",
        }}
      >
        {/* Topbar */}
        <div
          style={{
            background: "#0A1A3C",
            color: "#fff",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 id="edit-user-title" style={{ margin: 0, fontWeight: 700 }}>
            Editar usuário
          </h2>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.35)",
              color: "#fff",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Fechar
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 24,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <form
            onSubmit={salvar}
            style={{ width: "100%", maxWidth: 720 }}
          >
            {err && (
              <div
                style={{
                  background: "#fdecea",
                  color: "#b71c1c",
                  padding: "10px 12px",
                  borderRadius: 8,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              >
                {err}
              </div>
            )}

            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                Nome
              </span>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  background: "#f9fafb",
                  color: "#111827", // força texto visível
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                E-mail
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  background: "#f9fafb",
                  color: "#111827",
                }}
              />
            </label>

            {/* Para reativar senha, só descomentar: */}
            {/*
            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                Nova senha (opcional)
              </span>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Deixe vazio para manter"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  background: "#f9fafb",
                  color: "#111827",
                }}
              />
            </label>
            */}
          </form>
        </div>

        {/* Footer fixo */}
        <div
          style={{
            padding: 16,
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={close}
            disabled={busy}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              // dispara o submit do form manualmente
              const formEl = panelRef.current?.querySelector("form");
              if (formEl) {
                const submitted = formEl.dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true })
                );
                if (!submitted) return;
              }
            }}
            disabled={busy || loadingUser}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "#0A1A3C",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              opacity: busy || loadingUser ? 0.7 : 1,
            }}
          >
            {busy ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
