-- Schema do banco no Supabase.
-- Rode uma vez no SQL Editor do projeto (Supabase → SQL Editor → New query).
-- As políticas de RLS garantem que cada usuário só lê e grava os próprios dados.

create table public.transacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  tipo text not null check (tipo in ('renda', 'despesa')),
  descricao text not null,
  valor numeric(12, 2) not null check (valor > 0),
  categoria text not null,
  data date not null,
  criado_em timestamptz not null default now()
);

create index transacoes_usuario_data on public.transacoes (user_id, data desc);

-- Limite de gastos por mês ('YYYY-MM')
create table public.limites (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  mes text not null check (mes ~ '^\d{4}-\d{2}$'),
  valor numeric(12, 2) not null check (valor > 0),
  primary key (user_id, mes)
);

alter table public.transacoes enable row level security;
alter table public.limites enable row level security;

create policy "dono" on public.transacoes for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "dono" on public.limites for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
