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

  return (
    <div className="patients-container">
      <PageIntro
        title="Gestão de Internos"
        description="Gerencie pacientes, acompanhe alertas e acesse rapidamente os prontuários."
        actions={
          <Link href="/patients/new" className="btn btn-primary">
            <Plus size={18} />
            <span>Novo Interno</span>
          </Link>
        }
      />

      <div className="card table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar por nome ou CPF..." />
          </div>
          <div className="filters">
            <button className="btn btn-outline filter-btn">
              <Filter size={18} />
              <span>Status: Todos</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome do Paciente</th>
                <th>CPF</th>
                <th>Data de Entrada</th>
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
                    <Link href={`/patients/${patient.id}`} className="patient-name-link">
                      {patient.name}
                    </Link>
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
                      <Link href={`/patients/${patient.id}`} className="icon-btn" title="Ver Prontuário">
                        <FileText size={18} />
                      </Link>
                      <button className="icon-btn text-primary" title="Editar">
                        <Edit size={18} />
                      </button>
                      <button className="icon-btn text-danger" title="Excluir">
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
                      title="Nenhum interno encontrado"
                      description="Cadastre o primeiro interno para começar a operar o sistema."
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
