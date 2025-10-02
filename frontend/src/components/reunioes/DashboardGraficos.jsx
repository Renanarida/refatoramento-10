import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  LineChart, Line
} from "recharts";

export default function DashboardGraficos() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [dados, setDados] = useState({
    contagens: { semana: 0, mes: 0, ano: 0 },
    series: { semana_por_dia: [], mes_por_dia: [], ano_por_mes: [] },
    ref: {}
  });

  useEffect(() => {
    setLoading(true);
    API.get("/reunioes/stats-periodos")
      .then((res) => setDados(res.data))
      .catch((e) => setErr(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, []);

  const barras = useMemo(() => ([
    { periodo: "Semana", total: dados?.contagens?.semana ?? 0 },
    { periodo: "Mês",    total: dados?.contagens?.mes ?? 0 },
    { periodo: "Ano",    total: dados?.contagens?.ano ?? 0 },
  ]), [dados]);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ResumoCard titulo="Reuniões na Semana" valor={dados?.contagens?.semana ?? 0} />
        <ResumoCard titulo="Reuniões no Mês" valor={dados?.contagens?.mes ?? 0} />
        <ResumoCard titulo="Reuniões no Ano" valor={dados?.contagens?.ano ?? 0} />
      </div>

      <div className="bg-neutral-900/40 rounded-2xl p-4">
        <h3 className="text-lg font-semibold mb-3">Comparativo por Período</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={barras} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-neutral-900/40 rounded-2xl p-4">
        <h3 className="text-lg font-semibold mb-3">Semana atual (por dia)</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={dados?.series?.semana_por_dia || []} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          Janela: {dados?.ref?.semana?.inicio} a {dados?.ref?.semana?.fim} (TZ {dados?.ref?.tz})
        </p>
      </div>

      <div className="bg-neutral-900/40 rounded-2xl p-4">
        <h3 className="text-lg font-semibold mb-3">Mês atual (por dia)</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={dados?.series?.mes_por_dia || []} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ResumoCard({ titulo, valor }) {
  return (
    <div className="bg-neutral-900/40 rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-neutral-400">{titulo}</p>
        <p className="text-3xl font-bold mt-1">{valor}</p>
      </div>
      <span className="text-2xl">📊</span>
    </div>
  );
}
