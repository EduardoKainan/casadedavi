import { HospitalizationStatus, HospitalizationType, Prisma } from "@prisma/client";
import { prisma } from "./db";
import { DashboardSummary, PatientRecord, TimelineItem } from "./types";

const patientInclude = {
  responsibles: {
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  },
  admissions: {
    orderBy: { admissionDate: "desc" },
  },
  medications: {
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  },
  evolutionRecords: {
    orderBy: { recordDate: "desc" },
  },
  occurrences: {
    orderBy: { occurredAt: "desc" },
    take: 10,
  },
} satisfies Prisma.PatientInclude;

type PatientWithRelations = Prisma.PatientGetPayload<{
  include: typeof patientInclude;
}>;

function hospitalizationTypeLabel(type?: HospitalizationType): "Voluntária" | "Involuntária" {
  return type === "INVOLUNTARY" ? "Involuntária" : "Voluntária";
}

function buildAddress(patient: PatientWithRelations) {
  const parts = [
    patient.addressLine,
    patient.neighborhood,
    patient.city,
    patient.state,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" - ");
  }

  return patient.addressNotes || "Não informado";
}

function toPatientRecord(patient: PatientWithRelations): PatientRecord {
  const latestAdmission = patient.admissions[0];

  return {
    id: patient.id,
    fullName: patient.fullName,
    socialName: patient.socialName ?? undefined,
    cpf: patient.cpf,
    rg: patient.rg ?? undefined,
    birthDate: patient.birthDate.toISOString(),
    maritalStatus: patient.maritalStatus ?? undefined,
    nationality: patient.nationality ?? undefined,
    naturalness: patient.naturalness ?? undefined,
    phone: patient.phone ?? undefined,
    profession: patient.profession ?? undefined,
    fatherName: patient.fatherName ?? undefined,
    motherName: patient.motherName ?? undefined,
    hasChildren: patient.hasChildren,
    childrenCount: patient.childrenCount,
    susCard: patient.susCard ?? undefined,
    addressOrStreetSituation: buildAddress(patient),
    addressLine: patient.addressLine ?? undefined,
    neighborhood: patient.neighborhood ?? undefined,
    city: patient.city ?? undefined,
    state: patient.state ?? undefined,
    zipCode: patient.zipCode ?? undefined,
    addressNotes: patient.addressNotes ?? undefined,
    generalNotes: patient.generalNotes ?? undefined,
    admissionDate: latestAdmission?.admissionDate.toISOString() ?? patient.createdAt.toISOString(),
    expectedExitDate: latestAdmission?.expectedExitDate?.toISOString(),
    hospitalizationType: hospitalizationTypeLabel(latestAdmission?.hospitalizationType),
    status: latestAdmission?.status ?? "INTERNED",
    responsibles: patient.responsibles.map((responsible) => ({
      id: responsible.id,
      fullName: responsible.fullName,
      relationship: responsible.relationship,
      phone: responsible.phone ?? undefined,
      email: responsible.email ?? undefined,
      type: responsible.type,
      isPrimary: responsible.isPrimary,
      notes: responsible.notes ?? undefined,
    })),
    medications: patient.medications.map((medication) => ({
      id: medication.id,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      route: medication.route ?? undefined,
      responsibleDoctor: medication.responsibleDoctor ?? undefined,
      startDate: medication.startDate?.toISOString(),
      endDate: medication.endDate?.toISOString(),
      isActive: medication.isActive,
      notes: medication.notes ?? undefined,
    })),
    evolutions: patient.evolutionRecords.map((record) => ({
      id: record.id,
      createdAt: record.recordDate.toISOString(),
      observations: record.observations,
      weeklyEvolution: record.weeklyEvolution ?? undefined,
      occurrences: record.occurrences ?? undefined,
      mood: record.mood ?? undefined,
    })),
    alerts: patient.occurrences
      .filter((occurrence) => occurrence.severity >= 3)
      .map((occurrence) => occurrence.title),
  };
}

export async function listPatients() {
  const patients = await prisma.patient.findMany({
    include: patientInclude,
    orderBy: { createdAt: "desc" },
  });

  return patients.map(toPatientRecord);
}

export async function findPatient(id: string) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: patientInclude,
  });

  return patient ? toPatientRecord(patient) : null;
}

export async function getDashboardData(): Promise<DashboardSummary> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    activePatients,
    monthlyAdmissions,
    monthlyDischarges,
    totalAdmissions,
    totalEvaded,
    recentAdmissions,
    recentEvolutions,
    recentOccurrences,
    pendingDocuments,
    activeMedications,
  ] = await Promise.all([
    prisma.admission.count({ where: { status: HospitalizationStatus.INTERNED } }),
    prisma.admission.count({ where: { admissionDate: { gte: monthStart, lt: nextMonthStart } } }),
    prisma.admission.count({ where: { status: HospitalizationStatus.DISCHARGED, exitDate: { gte: monthStart, lt: nextMonthStart } } }),
    prisma.admission.count(),
    prisma.admission.count({ where: { status: HospitalizationStatus.EVADED } }),
    prisma.admission.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { patient: true },
    }),
    prisma.evolutionRecord.findMany({
      take: 4,
      orderBy: { recordDate: "desc" },
      include: { patient: true },
    }),
    prisma.patientOccurrence.findMany({
      take: 4,
      orderBy: [{ severity: "desc" }, { occurredAt: "desc" }],
      include: { patient: true },
    }),
    prisma.patientDocument.count({ where: { isDelivered: false } }),
    prisma.medication.count({ where: { isActive: true } }),
  ]);

  const recentActivity: TimelineItem[] = [
    ...recentAdmissions.map((item) => ({
      id: `admission-${item.id}`,
      type: "admission" as const,
      title: "Nova admissão",
      description: `${item.patient.fullName} foi admitido na unidade.`,
      createdAt: item.createdAt.toISOString(),
    })),
    ...recentEvolutions.map((item) => ({
      id: `evolution-${item.id}`,
      type: "evolution" as const,
      title: "Evolução clínica",
      description: `${item.patient.fullName} recebeu atualização no prontuário.`,
      createdAt: item.recordDate.toISOString(),
    })),
    ...recentOccurrences.map((item) => ({
      id: `occurrence-${item.id}`,
      type: item.severity >= 4 ? ("alert" as const) : ("medication" as const),
      title: item.title,
      description: `${item.patient.fullName}: ${item.title}`,
      createdAt: item.occurredAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const occupancyRate = Math.min(activePatients * 10, 100);
  const dropoutRate = totalAdmissions > 0 ? Number(((totalEvaded / totalAdmissions) * 100).toFixed(1)) : 0;

  const alerts: string[] = [];

  if (pendingDocuments > 0) {
    alerts.push(`${pendingDocuments} documento(s) ainda aguardam entrega ou conferência.`);
  }

  if (recentOccurrences.some((occurrence) => occurrence.severity >= 4)) {
    alerts.push("Há ocorrências de alta severidade que precisam de revisão imediata.");
  }

  if (activeMedications > 0) {
    alerts.push(`${activeMedications} medicação(ões) ativas exigem conferência da rotina assistencial.`);
  }

  if (alerts.length === 0) {
    alerts.push("Nenhuma pendência crítica registrada no momento.");
  }

  return {
    activePatients,
    monthlyAdmissions,
    monthlyDischarges,
    dropoutRate,
    occupancyRate,
    recentActivity,
    alerts,
  };
}
