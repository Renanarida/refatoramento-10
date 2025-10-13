import React, { useMemo, useState } from "react";
import { maskCpf, maskTelefone } from "../../utils/masks";

const NOVO = { nome: "", email: "", telefone: "", cpf: "", papel: "" };

export default function ParticipantesCards({ value = [], onChange, canEdit = true }) {
  const [showEditor, setShowEditor] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(NOVO);

  const participantes = useMemo(() => Array.isArray(value) ? value : [], [value]);

  function openCreate() {
    setForm(NOVO);
    setEditIndex(null);
    setShowEditor(true);
  }

  function openEdit(idx) {
    setForm(participantes[idx] ?? NOVO);
    setEditIndex(idx);
    setShowEditor(true);
  }

  function closeEditor() {
    setShowEditor(false);
    setForm(NOVO);
    setEditIndex(null);
  }

  function salvar() {
    const novoArr = [...participantes];
    if (editIndex === null) novoArr.push(form);
    else novoArr[editIndex] = form;

    onChange?.(novoArr);
    closeEditor();
  }

  function remover(idx) {
    const novoArr = participantes.filter((_, i) => i !== idx);
    onChange?.(novoArr);
  }

  function waLink(fone, nome) {
    const dig = String(fone || "").replace(/\D/g, "");
    const txt = encodeURIComponent(`Olá ${nome || ""}, tudo bem?`);
    return dig ? `https://wa.me/${dig}?text=${txt}` : undefined;
  }

  return (
    <div className="pcards-wrapper">
      <div className="pcards-header">
        <h5 className="mb-0">Participantes</h5>
        {canEdit && (
          <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
            Adicionar
          </button>
        )}
      </div>

      <div className="pcards-grid">
        {participantes.length === 0 && (
          <div className="pcards-empty">Nenhum participante adicionado.</div>
        )}

        {participantes.map((p, idx) => (
          <article className="pcard" key={idx}>
            <header className="pcard-title">{p.nome || "(sem nome)"}</header>
            <div className="pcard-line">{p.email}</div>
            {p.cpf && <div className="small">CPF: {maskCpf(p.cpf)}</div>}
            <div className="pcard-line"><strong>Papel:</strong> {p.papel || "—"}</div>

            <footer className="pcard-actions">
              {canEdit && (
                <>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => remover(idx)}>
                    Remover
                  </button>
                  <button type="button" className="btn btn-warning btn-sm" onClick={() => openEdit(idx)}>
                    Editar
                  </button>
                </>
              )}
              {/* <a
                className="btn btn-success btn-sm"
                href={waLink(p.telefone, p.nome) || "#"}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a> */}
            </footer>
          </article>
        ))}
      </div>

      {showEditor && (
        <div className="pcard-modal">
          <div className="pcard-dialog">
            <div className="pcard-dialog-header">
              <h5>{editIndex === null ? "Adicionar participante" : "Editar participante"}</h5>
              <button type="button" className="pcard-x" onClick={closeEditor}>×</button>
            </div>

            <div className="pcard-dialog-body">
              <div className="pcard-form-grid">
                <label>
                  <span>Nome</span>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    disabled={!canEdit}
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={!canEdit}
                  />
                </label>
                {/* <label>
                  <span>Telefone</span>
                  <input
                    type="text"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    placeholder="(44) 99999-9999"
                    disabled={!canEdit}
                  />
                </label> */}
                <label>
                  <span>CPF</span>
                  <input
                    type="text"
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    disabled={!canEdit}
                  />
                </label>
                <label>
                  <span>Área</span>
                  <input
                    type="text"
                    value={form.papel}
                    onChange={(e) => setForm({ ...form, papel: e.target.value })}
                    placeholder="Dev / UX / etc."
                    disabled={!canEdit}
                  />
                </label>
              </div>
            </div>

            <div className="pcard-dialog-footer">
              <button type="button" className="btn btn-light" onClick={closeEditor}>Cancelar</button>
              {canEdit && (
                <button type="button" className="btn btn-primary" onClick={salvar}>Salvar</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
