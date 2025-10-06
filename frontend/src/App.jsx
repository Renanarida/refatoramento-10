// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtegerRoute from "./components/reunioes/ProtegerRoute.jsx";

import Home from "./pages/Home";
import Cadastrar from "./pages/Cadastrar";
import Login from "./pages/Login";
import ResetSenha from "./pages/ResetSenha.jsx";
import NovaSenha from "./pages/NovaSenha.jsx";
import ReunioesPage from "./pages/ReunioesPage";
import Logout from "./pages/Logout";
import Dashboard from "./pages/Dashboard";

// novas páginas
import DashboardVisitante from "./pages/DashboardVisitante";
import DashboardParticipante from "./pages/DashboardParticipante";
import ParticipanteCpf from "./pages/ParticipanteCpf";

// layout com header + sidebar
import MainLayout from "./layouts/MainLayout.jsx";

function App() {
  return (
    <Routes>
      {/* ✅ PÚBLICAS (SEM header/sidebar) */}
      <Route path="/" element={<Home />} />
      <Route path="/cadastrar" element={<Cadastrar />} />
      <Route path="/login" element={<Login />} />
      <Route path="/participante" element={<ParticipanteCpf />} /> {/* página do CPF */}

      <Route path="/reset-senha" element={<ResetSenha />} />
      <Route path="/nova-senha" element={<NovaSenha />} />
      

      {/* A partir daqui, tudo passa pelo MainLayout (Header + Sidebar) */}
      <Route element={<MainLayout />}>
        {/* visitante */}
        <Route element={<ProtegerRoute allow={["visitor"]} redirectTo="/" />}>
          <Route path="/dashboard-visitante" element={<DashboardVisitante />} />
        </Route>

        {/* participante (protegidinha por mode=participant) */}
        <Route element={<ProtegerRoute allow={["participant"]} redirectTo="/participante" />}>
          <Route path="/dashboard-participante" element={<DashboardParticipante />} />
        </Route>

        {/* privadas (user/admin) */}
        <Route element={<ProtegerRoute allow={["user", "admin"]} redirectTo="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reunioes" element={<ReunioesPage />} />
          <Route path="/logout" element={<Logout />} />
        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
