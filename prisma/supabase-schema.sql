create extension if not exists "pgcrypto";

create type user_role as enum ('ADMIN', 'EMPLOYEE', 'NURSE', 'DOCTOR', 'SOCIAL_WORKER');
create type responsible_type as enum ('FAMILY', 'VOLUNTARY', 'OTHER');
create type hospitalization_type as enum ('VOLUNTARY', 'INVOLUNTARY');
create type hospitalization_status as enum ('INTERNED', 'DISCHARGED', 'DISCONNECTED', 'EVADED');
create type exit_reason as enum ('DISCHARGE', 'GIVE_UP', 'EXPULSION', 'OTHER');
create type document_type as enum ('RG', 'CPF', 'SUS_CARD', 'MEDICAL_REPORT', 'ADMISSION_TERM', 'COURT_ORDER', 'OTHER');
create type occurrence_type as enum ('CLINICAL', 'DISCIPLINARY', 'ADMINISTRATIVE', 'FAMILY', 'EMERGENCY', 'OTHER');

create table profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text,
  role user_role not null default 'EMPLOYEE',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  social_name text,
  cpf text not null unique,
  rg text,
  birth_date date not null,
  naturalness text,
  nationality text default 'Brasileira',
  marital_status text,
  profession text,
  phone text,
  sus_card text,
  father_name text,
  mother_name text,
  has_children boolean not null default false,
  children_count integer not null default 0,
  address_line text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  address_notes text,
  general_notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table responsible_people (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  full_name text not null,
  relationship text not null,
  phone text,
  email text,
  type responsible_type not null default 'FAMILY',
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table admissions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  hospitalization_type hospitalization_type not null default 'VOLUNTARY',
  status hospitalization_status not null default 'INTERNED',
  admission_date date not null,
  expected_exit_date date,
  exit_date date,
  exit_reason exit_reason,
  referral_source text,
  diagnosis text,
  initial_condition text,
  final_observations text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  admission_id uuid references admissions(id) on delete set null,
  name text not null,
  dosage text not null,
  frequency text not null,
  route text,
  responsible_doctor text,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table evolution_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  admission_id uuid references admissions(id) on delete set null,
  record_date timestamptz not null default now(),
  observations text not null,
  weekly_evolution text,
  occurrences text,
  mood text,
  conducted_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table patient_documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  admission_id uuid references admissions(id) on delete set null,
  type document_type not null default 'OTHER',
  title text not null,
  file_path text,
  file_url text,
  is_delivered boolean not null default false,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table patient_occurrences (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  admission_id uuid references admissions(id) on delete set null,
  occurrence_type occurrence_type not null default 'OTHER',
  title text not null,
  description text not null,
  severity integer not null default 1 check (severity between 1 and 5),
  occurred_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  entity_name text not null,
  entity_id uuid,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index idx_patients_full_name on patients(full_name);
create index idx_patients_cpf on patients(cpf);
create index idx_responsible_people_patient_id on responsible_people(patient_id);
create index idx_admissions_patient_id on admissions(patient_id);
create index idx_admissions_status on admissions(status);
create index idx_medications_patient_id on medications(patient_id);
create index idx_medications_is_active on medications(is_active);
create index idx_evolution_records_patient_id on evolution_records(patient_id);
create index idx_patient_documents_patient_id on patient_documents(patient_id);
create index idx_patient_occurrences_patient_id on patient_occurrences(patient_id);
create index idx_audit_logs_entity on audit_logs(entity_name, entity_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles
for each row execute function set_updated_at();

create trigger trg_patients_updated_at before update on patients
for each row execute function set_updated_at();

create trigger trg_responsible_people_updated_at before update on responsible_people
for each row execute function set_updated_at();

create trigger trg_admissions_updated_at before update on admissions
for each row execute function set_updated_at();

create trigger trg_medications_updated_at before update on medications
for each row execute function set_updated_at();

create trigger trg_evolution_records_updated_at before update on evolution_records
for each row execute function set_updated_at();

create trigger trg_patient_documents_updated_at before update on patient_documents
for each row execute function set_updated_at();

create trigger trg_patient_occurrences_updated_at before update on patient_occurrences
for each row execute function set_updated_at();
