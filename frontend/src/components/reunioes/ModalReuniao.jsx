import { useEffect, useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../services/useAuth";
import ParticipantesCards from "./ParticipantesCards";
import {
  DialogRoot, DialogBackdrop, DialogContent,
  DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogCloseTrigger,
  Input, Textarea, Button,
  VStack, HStack, Box
} from "@chakra-ui/react";

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

function Label({ children, htmlFor }) {
  return (
    <Box as="label" htmlFor={htmlFor} fontWeight="semibold" mb={2} display="block">
      {children}
    </Box>
  );
}

export default function ModalReuniao({ registro, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  const isEditing = !!registro?.id;

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

  function normalizarHora(hora) {
    if (!hora) return "";
    return hora.slice(0, 5);
  }

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
          cpf: maskCpf(p?.cpf ?? ""),
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
    if (!isAdmin) return;
    try {
      setSaving(true);
      setErrors(null);

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

      const payload = {
        titulo: form.titulo,
        descricao: form.descricao || null,
        data: form.data,
        hora: form.hora ? normalizarHora(form.hora) : null,
        local: form.local || null,
      };

      if (Array.isArray(form.participantes) && form.participantes.length > 0) {
        payload.participantes = form.participantes.map((p) => ({
          nome: p?.nome ?? "",
          email: p?.email ?? "",
          papel: p?.papel ?? "",
          cpf: p?.cpf ? onlyDigits(p.cpf) : null,
        }));
      }

      if (isEditing) {
        await API.put(`/reunioes/${registro.id}`, payload);
      } else {
        await API.post(`/reunioes`, payload);
      }

      window.dispatchEvent(new Event(EV_SALVA));
      onSaved?.();
      onClose?.();
    } catch (e) {
      const v = e?.response?.status === 422 ? e?.response?.data?.errors : null;
      if (v) setErrors(v);
      else alert("Erro ao salvar: " + (e?.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const excluir = async () => {
    if (!isAdmin || !isEditing) return;
    if (!confirm("Tem certeza que deseja excluir esta reunião?")) return;
    try {
      setSaving(true);
      setErrors(null);
      await API.delete(`/reunioes/${registro.id}`);
      window.dispatchEvent(new Event(EV_SALVA));
      onSaved?.();
      onClose?.();
    } catch (e) {
      alert("Erro ao excluir: " + (e?.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogRoot
      open={true}
      onOpenChange={(e) => {
        if (!e.open) onClose?.();
      }}
    >
      <DialogBackdrop />
      <DialogContent size="xl">
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Reunião" : "Nova Reunião"}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          {errors && (
            <Box borderWidth="1px" borderRadius="md" p={3} bg="red.50" mb={4}>
              <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                {Object.entries(errors).map(([field, msgs]) =>
                  (msgs || []).map((m, i) => <li key={field + i}>{m}</li>)
                )}
              </ul>
            </Box>
          )}

          <VStack align="stretch" spacing={4}>
            <Box opacity={isAdmin ? 1 : 0.7} pointerEvents={isAdmin ? "auto" : "none"}>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </Box>

            <Box opacity={isAdmin ? 1 : 0.7} pointerEvents={isAdmin ? "auto" : "none"}>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                rows={3}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </Box>

            <HStack align="start" spacing={4}>
              <Box flex="1" opacity={isAdmin ? 1 : 0.7} pointerEvents={isAdmin ? "auto" : "none"}>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </Box>

              <Box flex="1" opacity={isAdmin ? 1 : 0.7} pointerEvents={isAdmin ? "auto" : "none"}>
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  step="60"
                  value={form.hora}
                  onChange={(e) =>
                    setForm({ ...form, hora: normalizarHora(e.target.value) })
                  }
                />
              </Box>
            </HStack>

            <Box opacity={isAdmin ? 1 : 0.7} pointerEvents={isAdmin ? "auto" : "none"}>
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                value={form.local}
                onChange={(e) => setForm({ ...form, local: e.target.value })}
              />
            </Box>

            <Box>
              <ParticipantesCards
                value={form.participantes}
                onChange={(arr) => setForm((f) => ({ ...f, participantes: arr }))}
                canEdit={isAdmin}
              />
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter justifyContent="space-between">
          {!isAdmin && (
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          )}

          {isAdmin && !isEditing && (
            <HStack>
              <Button onClick={salvar} isLoading={saving}>
                Adicionar
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </HStack>
          )}

          {isAdmin && isEditing && (
            <HStack spacing={3}>
              <Button onClick={salvar} isLoading={saving}>
                Salvar
              </Button>
              <Button colorPalette="red" onClick={excluir} isLoading={saving}>
                Excluir
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </HStack>
          )}
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
