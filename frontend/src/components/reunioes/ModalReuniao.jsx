import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

const API = "http://localhost:8000"; // ajuste se necessário

export default function ModalReuniao({ registro, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    data: "",
    hora: "",
    local: "",
    participantes: [],
  });

  // Pré-preenche quando vier um registro para edição
  useEffect(() => {
    if (registro) {
      setForm({
        titulo: registro.titulo ?? "",
        descricao: registro.descricao ?? "",
        data: registro.data ?? "",
        hora: registro.hora ?? "",
        local: registro.local ?? "",
        participantes: registro.participantes ?? [],
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
  }, [registro]);

  const salvar = async () => {
    try {
      setSaving(true);
      const payload = { ...form };

      if (registro?.id) {
        await axios.put(`${API}/api/reunioes/${registro.id}`, payload, {
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
      } else {
        await axios.post(`${API}/api/reunioes`, payload, {
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
      }

      // avisa o pai
      onSaved && onSaved();
    } catch (e) {
      alert("Erro ao salvar: " + (e?.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  // Este modal é controlado pelo pai — se não estiver montado, retorna null.
  // Se você preferir, pode manter como está: a página pai só renderiza <ModalReuniao /> quando precisa abrir.
  return createPortal(
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={onClose} />
      {/* Modal */}
      <div className="modal fade show" style={{ display: "block", zIndex: 1055 }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{registro?.id ? "Editar Reunião" : "Nova Reunião"}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Título</label>
                  <input
                    className="form-control"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.data}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Hora</label>
                  <input
                    type="time"
                    className="form-control"
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Local</label>
                  <input
                    className="form-control"
                    value={form.local}
                    onChange={(e) => setForm({ ...form, local: e.target.value })}
                  />
                </div>

                {/* Participantes */}
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label m-0">Participantes</label>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        setForm((f) => ({ ...f, participantes: [...(f.participantes || []), {}] }))
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
                            placeholder="Papel"
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
              <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
