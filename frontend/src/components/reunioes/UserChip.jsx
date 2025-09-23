// UserChip.jsx (ou direto no seu componente da topbar)
import { useEffect, useRef, useState } from "react";

export default function UserChip() {
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  // carrega o usuário logado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8000/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setMe)
      .catch(console.error);
  }, []);

  const firstLetter = (me?.name || me?.email || "U").trim().charAt(0).toUpperCase();

  const openPicker = () => fileRef.current?.click();

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBusy(true);
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("avatar", file);

      const resp = await fetch("http://localhost:8000/api/me/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // FormData não usa Content-Type manual
        body: form,
      });

      if (!resp.ok) throw new Error("Falha no upload");
      const data = await resp.json();
      setMe((old) => ({ ...old, avatar_url: data.avatar_url }));
    } catch (err) {
      console.error(err);
      alert("Não foi possível enviar a imagem.");
    } finally {
      setBusy(false);
      e.target.value = ""; // reseta o input
    }
  };

  return (
    <div
      onClick={openPicker}
      title={busy ? "Enviando..." : "Clique para trocar a foto"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#0f172a",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #1e293b",
        cursor: busy ? "not-allowed" : "pointer",
        opacity: busy ? 0.7 : 1,
      }}
    >
      {/* Avatar / Inicial */}
      {me?.avatar_url ? (
        <img
          src={me.avatar_url}
          alt="avatar"
          style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#3b82f6",
            color: "white",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
          }}
        >
          {firstLetter}
        </div>
      )}

      {/* Nome */}
      <span style={{ color: "white", fontSize: 14 }}>
        {me?.name || "Usuário"}
      </span>

      {/* Input escondido */}
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onPick}
        style={{ display: "none" }}
        disabled={busy}
      />
    </div>
  );
}
