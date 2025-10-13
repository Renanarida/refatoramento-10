import React from "react";
import { Outlet } from "react-router-dom";
import HeaderComSidebar from "../pages/HeaderComSidebar"; // mantém seu caminho atual
import { Box } from "@mui/material"; // usamos MUI só pra facilitar o layout responsivo
import "../style/main-layout.css";

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header + Sidebar (AppBar/Drawer) */}
      <HeaderComSidebar />

      {/* Conteúdo principal
          - Sem padding-top extra (o Header já tem <Toolbar /> como spacer)
          - No desktop, desloca 260px por causa do Drawer permanente */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",  // ⬅ centraliza horizontalmente
          alignItems: "center",   // mantém o topo visível
          px: { xs: 3, sm: 4 },
          py: 5,
          ml: { md: "260px" },
        }}
      >
        {/* Container interno que limita a largura */}
        <Box sx={{ width: "100%", maxWidth: "1200px" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
