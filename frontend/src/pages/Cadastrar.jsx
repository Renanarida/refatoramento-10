// src/pages/Cadastrar.jsx
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/Reuniao-email.png";

// Material UI
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Cadastrar() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarSenha2, setMostrarSenha2] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (senha !== senhaConfirm) {
      setErro("As senhas não coincidem!");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("http://localhost:8000/api/usuarios", {
        nome,
        email,
        senha,
      });

      if (data) {
        setSucesso("Usuário cadastrado com sucesso!");
        setNome("");
        setEmail("");
        setSenha("");
        setSenhaConfirm("");

        setTimeout(() => navigate("/login", { replace: true }), 1200);
      }
    } catch (error) {
      setErro(error?.response?.data?.message || "Erro ao cadastrar usuário.");
    } finally {
      setLoading(false);
    }
  };

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
          "linear-gradient(180deg, rgba(11,26,165,0.18) 0%, rgba(11,26,165,0.06) 100%)",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            width: { xs: "92vw", sm: 440 },
            mx: "auto",
          }}
        >
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            <Box
              component="img"
              src={logo}
              alt="Cadastro"
              sx={{
                width: "100%",
                borderRadius: 2,
                boxShadow: 2,
                mb: 1,
                objectFit: "cover",
              }}
            />

            <Typography
              variant="h5"
              align="center"
              sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
            >
              Cadastro
            </Typography>

            {erro && <Alert severity="error">{erro}</Alert>}
            {sucesso && <Alert severity="success">{sucesso}</Alert>}

            <TextField
              id="nome"
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoComplete="name"
              fullWidth
            />

            <TextField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              fullWidth
            />

            <TextField
              id="senha"
              label="Senha"
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="new-password"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setMostrarSenha((v) => !v)}
                      edge="end"
                      aria-label="mostrar senha"
                    >
                      {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              id="senha2"
              label="Confirmar senha"
              type={mostrarSenha2 ? "text" : "password"}
              value={senhaConfirm}
              onChange={(e) => setSenhaConfirm(e.target.value)}
              required
              autoComplete="new-password"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setMostrarSenha2((v) => !v)}
                      edge="end"
                      aria-label="mostrar confirmação de senha"
                    >
                      {mostrarSenha2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? (
                <CircularProgress size={22} sx={{ color: "common.white" }} />
              ) : (
                "Cadastrar"
              )}
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
              Já tem conta?{" "}
              <Link component={RouterLink} to="/login" underline="hover">
                Faça login
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
