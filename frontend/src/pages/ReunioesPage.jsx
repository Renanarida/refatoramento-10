import { useState } from "react";
import CardsReunioes from "../components/reunioes/CardsReunioes";
import ReunioesTable from "../components/reunioes/ReunioesTable";
import ModalReuniao from "../components/reunioes/ModalReuniao";

export default function ReunioesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null); // null = novo, objeto = edição

  const handleNova = () => { setEditando(null); setShowModal(true); };
  const handleEditar = (registro) => { setEditando(registro); setShowModal(true); };

  return (
    <div className="container py-4">
      <CardsReunioes />
      <ReunioesTable onNova={handleNova} onEditar={handleEditar} />
      {showModal && (
        <ModalReuniao
          registro={editando}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            window.dispatchEvent(new CustomEvent("reuniao:salva"));
          }}
        />
      )}
    </div>
  );
}
