// src/pages/Home.jsx
import * as React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Stack,
  Avatar,
  Link,
} from "@mui/material";
import { useAuth } from "../services/useAuth";

// Imagens
import partnersIcon from "../assets/partners.png";
import videoConferenceIcon from "../assets/video-conference.png";
import sendIcon from "../assets/send.png";

export default function Home() {
  const navigate = useNavigate();
  const { asVisitor } = useAuth();

  const handleVisitante = () => {
    asVisitor();
    navigate("/dashboard-visitante");
  };

  const handleParticipante = () => {
    navigate("/participante");
  };

  return (
    <Box sx={{ width: "100vw", overflowX: "hidden" }}>
      {/* HERO ocupando 100% da tela */}
      <Box
        sx={{
          width: "100vw",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          background:
            "linear-gradient(180deg, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.05) 100%)",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="column"
            spacing={3}
            sx={{ alignItems: "center" }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 700, letterSpacing: 0.3 }}
            >
              Bem-vindo ao site de Reuniões
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 900 }}
            >
              Administre suas reuniões de forma prática e fácil — crie, gerencie
              participantes e compartilhe convites em poucos cliques.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 1, flexWrap: "wrap", justifyContent: "center" }}
            >
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/cadastrar"
              >
                Cadastre-se
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/login"
              >
                Login
              </Button>
              <Button variant="text" size="large" onClick={handleVisitante}>
                Entrar como visitante
              </Button>
              <Button variant="text" size="large" onClick={handleParticipante}>
                Participante
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* CONTEÚDO ABAIXO */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h5"
          align="center"
          sx={{ fontWeight: 700, mb: { xs: 4, md: 6 } }}
        >
          O que você encontra aqui?
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", borderRadius: 3, boxShadow: 2 }}>
              <CardHeader
                avatar={
                  <Avatar
                    src={partnersIcon}
                    alt="Organização"
                    sx={{ width: 48, height: 48 }}
                  />
                }
                title="Organização prática"
                titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
              />
              <CardContent>
                <Typography color="text.secondary">
                  Crie e acompanhe reuniões com filtros por data, status e
                  responsáveis — tudo centralizado.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", borderRadius: 3, boxShadow: 2 }}>
              <CardHeader
                avatar={
                  <Avatar
                    src={videoConferenceIcon}
                    alt="Participantes"
                    sx={{ width: 48, height: 48 }}
                  />
                }
                title="Participantes visíveis"
                titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
              />
              <CardContent>
                <Typography color="text.secondary">
                  Liste participantes com dados empresariais e atalhos úteis
                  (WhatsApp, e-mail, telefone).
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", borderRadius: 3, boxShadow: 2 }}>
              <CardHeader
                avatar={
                  <Avatar
                    src={sendIcon}
                    alt="Envio"
                    sx={{ width: 48, height: 48 }}
                  />
                }
                title="Convites rápidos"
                titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
              />
              <CardContent>
                <Typography color="text.secondary">
                  Compartilhe reuniões via WhatsApp em segundos, sem sair do
                  fluxo.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: { xs: 6, md: 10 },
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Novo por aqui?
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button variant="contained" component={RouterLink} to="/cadastrar">
              Começar agora
            </Button>
            <Link
              component={RouterLink}
              to="/dashboard-visitante"
              underline="hover"
              sx={{ alignSelf: "center" }}
            >
              Ver demonstração (visitante)
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
