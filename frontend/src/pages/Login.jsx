// src/pages/Login.jsx
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import API, { setAuthHeaderFromStorage } from "../services/api";
import { useAuth } from "../services/useAuth";
import logo from "../assets/Reuniao-email.png";

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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // senha
  const [showPass, setShowPass] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { asUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    try {
      const res = await API.post("/login", { email, password });

      const token = (
        res?.data?.token ||
        res?.data?.plainTextToken ||
        res?.data?.access_token ||
        ""
      )
        .toString()
        .trim();

      if (token) {
        localStorage.setItem("token", token);
        setAuthHeaderFromStorage?.();
      } else {
        localStorage.removeItem("token");
      }

      let user = res?.data?.user;
      if (!user?.role) {
        const me = await API.get("/me");
        user = me?.data || user;
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (user.name) localStorage.setItem("user_name", user.name);
        asUser(user);
      }

      setSucesso("Login realizado com sucesso!");
      navigate("/reunioes", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Email ou senha incorretos.";
      setErro(msg);
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
              alt="Login"
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
              Login
            </Typography>

            {erro && <Alert severity="error">{erro}</Alert>}
            {sucesso && <Alert severity="success">{sucesso}</Alert>}

            <TextField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              fullWidth
              disabled={loading}
            />

            <TextField
              id="password"
              label="Senha"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              fullWidth
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="mostrar/ocultar senha"
                      onClick={() => setShowPass((v) => !v)}
                      edge="end"
                    >
                      {showPass ? <VisibilityOff /> : <Visibility />}
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
                "Entrar"
              )}
            </Button>

            <Typography variant="body2" align="center">
              Esqueceu a senha?{" "}
              <Link component={RouterLink} to="/reset-senha" underline="hover">
                Clique aqui
              </Link>
            </Typography>

            <Typography variant="body2" align="center" color="text.secondary">
              Ainda não tem conta?{" "}
              <Link component={RouterLink} to="/cadastrar" underline="hover">
                Cadastre-se aqui
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
