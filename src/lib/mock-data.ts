import { DashboardSummary, PatientRecord, TimelineItem } from "./types";

export const mockPatients: PatientRecord[] = [
  {
    id: "1",
    fullName: "João Carlos Silva",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    birthDate: "1985-05-14",
    maritalStatus: "Solteiro",
    nationality: "Brasileira",
    naturalness: "Goiânia - GO",
    addressOrStreetSituation: "Rua das Flores, 123 - Centro, Goiânia/GO",
    profession: "Pedreiro",
    motherName: "Maria Costa Silva",
    fatherName: "José Carlos Silva",
    admissionDate: "2026-02-15",
    expectedExitDate: "2026-08-15",
    hospitalizationType: "Voluntária",
    status: "INTERNED",
    responsibles: [
      {
        id: "r1",
        fullName: "Maria Costa Silva",
        relationship: "Mãe",
        phone: "(62) 99999-0001",
        type: "FAMILY",
      },
    ],
    medications: [
      {
        id: "m1",
        name: "Diazepam",
        dosage: "10mg",
        frequency: "1x ao dia (Noite)",
        responsibleDoctor: "Dr. Ribeiro",
        isActive: true,
      },
    ],
    evolutions: [
      {
        id: "e1",
        createdAt: "2026-04-08T09:30:00.000Z",
        observations: "Paciente apresentou boa adesão às atividades terapêuticas da semana.",
        weeklyEvolution: "Estável, com melhora no relacionamento com a equipe.",
      },
    ],
    alerts: ["Atualizar prontuário até sexta-feira"],
  },
  {
    id: "2",
    fullName: "Marcos Paulo Souza",
    cpf: "987.654.321-11",
    rg: "98.765.432-1",
    birthDate: "1990-09-02",
    maritalStatus: "Casado",
    nationality: "Brasileira",
    naturalness: "Anápolis - GO",
    addressOrStreetSituation: "Setor Sul, Anápolis/GO",
    profession: "Motorista",
    motherName: "Rosa Maria Souza",
    admissionDate: "2026-01-10",
    expectedExitDate: "2026-04-10",
    hospitalizationType: "Involuntária",
    status: "DISCHARGED",
    responsibles: [
      {
        id: "r2",
        fullName: "Aline Souza",
        relationship: "Esposa",
        phone: "(62) 99999-0002",
        type: "FAMILY",
      },
    ],
    medications: [],
    evolutions: [],
    alerts: [],
  },
  {
    id: "3",
    fullName: "Carlos Mendes",
    cpf: "456.123.789-22",
    rg: "45.612.378-9",
    birthDate: "1978-11-21",
    maritalStatus: "Divorciado",
    nationality: "Brasileira",
    naturalness: "Aparecida de Goiânia - GO",
    addressOrStreetSituation: "Setor Garavelo, Aparecida de Goiânia/GO",
    profession: "Vendedor",
    motherName: "Claudete Mendes",
    admissionDate: "2026-03-05",
    expectedExitDate: "2026-09-05",
    hospitalizationType: "Voluntária",
    status: "INTERNED",
    responsibles: [
      {
        id: "r3",
        fullName: "Paulo Mendes",
        relationship: "Irmão",
        phone: "(62) 99999-0003",
        type: "FAMILY",
      },
    ],
    medications: [
      {
        id: "m2",
        name: "Clonazepam",
        dosage: "2mg",
        frequency: "2x ao dia",
        responsibleDoctor: "Dra. Renata",
        isActive: true,
      },
    ],
    evolutions: [
      {
        id: "e2",
        createdAt: "2026-04-09T13:00:00.000Z",
        observations: "Paciente apresentou ansiedade no período da tarde.",
        occurrences: "Solicitou reforço da equipe multiprofissional.",
      },
    ],
    alerts: ["Revisar medicação com equipe médica"],
  },
  {
    id: "4",
    fullName: "Roberto Alves",
    cpf: "321.654.987-33",
    rg: "32.165.498-7",
    birthDate: "1982-01-18",
    maritalStatus: "Solteiro",
    nationality: "Brasileira",
    naturalness: "Trindade - GO",
    addressOrStreetSituation: "Sem residência fixa",
    profession: "Autônomo",
    motherName: "Sandra Alves",
    admissionDate: "2025-12-20",
    expectedExitDate: "2026-06-20",
    hospitalizationType: "Involuntária",
    status: "EVADED",
    responsibles: [
      {
        id: "r4",
        fullName: "Luciana Alves",
        relationship: "Irmã",
        phone: "(62) 99999-0004",
        type: "FAMILY",
      },
    ],
    medications: [],
    evolutions: [],
    alerts: ["Registrar ocorrência administrativa"],
  },
];

const recentActivity: TimelineItem[] = [
  {
    id: "t1",
    type: "admission",
    title: "Nova internação registrada",
    description: "João Carlos Silva foi admitido na unidade.",
    createdAt: "2026-04-10T14:00:00.000Z",
  },
  {
    id: "t2",
    type: "evolution",
    title: "Evolução clínica registrada",
    description: "Carlos Mendes teve atualização no prontuário.",
    createdAt: "2026-04-10T11:20:00.000Z",
  },
  {
    id: "t3",
    type: "alert",
    title: "Ocorrência importante",
    description: "Roberto Alves está com pendência administrativa de evasão.",
    createdAt: "2026-04-09T18:30:00.000Z",
  },
];

export function getDashboardSummary(): DashboardSummary {
  const activePatients = mockPatients.filter((patient) => patient.status === "INTERNED").length;
  const monthlyAdmissions = mockPatients.filter((patient) => patient.admissionDate.startsWith("2026-0")).length;
  const monthlyDischarges = mockPatients.filter((patient) => patient.status === "DISCHARGED").length;
  const dropoutRate = Number(((mockPatients.filter((patient) => patient.status === "EVADED").length / mockPatients.length) * 100).toFixed(1));
  const occupancyRate = 70;

  return {
    activePatients,
    monthlyAdmissions,
    monthlyDischarges,
    dropoutRate,
    occupancyRate,
    recentActivity,
    alerts: [
      "2 pacientes precisam de atualização de prontuário hoje.",
      "Revisar estoque de medicações controladas da semana.",
      "Conferir pendências documentais de novas admissões.",
    ],
  };
}

export function getPatientById(id: string) {
  return mockPatients.find((patient) => patient.id === id) ?? null;
}
