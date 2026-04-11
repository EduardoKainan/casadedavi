import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Pill, Activity, FileText, Settings, Download, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { findPatient } from "@/lib/patient-service";
import { formatDateTime } from "@/lib/utils";
import { toPatientDetailView } from "@/lib/patient-view";
import "./detail.css";

const tabs = [
  { id: "info", label: "Dados Gerais", icon: User },
  { id: "medications", label: "Medicações", icon: Pill },
  { id: "evolution", label: "Evolução", icon: Activity },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "exit", label: "Gestão de Saída", icon: Settings },
] as const;

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const activeTab = resolvedSearchParams?.tab ?? "info";
  const patient = await findPatient(id);

  if (!patient) {
    notFound();
  }

  const view = toPatientDetailView(patient);

  return (
    <div className="detail-container">
      <div className="page-header">
        <div className="header-breadcrumbs">
          <Link href="/patients" className="back-link">
            <ArrowLeft size={18} />
            <span>Voltar para Lista</span>
          </Link>
          <div className="detail-title-row">
            <h2>{view.fullName}</h2>
            <StatusBadge tone={view.statusMeta.tone as "primary" | "success" | "warning" | "danger"}>
              {view.statusMeta.label}
            </StatusBadge>
            <StatusBadge tone="neutral">{view.hospitalizationType}</StatusBadge>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">
            <Download size={18} />
            <span>Exportar Prontuário</span>
          </button>
          <button className="btn btn-primary">Editar Cadastro</button>
        </div>
      </div>

      {view.alerts.length > 0 && (
        <div className="card alerts-banner">
          <div className="alerts-banner-icon">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3>Alertas do paciente</h3>
            <ul>
              {view.alerts.map((alert) => (
                <li key={alert}>{alert}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="tabs-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={`/patients/${id}?tab=${tab.id}`}
              className={`tab-btn ${isActive ? "active" : ""}`}
            >
              <Icon size={18} /> {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="tab-content">
        {activeTab === "info" && (
          <div className="info-grid">
            <SectionCard title="Informações Pessoais">
              <div className="data-list">
                <div className="data-item">
                  <span className="data-label">CPF</span>
                  <span className="data-value">{view.cpf}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">RG</span>
                  <span className="data-value">{view.rg}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Data de Nascimento</span>
                  <span className="data-value">{view.birthDateFormatted} ({view.age} anos)</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Estado Civil</span>
                  <span className="data-value">{view.maritalStatus}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Naturalidade</span>
                  <span className="data-value">{view.naturalness}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Nacionalidade</span>
                  <span className="data-value">{view.nationality}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Profissão</span>
                  <span className="data-value">{view.profession ?? "Não informada"}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Mãe</span>
                  <span className="data-value">{view.motherName ?? "Não informada"}</span>
                </div>
                <div className="data-item col-span-2">
                  <span className="data-label">Endereço / Situação</span>
                  <span className="data-value">{view.addressOrStreetSituation}</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Dados da Internação">
              <div className="data-list">
                <div className="data-item">
                  <span className="data-label">Data de Entrada</span>
                  <span className="data-value">{view.admissionDateFormatted}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">Previsão de Saída</span>
                  <span className="data-value">{view.expectedExitDateFormatted}</span>
                </div>
                <div className="data-item col-span-2">
                  <span className="data-label">Responsável principal</span>
                  <span className="data-value">
                    {view.mainResponsible
                      ? `${view.mainResponsible.fullName} (${view.mainResponsible.relationship}) - ${view.mainResponsible.phone}`
                      : "Não informado"}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "medications" && (
          <SectionCard
            title="Controle de Medicações"
            description="Medicamentos ativos e histórico de prescrição"
            actions={<button className="btn btn-primary btn-sm">Adicionar Medicação</button>}
          >
            {view.medications.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Dosagem</th>
                    <th>Frequência</th>
                    <th>Médico</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {view.medications.map((medication) => (
                    <tr key={medication.id}>
                      <td>{medication.name}</td>
                      <td>{medication.dosage}</td>
                      <td>{medication.frequency}</td>
                      <td>{medication.responsibleDoctor}</td>
                      <td>
                        <StatusBadge tone={medication.isActive ? "success" : "warning"}>
                          {medication.isActive ? "Ativo" : "Inativo"}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                icon={Pill}
                title="Nenhuma medicação cadastrada"
                description="Adicione as prescrições para manter o prontuário atualizado."
              />
            )}
          </SectionCard>
        )}

        {activeTab === "evolution" && (
          <SectionCard title="Evolução clínica" description="Ocorrências, observações e progresso terapêutico">
            {view.evolutions.length > 0 ? (
              <div className="timeline-list">
                {view.evolutions.map((item) => (
                  <article key={item.id} className="timeline-item-card">
                    <div className="timeline-item-header">
                      <strong>{formatDateTime(item.createdAt)}</strong>
                    </div>
                    <p>{item.observations}</p>
                    {item.weeklyEvolution ? <p className="text-muted">{item.weeklyEvolution}</p> : null}
                    {item.occurrences ? <p className="text-muted">{item.occurrences}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="Sem evoluções registradas"
                description="As anotações da equipe aparecerão aqui quando forem cadastradas."
              />
            )}
          </SectionCard>
        )}

        {(activeTab === "documents" || activeTab === "exit") && (
          <SectionCard title={activeTab === "documents" ? "Documentos" : "Gestão de saída"}>
            <EmptyState
              icon={activeTab === "documents" ? FileText : Settings}
              title="Área em construção"
              description="A estrutura já está pronta para plugar banco real e fluxos operacionais nessa aba."
            />
          </SectionCard>
        )}
      </div>
    </div>
  );
}
