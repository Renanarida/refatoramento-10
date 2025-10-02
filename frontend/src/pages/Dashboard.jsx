import DashboardGraficos from "../components/reunioes/DashboardGraficos";

export default function Dashboard() {
    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <DashboardGraficos />
        </div>
    )
}