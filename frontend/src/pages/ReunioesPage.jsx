// src/pages/ReunioesPage.jsx
import { useState } from "react";
import HeaderComSidebar from "./HeaderComSidebar.jsx";
import CardsReunioes from "../components/reunioes/CardsReunioes";
import ReunioesTable from "../components/reunioes/ReunioesTable";
import ModalReuniao from "../components/reunioes/ModalReuniao";

export default function ReunioesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0); // 👈

  const handleNova = () => { setEditando(null); setShowModal(true); };
  const handleEditar = (registro) => { setEditando(registro); setShowModal(true); };

  return (
    <>
      <HeaderComSidebar />

      <div className="container p-4 py-5 mr-5 bg-eu-mando rounded-3 shadow-lg">
        {/* Se quiser, os cards também atualizam */}
        <CardsReunioes refreshTick={refreshTick} /> 

        <ReunioesTable
          onNova={handleNova}
          onEditar={handleEditar}
          refreshTick={refreshTick}  // 👈 passa o tick pra tabela
        />

        {showModal && (
          <ModalReuniao
            registro={editando}
            onClose={() => setShowModal(false)}
            onSaved={(novoRegistro) => {
              setShowModal(false);
              setRefreshTick(t => t + 1); // 👈 dispara refresh
            }}
          />
        )}
      </div>
    </>
  );
}
