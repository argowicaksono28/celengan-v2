-- ============================================================
-- Celengan V2 — Initial Database Migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                    uuid references auth.users on delete cascade primary key,
  name                  text,
  plan                  text not null default 'FREE' check (plan in ('FREE','PRO')),
  monthly_budget        numeric(15,0),
  onboarding_completed  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ──────────────────────────────────────────────────────────────
-- 2. ACCOUNTS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.accounts (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  name        text not null,
  type        text not null check (type in ('CASH','BANK','EWALLET','SAVINGS_POCKET','CUSTOM')),
  balance     numeric(15,0) not null default 0,
  icon        text not null default 'Wallet',
  color       text not null default '#68B684',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index idx_accounts_user_id on public.accounts(user_id);

alter table public.accounts enable row level security;

create policy "Users can manage own accounts"
  on public.accounts for all
  using (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────
-- 3. CATEGORIES
-- ──────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade,  -- null = default category
  name        text not null,
  icon        text not null,
  color       text not null,
  tx_type     text not null default 'EXPENSE' check (tx_type in ('EXPENSE','INCOME','BOTH')),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_categories_user_id on public.categories(user_id);

alter table public.categories enable row level security;

-- Users see default categories (user_id is null) + their own
create policy "Users can view categories"
  on public.categories for select
  using (user_id is null or auth.uid() = user_id);

create policy "Users can manage own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id and is_default = false);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id and is_default = false);


-- ──────────────────────────────────────────────────────────────
-- 4. TRANSACTIONS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id                      uuid default gen_random_uuid() primary key,
  user_id                 uuid references auth.users on delete cascade not null,
  account_id              uuid references public.accounts on delete set null,
  category_id             uuid references public.categories on delete set null,
  type                    text not null check (type in ('INCOME','EXPENSE','TRANSFER')),
  amount                  numeric(15,0) not null,
  note                    text,
  date                    date not null default current_date,
  transfer_to_account_id  uuid references public.accounts on delete set null,
  created_at              timestamptz not null default now()
);

create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_date on public.transactions(user_id, date desc);
create index idx_transactions_account on public.transactions(account_id);
create index idx_transactions_category on public.transactions(category_id);

alter table public.transactions enable row level security;

create policy "Users can manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id);

-- Enable realtime for transactions
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.accounts;


-- ──────────────────────────────────────────────────────────────
-- 5. BUDGETS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.budgets (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users on delete cascade not null,
  category_id  uuid references public.categories on delete cascade,  -- null = overall budget
  amount       numeric(15,0) not null,
  month        smallint not null check (month between 1 and 12),
  year         smallint not null,
  created_at   timestamptz not null default now(),
  unique (user_id, category_id, month, year)
);

-- Partial unique index: only one overall budget (null category_id) per user per month/year
create unique index if not exists idx_budgets_overall_unique
  on public.budgets (user_id, month, year)
  where category_id is null;

create index idx_budgets_user_month on public.budgets(user_id, month, year);

alter table public.budgets enable row level security;

create policy "Users can manage own budgets"
  on public.budgets for all
  using (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────
-- 6. GOALS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.goals (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users on delete cascade not null,
  name                text not null,
  target_amount       numeric(15,0) not null,
  saved_amount        numeric(15,0) not null default 0,
  deadline            date,
  linked_account_id   uuid references public.accounts on delete set null,
  icon                text default '🎯',
  is_completed        boolean not null default false,
  created_at          timestamptz not null default now()
);

create index idx_goals_user_id on public.goals(user_id);

alter table public.goals enable row level security;

create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────
-- 7. CREDIT CARDS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.credit_cards (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users on delete cascade not null,
  name          text not null,
  bank          text,
  last_four     text,
  limit_amount  numeric(15,0) not null,
  balance       numeric(15,0) not null default 0,
  billing_date  smallint check (billing_date between 1 and 31),
  due_date      smallint check (due_date between 1 and 31),
  created_at    timestamptz not null default now()
);

alter table public.credit_cards enable row level security;

create policy "Users can manage own credit cards"
  on public.credit_cards for all
  using (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────
-- 8. LOANS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.loans (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users on delete cascade not null,
  person_name       text not null,
  direction         text not null check (direction in ('LENT','BORROWED')),
  original_amount   numeric(15,0) not null,
  remaining_amount  numeric(15,0) not null,
  status            text not null default 'ACTIVE' check (status in ('ACTIVE','CLEARED')),
  due_date          date,
  note              text,
  created_at        timestamptz not null default now()
);

alter table public.loans enable row level security;

create policy "Users can manage own loans"
  on public.loans for all
  using (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────
-- 9. DEFAULT CATEGORIES SEED
-- ──────────────────────────────────────────────────────────────
insert into public.categories (id, user_id, name, icon, color, tx_type, is_default) values
  -- Expense categories
  (gen_random_uuid(), null, 'Makan',       'UtensilsCrossed', '#3B82F6', 'EXPENSE', true),
  (gen_random_uuid(), null, 'Transport',   'Car',             '#F97316', 'EXPENSE', true),
  (gen_random_uuid(), null, 'Belanja',     'ShoppingBag',     '#8B5CF6', 'EXPENSE', true),
  (gen_random_uuid(), null, 'Tagihan',     'FileText',        '#EF4444', 'EXPENSE', true),
  (gen_random_uuid(), null, 'Hiburan',     'Tv',              '#EC4899', 'EXPENSE', true),
  (gen_random_uuid(), null, 'Kesehatan',   'Heart',           '#10B981', 'EXPENSE', true),
  (gen_random_uuid(), null, 'Pendidikan',  'BookOpen',        '#14B8A6', 'EXPENSE', true),
  (gen_random_uuid(), null, 'Lainnya',     'MoreHorizontal',  '#9CA3AF', 'EXPENSE', true),
  -- Income categories
  (gen_random_uuid(), null, 'Gaji',        'Briefcase',       '#10B981', 'INCOME',  true),
  (gen_random_uuid(), null, 'Freelance',   'Laptop',          '#14B8A6', 'INCOME',  true),
  (gen_random_uuid(), null, 'Bonus',       'Gift',            '#EAB308', 'INCOME',  true),
  (gen_random_uuid(), null, 'Investasi',   'TrendingUp',      '#3B82F6', 'INCOME',  true),
  (gen_random_uuid(), null, 'Hadiah',      'Package',         '#8B5CF6', 'INCOME',  true),
  (gen_random_uuid(), null, 'Pemasukan Lainnya', 'MoreHorizontal', '#9CA3AF', 'INCOME', true)
on conflict do nothing;
