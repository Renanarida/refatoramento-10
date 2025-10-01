import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import API from "../../services/api"; // usa o client axios configurado
import { useAuth } from "../../services/useAuth"; // 👈 pega isAdmin

import ParticipantesCards from "./ParticipantesCards";      // mesma pasta, nome igualzinho
import "../../style/participantes-cards.css";               // CSS está em src/style

const EV_SALVA = "reuniao:salva";

// ---- helpers de CPF ----
const onlyDigits = (v) => (v || "").replace(/\D/g, "");
const maskCpf = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  let out = p1;
  if (p2) out += "." + p2;
  if (p3) out += "." + p3;
  if (p4) out += "-" + p4;
  return out;
};

export default function ModalReuniao({ registro, onClose, onSaved }) {
  const { isAdmin } = useAuth();              // 👈 define permissões
  const isEditing = !!registro?.id;           // 👈 modo edição?

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    data: "",
    hora: "",
    local: "",
    participantes: [],
  });
  const [errors, setErrors] = useState(null);

  // ---- util ----
  function normalizarHora(hora) {
    if (!hora) return "";
    return hora.slice(0, 5); // garante HH:MM (corta :SS se vier)
  }

  // Pré-preenche quando vier um registro para edição
  useEffect(() => {
    if (registro) {
      setForm({
        titulo: registro.titulo ?? "",
        descricao: registro.descricao ?? "",
        data: registro.data ?? "",
        hora: normalizarHora(registro.hora ?? ""),
        local: registro.local ?? "",
        participantes: (registro.participantes ?? []).map((p) => ({
          nome: p?.nome ?? "",
          email: p?.email ?? "",
          papel: p?.papel ?? "",
          cpf: maskCpf(p?.cpf ?? ""), // 👈 mostra mascarado na edição
        })),
      });
    } else {
      setForm({
        titulo: "",
        descricao: "",
        data: "",
        hora: "",
        local: "",
        participantes: [],
      });
    }
    setErrors(null);
  }, [registro]);

  const salvar = async () => {
    if (!isAdmin) return; // 👈 trava ação para não-admin
    try {
      setSaving(true);
      setErrors(null);

      // Validação rápida no front (evita 422 bobo)
      if (!form.titulo?.trim()) {
        setErrors({ titulo: ["O título é obrigatório."] });
        setSaving(false);
        return;
      }
      if (!form.data) {
        setErrors({ data: ["A data é obrigatória."] });
        setSaving(false);
        return;
      }
      if (!form.hora) {
        setErrors((prev) => ({ ...(prev || {}), hora: ["A hora é obrigatória."] }));
        setSaving(false);
        return;
      }

      // Monta payload com hora normalizada
      const payload = {
        titulo: form.titulo,
        descricao: form.descricao || null,
        data: form.data,                                  // YYYY-MM-DD
        hora: form.hora ? normalizarHora(form.hora) : null, // HH:MM
        local: form.local || null,
      };

      // só envia participantes se houver algo
      if (Array.isArray(form.participantes) && form.participantes.length > 0) {
        payload.participantes = form.participantes.map((p) => ({
          nome: p?.nome ?? "",
          email: p?.email ?? "",
          papel: p?.papel ?? "",
          cpf: p?.cpf ? onlyDigits(p.cpf) : null, // 👈 só dígitos para o backend
        }));
      }

      if (isEditing) {
        await API.put(`/reunioes/${registro.id}`, payload);
      } else {
        await API.post(`/reunioes`, payload);
      }

      window.dispatchEvent(new Event(EV_SALVA));
      onSaved && onSaved();
      onClose && onClose();
    } catch (e) {
      const v = e?.response?.status === 422 ? e?.response?.data?.errors : null;
      if (v) setErrors(v);
      else alert("Erro ao salvar: " + (e?.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const excluir = async () => {
    if (!isAdmin || !isEditing) return; // 👈 trava ação
    if (!confirm("Tem certeza que deseja excluir esta reunião?")) return;
    try {
      setSaving(true);
      setErrors(null);
      await API.delete(`/reunioes/${registro.id}`);
      window.dispatchEvent(new Event(EV_SALVA));
      onSaved && onSaved();
      onClose && onClose();
    } catch (e) {
      alert("Erro ao excluir: " + (e?.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  // Render
  return createPortal(
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={onClose} />
      {/* Modal */}
      <div className="modal fade show" style={{ display: "block", zIndex: 1055 }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isEditing ? "Editar Reunião" : "Nova Reunião"}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {/* Erros globais/validação */}
              {errors && (
                <div className="alert alert-danger">
                  <ul className="m-0 ps-3">
                    {Object.entries(errors).map(([field, msgs]) =>
                      (msgs || []).map((m, i) => <li key={field + i}>{m}</li>)
                    )}
                  </ul>
                </div>
              )}

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Título</label>
                  <input
                    className={`form-control ${errors?.titulo ? "is-invalid" : ""}`}
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    disabled={!isAdmin}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    disabled={!isAdmin}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className={`form-control ${errors?.data ? "is-invalid" : ""}`}
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    disabled={!isAdmin}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label">Hora</label>
                  <input
                    type="time"
                    step="60"
                    className={`form-control ${errors?.hora ? "is-invalid" : ""}`}
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: normalizarHora(e.target.value) })}
                    disabled={!isAdmin}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Local</label>
                  <input
                    className="form-control"
                    value={form.local}
                    onChange={(e) => setForm({ ...form, local: e.target.value })}
                    disabled={!isAdmin}
                  />
                </div>

                {/* Participantes (cards) */}
                <div className="col-12">
                  <ParticipantesCards
                    value={form.participantes}
                    onChange={(arr) => setForm((f) => ({ ...f, participantes: arr }))}
                    canEdit={isAdmin}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {/* Não-admin: só fecha */}
              {!isAdmin && (
                <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
                  Fechar
                </button>
              )}

              {/* Admin + Novo */}
              {isAdmin && !isEditing && (
                <>
                  <button className="btn btn-primary" onClick={salvar} disabled={saving}>
                    {saving ? "Salvando..." : "Adicionar"}
                  </button>
                  <button className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
                    Cancelar
                  </button>
                </>
              )}

              {/* Admin + Edição */}
              {isAdmin && isEditing && (
                <>
                  <button className="btn btn-primary" onClick={salvar} disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Reunião"}
                  </button>
                  <button className="btn btn-danger" onClick={excluir} disabled={saving}>
                    {saving ? "Excluindo..." : "Excluir Reunião"}
                  </button>
                  <button className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
