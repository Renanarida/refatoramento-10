import "bootstrap/dist/css/bootstrap.min.css";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./services/useAuth"; // ✅ importa o provider
import { setAuthHeaderFromStorage } from "./services/api";
import "./index.css";

setAuthHeaderFromStorage(); // <<< garante header no primeiro paint

const theme = createTheme();
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);