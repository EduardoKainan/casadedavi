import { DashboardSummary, PatientRecord, TimelineItem } from "./types";
import { getSupabaseClient } from "./supabase";

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
};

type AdmissionRow = {
  id: string;
  patient_id: string;
  hospitalization_type: string;
  status: "INTERNED" | "DISCHARGED" | "DISCONNECTED" | "EVADED";
  admission_date: string;
  expected_exit_date?: string | null;
  exit_date?: string | null;
  created_at: string;
};

type ResponsibleRow = {
  id: string;
  patient_id: string;
  full_name: string;
  relationship: string;
  phone?: string | null;
  email?: string | null;
  type: "FAMILY" | "VOLUNTARY" | "OTHER";
  is_primary?: boolean | null;
  notes?: string | null;
  created_at: string;
};

type MedicationRow = {
  id: string;
  patient_id: string;
  admission_id?: string | null;
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
};

type EvolutionRow = {
  id: string;
  patient_id: string;
  admission_id?: string | null;
  record_date: string;
  observations: string;
  weekly_evolution?: string | null;
  occurrences?: string | null;
  mood?: string | null;
};

type OccurrenceRow = {
  id: string;
  patient_id: string;
  admission_id?: string | null;
  title: string;
  description: string;
  severity: number;
  occurred_at: string;
};

function hospitalizationTypeLabel(type?: string | null): "Voluntária" | "Involuntária" {
  return type === "INVOLUNTARY" ? "Involuntária" : "Voluntária";
}

function buildAddress(patient: PatientRow) {
  const parts = [patient.address_line, patient.neighborhood, patient.city, patient.state].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : patient.address_notes || "Não informado";
}

function toPatientRecord(patient: PatientRow & {
  admissions?: AdmissionRow[];
  responsible_people?: ResponsibleRow[];
  medications?: MedicationRow[];
  evolution_records?: EvolutionRow[];
  patient_occurrences?: OccurrenceRow[];
}): PatientRecord {
  const admissions = [...(patient.admissions ?? [])].sort(
    (a, b) => new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime(),
  );
  const latestAdmission = admissions && admissions.length > 0 ? admissions[0] : undefined;

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
    responsibles: responsibles.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      relationship: r.relationship,
      phone: r.phone ?? undefined,
      email: r.email ?? undefined,
      type: r.type,
      isPrimary: r.is_primary ?? false,
      notes: r.notes ?? undefined,
    })),
    medications: medications.map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      route: m.route ?? undefined,
      responsibleDoctor: m.responsible_doctor ?? undefined,
      startDate: m.start_date ?? undefined,
      endDate: m.end_date ?? undefined,
      isActive: m.is_active,
      notes: m.notes ?? undefined,
    })),
    evolutions: evolutions.map((e) => ({
      id: e.id,
      createdAt: e.record_date,
      observations: e.observations,
      weeklyEvolution: e.weekly_evolution ?? undefined,
      occurrences: e.occurrences ?? undefined,
      mood: e.mood ?? undefined,
    })),
    alerts: occurrences.filter((o) => o.severity >= 3).map((o) => o.title),
  };
}

