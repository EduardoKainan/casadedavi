import Link from "next/link";
import { ArrowLeft, Save, ShieldCheck, UserPlus } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { SectionCard } from "@/components/section-card";
import "./form.css";

export default function NewPatientPage() {
  return (
    <div className="form-container">
      <div className="header-breadcrumbs">
        <Link href="/patients" className="back-link">
          <ArrowLeft size={18} />
          <span>Voltar para Lista</span>
        </Link>
      </div>

      <PageIntro
        title="Cadastrar Novo Interno"
        description="Preencha os dados essenciais para iniciar a jornada do paciente com prontuário estruturado."
        actions={
          <button type="submit" form="new-patient-form" className="btn btn-primary">
            <Save size={18} />
            <span>Salvar Cadastro</span>
          </button>
        }
      />

      <div className="form-highlight-grid">
        <div className="card highlight-card">
          <UserPlus size={18} />
          <div>
            <strong>Cadastro inicial rápido</strong>
            <p className="text-muted">Priorize os campos mínimos para registrar a entrada sem travar a operação.</p>
          </div>
        </div>
        <div className="card highlight-card">
          <ShieldCheck size={18} />
          <div>
            <strong>Dados sensíveis</strong>
            <p className="text-muted">Esse fluxo deve evoluir com autenticação, auditoria e controle de acesso por perfil.</p>
          </div>
        </div>
      </div>

      <form id="new-patient-form" className="form-wrapper">
        <SectionCard title="Dados Pessoais do Interno" description="Identificação civil e contexto social básico.">
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label>Nome Completo*</label>
              <input type="text" required placeholder="Digite o nome completo" />
            </div>
            <div className="form-group">
              <label>Data de Nascimento*</label>
              <input type="date" required />
            </div>
            <div className="form-group">
              <label>CPF*</label>
              <input type="text" required placeholder="000.000.000-00" />
            </div>
            <div className="form-group">
              <label>RG*</label>
              <input type="text" required placeholder="Apenas números" />
            </div>
            <div className="form-group">
              <label>Naturalidade</label>
              <input type="text" placeholder="Ex: Goiânia - GO" />
            </div>
            <div className="form-group">
              <label>Nacionalidade</label>
              <input type="text" placeholder="Ex: Brasileira" defaultValue="Brasileira" />
            </div>
            <div className="form-group">
              <label>Estado Civil</label>
              <select>
                <option value="">Selecione...</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nome da Mãe*</label>
              <input type="text" required placeholder="Nome completo da mãe" />
            </div>
            <div className="form-group">
              <label>Nome do Pai</label>
              <input type="text" placeholder="Nome completo do pai" />
            </div>
            <div className="form-group">
              <label>Profissão</label>
              <input type="text" placeholder="Profissão atual ou anterior" />
            </div>
            <div className="form-group">
              <label>Filhos</label>
              <select>
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label>Endereço ou Situação de Rua*</label>
              <input type="text" required placeholder="Rua, número, bairro, CEP ou descrição da situação" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Dados da Internação" description="Informações operacionais da entrada do paciente.">
          <div className="form-grid">
            <div className="form-group">
              <label>Tipo de Internação*</label>
              <select required>
                <option value="VOLUNTARY">Voluntária</option>
                <option value="INVOLUNTARY">Involuntária</option>
              </select>
            </div>
            <div className="form-group">
              <label>Data de Entrada*</label>
              <input type="date" required />
            </div>
            <div className="form-group">
              <label>Previsão de Saída</label>
              <input type="date" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Responsável pela Internação" description="Contato principal para comunicação e suporte documental.">
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label>Nome do Responsável*</label>
              <input type="text" required placeholder="Nome completo" />
            </div>
            <div className="form-group">
              <label>Parentesco / Vínculo*</label>
              <input type="text" required placeholder="Ex: Mãe, Esposa, Amigo" />
            </div>
            <div className="form-group">
              <label>Telefone*</label>
              <input type="tel" required placeholder="(00) 00000-0000" />
            </div>
            <div className="form-group">
              <label>Tipo de Responsável*</label>
              <select required>
                <option value="FAMILY">Familiar</option>
                <option value="VOLUNTARY">Voluntário (Amigo/Conhecido)</option>
                <option value="OTHER">Outro (Justiça, Clínica)</option>
              </select>
            </div>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}
