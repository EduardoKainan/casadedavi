"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Bell,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { cn } from "@/lib/utils";
import "./settings.css";

const tabs = [
  { id: "unit", label: "Unidade", icon: Building2 },
  { id: "users", label: "Usuários", icon: Users },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "security", label: "Segurança", icon: Shield },
] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("unit");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Unit settings
  const [unitData, setUnitData] = useState({
    name: "Casa de Davi",
    cnpj: "",
    address: "",
    phone: "",
    email: "",
    capacity: 30,
    director: "",
    license: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    medicationReminders: true,
    admissionNotifications: true,
    dischargeNotifications: false,
    dailyReports: true,
    weeklyReports: false,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-container">
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold">Configurações</h2>
          <p className="text-muted">
            Gerencie dados da unidade, usuários e preferências do sistema.
          </p>
        </div>
        <button
          className={cn("btn", saved ? "btn-success" : "btn-primary")}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 size={18} />
              Salvo!
            </>
          ) : (
            <>
              <Save size={18} />
              Salvar alterações
            </>
          )}
        </button>
      </div>

      <div className="settings-layout">
        {/* Sidebar tabs */}
        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={cn("settings-tab", activeTab === tab.id && "active")}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="settings-content">
          {activeTab === "unit" && (
            <div className="settings-section">
              <SectionCard
                title="Dados da Unidade"
                description="Informações cadastrais da instituição"
              >
                <div className="settings-form">
                  <div className="form-group">
                    <label className="form-label">Nome da unidade</label>
                    <input
                      type="text"
                      value={unitData.name}
                      onChange={(e) =>
                        setUnitData({ ...unitData, name: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">CNPJ</label>
                      <input
                        type="text"
                        value={unitData.cnpj}
                        onChange={(e) =>
                          setUnitData({ ...unitData, cnpj: e.target.value })
                        }
                        className="form-input"
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Capacidade</label>
                      <input
                        type="number"
                        value={unitData.capacity}
                        onChange={(e) =>
                          setUnitData({
                            ...unitData,
                            capacity: Number(e.target.value),
                          })
                        }
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Endereço</label>
                    <input
                      type="text"
                      value={unitData.address}
                      onChange={(e) =>
                        setUnitData({ ...unitData, address: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Telefone</label>
                      <input
                        type="tel"
                        value={unitData.phone}
                        onChange={(e) =>
                          setUnitData({ ...unitData, phone: e.target.value })
                        }
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">E-mail</label>
                      <input
                        type="email"
                        value={unitData.email}
                        onChange={(e) =>
                          setUnitData({ ...unitData, email: e.target.value })
                        }
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Diretor responsável</label>
                      <input
                        type="text"
                        value={unitData.director}
                        onChange={(e) =>
                          setUnitData({
                            ...unitData,
                            director: e.target.value,
                          })
                        }
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Nº da licença/Alvará
                      </label>
                      <input
                        type="text"
                        value={unitData.license}
                        onChange={(e) =>
                          setUnitData({ ...unitData, license: e.target.value })
                        }
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === "users" && (
            <div className="settings-section">
              <SectionCard
                title="Usuários do Sistema"
                description="Gerencie acessos e permissões"
                actions={
                  <button className="btn btn-primary btn-sm">
                    <Users size={16} />
                    Novo usuário
                  </button>
                }
              >
                <div className="users-list">
                  {[
                    {
                      name: "Administrador",
                      email: "admin@casadedavi.com",
                      role: "Administrador",
                      status: "active",
                    },
                    {
                      name: "Dr. Silva",
                      email: "dr.silva@casadedavi.com",
                      role: "Médico",
                      status: "active",
                    },
                    {
                      name: "Enf. Maria",
                      email: "maria@casadedavi.com",
                      role: "Enfermeiro",
                      status: "active",
                    },
                  ].map((user, index) => (
                    <div key={index} className="user-item">
                      <div className="user-avatar">
                        {user.name.charAt(0)}
                      </div>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                      <span className="user-role">{user.role}</span>
                      <span
                        className={cn(
                          "user-status",
                          user.status === "active" && "active"
                        )}
                      >
                        {user.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="settings-section">
              <SectionCard
                title="Preferências de Notificação"
                description="Configure quais alertas deseja receber"
              >
                <div className="notifications-list">
                  {[
                    {
                      key: "emailAlerts",
                      label: "Alertas por e-mail",
                      description: "Receba alertas importantes por e-mail",
                    },
                    {
                      key: "medicationReminders",
                      label: "Lembretes de medicação",
                      description: "Notificações sobre horários de medicação",
                    },
                    {
                      key: "admissionNotifications",
                      label: "Novas admissões",
                      description: "Seja notificado quando um paciente for admitido",
                    },
                    {
                      key: "dischargeNotifications",
                      label: "Altas e evasões",
                      description: "Notificações sobre saídas de pacientes",
                    },
                    {
                      key: "dailyReports",
                      label: "Relatório diário",
                      description: "Resumo diário da unidade",
                    },
                    {
                      key: "weeklyReports",
                      label: "Relatório semanal",
                      description: "Resumo semanal com indicadores",
                    },
                  ].map((item) => (
                    <div key={item.key} className="notification-item">
                      <div className="notification-info">
                        <strong>{item.label}</strong>
                        <span>{item.description}</span>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={
                            notifications[item.key as keyof typeof notifications]
                          }
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [item.key]: e.target.checked,
                            })
                          }
                        />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === "security" && (
            <div className="settings-section">
              <SectionCard
                title="Segurança"
                description="Configurações de acesso e privacidade"
              >
                <div className="security-options">
                  <div className="security-item">
                    <div>
                      <strong>Autenticação em duas etapas</strong>
                      <span>
                        Adicione uma camada extra de segurança ao login
                      </span>
                    </div>
                    <button className="btn btn-outline btn-sm">
                      Configurar
                    </button>
                  </div>

                  <div className="security-item">
                    <div>
                      <strong>Sessões ativas</strong>
                      <span>Gerencie dispositivos conectados</span>
                    </div>
                    <button className="btn btn-outline btn-sm">
                      Visualizar
                    </button>
                  </div>

                  <div className="security-item">
                    <div>
                      <strong>Logs de auditoria</strong>
                      <span>Histórico de ações no sistema</span>
                    </div>
                    <button className="btn btn-outline btn-sm">
                      Visualizar
                    </button>
                  </div>

                  <div className="security-item danger">
                    <div>
                      <strong>Zona de perigo</strong>
                      <span>
                        Ações irreversíveis para a conta e dados
                      </span>
                    </div>
                    <button className="btn btn-danger btn-sm">
                      Ações
                    </button>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