async function fetchPatientsWithRelations() {
  const supabase = getSupabaseClient();

  // Buscar pacientes
  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (patientsError) {
    throw new Error(`Erro ao buscar patients: ${patientsError.message}`);
  }

  if (!patients || patients.length === 0) {
    return [];
  }

  const patientIds = patients.map((p) => p.id);

  // Buscar relações separadas em paralelo
  const [
    { data: admissions },
    { data: responsibles },
    { data: medications },
    { data: evolutions },
    { data: occurrences },
  ] = await Promise.all([
    supabase.from("admissions").select("*").in("patient_id", patientIds).order("admission_date", { ascending: false }),
    supabase.from("responsible_people").select("*").in("patient_id", patientIds),
    supabase.from("medications").select("*").in("patient_id", patientIds).order("is_active", { ascending: false }),
    supabase.from("evolution_records").select("*").in("patient_id", patientIds).order("record_date", { ascending: false }),
    supabase.from("patient_occurrences").select("*").in("patient_id", patientIds).order("occurred_at", { ascending: false }),
  ]);

  const admissionsMap = new Map<string, AdmissionRow[]>();
  admissions?.forEach((a) => {
    const list = admissionsMap.get(a.patient_id) || [];
    list.push(a);
    admissionsMap.set(a.patient_id, list);
  });

  const responsiblesMap = new Map<string, ResponsibleRow[]>();
  responsibles?.forEach((r) => {
    const list = responsiblesMap.get(r.patient_id) || [];
    list.push(r);
    responsiblesMap.set(r.patient_id, list);
  });

  const medicationsMap = new Map<string, MedicationRow[]>();
  medications?.forEach((m) => {
    const list = medicationsMap.get(m.patient_id) || [];
    list.push(m);
    medicationsMap.set(m.patient_id, list);
  });

  const evolutionsMap = new Map<string, EvolutionRow[]>();
  evolutions?.forEach((e) => {
    const list = evolutionsMap.get(e.patient_id) || [];
    list.push(e);
    evolutionsMap.set(e.patient_id, list);
  });

  const occurrencesMap = new Map<string, OccurrenceRow[]>();
  occurrences?.forEach((o) => {
    const list = occurrencesMap.get(o.patient_id) || [];
    list.push(o);
    occurrencesMap.set(o.patient_id, list);
  });

  return patients.map((patient) => ({
    ...patient,
    admissions: admissionsMap.get(patient.id) || [],
    responsible_people: responsiblesMap.get(patient.id) || [],
    medications: medicationsMap.get(patient.id) || [],
    evolution_records: evolutionsMap.get(patient.id) || [],
    patient_occurrences: occurrencesMap.get(patient.id) || [],
  }));
}

export async function listPatients() {
  const patients = await fetchPatientsWithRelations();
  return patients.map(toPatientRecord);
}

export async function findPatient(id: string) {
  const patients = await fetchPatientsWithRelations();
  return patients.find((p) => p.id === id) || null;
}

export async function createPatient(data: {
  full_name: string;
  social_name?: string;
  cpf: string;
  rg?: string;
  birth_date: string;
  marital_status?: string;
  nationality?: string;
  naturalness?: string;
  phone?: string;
  profession?: string;
  father_name?: string;
  mother_name?: string;
  has_children?: boolean;
  children_count?: number;
  sus_card?: string;
  address_line?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  address_notes?: string;
  general_notes?: string;
}) {
  const supabase = getSupabaseClient();

  const { data: patient, error } = await supabase
    .from("patients")
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar paciente: ${error.message}`);
  }

  return patient;
}

export async function createAdmission(data: {
  patient_id: string;
  hospitalization_type: "VOLUNTARY" | "INVOLUNTARY";
  admission_date: string;
  expected_exit_date?: string;
  exit_date?: string;
  exit_reason?: "DISCHARGE" | "GIVE_UP" | "EXPULSION" | "OTHER";
  referral_source?: string;
  diagnosis?: string;
  initial_condition?: string;
  final_observations?: string;
}) {
  const supabase = getSupabaseClient();

  const { data: admission, error } = await supabase
    .from("admissions")
    .insert([
      {
        ...data,
        status: data.exit_date ? "DISCHARGED" : "INTERNED",
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar admissão: ${error.message}`);
  }

  return admission;
}

export async function updatePatient(id: string, data: Partial<{
  full_name: string;
  social_name?: string;
  cpf: string;
  rg?: string;
  birth_date: string;
  marital_status?: string;
  nationality?: string;
  naturalness?: string;
  phone?: string;
  profession?: string;
  father_name?: string;
  mother_name?: string;
  has_children?: boolean;
  children_count?: number;
  sus_card?: string;
  address_line?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  address_notes?: string;
  general_notes?: string;
}>) {
  const supabase = getSupabaseClient();

  const { data: patient, error } = await supabase
    .from("patients")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar paciente: ${error.message}`);
  }

  return patient;
}

export async function deletePatient(id: string) {
  const supabase = getSupabaseClient();

  // Deletar registros relacionados primeiro (ordem importa por causa das FKs)
  const tables = [
    "patient_occurrences",
    "patient_documents",
    "evolution_records",
    "medications",
    "admissions",
    "responsible_people",
  ];

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("patient_id", id);

    if (error) {
      console.warn(`Erro ao deletar de ${table}:`, error.message);
    }
  }

  // Deletar o paciente
  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Erro ao excluir paciente: ${error.message}`);
  }
}

