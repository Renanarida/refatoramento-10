import "bootstrap/dist/css/bootstrap.min.css"; // pode coexistir com Chakra
import React from "react";
import { createRoot } from "react-dom/client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "./theme.js";

import { BrowserRouter } from "react-router-dom";
import App from "./App";

import { AuthProvider } from "./services/useAuth";
import { setAuthHeaderFromStorage } from "./services/api";
import "./index.css";

// 🔔 Toaster do Chakra v3 (seu wrapper)
import { ToasterProvider } from "./components/ui/toaster.jsx";

setAuthHeaderFromStorage(); // garante header no primeiro paint

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Chakra v3 usa o "System" theme via prop value */}
    <ChakraProvider value={system}>
      {/* ColorModeScript não é necessário no v3 */}
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>

      {/* Provider visual dos toasts (renderiza os toasts globalmente) */}
      <ToasterProvider />
    </ChakraProvider>
  </React.StrictMode>
);
