import React, { useMemo, useState } from "react";
import { maskCpf, maskTelefone } from "../../utils/masks";

const NOVO = { nome: "", email: "", telefone: "", cpf: "", papel: "" };
const onlyDigits = (v = "") => String(v).replace(/\D/g, "");

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

  // quando editar, já carrega os campos com máscara para o usuário
  function openEdit(idx) {
    const p = participantes[idx] ?? NOVO;
    setForm({
      nome: p.nome || "",
      email: p.email || "",
      telefone: p.telefone ? maskTelefone(p.telefone) : "",
      cpf: p.cpf ? maskCpf(p.cpf) : "",
      papel: p.papel || p.cargo || "",
    });
    setEditIndex(idx);
    setShowEditor(true);
  }

  function closeEditor() {
    setShowEditor(false);
    setForm(NOVO);
    setEditIndex(null);
  }

  // aplica máscara conforme o campo
  function handleChange(e) {
    const { name, value } = e.target;
    let v = value;
    if (name === "cpf") v = maskCpf(value);            // 000.000.000-00
    if (name === "telefone") v = maskTelefone(value);  // (44) 99999-9999
    setForm((f) => ({ ...f, [name]: v }));
  }

  function salvar() {
    // 🔑 normaliza ANTES de enviar pra cima (só dígitos)
    const payload = {
      nome: (form.nome || "").trim(),
      email: (form.email || "").trim(),
      cpf: onlyDigits(form.cpf),               // << só números
      telefone: onlyDigits(form.telefone),     // << só números
      papel: (form.papel || "").trim(),
    };

    // substitui/insere no array original
    const novoArr = [...participantes];
    if (editIndex === null) novoArr.push(payload);
    else novoArr[editIndex] = payload;

    onChange?.(novoArr);
    closeEditor();
  }

  function remover(idx) {
    const novoArr = participantes.filter((_, i) => i !== idx);
    onChange?.(novoArr);
  }

  function waLink(fone, nome) {
    const dig = onlyDigits(fone);
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

            {p.telefone && (
              <div className="small">Telefone: {maskTelefone(p.telefone)}</div>
            )}

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
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    disabled={!canEdit}
                  />
                </label>

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!canEdit}
                  />
                </label>

                <label>
                  <span>CPF</span>
                  <input
                    type="text"
                    name="cpf"
                    value={form.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    inputMode="numeric"
                    disabled={!canEdit}
                  />
                </label>

                <label>
                  <span>Telefone</span>
                  <input
                    type="text"
                    name="telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    placeholder="(44) 99999-9999"
                    maxLength={15}
                    inputMode="numeric"
                    disabled={!canEdit}
                  />
                </label>

                <label>
                  <span>Papel</span>
                  <input
                    type="text"
                    name="papel"
                    value={form.papel}
                    onChange={handleChange}
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
