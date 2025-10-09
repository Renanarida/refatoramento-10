import { useState } from "react";
import { VStack, Box } from "@chakra-ui/react";
import CardsReunioes from "../components/reunioes/CardsReunioes";
import ReunioesTable from "../components/reunioes/ReunioesTable";
import ModalReuniao from "../components/reunioes/ModalReuniao"; // precisa estar migrado p/ Dialog v3 também

export default function ReunioesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const handleNova = () => { setEditando(null); setShowModal(true); };
  const handleEditar = (registro) => { setEditando(registro); setShowModal(true); };

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <CardsReunioes refreshTick={refreshTick} />
      </Box>

      <Box>
        <ReunioesTable
          onNova={handleNova}
          onEditar={handleEditar}
          refreshTick={refreshTick}
        />
      </Box>

      {showModal && (
        <ModalReuniao
          registro={editando}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            setRefreshTick((t) => t + 1);
          }}
        />
      )}
    </VStack>
  );
}
