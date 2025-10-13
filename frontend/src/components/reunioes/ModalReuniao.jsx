import { useEffect, useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../services/useAuth";
import ParticipantesCards from "./ParticipantesCards";
import "../../style/participantes-cards.css";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, Button, Alert, CircularProgress
} from "@mui/material";

const EV_SALVA = "reuniao:salva";
const onlyDigits = (v) => (v || "").replace(/\D/g, "");

export default function ModalReuniao({ registro, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  const isEditing = !!registro?.id;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: "", descricao: "", data: "", hora: "", local: "", participantes: [],
  });
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    if (!registro) {
      setForm({ titulo: "", descricao: "", data: "", hora: "", local: "", participantes: [] });
      setErrors(null);
      return;
    }
    setForm({
      titulo: registro.titulo ?? "",
      descricao: registro.descricao ?? "",
      data: registro.data ?? "",
      hora: registro.hora ?? "",
      local: registro.local ?? "",
      participantes: Array.isArray(registro.participantes) ? registro.participantes : [],
    });
    setErrors(null);
  }, [registro]);

  const fieldError = (name) => {
    const arr = errors?.[name];
    return Array.isArray(arr) && arr.length ? arr[0] : null;
  };

  const save = async () => {
    try {
      setSaving(true);
      setErrors(null);
      if (!form.titulo || String(form.titulo).trim().length < 3) {
        setErrors({ titulo: ["Informe um título (mín. 3 caracteres)."] });
        setSaving(false); return;
      }
      if (!form.data) { setErrors({ data: ["A data é obrigatória."] }); setSaving(false); return; }
      if (!form.hora) {
        setErrors((p) => ({ ...(p || {}), hora: ["A hora é obrigatória."] }));
        setSaving(false); return;
      }

      const payload = {
        titulo: form.titulo,
        descricao: form.descricao || null,
        data: form.data,
        hora: form.hora,
        local: form.local || null,
        participantes: (form.participantes || []).map((p) => ({
          ...p, cpf: onlyDigits(p.cpf), telefone: onlyDigits(p.telefone),
        })),
      };

      if (isEditing) await API.put(`/reunioes/${registro.id}`, payload);
      else await API.post(`/reunioes`, payload);

      window.dispatchEvent(new Event(EV_SALVA));
      onSaved && onSaved();
      onClose && onClose();
    } catch (e) {
      const v = e?.response?.status === 422 ? e?.response?.data?.errors : null;
      if (v) setErrors(v);
      else alert("Erro ao salvar: " + (e?.response?.data?.message || e?.message || "desconhecido"));
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? "Editar reunião" : "Nova reunião"}</DialogTitle>
      <DialogContent dividers>
        {errors?.__all__ && <Alert severity="error" sx={{ mb: 2 }}>{String(errors.__all__)}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              label="Título" fullWidth value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              error={!!fieldError("titulo")} helperText={fieldError("titulo") || " "}
              disabled={!isAdmin}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Local" fullWidth value={form.local}
              onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
              disabled={!isAdmin}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Data" type="date" fullWidth value={form.data}
              onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
              error={!!fieldError("data")} helperText={fieldError("data") || " "}
              disabled={!isAdmin} InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Hora" type="time" fullWidth value={form.hora}
              onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
              error={!!fieldError("hora")} helperText={fieldError("hora") || " "}
              disabled={!isAdmin} InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descrição" fullWidth multiline minRows={3} value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              disabled={!isAdmin}
            />
          </Grid>
          <Grid item xs={12}>
            <ParticipantesCards
              value={form.participantes}
              onChange={(arr) => setForm((f) => ({ ...f, participantes: arr }))}
              canEdit={isAdmin}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving} variant="text">Cancelar</Button>
        <Button onClick={save} disabled={saving || !isAdmin} variant="contained">
          {saving ? <CircularProgress size={20} /> : (isEditing ? "Salvar" : "Cadastrar")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
