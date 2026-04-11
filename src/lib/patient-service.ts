import { DashboardSummary, PatientRecord, TimelineItem } from "./types";
import { getSupabaseClient } from "./supabase";

function hospitalizationTypeLabel(type?: string | null): "Voluntária" | "Involuntária" {
  return type === "INVOLUNTARY" ? "Involuntária" : "Voluntária";
}

function buildAddress(patient: {
  address_line?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  address_notes?: string | null;
}) {
  const parts = [patient.address_line, patient.neighborhood, patient.city, patient.state].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : patient.address_notes || "Não informado";
}

type PatientRow = {
  id: string;
  full_name: string;
  social_name?: string | null;
  cpf: string;
  rg?: string | null;
  birth_date: string;
  marital_status?: string | null;
  nationality?: string | null;
  naturalness?: string | null;
  phone?: string | null;
  profession?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  has_children?: boolean | null;
  children_count?: number | null;
  sus_card?: string | null;
  address_line?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  address_notes?: string | null;
  general_notes?: string | null;
  created_at: string;
  responsible_people?: Array<{
    id: string;
    full_name: string;
    relationship: string;
    phone?: string | null;
    email?: string | null;
    type: "FAMILY" | "VOLUNTARY" | "OTHER";
    is_primary?: boolean | null;
    notes?: string | null;
    created_at: string;
  }>;
  admissions?: Array<{
    id: string;
    hospitalization_type: string;
    status: "INTERNED" | "DISCHARGED" | "DISCONNECTED" | "EVADED";
    admission_date: string;
    expected_exit_date?: string | null;
    exit_date?: string | null;
    created_at: string;
  }>;
  medications?: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    route?: string | null;
    responsible_doctor?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    is_active: boolean;
    notes?: string | null;
    created_at: string;
  }>;
  evolution_records?: Array<{
    id: string;
    record_date: string;
    observations: string;
    weekly_evolution?: string | null;
    occurrences?: string | null;
    mood?: string | null;
  }>;
  patient_occurrences?: Array<{
    id: string;
    title: string;
    description: string;
    severity: number;
    occurred_at: string;
  }>;
};

