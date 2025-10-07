import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import API from "../../services/api";

export default function EditUserModal({ open, onClose, user, onSaved }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const panelRef = useRef(null);

  // Preenche formulário ao abrir
  useEffect(() => {
    if (open && user) {
      setForm({ name: user.name || "", email: user.email || "", password: "" });
      setErr(null);
    }
  }, [open, user]);

  // Trava scroll do body enquanto o modal está aberto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Fecha com ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function salvar(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      // ajuste o endpoint se seu backend expõe /me PUT
      await API.put(`/me`, {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
      });
      onSaved?.();
      onClose?.(); // fecha após salvar ✅
    } catch (e) {
      setErr(e?.response?.data?.message || "Erro ao atualizar usuário.");
    } finally {
      setBusy(false);
    }
  }

  const modal = (
    <div
      className="rt-modal__overlay"
      onClick={onClose}
      aria-hidden="true"
      role="presentation"
    >
      <div
        className="rt-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        onClick={(e) => e.stopPropagation()}
        ref={panelRef}
      >
        <h2 id="edit-user-title" className="rt-modal__title">Editar usuário</h2>

        {err && <div className="rt-modal__error">{err}</div>}

        <form onSubmit={salvar} className="rt-modal__form">
          <label className="rt-field">
            <span className="rt-label">Nome</span>
            <input
              className="rt-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>

          <label className="rt-field">
            <span className="rt-label">E-mail</span>
            <input
              type="email"
              className="rt-input"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>

          <label className="rt-field">
            {/* <span className="rt-label">Nova senha (opcional)</span> */}
            {/* <input
              type="password"
              className="rt-input"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Deixe vazio para manter"
            /> */}
          </label>

          <div className="rt-modal__actions">
            <button type="button" className="rt-btn rt-btn--ghost" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <button type="submit" className="rt-btn rt-btn--primary" disabled={busy}>
              {busy ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 🔌 Portal direto no <body>, garante ficar por cima de tudo
  return ReactDOM.createPortal(modal, document.body);
}
