// src/components/reunioes/CardsReunioes.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../services/useAuth";
import { Grid, Card, CardContent, Typography, Alert, Skeleton } from "@mui/material";

export default function CardsReunioes({ refreshTick }) {
  const { isAdmin, isUser, isParticipant } = useAuth();

  const [stats, setStats] = useState({
    total: 0,
    hoje: 0,
    amanha: 0,
    proximas_48h: 0,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const endpoint =
          isAdmin || isUser
            ? "/reunioes/stats"
            : isParticipant
            ? "/participante/reunioes/stats" // se não existir, pode trocar por /public/reunioes/stats
            : "/public/reunioes/stats";

        const { data: res } = await API.get(endpoint);

        // O controller retorna { resumo: { total, hoje, amanha, proximas_48h }, ref: {...} }
        const r = res?.resumo || res || {};
        if (!alive) return;
        setStats({
          total: Number(r.total ?? 0),
          hoje: Number(r.hoje ?? 0),
          amanha: Number(r.amanha ?? 0),
          // aceita tanto proximas_48h quanto prox_48h (se você tiver usado outro nome antes)
          proximas_48h: Number(r.proximas_48h ?? r.prox_48h ?? 0),
        });
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || "Não foi possível carregar os cards.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAdmin, isUser, isParticipant, refreshTick]);

  const Cell = ({ label, value }) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          {loading ? (
            <Skeleton variant="text" sx={{ fontSize: "2rem", width: 60 }} />
          ) : (
            <Typography variant="h4">{value ?? "—"}</Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Cell label="Total" value={stats.total} />
        <Cell label="Hoje" value={stats.hoje} />
        <Cell label="Amanhã" value={stats.amanha} />
        <Cell label="Próx. 48h" value={stats.proximas_48h} />
      </Grid>
    </>
  );
}