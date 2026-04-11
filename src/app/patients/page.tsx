import Link from "next/link";
import { Plus, Search, Filter, Edit, FileText, Trash, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { StatusBadge } from "@/components/status-badge";
import { listPatients } from "@/lib/patient-service";
import { toPatientListItem } from "@/lib/patient-view";
import "./patients.css";

export default async function PatientsPage() {
  const patients = (await listPatients()).map(toPatientListItem);
  const activePatients = patients.filter((patient) => patient.status === "Internado").length;
  const patientsWithAlerts = patients.filter((patient) => patient.alertsCount > 0).length;
  const involuntaryAdmissions = patients.filter((patient) => patient.type === "Involuntária").length;

  return (
    <div className="patients-container">
      <PageIntro
        title="Pacientes acolhidos"
        description="Gerencie prontuários, acompanhe alertas assistenciais e mantenha a operação clínica organizada."
        actions={
          <Link href="/patients/new" className="btn btn-primary">
            <Plus size={18} />
            <span>Novo paciente</span>
          </Link>
        }
      />

      <section className="patients-highlight">
        <article className="highlight-card">
          <span>Internados</span>
          <strong>{activePatients}</strong>
          <p>Pacientes com acolhimento ativo no momento.</p>
        </article>
        <article className="highlight-card">
          <span>Com alerta</span>
          <strong>{patientsWithAlerts}</strong>
          <p>Prontuários exigindo atenção imediata da equipe.</p>
        </article>
        <article className="highlight-card">
          <span>Internação involuntária</span>
          <strong>{involuntaryAdmissions}</strong>
          <p>Casos que pedem acompanhamento documental mais rígido.</p>
        </article>
      </section>

      <div className="card table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar por nome, CPF ou responsável..." />
          </div>
          <div className="filters">
            <button className="btn btn-outline filter-btn">
              <Filter size={18} />
              <span>Status: Todos</span>
            </button>
            <button className="btn btn-outline filter-btn">
              <span>Alertas: Todos</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>CPF</th>
                <th>Entrada</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Alertas</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="patient-meta">
                      <Link href={`/patients/${patient.id}`} className="patient-name-link">
                        {patient.name}
                      </Link>
                      <small>Prontuário disponível para consulta clínica</small>
                    </div>
                  </td>
                  <td className="text-muted">{patient.cpf}</td>
                  <td>{patient.admissionDate}</td>
                  <td>
                    <StatusBadge tone="neutral">{patient.type}</StatusBadge>
                  </td>
                  <td>
                    <StatusBadge tone={patient.statusTone as "primary" | "success" | "warning" | "danger"}>
                      {patient.status}
                    </StatusBadge>
                  </td>
                  <td>
                    {patient.alertsCount > 0 ? (
                      <span className="alerts-chip">
                        <AlertTriangle size={14} />
                        {patient.alertsCount}
                      </span>
                    ) : (
                      <span className="text-muted text-sm">Sem alertas</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <Link href={`/patients/${patient.id}`} className="icon-btn" title="Ver prontuário">
                        <FileText size={18} />
                      </Link>
                      <button className="icon-btn text-primary" title="Editar paciente">
                        <Edit size={18} />
                      </button>
                      <button className="icon-btn text-danger" title="Excluir paciente">
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {patients.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={FileText}
                      title="Nenhum paciente encontrado"
                      description="Cadastre o primeiro paciente para iniciar a operação clínica no sistema."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="text-sm text-muted">
            Mostrando 1 a {patients.length} de {patients.length} registros
          </span>
          <div className="pagination-controls">
            <button className="btn btn-outline btn-sm" disabled>Anterior</button>
            <button className="btn btn-outline btn-sm" disabled>Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
}
