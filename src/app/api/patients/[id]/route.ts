import { NextResponse } from "next/server";
import { deletePatient, findPatient, updatePatient } from "@/lib/patient-service";

type UpdatePatientRequest = Partial<{
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
}>;

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const patient = await findPatient(id);

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Erro ao buscar paciente:", error);
    return NextResponse.json(
      { error: errorMessage(error, "Erro inesperado ao buscar paciente.") },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdatePatientRequest;
    const patient = await updatePatient(id, body);
    return NextResponse.json(patient);
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);
    return NextResponse.json(
      { error: errorMessage(error, "Erro inesperado ao atualizar paciente.") },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deletePatient(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);
    return NextResponse.json(
      { error: errorMessage(error, "Erro inesperado ao excluir paciente.") },
      { status: 400 },
    );
  }
}
