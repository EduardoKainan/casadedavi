import { NextResponse } from "next/server";
import { createAdmission, createPatient, createResponsible, deletePatient } from "@/lib/patient-service";

type NewPatientRequest = {
  patient: Parameters<typeof createPatient>[0];
  admission: Omit<Parameters<typeof createAdmission>[0], "patient_id">;
  responsible?: Omit<Parameters<typeof createResponsible>[0], "patient_id">;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erro inesperado ao salvar paciente.";
}

export async function POST(request: Request) {
  let createdPatientId: string | null = null;

  try {
    const body = (await request.json()) as NewPatientRequest;

    const patient = await createPatient(body.patient);
    createdPatientId = patient.id;

    await createAdmission({
      ...body.admission,
      patient_id: patient.id,
    });

    if (body.responsible?.full_name?.trim()) {
      await createResponsible({
        ...body.responsible,
        patient_id: patient.id,
      });
    }

    return NextResponse.json({ id: patient.id }, { status: 201 });
  } catch (error) {
    if (createdPatientId) {
      try {
        await deletePatient(createdPatientId);
      } catch (cleanupError) {
        console.error("Erro ao desfazer cadastro incompleto:", cleanupError);
      }
    }

    console.error("Erro ao cadastrar paciente:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}
