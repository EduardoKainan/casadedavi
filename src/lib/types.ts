export type PatientStatus = "INTERNED" | "DISCHARGED" | "DISCONNECTED" | "EVADED";
export type HospitalizationTypeLabel = "Voluntária" | "Involuntária";

export type ResponsibleContact = {
  id: string;
  fullName: string;
  relationship: string;
  phone?: string;
  email?: string;
  type: "FAMILY" | "VOLUNTARY" | "OTHER";
  isPrimary?: boolean;
  notes?: string;
};

export type MedicationItem = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route?: string;
  responsibleDoctor?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
};

export type EvolutionItem = {
  id: string;
  createdAt: string;
  observations: string;
  weeklyEvolution?: string;
  occurrences?: string;
  mood?: string;
};

export type TimelineItem = {
  id: string;
  type: "admission" | "evolution" | "medication" | "alert" | "discharge";
  title: string;
  description: string;
  createdAt: string;
};

export type PatientRecord = {
  id: string;
  fullName: string;
  socialName?: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  maritalStatus?: string;
  nationality?: string;
  naturalness?: string;
  phone?: string;
  profession?: string;
  fatherName?: string;
  motherName?: string;
  hasChildren?: boolean;
  childrenCount?: number;
  susCard?: string;
  addressOrStreetSituation: string;
  addressLine?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  addressNotes?: string;
  generalNotes?: string;
  admissionDate: string;
  expectedExitDate?: string;
  hospitalizationType: HospitalizationTypeLabel;
  status: PatientStatus;
  responsibles: ResponsibleContact[];
  medications: MedicationItem[];
  evolutions: EvolutionItem[];
  alerts: string[];
};

import { LucideIcon } from "lucide-react";

export type DashboardMetric = {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
  tone: "primary" | "success" | "warning" | "danger";
};

export type DashboardSummary = {
  activePatients: number;
  monthlyAdmissions: number;
  monthlyDischarges: number;
  dropoutRate: number;
  occupancyRate: number;
  recentActivity: TimelineItem[];
  alerts: string[];
};
