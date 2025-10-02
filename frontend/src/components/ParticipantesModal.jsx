import React, { useEffect, useState } from "react";
import API from "../services/api"; // seu axios configurado
import { normalizeCpf } from "../utils/participant";

export default function ParticipantesModal({ reuniaoId, onClose, initialList = null }) {
  const [loading, setLoading] = useState(false);
  const [participantes, setParticipantes] = useState(initialList || []);
  const [error, setError] = useState(null);

  useEffect(() => {
    // se já passou initialList, não busca
    if (initialList && initialList.length) return;

    async function fetchPart() {
      setLoading(true);
      setError(null);
      try {
        // pega cpf do storage (mesma chave usada no front)
        const cpfRaw = localStorage.getItem('participant_cpf') || localStorage.getItem('participantCpf') || localStorage.getItem('cpf');
        const cpf = cpfRaw ? normalizeCpf(cpfRaw) : null;

        // se tiver cpf faz chamada ao backend para garantir
        const res = await API.get(`/reunioes/${reuniaoId}/participantes-by-cpf`, {
          params: { cpf }
        });

        setParticipantes(res.data.participantes || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Erro ao buscar participantes");
      } finally {
        setLoading(false);
      }
    }

    fetchPart();
  }, [reuniaoId, initialList]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>Fechar</button>

        <h3>Participantes</h3>

        {loading && <p>Carregando...</p>}
        {error && <p className="error">{error}</p>}

        <div className="participants-grid">
          {participantes && participantes.length ? (
            participantes.map((p) => (
              <div key={p.id ?? p.cpf} className="participant-card">
                <div className="participant-name">{p.nome}</div>
                <div className="participant-email">{p.email}</div>
                <div className="participant-papel">{p.papel}</div>
                <div className="participant-cpf">{p.cpf}</div>
              </div>
            ))
          ) : (
            !loading && <p>Nenhum participante encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
