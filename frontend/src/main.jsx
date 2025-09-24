import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* O BrowserRouter precisa envolver o App para as rotas funcionarem */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
