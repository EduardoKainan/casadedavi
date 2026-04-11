import { PatientRecord, PatientStatus } from "@/lib/types";
import { calculateAge, formatDate } from "@/lib/utils";

const statusMap: Record<PatientStatus, { label: string; tone: string }> = {
  INTERNED: { label: "Internado", tone: "success" },
  DISCHARGED: { label: "Alta", tone: "primary" },
  DISCONNECTED: { label: "Desligado", tone: "warning" },
  EVADED: { label: "Evadido", tone: "danger" },
};

export function getPatientStatusMeta(status: PatientStatus) {
  return statusMap[status];
}

export function toPatientListItem(patient: PatientRecord) {
  return {
    id: patient.id,
    name: patient.fullName,
    cpf: patient.cpf,
    admissionDate: formatDate(patient.admissionDate),
    type: patient.hospitalizationType,
    status: getPatientStatusMeta(patient.status).label,
    statusTone: getPatientStatusMeta(patient.status).tone,
    alertsCount: patient.alerts.length,
  };
}

export function toPatientDetailView(patient: PatientRecord) {
  const mainResponsible = patient.responsibles[0];

  return {
    ...patient,
    age: calculateAge(patient.birthDate),
    birthDateFormatted: formatDate(patient.birthDate),
    admissionDateFormatted: formatDate(patient.admissionDate),
    expectedExitDateFormatted: patient.expectedExitDate ? formatDate(patient.expectedExitDate) : "Não definida",
    statusMeta: getPatientStatusMeta(patient.status),
    mainResponsible,
  };
}
