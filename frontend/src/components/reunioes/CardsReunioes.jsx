// src/components/reunioes/CardsReunioes.jsx
import { useEffect, useState } from "react";
import API from "../../services/api";
import { Grid, Card, CardContent, Typography, Alert, Skeleton } from "@mui/material";

export default function CardsReunioes() {
  const [stats, setStats] = useState({ total: 0, hoje: 0, amanha: 0, prox_48h: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await API.get("/reunioes/stats");
        if (!alive) return;
        setStats({
          total: data?.total ?? 0,
          hoje: data?.hoje ?? 0,
          amanha: data?.amanha ?? 0,
          prox_48h: data?.prox_48h ?? 0,
        });
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || "Não foi possível carregar os cards.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const Cell = ({ label, value }) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card elevation={1}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          {loading ? (
            <Skeleton variant="text" sx={{ fontSize: "2rem", width: 80 }} />
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
      <Grid container spacing={3}>
        <Cell label="Total" value={stats.total} />
        <Cell label="Hoje" value={stats.hoje} />
        <Cell label="Amanhã" value={stats.amanha} />
        <Cell label="Próx. 48h" value={stats.prox_48h} />
      </Grid>
    </>
  );
}