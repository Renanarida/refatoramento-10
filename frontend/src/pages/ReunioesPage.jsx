// src/pages/ReunioesPage.jsx
import { useState } from "react";
import HeaderComSidebar from "./HeaderComSidebar.jsx";
import CardsReunioes from "../components/reunioes/CardsReunioes";
import ReunioesTable from "../components/reunioes/ReunioesTable";
import ModalReuniao from "../components/reunioes/ModalReuniao";

export default function ReunioesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const handleNova = () => { setEditando(null); setShowModal(true); };
  const handleEditar = (registro) => { setEditando(registro); setShowModal(true); };

  return (
    <>
      <HeaderComSidebar /* userName="Renan Arida" */ />

      <div className="container py-4">
        <CardsReunioes />
        <ReunioesTable onNova={handleNova} onEditar={handleEditar} />
        {showModal && (
          <ModalReuniao
            registro={editando}
            onClose={() => setShowModal(false)}
            onSaved={() => setShowModal(false)}
          />
        )}
      </div>
    </>
  );
}
