import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

export default function ModalReuniao() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ participantes: [] });

  useEffect(() => {
    const onNova = () => { setEditing(null); setForm({ participantes: [] }); setOpen(true); };
    const onEdit = (e) => { setEditing(e.detail); setForm({ ...(e.detail||{}), participantes: e.detail?.participantes || [] }); setOpen(true); };
    window.addEventListener("reuniao:nova", onNova);
    window.addEventListener("reuniao:editar", onEdit);
    return () => {
      window.removeEventListener("reuniao:nova", onNova);
      window.removeEventListener("reuniao:editar", onEdit);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    // trava scroll e garante empilhamento
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("modal-open");
    };
  }, [open]);

  const salvar = async () => {
    if (editing?.id) await axios.put(`/api/reunioes/${editing.id}`, form);
    else await axios.post("/api/reunioes", form);
    setOpen(false);
    window.dispatchEvent(new CustomEvent("reuniao:salva"));
  };

  if (!open) return null;

  const modalEl = (
    <>
      {/* Backdrop com z-index menor */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={() => setOpen(false)}
      />
      {/* Modal com z-index maior */}
      <div
        className="modal fade show"
        style={{ display: "block", zIndex: 1055 }}
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editing ? "Editar Reunião" : "Nova Reunião"}</h5>
              <button className="btn-close" onClick={() => setOpen(false)} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Título</label>
                  <input
                    className="form-control"
                    value={form.titulo || ""}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.descricao || ""}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.data || ""}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Hora</label>
                  <input
                    type="time"
                    className="form-control"
                    value={form.hora || ""}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Local</label>
                  <input
                    className="form-control"
                    value={form.local || ""}
                    onChange={(e) => setForm({ ...form, local: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label m-0">Participantes</label>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        setForm({
                          ...form,
                          participantes: [...(form.participantes || []), {}],
                        })
                      }
                    >
                      Adicionar
                    </button>
                  </div>
                  <div className="mt-2">
                    {(form.participantes || []).map((p, i) => (
                      <div className="row g-2 align-items-center mb-2" key={i}>
                        <div className="col-md-4">
                          <input
                            className="form-control"
                            placeholder="Nome"
                            value={p.nome || ""}
                            onChange={(e) => {
                              const arr = [...(form.participantes || [])];
                              arr[i] = { ...arr[i], nome: e.target.value };
                              setForm({ ...form, participantes: arr });
                            }}
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            className="form-control"
                            placeholder="Email"
                            value={p.email || ""}
                            onChange={(e) => {
                              const arr = [...(form.participantes || [])];
                              arr[i] = { ...arr[i], email: e.target.value };
                              setForm({ ...form, participantes: arr });
                            }}
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            className="form-control"
                            placeholder="Setor"
                            value={p.papel || ""}
                            onChange={(e) => {
                              const arr = [...(form.participantes || [])];
                              arr[i] = { ...arr[i], papel: e.target.value };
                              setForm({ ...form, participantes: arr });
                            }}
                          />
                        </div>
                        <div className="col-md-1 text-end">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              const arr = [...(form.participantes || [])];
                              arr.splice(i, 1);
                              setForm({ ...form, participantes: arr });
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => setOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar}>Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalEl, document.body);
}
