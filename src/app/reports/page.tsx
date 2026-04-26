"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Calendar,
  BarChart3,
} from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { MetricCard } from "@/components/metric-card";
import { cn } from "@/lib/utils";
import "./reports.css";

const periods = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "week" },
  { label: "30 dias", value: "month" },
  { label: "Ano", value: "year" },
  { label: "Personalizado", value: "custom" },
];

const mockData = {
  admissions: 47,
  discharges: 32,
  evasions: 5,
  avgStay: 42, // dias
  occupancyRate: 73, // %
  medicationsGiven: 1847,
  evolutionsRecorded: 312,
};

const monthlyData = [
  { month: "Jan", admissions: 12, discharges: 8, evasions: 1 },
  { month: "Fev", admissions: 15, discharges: 10, evasions: 0 },
  { month: "Mar", admissions: 18, discharges: 14, evasions: 2 },
  { month: "Abr", admissions: 11, discharges: 9, evasions: 1 },
  { month: "Mai", admissions: 14, discharges: 11, evasions: 0 },
  { month: "Jun", admissions: 16, discharges: 13, evasions: 1 },
];

const recentReports = [
  { id: 1, title: "Relatório Mensal - Março 2026", date: "2026-04-01", type: "mensal" },
  { id: 2, title: "Relatório Trimestral - Q1 2026", date: "2026-04-05", type: "trimestral" },
  { id: 3, title: "Relatório de Evasão - Análise", date: "2026-04-10", type: "especial" },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  return (
    <div className="reports-container">
      {/* Header com filtros */}
      <div className="reports-header">
        <div className="period-selector">
          {periods.map((period) => (
            <button
              key={period.value}
              className={cn("period-btn", selectedPeriod === period.value && "active")}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </button>
          ))}
        </div>

        <button className="btn btn-primary btn-sm">
          <Download size={16} />
          Exportar PDF
        </button>
      </div>

      {/* Métricas principais */}
      <div className="metrics-grid">
        <MetricCard
          icon={Users}
          label="Internações"
          value={mockData.admissions.toString()}
          description="Total de admissões no período"
          tone="primary"
        />
        <MetricCard
          icon={TrendingUp}
          label="Altas"
          value={mockData.discharges.toString()}
          description="Pacientes liberados"
          tone="success"
        />
        <MetricCard
          icon={TrendingDown}
          label="Evasões"
          value={mockData.evasions.toString()}
          description="Desligamentos não programados"
          tone="danger"
        />
        <MetricCard
          icon={Clock}
          label="Permanência média"
          value={`${mockData.avgStay} dias`}
          description="Tempo médio de internação"
          tone="warning"
        />
      </div>

      {/* Gráfico + Ocupação */}
      <div className="charts-grid">
        <SectionCard
          title="Evolução mensal"
          description="Admissões, altas e evasões por mês"
        >
          <div className="chart-container">
            {monthlyData.map((item) => {
              const maxVal = Math.max(...monthlyData.map((d) => d.admissions));
              return (
                <div key={item.month} className="chart-bar-group">
                  <div className="chart-bars">
                    <div
                      className="chart-bar admission"
                      style={{ height: `${(item.admissions / maxVal) * 100}%` }}
                    />
                    <div
                      className="chart-bar discharge"
                      style={{ height: `${(item.discharges / maxVal) * 100}%` }}
                    />
                    <div
                      className="chart-bar evasion"
                      style={{ height: `${(item.evasions / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="chart-label">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-dot admission" /> Admissões
            </span>
            <span className="legend-item">
              <span className="legend-dot discharge" /> Altas
            </span>
            <span className="legend-item">
              <span className="legend-dot evasion" /> Evasões
            </span>
          </div>
        </SectionCard>

        <SectionCard
          title="Taxa de ocupação"
          description="Capacidade assistencial da unidade"
        >
          <div className="occupancy-display">
            <div className="occupancy-circle">
              <svg viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="occupancyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f766e" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
                <circle className="occupancy-track" cx="60" cy="60" r="50" />
                <circle
                  className="occupancy-fill"
                  cx="60"
                  cy="60"
                  r="50"
                  strokeDasharray={`${mockData.occupancyRate * 3.14} 314`}
                />
              </svg>
              <div className="occupancy-value">
                <strong>{mockData.occupancyRate}%</strong>
                <span>Ocupação</span>
              </div>
            </div>
            <div className="occupancy-details">
              <div className="occupancy-stat">
                <span className="stat-label">Vagas ocupadas</span>
                <strong>22</strong>
              </div>
              <div className="occupancy-stat">
                <span className="stat-label">Vagas disponíveis</span>
                <strong>8</strong>
              </div>
              <div className="occupancy-stat">
                <span className="stat-label">Capacidade total</span>
                <strong>30</strong>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Relatórios recentes + Atividade */}
      <div className="reports-bottom">
        <SectionCard
          title="Relatórios gerados"
          description="Documentos recentes exportados"
          actions={<button className="btn btn-outline btn-sm">Ver todos</button>}
        >
          <div className="reports-list">
            {recentReports.map((report) => (
              <div key={report.id} className="report-item">
                <div className="report-icon">
                  <FileText size={20} />
                </div>
                <div className="report-info">
                  <p className="report-title">{report.title}</p>
                  <span className="report-date">
                    <Calendar size={12} />
                    {new Date(report.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <span className={cn("report-badge", `badge-${report.type}`)}>
                  {report.type}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Resumo operacional"
          description="Indicadores do período selecionado"
        >
          <div className="summary-list">
            <div className="summary-item">
              <BarChart3 size={18} />
              <div>
                <span className="summary-label">Medicações administradas</span>
                <strong>{mockData.medicationsGiven}</strong>
              </div>
            </div>
            <div className="summary-item">
              <FileText size={18} />
              <div>
                <span className="summary-label">Evoluções registradas</span>
                <strong>{mockData.evolutionsRecorded}</strong>
              </div>
            </div>
            <div className="summary-item">
              <Users size={18} />
              <div>
                <span className="summary-label">Taxa de readmissão</span>
                <strong>4,2%</strong>
              </div>
            </div>
            <div className="summary-item">
              <Clock size={18} />
              <div>
                <span className="summary-label">Tempo médio espera</span>
                <strong>2,3 dias</strong>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
