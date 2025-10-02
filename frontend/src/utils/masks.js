export function maskCpf(value) {
  if (!value) return "";
  const v = String(value).replace(/\D/g, "").slice(0, 11);
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// Aplica máscara de telefone (fixo ou celular com DDD)
export function maskTelefone(value) {
  if (!value) return "";
  const v = String(value).replace(/\D/g, "").slice(0, 11);
  if (v.length === 10) {
    // Ex: 1123456789 -> (11) 2345-6789
    return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  if (v.length === 11) {
    // Ex: 11923456789 -> (11) 92345-6789
    return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return value;
}