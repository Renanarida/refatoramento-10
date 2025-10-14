import * as React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";

const drawerWidth = 280; // ajuste se sua sidebar tiver outra largura

export default function Layout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* sua Sidebar/Drawer aqui */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",        // Garante ocupar toda a largura disponível
          maxWidth: "unset",    // Remove limites herdados
          ml: { md: `${drawerWidth}px` }, // se a sidebar for fixa à esquerda
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        {/* Caso você use Container aqui, mantenha o maxWidth="lg" só no miolo */}
        <Container maxWidth={false} disableGutters>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}