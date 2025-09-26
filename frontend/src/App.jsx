// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtegerRoute from "./components/reunioes/ProtegerRoute.jsx";
import Home from "./pages/Home";
import Cadastrar from "./pages/Cadastrar";
import Login from "./pages/Login";
import ReunioesPage from "./pages/ReunioesPage";
import Logout from "./pages/Logout";

// ✅ novas páginas
import DashboardVisitante from "./pages/DashboardVisitante";
import DashboardParticipante from "./pages/DashboardParticipante";

function App() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/cadastrar" element={<Cadastrar />} />
      <Route path="/login" element={<Login />} />

      {/* visitante */}
      <Route element={<ProtegerRoute allow={["visitor"]} redirectTo="/" />}>
        <Route path="/dashboard-visitante" element={<DashboardVisitante />} />
      </Route>

      {/* participante */}
      <Route element={<ProtegerRoute allow={["participant"]} redirectTo="/entrar-participante" />}>
        <Route path="/dashboard-participante" element={<DashboardParticipante />} />
      </Route>

      {/* privadas (user/admin) */}
      <Route element={<ProtegerRoute allow={["user","admin"]} />}>
        <Route path="/reunioes" element={<ReunioesPage />} />
        <Route path="/logout" element={<Logout />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
