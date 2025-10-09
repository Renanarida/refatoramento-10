import "bootstrap/dist/css/bootstrap.min.css"; // pode coexistir com Chakra
import React from "react";
import ReactDOM from "react-dom/client";

import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme";

import { BrowserRouter } from "react-router-dom";
import App from "./App";

import { AuthProvider } from "./services/useAuth";
import { setAuthHeaderFromStorage } from "./services/api";
import "./index.css";

setAuthHeaderFromStorage(); // garante header no primeiro paint

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      {/* injeta o script para respeitar o initialColorMode do tema */}
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);