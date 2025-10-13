import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, NavLink, Link, useLocation } from "react-router-dom";
import EditUserModal from "../components/reunioes/EditaUSerModal.jsx";

// MUI
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";

const API = "http://localhost:8000/api";
const DRAWER_WIDTH = 260;

export default function HeaderComSidebar({ userName: userNameProp }) {
  const [open, setOpen] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));

  const userNameFromStorage = useMemo(() => {
    return (
      (userNameProp && String(userNameProp).trim()) ||
      localStorage.getItem("user_name") ||
      (JSON.parse(localStorage.getItem("user") || "{}").name) ||
      "Usuário"
    );
  }, [userNameProp]);

  const userName = me?.name || userNameFromStorage;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setMe(data?.user || data || null);
        const nome = data?.user?.name ?? data?.name;
        if (nome) localStorage.setItem("user_name", nome);
      })
      .catch(() => {});
  }, []);

  const toggle = () => setOpen((v) => !v);

  const initials = (userName || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const openPicker = () => {
    if (busy) return;
    fileRef.current?.click();
  };

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Faça login para trocar a foto.");
      e.target.value = "";
      return;
    }
    try {
      setBusy(true);
      const form = new FormData();
      form.append("avatar", file);

      const resp = await fetch(`${API}/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!resp.ok) throw new Error("Falha ao enviar imagem");
      const data = await resp.json();
      setMe((prev) => ({ ...(prev || {}), avatar_url: data.avatar_url }));
    } catch (err) {
      console.error(err);
      alert("Não foi possível enviar a imagem.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const openEditUser = () => {
    console.log("[HeaderComSidebar] Abrindo modal de editar usuário");
    setShowEditUser(true);
    setOpen(false);
  };

  const DrawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Reuniões
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
            Painel de Controle
          </Typography>
        </Box>
        {!mdUp && (
          <IconButton onClick={() => setOpen(false)} aria-label="Fechar menu" sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ opacity: 0.2, borderColor: "rgba(255,255,255,0.2)" }} />

      <Box sx={{ flex: 1, py: 1 }}>
        <List disablePadding>
          <ListItemButton
            component={NavLink}
            to="/reunioes"
            sx={(t) => ({
              mx: 1,
              borderRadius: 2,
              "&.active": {
                background: "rgba(255,255,255,0.15)",
                "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                  color: "#fff",
                  fontWeight: 600,
                },
              },
            })}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
              <EventNoteIcon />
            </ListItemIcon>
            <ListItemText primary="Reuniões" />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to="/dashboard"
            sx={(t) => ({
              mx: 1,
              borderRadius: 2,
              "&.active": {
                background: "rgba(255,255,255,0.15)",
                "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                  color: "#fff",
                  fontWeight: 600,
                },
              },
            })}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton onClick={openEditUser} sx={{ mx: 1, borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary="Editar Usuário" />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to="/configuracoes"
            sx={(t) => ({
              mx: 1,
              borderRadius: 2,
              "&.active": {
                background: "rgba(255,255,255,0.15)",
                "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                  color: "#fff",
                  fontWeight: 600,
                },
              },
            })}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Configurações" />
          </ListItemButton>
        </List>
      </Box>

      <Divider sx={{ opacity: 0.2, borderColor: "rgba(255,255,255,0.2)" }} />
      <Box sx={{ p: 1 }}>
        <List disablePadding>
          <ListItemButton
            component={Link}
            to="/logout"
            sx={{ borderRadius: 2, mx: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* HEADER */}
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: "#0A1A3C",
          color: "#fff",
          borderBottom: "none",
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {!mdUp && (
            <IconButton color="inherit" edge="start" onClick={toggle} aria-label="Abrir navegação">
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Reuniões
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Tooltip title={busy ? "Enviando..." : "Clique para trocar a foto"}>
            <Box
              onClick={openPicker}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.7 : 1,
                pr: 0.5,
              }}
            >
              <Badge overlap="circular" variant="dot" color="success">
                {me?.avatar_url ? (
                  <Avatar src={me.avatar_url} alt="avatar" sx={{ width: 32, height: 32 }} />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "#1E3A8A" }}>{initials || "U"}</Avatar>
                )}
              </Badge>
              <Typography variant="body2" noWrap maxWidth={160} title={userName}>
                {userName}
              </Typography>

              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onPick}
                style={{ display: "none" }}
                disabled={busy}
              />
            </Box>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      {mdUp ? (
        <Drawer
          variant="permanent"
          open
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: "#0A1A3C",
              color: "#fff",
              borderRight: 0,
              "& .MuiListItemIcon-root": { color: "#fff" },
              "& .MuiListItemButton:hover": {
                backgroundColor: "rgba(255,255,255,0.08)",
              },
              "& .MuiListItemButton.Mui-selected": {
                backgroundColor: "rgba(255,255,255,0.15)",
              },
            },
          }}
        >
          {DrawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={open}
          onClose={toggle}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: "#0A1A3C",
              color: "#fff",
              "& .MuiListItemIcon-root": { color: "#fff" },
              "& .MuiListItemButton:hover": {
                backgroundColor: "rgba(255,255,255,0.08)",
              },
              "& .MuiListItemButton.Mui-selected": {
                backgroundColor: "rgba(255,255,255,0.15)",
              },
            },
          }}
        >
          {DrawerContent}
        </Drawer>
      )}

      {/* Spacer do AppBar */}
      <Toolbar sx={{ mb: 0 }} />

      {/* Modal Editar Usuário */}
      <EditUserModal
        open={showEditUser}
        isOpen={showEditUser}
        show={showEditUser}
        onClose={() => setShowEditUser(false)}
        onHide={() => setShowEditUser(false)}
        user={me}
        onSaved={async () => {
          try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const r = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (r.ok) {
              const data = await r.json();
              setMe(data?.user || data || null);
              const nome = data?.user?.name ?? data?.name;
              if (nome) localStorage.setItem("user_name", nome);
            }
          } catch {}
        }}
      />
    </>
  );
}
