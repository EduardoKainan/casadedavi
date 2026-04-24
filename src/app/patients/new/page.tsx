"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPatient, createAdmission, createResponsible } from "@/lib/patient-service";
import { cn } from "@/lib/utils";

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    social_name: "",
    cpf: "",
    rg: "",
    birth_date: "",
    marital_status: "",
    nationality: "Brasileira",
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
  });

  const [admission, setAdmission] = useState({
    hospitalization_type: "VOLUNTARY" as "VOLUNTARY" | "INVOLUNTARY",
    admission_date: "",
    expected_exit_date: "",
    diagnosis: "",
    initial_condition: "",
    final_observations: "",
  });

  const [responsible, setResponsible] = useState({
    full_name: "",
    relationship: "",
    phone: "",
    email: "",
    type: "FAMILY" as "FAMILY" | "VOLUNTARY" | "OTHER",
    is_primary: true,
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith("adm_")) {
      const key = name.replace("adm_", "");
      setAdmission((prev) => ({ ...prev, [key]: value }));
    } else if (name.startsWith("resp_")) {
      const key = name.replace("resp_", "");
      setResponsible((prev) => ({ ...prev, [key]: type === "checkbox" ? checked : value }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1) Criar paciente
      const patient = await createPatient(form);

      // 2) Criar admissão
      await createAdmission({
        patient_id: patient.id,
        hospitalization_type: admission.hospitalization_type,
        admission_date: admission.admission_date,
        expected_exit_date: admission.expected_exit_date || undefined,
        diagnosis: admission.diagnosis || undefined,
        initial_condition: admission.initial_condition || undefined,
        final_observations: admission.final_observations || undefined,
      });

      // 3) Criar responsável (se preenchido)
      if (responsible.full_name.trim()) {
        await createResponsible({
          patient_id: patient.id,
          full_name: responsible.full_name,
          relationship: responsible.relationship,
          phone: responsible.phone || undefined,
          email: responsible.email || undefined,
          type: responsible.type,
          is_primary: responsible.is_primary,
          notes: responsible.notes || undefined,
        });
      }

      setSuccess(true);
      // Redireciona para o detalhe do paciente recém-criado
      router.push(`/patients/${patient.id}`);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar paciente. Tente novamente.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      full_name: "",
      social_name: "",
      cpf: "",
      rg: "",
      birth_date: "",
      marital_status: "",
      nationality: "Brasileira",
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
    });
    setAdmission({
      hospitalization_type: "VOLUNTARY",
      admission_date: "",
      expected_exit_date: "",
      diagnosis: "",
      initial_condition: "",
      final_observations: "",
    });
    setResponsible({
      full_name: "",
      relationship: "",
      phone: "",
      email: "",
      type: "FAMILY",
      is_primary: true,
      notes: "",
    });
  }

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h2>Novo Paciente</h2>
          <p className="text-muted">Preencha os dados do paciente e admissão inicial.</p>
        </div>
        <div className="header-actions">
          <Link href="/patients" className="btn btn-outline">Cancelar</Link>
          <button type="submit" form="patient-form" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Paciente"}
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: "var(--danger)", background: "rgba(220,38,38,0.04)" }}>
          <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p>
        </div>
      )}

      {success && (
        <div className="card" style={{ borderColor: "var(--success)", background: "rgba(21,128,61,0.04)" }}>
          <p style={{ color: "var(--success)", margin: 0 }}>Paciente cadastrado com sucesso. Redirecionando...</p>
        </div>
      )}

      <form id="patient-form" onSubmit={handleSubmit} onReset={(e) => { e.preventDefault(); resetForm(); }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Dados Pessoais</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Nome completo *
              </label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Nome social
              </label>
              <input name="social_name" value={form.social_name} onChange={handleChange} style={inputStyle} placeholder="Nome social (opcional)" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                CPF *
              </label>
              <input name="cpf" value={form.cpf} onChange={handleChange} required style={inputStyle} placeholder="000.000.000-00" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                RG
              </label>
              <input name="rg" value={form.rg} onChange={handleChange} style={inputStyle} placeholder="00.000.000-0" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Data de nascimento *
              </label>
              <input name="birth_date" value={form.birth_date} onChange={handleChange} type="date" required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Estado civil
              </label>
              <input name="marital_status" value={form.marital_status} onChange={handleChange} style={inputStyle} placeholder="Solteiro, Casado..." />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Nacionalidade
              </label>
              <input name="nationality" value={form.nationality} onChange={handleChange} style={inputStyle} placeholder="Brasileira" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Naturalidade
              </label>
              <input name="naturalness" value={form.naturalness} onChange={handleChange} style={inputStyle} placeholder="Cidade - UF" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Telefone
              </label>
              <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Profissão
              </label>
              <input name="profession" value={form.profession} onChange={handleChange} style={inputStyle} placeholder="Profissão" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Nome do pai
              </label>
              <input name="father_name" value={form.father_name} onChange={handleChange} style={inputStyle} placeholder="Nome do pai" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Nome da mãe
              </label>
              <input name="mother_name" value={form.mother_name} onChange={handleChange} style={inputStyle} placeholder="Nome da mãe" />
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem", fontWeight: 600 }}>
                <input type="checkbox" name="has_children" checked={form.has_children} onChange={handleChange} />
                Tem filhos?
              </label>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Quantidade de filhos
              </label>
              <input name="children_count" value={form.children_count} onChange={handleChange} type="number" min="0" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Cartão SUS
              </label>
              <input name="sus_card" value={form.sus_card} onChange={handleChange} style={inputStyle} placeholder="Número do cartão SUS" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Endereço
              </label>
              <input name="address_line" value={form.address_line} onChange={handleChange} style={inputStyle} placeholder="Logradouro, número, complemento" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Bairro
              </label>
              <input name="neighborhood" value={form.neighborhood} onChange={handleChange} style={inputStyle} placeholder="Bairro" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Cidade
              </label>
              <input name="city" value={form.city} onChange={handleChange} style={inputStyle} placeholder="Cidade" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Estado
              </label>
              <input name="state" value={form.state} onChange={handleChange} style={inputStyle} placeholder="UF" maxLength={2} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                CEP
              </label>
              <input name="zip_code" value={form.zip_code} onChange={handleChange} style={inputStyle} placeholder="00000-000" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Observações gerais
              </label>
              <textarea name="general_notes" value={form.general_notes} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Observações adicionais" />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Admissão</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Tipo de internação
              </label>
              <select name="adm_hospitalization_type" value={admission.hospitalization_type} onChange={handleChange} required style={inputStyle}>
                <option value="VOLUNTARY">Voluntária</option>
                <option value="INVOLUNTARY">Involuntária</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Data de entrada *
              </label>
              <input name="adm_admission_date" value={admission.admission_date} onChange={handleChange} type="date" required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Previsão de saída
              </label>
              <input name="adm_expected_exit_date" value={admission.expected_exit_date} onChange={handleChange} type="date" style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Diagnóstico inicial
              </label>
              <textarea name="adm_diagnosis" value={admission.diagnosis} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: "vertical" }} placeholder="Diagnóstico ou motivo da internação" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Condição inicial
              </label>
              <textarea name="adm_initial_condition" value={admission.initial_condition} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: "vertical" }} placeholder="Estado clínico na admissão" />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Responsável Principal</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Nome completo
              </label>
              <input name="resp_full_name" value={responsible.full_name} onChange={handleChange} style={inputStyle} placeholder="Nome do responsável" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Parentesco
              </label>
              <input name="resp_relationship" value={responsible.relationship} onChange={handleChange} style={inputStyle} placeholder="Mãe, Pai, Irmão..." />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Telefone
              </label>
              <input name="resp_phone" value={responsible.phone} onChange={handleChange} style={inputStyle} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Email
              </label>
              <input name="resp_email" value={responsible.email} onChange={handleChange} type="email" style={inputStyle} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem", fontWeight: 600 }}>
                <input type="checkbox" name="resp_is_primary" checked={responsible.is_primary} onChange={handleChange} />
                Principal
              </label>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Tipo
              </label>
              <select name="resp_type" value={responsible.type} onChange={handleChange} style={inputStyle}>
                <option value="FAMILY">Familiar</option>
                <option value="VOLUNTARY">Voluntário</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8125rem", fontWeight: 600 }}>
                Observações
              </label>
              <textarea name="resp_notes" value={responsible.notes} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: "vertical" }} placeholder="Observações sobre o responsável" />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button type="reset" className="btn btn-outline">Limpar</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Paciente"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  fontSize: "0.875rem",
  background: "rgba(255,255,255,0.8)",
  transition: "border-color 0.2s, box-shadow 0.2s",
  outline: "none",
};
