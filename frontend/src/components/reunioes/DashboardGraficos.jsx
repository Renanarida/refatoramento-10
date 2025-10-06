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
    <div className="min-h-screen bg-blue-900 text-white p-8">
      {/* <h1 className="text-3xl font-bold mb-8">Dashboard</h1> */}

      {/* Barras */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Comparativo por Período</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={barras} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", color: "#111827" }} />
              <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Semana atual */}
      {/* <div className="bg-white rounded-2xl p-4 shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Semana atual (por dia)</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={dados?.series?.semana_por_dia || []} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", color: "#111827" }} />
              <Line type="monotone" dataKey="total" dot stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Janela: {dados?.ref?.semana?.inicio} a {dados?.ref?.semana?.fim} (TZ {dados?.ref?.tz})
        </p>
      </div> */}

      {/* Mês atual */}
      {/* <div className="bg-white rounded-2xl p-4 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Mês atual (por dia)</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={dados?.series?.mes_por_dia || []} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", color: "#111827" }} />
              <Line type="monotone" dataKey="total" dot stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div> */}

      {err && <p className="mt-4 text-red-200">Erro: {err}</p>}
      {loading && <p className="mt-4 text-gray-200">Carregando…</p>}
    </div>
  );
}
