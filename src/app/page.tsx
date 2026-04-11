import { Users, UserPlus, LogOut, TrendingUp, Activity } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { getDashboardData } from "@/lib/patient-service";
import { DashboardMetric } from "@/lib/types";
import { cn } from "@/lib/utils";
import "./dashboard.css";

async function getMetrics(): Promise<DashboardMetric[]> {
  const data = await getDashboardData();

  return [
    {
      icon: Users,
      label: "Internos Ativos",
      value: data.activePatients.toString(),
      description: "Pacientes internados atualmente",
      tone: "primary",
    },
    {
      icon: UserPlus,
      label: "Entradas no Mês",
      value: data.monthlyAdmissions.toString(),
      description: "Novas admissões neste mês",
      tone: "success",
    },
    {
      icon: LogOut,
      label: "Saídas no Mês",
      value: data.monthlyDischarges.toString(),
      description: "Altas e encerramentos",
      tone: "warning",
    },
    {
      icon: TrendingUp,
      label: "Taxa de Desistência",
      value: `${data.dropoutRate}%`,
      description: "Percentual de evasões",
      tone: "danger",
    },
  ];
}

export default async function DashboardPage() {
  const metrics = await getMetrics();
  const data = await getDashboardData();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Visão Geral</h2>
        <p className="text-muted">Acompanhe as métricas e indicadores da clínica.</p>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="charts-grid">
        <SectionCard
          title="Atividade Recente"
          description="Últimas ocorrências na clínica"
          actions={<button className="btn btn-outline btn-sm">Ver Todos</button>}
        >
          <div className="activity-list">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div
                  className={cn(
                    "activity-icon-sm",
                    activity.type === "admission"
                      ? "success"
                      : activity.type === "evolution"
                        ? "warning"
                        : activity.type === "alert"
                          ? "danger"
                          : "primary",
                  )}
                >
                  {activity.type === "admission" && <UserPlus size={16} />}
                  {activity.type === "evolution" && <Activity size={16} />}
                  {activity.type === "alert" && <TrendingUp size={16} />}
                  {activity.type === "discharge" && <LogOut size={16} />}
                </div>
                <div className="activity-details">
                  <p>{activity.description}</p>
                  <span className="text-muted text-sm">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(activity.createdAt))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Informações Importantes" description="Lembretes e avisos gerais">
          <ul className="info-list">
            {data.alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