export async function createResponsible(data: {
  patient_id: string;
  full_name: string;
  relationship: string;
  phone?: string;
  email?: string;
  type: "FAMILY" | "VOLUNTARY" | "OTHER";
  is_primary?: boolean;
  notes?: string;
}) {
  const supabase = getSupabaseClient();

  const { data: responsible, error } = await supabase
    .from("responsible_people")
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar responsável: ${error.message}`);
  }

  return responsible;
}

export async function getReportsData(period: string = "month") {
  const supabase = getSupabaseClient();
  
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case "custom":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "month":
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const { data: patients } = await supabase
    .from("patients")
    .select("*")
    .gte("created_at", startDate.toISOString());

  const { data: admissions } = await supabase
    .from("admissions")
    .select("*")
    .gte("created_at", startDate.toISOString());

  const { data: medications } = await supabase
    .from("medications")
    .select("*")
    .gte("created_at", startDate.toISOString());

  const { data: evolutions } = await supabase
    .from("evolution_records")
    .select("*")
    .gte("created_at", startDate.toISOString());

  const { data: activeAdmissions } = await supabase
    .from("admissions")
    .select("*")
    .eq("status", "INTERNED");

  const totalAdmissions = admissions?.length ?? 0;
  const discharges = admissions?.filter((a) => a.status === "DISCHARGED").length ?? 0;
  const evasions = admissions?.filter((a) => a.status === "EVADED").length ?? 0;
  const activeCount = activeAdmissions?.length ?? 0;

  // Calcular permanência média
  let avgStay = 0;
  const completedAdmissions = admissions?.filter((a) => a.exit_date) ?? [];
  if (completedAdmissions.length > 0) {
    const totalDays = completedAdmissions.reduce((sum, a) => {
      const admission = new Date(a.admission_date);
      const exit = new Date(a.exit_date!);
      return sum + Math.ceil((exit.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    avgStay = Math.round(totalDays / completedAdmissions.length);
  }

  // Taxa de ocupação (assumindo capacidade de 30)
  const capacity = 30;
  const occupancyRate = Math.min(Math.round((activeCount / capacity) * 100), 100);

  // Dados mensais para gráfico (últimos 6 meses)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthAdmissions = admissions?.filter((a) => {
      const date = new Date(a.admission_date);
      return date >= monthDate && date <= monthEnd;
    }).length ?? 0;
    
    const monthDischarges = admissions?.filter((a) => {
      if (!a.exit_date || a.status !== "DISCHARGED") return false;
      const date = new Date(a.exit_date);
      return date >= monthDate && date <= monthEnd;
    }).length ?? 0;
    
    const monthEvasions = admissions?.filter((a) => {
      if (!a.exit_date || a.status !== "EVADED") return false;
      const date = new Date(a.exit_date);
      return date >= monthDate && date <= monthEnd;
    }).length ?? 0;

    monthlyData.push({
      month: monthDate.toLocaleDateString("pt-BR", { month: "short" }),
      admissions: monthAdmissions,
      discharges: monthDischarges,
      evasions: monthEvasions,
    });
  }

  return {
    admissions: totalAdmissions,
    discharges,
    evasions,
    avgStay,
    occupancyRate,
    activeCount,
    capacity,
    medicationsGiven: medications?.length ?? 0,
    evolutionsRecorded: evolutions?.length ?? 0,
    monthlyData,
  };
}

export async function getDashboardData(): Promise<DashboardSummary> {
  const patients = await fetchPatientsWithRelations();
  const parsedPatients = patients.map(toPatientRecord);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const allAdmissions = patients.flatMap((p) => p.admissions ?? []);
  const allMedications = patients.flatMap((p) => p.medications ?? []);
  const allEvolutions = patients.flatMap((p) =>
    (p.evolution_records ?? []).map((record: EvolutionRow) => ({ record, patientName: p.full_name })),
  );
  const allOccurrences = patients.flatMap((p) =>
    (p.patient_occurrences ?? []).map((occurrence: OccurrenceRow) => ({ occurrence, patientName: p.full_name })),
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
      description: `${parsedPatients.find((p) => p.admissionDate === admission.admission_date)?.fullName ?? "Paciente"} ${admission.status === "DISCHARGED" ? "teve alta registrada." : "foi admitido na unidade."}`,
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
      id: `occurrence-${occurrence.title}-${patientName}`,
      type: "alert" as const,
      title: occurrence.title,
      description: `${patientName}: ${occurrence.title}`,
      createdAt: now.toISOString(),
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

  if (allOccurrences.length > 0) {
    alerts.push("Há ocorrências registradas que precisam de atenção.");
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
