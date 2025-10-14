// src/pages/ParticipanteCpf.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { setCpfHeader } from "../services/api";
import { maskCpf } from "../utils/masks";

import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";

const normalizeCpf = (v = "") => String(v).replace(/\D+/g, "").slice(0, 11);

export default function ParticipanteCpf() {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    const puro = normalizeCpf(cpf);
    if (puro.length !== 11) {
      setMsg("Informe um CPF com 11 dígitos.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/participante/check-cpf", { cpf: puro });
      if (data?.ok && data?.exists) {
        setCpfHeader(puro);
        navigate("/dashboard-participante");
      } else {
        setMsg("CPF não encontrado em nenhuma reunião.");
      }
    } catch (err) {
      if (err?.response?.status === 422) {
        setMsg("CPF inválido. Verifique os dígitos.");
      } else {
        setMsg("Erro ao verificar CPF. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        background:
          "linear-gradient(180deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            width: { xs: "92vw", sm: 420 },
            mx: "auto",
            p: 4,
            borderRadius: 3,
          }}
        >
          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <Typography
              variant="h5"
              align="center"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              Acesso do Participante
            </Typography>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
              Informe seu CPF para verificar o acesso.
            </Typography>

            <TextField
              fullWidth
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(maskCpf(e.target.value))}
              inputProps={{ inputMode: "numeric" }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} sx={{ color: "common.white" }} /> : "Continuar"}
            </Button>

            {msg && (
              <Alert severity="warning" sx={{ mt: 1, mb: 0 }}>
                {msg}
              </Alert>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
