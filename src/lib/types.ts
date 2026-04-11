export type PatientStatus = "INTERNED" | "DISCHARGED" | "DISCONNECTED" | "EVADED";
export type HospitalizationTypeLabel = "Voluntária" | "Involuntária";

export type ResponsibleContact = {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  type: "FAMILY" | "VOLUNTARY" | "OTHER";
};

export type MedicationItem = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  responsibleDoctor: string;
  isActive: boolean;
};

export type EvolutionItem = {
  id: string;
  createdAt: string;
  observations: string;
  weeklyEvolution?: string;
  occurrences?: string;
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
  cpf: string;
  rg: string;
  birthDate: string;
  maritalStatus: string;
  nationality: string;
  naturalness: string;
  addressOrStreetSituation: string;
  profession?: string;
  fatherName?: string;
  motherName?: string;
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
