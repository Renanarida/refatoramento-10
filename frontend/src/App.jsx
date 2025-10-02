// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtegerRoute from "./components/reunioes/ProtegerRoute.jsx";

import Home from "./pages/Home";
import Cadastrar from "./pages/Cadastrar";
import Login from "./pages/Login";
import ReunioesPage from "./pages/ReunioesPage";
import Logout from "./pages/Logout";
import Dashboard from "./pages/Dashboard"; // ✅ gráfico

// novas páginas
import DashboardVisitante from "./pages/DashboardVisitante";
import DashboardParticipante from "./pages/DashboardParticipante";

// layout com header + sidebar
import MainLayout from "./layouts/MainLayout.jsx";

function App() {
  return (
    <Routes>
      {/* públicas SEM header/sidebar */}
      <Route path="/" element={<Home />} />
      <Route path="/cadastrar" element={<Cadastrar />} />
      <Route path="/login" element={<Login />} />

      {/* A partir daqui, tudo passa pelo MainLayout (Header + Sidebar) */}
      <Route element={<MainLayout />}>
        {/* visitante */}
        <Route element={<ProtegerRoute allow={["visitor"]} redirectTo="/" />}>
          <Route path="/dashboard-visitante" element={<DashboardVisitante />} />
        </Route>

        {/* participante */}
        <Route
          element={
            <ProtegerRoute allow={["participant"]} redirectTo="/entrar-participante" />
          }
        >
          <Route path="/participante" element={<DashboardParticipante />} />
          <Route path="/dashboard-participante" element={<DashboardParticipante />} />
        </Route>

        {/* privadas (user/admin) */}
        <Route element={<ProtegerRoute allow={["user", "admin"]} />}>
          <Route path="/dashboard" element={<Dashboard />} /> {/* ✅ NOVA ROTA */}
          <Route path="/reunioes" element={<ReunioesPage />} />
          <Route path="/logout" element={<Logout />} />
        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
