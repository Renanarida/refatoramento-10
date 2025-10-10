import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@chakra-ui/react";
import HeaderComSidebar from "../pages/HeaderComSidebar";

export default function MainLayout() {
  return (
    <Box minH="100vh" bg="white">
      <HeaderComSidebar />
      <Box as="main" py={6}>
        <Container maxW="6xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}