"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

type EditPatientFormData = {
  full_name: string;
  social_name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  marital_status: string;
  nationality: string;
  naturalness: string;
  phone: string;
  profession: string;
  father_name: string;
  mother_name: string;
  has_children: boolean;
  children_count: number;
  sus_card: string;
  address_line: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  address_notes: string;
  general_notes: string;
};

type PatientResponse = {
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
  addressLine?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  addressNotes?: string;
  generalNotes?: string;
};

const initialFormData: EditPatientFormData = {
  full_name: "",
  social_name: "",
  cpf: "",
  rg: "",
  birth_date: "",
  marital_status: "",
  nationality: "",
  naturalness: "",
  phone: "",
  profession: "",
  father_name: "",
  mother_name: "",
  has_children: false,
  children_count: 0,
  sus_card: "",
  address_line: "",
  neighborhood: "",
  city: "",
  state: "",
  zip_code: "",
  address_notes: "",
  general_notes: "",
};

function toFormData(patient: PatientResponse): EditPatientFormData {
  return {
    full_name: patient.fullName,
    social_name: patient.socialName || "",
    cpf: patient.cpf,
    rg: patient.rg || "",
    birth_date: patient.birthDate,
    marital_status: patient.maritalStatus || "",
    nationality: patient.nationality || "",
    naturalness: patient.naturalness || "",
    phone: patient.phone || "",
    profession: patient.profession || "",
    father_name: patient.fatherName || "",
    mother_name: patient.motherName || "",
    has_children: patient.hasChildren || false,
    children_count: patient.childrenCount || 0,
    sus_card: patient.susCard || "",
    address_line: patient.addressLine || "",
    neighborhood: patient.neighborhood || "",
    city: patient.city || "",
    state: patient.state || "",
    zip_code: patient.zipCode || "",
    address_notes: patient.addressNotes || "",
    general_notes: patient.generalNotes || "",
  };
}

export default function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditPatientFormData>(initialFormData);

  useEffect(() => {
    let active = true;

    async function loadPatient() {
      try {
        const resolvedParams = await params;
        if (!active) return;

        setId(resolvedParams.id);

        const response = await fetch(`/api/patients/${resolvedParams.id}`, {
          method: "GET",
          cache: "no-store",
        });
        const result = (await response.json().catch(() => ({}))) as PatientResponse & { error?: string };

        if (!response.ok) {
          throw new Error(result.error || "Erro ao carregar paciente.");
        }

        if (active) {
          setFormData(toFormData(result));
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Erro ao carregar paciente.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPatient();

    return () => {
      active = false;
    };
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          children_count: Number(formData.children_count),
        }),
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Erro ao atualizar paciente. Tente novamente.");
      }

      router.push(`/patients/${id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao atualizar paciente. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error && !id) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card" style={{ borderColor: "var(--danger)", background: "rgba(220,38,38,0.04)" }}>
          <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/patients/${id}`} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Editar Paciente</h1>
      </div>

      {error ? (
        <div className="card" style={{ borderColor: "var(--danger)", background: "rgba(220,38,38,0.04)", marginBottom: 16 }}>
          <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Nome completo *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nome social</label>
            <input
              type="text"
              name="social_name"
              value={formData.social_name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">CPF *</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">RG</label>
            <input
              type="text"
              name="rg"
              value={formData.rg}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Data de nascimento *</label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estado civil</label>
            <select
              name="marital_status"
              value={formData.marital_status}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Selecione</option>
              <option value="Solteiro">Solteiro</option>
              <option value="Casado">Casado</option>
              <option value="Divorciado">Divorciado</option>
              <option value="Viúvo">Viúvo</option>
              <option value="Separado">Separado</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Profissão</label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nome da mãe</label>
            <input
              type="text"
              name="mother_name"
              value={formData.mother_name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nome do pai</label>
            <input
              type="text"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cartão SUS</label>
            <input
              type="text"
              name="sus_card"
              value={formData.sus_card}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group md:col-span-2">
            <label className="form-label">Endereço</label>
            <input
              type="text"
              name="address_line"
              value={formData.address_line}
              onChange={handleChange}
              className="form-input"
              placeholder="Rua, número, complemento"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bairro</label>
            <input
              type="text"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cidade</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estado</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="form-input"
              maxLength={2}
              placeholder="UF"
            />
          </div>

          <div className="form-group">
            <label className="form-label">CEP</label>
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Naturalidade</label>
            <input
              type="text"
              name="naturalness"
              value={formData.naturalness}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nacionalidade</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                name="has_children"
                checked={formData.has_children}
                onChange={handleChange}
              />
              Tem filhos?
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Quantidade de filhos</label>
            <input
              type="number"
              name="children_count"
              value={formData.children_count}
              onChange={handleChange}
              className="form-input"
              min={0}
            />
          </div>

          <div className="form-group md:col-span-2">
            <label className="form-label">Observações de endereço</label>
            <textarea
              name="address_notes"
              value={formData.address_notes}
              onChange={handleChange}
              className="form-input"
              rows={3}
            />
          </div>

          <div className="form-group md:col-span-2">
            <label className="form-label">Observações gerais</label>
            <textarea
              name="general_notes"
              value={formData.general_notes}
              onChange={handleChange}
              className="form-input"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <Link href={`/patients/${id}`} className="btn btn-outline">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
