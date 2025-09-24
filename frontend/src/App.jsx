// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtegerRoute from "./components/reunioes/ProtegerRoute.jsx";
import Home from "./pages/Home";
import Cadastrar from "./pages/Cadastrar";
import Login from "./pages/Login";
import ReunioesPage from "./pages/ReunioesPage";
import Logout from "./pages/Logout";

function App() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/cadastrar" element={<Cadastrar />} />
      <Route path="/login" element={<Login />} />

      {/* privadas */}
      <Route element={<ProtegerRoute />}>
        <Route path="/reunioes" element={<ReunioesPage />} />
        <Route path="/logout" element={<Logout />} />
        {/* coloque outras rotas privadas aqui, se quiser */}
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
