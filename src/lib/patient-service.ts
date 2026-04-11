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

function buildAddress(patient: PatientRow) {
  const parts = [patient.address_line, patient.neighborhood, patient.city, patient.state].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : patient.address_notes || "Não informado";
}

function toPatientRecord(patient: PatientRow): PatientRecord {
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
    admissionDate: patient.created_at,
    expectedExitDate: undefined,
    hospitalizationType: "Voluntária",
    status: "INTERNED",
    responsibles: [],
    medications: [],
    evolutions: [],
    alerts: [],
  };
}

async function fetchPatients() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar patients no Supabase: ${error.message}`);
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
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(`Erro ao buscar patient no Supabase: ${error.message}`);
  }

  return toPatientRecord(data as PatientRow);
}

export async function getDashboardData(): Promise<DashboardSummary> {
  const patients = (await fetchPatients()).map(toPatientRecord);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const activePatients = patients.length;
  const monthlyAdmissions = patients.filter((patient) => {
    const date = new Date(patient.admissionDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const recentActivity: TimelineItem[] = patients.slice(0, 6).map((patient) => ({
    id: `patient-${patient.id}`,
    type: "admission",
    title: "Cadastro disponível",
    description: `${patient.fullName} está disponível no sistema.`,
    createdAt: patient.admissionDate,
  }));

  return {
    activePatients,
    monthlyAdmissions,
    monthlyDischarges: 0,
    dropoutRate: 0,
    occupancyRate: Math.min(activePatients * 10, 100),
    recentActivity,
    alerts: patients.length === 0
      ? ["Nenhum paciente cadastrado ainda. Cadastre o primeiro para começar."]
      : ["Leitura básica ativa. Relações clínicas serão religadas na próxima etapa."],
  };
}
