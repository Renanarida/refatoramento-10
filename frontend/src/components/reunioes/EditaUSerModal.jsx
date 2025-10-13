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
  const opened = (typeof open !== "undefined" ? open : (typeof isOpen !== "undefined" ? isOpen : show)) || false;
  // compat: aceita onClose | onHide
  const close = onClose || onHide || (() => {});

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const panelRef = useRef(null);

  // Preenche formulário ao abrir
  useEffect(() => {
    if (opened && user) {
      setForm({ name: user.name || "", email: user.email || "", password: "" });
      setErr(null);
    }
  }, [opened, user]);

  // Trava scroll do body enquanto o modal está aberto
  useEffect(() => {
    if (!opened) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [opened]);

  // Fecha com ESC
  useEffect(() => {
    if (!opened) return;
    const onKey = (e) => { if (e.key === "Escape") close?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, close]);

  if (!opened) return null;

  async function salvar(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await API.put(`/me`, {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
      });
      onSaved?.();
      close?.(); // fecha após salvar
    } catch (e) {
      setErr(e?.response?.data?.message || "Erro ao atualizar usuário.");
    } finally {
      setBusy(false);
    }
  }

  const modal = (
    <div
      className="rt-modal__overlay"
      onClick={close}
      aria-hidden="true"
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300, // acima do Drawer/AppBar do MUI
      }}
    >
      <div
        className="rt-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        onClick={(e) => e.stopPropagation()}
        ref={panelRef}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          padding: 20,
        }}
      >
        <h2 id="edit-user-title" className="rt-modal__title" style={{ margin: 0, marginBottom: 12 }}>
          Editar usuário
        </h2>

        {err && (
          <div
            className="rt-modal__error"
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

        <form onSubmit={salvar} className="rt-modal__form">
          <label className="rt-field" style={{ display: "block", marginBottom: 12 }}>
            <span className="rt-label" style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Nome</span>
            <input
              className="rt-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            />
          </label>

          <label className="rt-field" style={{ display: "block", marginBottom: 12 }}>
            <span className="rt-label" style={{ display: "block", fontSize: 13, marginBottom: 6 }}>E-mail</span>
            <input
              type="email"
              className="rt-input"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            />
          </label>

          {/* Se quiser reativar a troca de senha, descomente: */}
          {/* <label className="rt-field" style={{ display: "block", marginBottom: 12 }}>
            <span className="rt-label" style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Nova senha (opcional)</span>
            <input
              type="password"
              className="rt-input"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Deixe vazio para manter"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            />
          </label> */}

          <div className="rt-modal__actions" style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <button
              type="button"
              className="rt-btn rt-btn--ghost"
              onClick={close}
              disabled={busy}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rt-btn rt-btn--primary"
              disabled={busy}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "#0A1A3C",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {busy ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
