"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Pill,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { getSupabaseClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import "./medications.css";

type Medication = {
  id: string;
  patient_id: string;
  patient_name: string;
  name: string;
  dosage: string;
  frequency: string;
  route?: string;
  responsible_doctor?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
};

type MedicationRow = Omit<Medication, "patient_name"> & {
  patients?: { full_name?: string | null } | null;
};

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState<{ id: string; full_name: string }[]>([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    name: "",
    dosage: "",
    frequency: "",
    route: "",
    responsible_doctor: "",
    start_date: "",
    end_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMedications();
    fetchPatients();
  }, []);

  async function fetchMedications() {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("medications")
        .select(`
          *,
          patients:patient_id (full_name)
        `)
        .order("is_active", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted: Medication[] = ((data || []) as MedicationRow[]).map((item) => ({
        ...item,
        patient_name: item.patients?.full_name || "Desconhecido",
      }));

      setMedications(formatted);
    } catch (error) {
      console.error("Erro ao buscar medicações:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPatients() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name")
        .order("full_name");

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
    }
  }

  const filteredMedications = medications.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.patient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? med.is_active
        : !med.is_active;
    return matchesSearch && matchesStatus;
  });

  const activeCount = medications.filter((m) => m.is_active).length;
  const inactiveCount = medications.filter((m) => !m.is_active).length;
  const expiringSoon = medications.filter((m) => {
    if (!m.end_date || !m.is_active) return false;
    const end = new Date(m.end_date);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // 7 dias
  }).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.name || !formData.dosage || !formData.frequency) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("medications").insert([
        {
          ...formData,
          is_active: true,
        },
      ]);

      if (error) throw error;

      setShowModal(false);
      setFormData({
        patient_id: "",
        name: "",
        dosage: "",
        frequency: "",
        route: "",
        responsible_doctor: "",
        start_date: "",
        end_date: "",
        notes: "",
      });
      fetchMedications();
    } catch (error) {
      console.error("Erro ao salvar medicação:", error);
      alert("Erro ao salvar medicação");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("medications")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      fetchMedications();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  return (
    <div className="medications-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold">Controle de Medicações</h2>
          <p className="text-muted">Gerencie prescrições, administração e controle de estoque.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Nova Medicação
        </button>
      </div>

      {/* Stats */}
      <div className="medications-stats">
        <div className="stat-card">
          <Pill size={24} className="text-primary" />
          <div>
            <strong>{activeCount}</strong>
            <span>Ativas</span>
          </div>
        </div>
        <div className="stat-card">
          <XCircle size={24} className="text-muted" />
          <div>
            <strong>{inactiveCount}</strong>
            <span>Inativas</span>
          </div>
        </div>
        <div className="stat-card">
          <AlertTriangle size={24} className="text-warning" />
          <div>
            <strong>{expiringSoon}</strong>
            <span>Expiram em 7 dias</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="medications-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por medicamento ou paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {(["all", "active", "inactive"] as const).map((status) => (
              <button
                key={status}
                className={cn("filter-tab", filterStatus === status && "active")}
                onClick={() => setFilterStatus(status)}
              >
                {status === "all" && "Todas"}
                {status === "active" && "Ativas"}
                {status === "inactive" && "Inativas"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : filteredMedications.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="Nenhuma medicação encontrada"
            description="Cadastre a primeira prescrição para iniciar o controle."
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Paciente</th>
                  <th>Dosagem</th>
                  <th>Frequência</th>
                  <th>Início</th>
                  <th>Término</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedications.map((med) => (
                  <tr key={med.id}>
                    <td>
                      <div className="medication-name">
                        <Pill size={16} />
                        <span>{med.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="patient-cell">
                        <User size={14} />
                        {med.patient_name}
                      </div>
                    </td>
                    <td>{med.dosage}</td>
                    <td>
                      <div className="frequency-cell">
                        <Clock size={14} />
                        {med.frequency}
                      </div>
                    </td>
                    <td>
                      {med.start_date
                        ? new Date(med.start_date).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td>
                      {med.end_date
                        ? new Date(med.end_date).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td>
                      <StatusBadge tone={med.is_active ? "success" : "warning"}>
                        {med.is_active ? "Ativo" : "Inativo"}
                      </StatusBadge>
                    </td>
                    <td className="text-right">
                      <button
                        className={cn("icon-btn", med.is_active ? "text-warning" : "text-success")}
                        onClick={() => toggleStatus(med.id, med.is_active)}
                        title={med.is_active ? "Desativar" : "Ativar"}
                      >
                        {med.is_active ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova Medicação</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Paciente *</label>
                <select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="form-input"
                  required
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Medicamento *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Nome do medicamento"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Dosagem *</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="form-input"
                    placeholder="Ex: 500mg"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Frequência *</label>
                  <input
                    type="text"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="form-input"
                    placeholder="Ex: 8/8h"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Via de administração</label>
                <select
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  className="form-input"
                >
                  <option value="">Selecione</option>
                  <option value="Oral">Oral</option>
                  <option value="Intravenosa">Intravenosa</option>
                  <option value="Intramuscular">Intramuscular</option>
                  <option value="Subcutânea">Subcutânea</option>
                  <option value="Tópica">Tópica</option>
                  <option value="Retal">Retal</option>
                  <option value="Inalatória">Inalatória</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Médico responsável</label>
                <input
                  type="text"
                  value={formData.responsible_doctor}
                  onChange={(e) => setFormData({ ...formData, responsible_doctor: e.target.value })}
                  className="form-input"
                  placeholder="Nome do médico"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Data de início</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Data de término</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input"
                  rows={3}
                  placeholder="Observações adicionais"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Cadastrar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