function toPatientRecord(patient: PatientRow): PatientRecord {
  const admissions = [...(patient.admissions ?? [])].sort(
    (a, b) => new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime(),
  );
  const latestAdmission = admissions[0];
  const responsibles = [...(patient.responsible_people ?? [])].sort((a, b) => {
    const primaryDiff = Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary));
    if (primaryDiff !== 0) return primaryDiff;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  const medications = [...(patient.medications ?? [])].sort((a, b) => {
    const activeDiff = Number(b.is_active) - Number(a.is_active);
    if (activeDiff !== 0) return activeDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const evolutions = [...(patient.evolution_records ?? [])].sort(
    (a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime(),
  );
  const occurrences = [...(patient.patient_occurrences ?? [])].sort(
    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  );

  return {
    id: patient.id,
    fullName: patient.full_name,
    socialName: patient.social_name ?? undefined,
    cpf: patient.cpf,
    rg: patient.rg ?? undefined,
    birthDate: patient.birth_date,
    maritalStatus: patient.marital_status ?? undefined,
    nationality: patient.nationality ?? undefined,
    naturalness: patient.naturalness ?? undefined,
    phone: patient.phone ?? undefined,
    profession: patient.profession ?? undefined,
    fatherName: patient.father_name ?? undefined,
    motherName: patient.mother_name ?? undefined,
    hasChildren: patient.has_children ?? false,
    childrenCount: patient.children_count ?? 0,
    susCard: patient.sus_card ?? undefined,
    addressOrStreetSituation: buildAddress(patient),
    addressLine: patient.address_line ?? undefined,
    neighborhood: patient.neighborhood ?? undefined,
    city: patient.city ?? undefined,
    state: patient.state ?? undefined,
    zipCode: patient.zip_code ?? undefined,
    addressNotes: patient.address_notes ?? undefined,
    generalNotes: patient.general_notes ?? undefined,
    admissionDate: latestAdmission?.admission_date ?? patient.created_at,
    expectedExitDate: latestAdmission?.expected_exit_date ?? undefined,
    hospitalizationType: hospitalizationTypeLabel(latestAdmission?.hospitalization_type),
    status: latestAdmission?.status ?? "INTERNED",
    responsibles: responsibles.map((responsible) => ({
      id: responsible.id,
      fullName: responsible.full_name,
      relationship: responsible.relationship,
      phone: responsible.phone ?? undefined,
      email: responsible.email ?? undefined,
      type: responsible.type,
      isPrimary: responsible.is_primary ?? false,
      notes: responsible.notes ?? undefined,
    })),
    medications: medications.map((medication) => ({
      id: medication.id,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      route: medication.route ?? undefined,
      responsibleDoctor: medication.responsible_doctor ?? undefined,
      startDate: medication.start_date ?? undefined,
      endDate: medication.end_date ?? undefined,
      isActive: medication.is_active,
      notes: medication.notes ?? undefined,
    })),
    evolutions: evolutions.map((record) => ({
      id: record.id,
      createdAt: record.record_date,
      observations: record.observations,
      weeklyEvolution: record.weekly_evolution ?? undefined,
      occurrences: record.occurrences ?? undefined,
      mood: record.mood ?? undefined,
    })),
    alerts: occurrences.filter((occurrence) => occurrence.severity >= 3).map((occurrence) => occurrence.title),
  };
}

async function fetchPatients() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("patients")
    .select(`
      *,
      responsible_people(*),
      admissions(*),
      medications(*),
      evolution_records(*),
      patient_occurrences(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar pacientes no Supabase: ${error.message}`);
  }

  return (data ?? []) as PatientRow[];
}

export async function listPatients() {
  const patients = await fetchPatients();
  return patients.map(toPatientRecord);
}

export async function findPatient(id: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("patients")
    .select(`
      *,
      responsible_people(*),
      admissions(*),
      medications(*),
      evolution_records(*),
      patient_occurrences(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(`Erro ao buscar paciente no Supabase: ${error.message}`);
  }

  return toPatientRecord(data as PatientRow);
}

export async function getDashboardData(): Promise<DashboardSummary> {
  const patients = await fetchPatients();
  const parsedPatients = patients.map(toPatientRecord);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const allAdmissions = patients.flatMap((patient) => patient.admissions ?? []);
  const allMedications = patients.flatMap((patient) => patient.medications ?? []);
  const allEvolutions = patients.flatMap((patient) =>
    (patient.evolution_records ?? []).map((record) => ({ record, patientName: patient.full_name })),
  );
  const allOccurrences = patients.flatMap((patient) =>
    (patient.patient_occurrences ?? []).map((occurrence) => ({ occurrence, patientName: patient.full_name })),
  );

  const activePatients = parsedPatients.filter((patient) => patient.status === "INTERNED").length;
  const monthlyAdmissions = allAdmissions.filter((admission) => {
    const date = new Date(admission.admission_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;
  const monthlyDischarges = allAdmissions.filter((admission) => {
    if (!admission.exit_date || admission.status !== "DISCHARGED") return false;
    const date = new Date(admission.exit_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;
  const totalAdmissions = allAdmissions.length;
  const totalEvaded = allAdmissions.filter((admission) => admission.status === "EVADED").length;
  const dropoutRate = totalAdmissions > 0 ? Number(((totalEvaded / totalAdmissions) * 100).toFixed(1)) : 0;
  const occupancyRate = Math.min(activePatients * 10, 100);

  const recentActivity: TimelineItem[] = [
    ...allAdmissions.map((admission) => ({
      id: `admission-${admission.id}`,
      type: admission.status === "DISCHARGED" ? ("discharge" as const) : ("admission" as const),
      title: admission.status === "DISCHARGED" ? "Alta registrada" : "Nova admissão",
      description: `${parsedPatients.find((patient) => patient.admissionDate === admission.admission_date)?.fullName ?? "Paciente"} ${admission.status === "DISCHARGED" ? "teve alta registrada." : "foi admitido na unidade."}`,
      createdAt: admission.created_at,
    })),
    ...allEvolutions.map(({ record, patientName }) => ({
      id: `evolution-${record.id}`,
      type: "evolution" as const,
      title: "Evolução clínica",
      description: `${patientName} recebeu atualização no prontuário.`,
      createdAt: record.record_date,
    })),
    ...allOccurrences.map(({ occurrence, patientName }) => ({
      id: `occurrence-${occurrence.id}`,
      type: occurrence.severity >= 4 ? ("alert" as const) : ("medication" as const),
      title: occurrence.title,
      description: `${patientName}: ${occurrence.title}`,
      createdAt: occurrence.occurred_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const pendingDocumentsEstimate = parsedPatients.filter((patient) => patient.alerts.length > 0).length;
  const activeMedications = allMedications.filter((medication) => medication.is_active).length;

  const alerts: string[] = [];

  if (pendingDocumentsEstimate > 0) {
    alerts.push(`${pendingDocumentsEstimate} paciente(s) possuem alertas ou pendências registradas.`);
  }

  if (allOccurrences.some(({ occurrence }) => occurrence.severity >= 4)) {
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
