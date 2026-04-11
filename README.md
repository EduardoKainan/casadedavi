# Casa de Davi App

Sistema de gestão para clínica de recuperação, com foco em cadastro de internos, prontuário, acompanhamento clínico e operação administrativa.

## Stack

- Next.js 16
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- Vercel para deploy

## Status atual

O projeto já está preparado para deploy na Vercel com:

- build validado
- lint validado
- estrutura em `src/`
- Prisma ajustado para a sintaxe do Prisma 7
- telas iniciais refatoradas (`dashboard`, `patients`, `patient detail`, `new patient`)

## Rodando localmente

```bash
npm install
npx prisma generate
npm run dev
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

Obrigatórias para produção:

- `DATABASE_URL`
- `DIRECT_URL`

O restante pode entrar depois, conforme a integração real com Supabase evoluir.

## Prisma

Gerar client:

```bash
npx prisma generate
```

Se for usar migrations:

```bash
npx prisma migrate deploy
```

## Deploy na Vercel

### Configuração recomendada

- Framework Preset: `Next.js`
- Root Directory: `casa-de-davi-app`
- Install Command: `npm install`
- Build Command: `npx prisma generate && next build`

### Environment Variables na Vercel

Adicionar no painel da Vercel:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL` (se usar)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (se usar)
- `SUPABASE_SERVICE_ROLE_KEY` (se usar backoffice/rotinas server)

## Checklist antes do deploy real

- [ ] Banco Postgres acessível externamente
- [ ] `DATABASE_URL` e `DIRECT_URL` válidas
- [ ] Rodar `npx prisma generate`
- [ ] Se houver migrations, rodar `npx prisma migrate deploy`
- [ ] Confirmar que o projeto está apontando para dados reais, não apenas mocks

## Banco e modelagem

Arquivos adicionados para a próxima etapa:

- `prisma/schema.prisma` → modelagem refatorada para operação real
- `prisma/supabase-schema.sql` → script inicial para criação do banco no Supabase

### Estrutura principal

- `profiles`
- `patients`
- `responsible_people`
- `admissions`
- `medications`
- `evolution_records`
- `patient_documents`
- `patient_occurrences`
- `audit_logs`

## Próximos passos técnicos

1. Aplicar `prisma/supabase-schema.sql` no projeto Supabase
2. Conectar `DATABASE_URL` e `DIRECT_URL` reais
3. Substituir `mock-data` por leitura real via Prisma
4. Criar CRUD real de pacientes
5. Adicionar autenticação e perfis
6. Implementar documentos, saída e auditoria
