import CardsReunioes from "../components/reunioes/CardsReunioes";
import ModalReuniao from "../components/reunioes/ModalReuniao";

export default function ReunioesPage() {
  return (
    <div className="container py-4">
      {/* Mostra os cards + lista */}
      <CardsReunioes onNova={() => window.dispatchEvent(new CustomEvent("reuniao:nova"))} />

      {/* Modal (fica invisível até abrir) */}
      <ModalReuniao />
    </div>
  );
}