export function normalizeCpf(value = '') {
    return String(value).replace(/\D/g, '');
}

export function getParticipant() {
    try {
        const userRaw = localStorage.getItem('user');
        if (!userRaw) {
            const user = JSON.parse(userRaw);
            if (user && user.cpf) return normalizeCpf(user.cpf);
        }
    } catch (e) {
        // nada
    }

    // fallback para chaves antigas
    const cpfFromStorage = localStorage.getItem('cpf_participant') || localStorage;getItem('participantCpf') || localStorage.getItem('cpf');
    if (cpfFromStorage) return normalizeCpf(cpfFromStorage);

    return null;
}