import { Users, UserPlus, LogOut, TrendingUp, Activity, ShieldAlert, CalendarClock } from "lucide-react";
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
      label: "Internos ativos",
      value: data.activePatients.toString(),
      description: "Pacientes acolhidos atualmente na unidade",
      tone: "primary",
    },
    {
      icon: UserPlus,
      label: "Entradas no mês",
      value: data.monthlyAdmissions.toString(),
      description: "Novas admissões registradas no período",
      tone: "success",
    },
    {
      icon: LogOut,
      label: "Saídas no mês",
      value: data.monthlyDischarges.toString(),
      description: "Altas e encerramentos da unidade",
      tone: "warning",
    },
    {
      icon: TrendingUp,
      label: "Taxa de evasão",
      value: `${data.dropoutRate}%`,
      description: "Percentual de evasões sobre o total de acolhidos",
      tone: "danger",
    },
  ];
}

export default async function DashboardPage() {
  const metrics = await getMetrics();
  const data = await getDashboardData();

  return (
    <div className="dashboard-container">
      <section className="dashboard-hero">
        <div className="dashboard-hero-main">
          <h2>Painel assistencial da unidade</h2>
          <p>
            Acompanhe ocupação, alertas operacionais, evoluções recentes e tudo que exige atenção da equipe no dia.
          </p>

          <div className="hero-pills">
            <span className="hero-pill">
              <ShieldAlert size={16} />
              3 prontuários pendentes
            </span>
            <span className="hero-pill">
              <CalendarClock size={16} />
              2 revisões previstas hoje
            </span>
            <span className="hero-pill">
              <Activity size={16} />
              Fluxo clínico estável
            </span>
          </div>
        </div>

        <div className="dashboard-hero-aside">
          <span>Ocupação atual</span>
          <strong>{data.occupancyRate}%</strong>
          <p>Capacidade assistencial dentro da faixa segura, mas com pressão moderada na rotina.</p>
          <div className="aside-progress">
            <div />
          </div>
        </div>
      </section>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="charts-grid">
        <SectionCard
          title="Atividade recente"
          description="Movimentações clínicas e administrativas mais recentes da unidade"
          actions={<button className="btn btn-outline btn-sm">Ver histórico</button>}
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

        <SectionCard title="Pendências críticas" description="Itens que merecem ação rápida da equipe">
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
