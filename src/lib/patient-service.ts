import { getDashboardSummary, getPatientById, mockPatients } from "./mock-data";

export async function listPatients() {
  return mockPatients;
}

export async function findPatient(id: string) {
  return getPatientById(id);
}

export async function getDashboardData() {
  return getDashboardSummary();
}
