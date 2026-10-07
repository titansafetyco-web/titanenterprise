-- Run this in the SQL editor for https://ovjmmpcqtsxlpdkcyute.supabase.co

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  role text not null default 'affiliate' check (role in ('admin', 'agent', 'affiliate', 'team', 'member')),
  avatar_path text not null default '',
  birth_date date,
  state text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  program text not null,
  second_program text not null default '',
  years text not null,
  areas text not null,
  background text not null,
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;

create or replace function public.is_reviewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'approved'
      and role = 'admin'
  );
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen text := coalesce(new.raw_user_meta_data->>'role', '');
  admin_count int;
  account_status text := 'pending';
begin
  select count(*) into admin_count
  from public.profiles
  where role = 'admin';

  if admin_count = 0 then
    chosen := 'admin';
    account_status := 'approved';
  elsif chosen not in ('agent', 'affiliate') then
    chosen := 'affiliate';
  end if;

  insert into public.profiles (id, name, email, phone, status, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    account_status,
    chosen
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.confirm_email_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists confirm_email_on_signup on auth.users;
create trigger confirm_email_on_signup
  before insert on auth.users
  for each row execute function public.confirm_email_on_signup();

create or replace function public.claim_my_submissions()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  owner uuid := auth.uid();
  owner_email text;
begin
  if owner is null then
    return;
  end if;

  select lower(email) into owner_email from auth.users where id = owner;
  if owner_email is null or owner_email = '' then
    return;
  end if;

  update public.messages
  set user_id = owner
  where user_id is null and lower(email) = owner_email;

  update public.chats
  set user_id = owner
  where user_id is null and lower(email) = owner_email;

  update public.applications
  set user_id = owner
  where user_id is null and lower(email) = owner_email;
end;
$$;

drop policy if exists "read profiles" on public.profiles;
create policy "read profiles" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_reviewer());

drop policy if exists "review profiles" on public.profiles;
create policy "review profiles" on public.profiles
  for update to authenticated
  using (public.is_reviewer())
  with check (public.is_reviewer());

drop policy if exists "submit onboarding" on public.applications;
create policy "submit onboarding" on public.applications
  for insert to anon, authenticated
  with check (status = 'pending' and (user_id is null or user_id = auth.uid()));

drop policy if exists "read onboarding" on public.applications;
create policy "read onboarding" on public.applications
  for select to authenticated
  using (public.is_reviewer() or user_id = auth.uid());

drop policy if exists "review onboarding" on public.applications;
create policy "review onboarding" on public.applications
  for update to authenticated
  using (public.is_reviewer())
  with check (public.is_reviewer());

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  interest text not null,
  message text not null,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.programs (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.programs (id, name)
values
  ('safety-products', 'Safety products'),
  ('energy-solutions', 'Energy solutions'),
  ('digital-media', 'Digital media'),
  ('software-development', 'Software development'),
  ('insurance', 'Insurance')
on conflict (id) do nothing;

alter table public.messages enable row level security;
alter table public.chats enable row level security;
alter table public.programs enable row level security;

drop policy if exists "send message" on public.messages;
create policy "send message" on public.messages
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "read messages" on public.messages;
create policy "read messages" on public.messages
  for select to authenticated
  using (public.is_reviewer() or user_id = auth.uid());

drop policy if exists "send chat" on public.chats;
create policy "send chat" on public.chats
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create or replace function public.is_support()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'approved'
      and role in ('admin', 'team')
  );
$$;

drop policy if exists "read chats" on public.chats;
create policy "read chats" on public.chats
  for select to authenticated
  using (public.is_support() or user_id = auth.uid());

alter table public.chats
  add column if not exists from_staff boolean not null default false,
  add column if not exists thread_id uuid;

update public.chats as chat
set thread_id = threads.thread_id
from (
  select lower(email) as email, gen_random_uuid() as thread_id
  from public.chats
  where thread_id is null
  group by lower(email)
) as threads
where chat.thread_id is null and lower(chat.email) = threads.email;

update public.chats set thread_id = gen_random_uuid() where thread_id is null;

alter table public.chats alter column thread_id set default gen_random_uuid();
alter table public.chats alter column thread_id set not null;

create index if not exists chats_thread_idx on public.chats (thread_id, created_at);

create or replace function public.guard_staff_chat()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.from_staff and not public.is_support() then
    new.from_staff := false;
  end if;
  if new.thread_id is null then
    new.thread_id := gen_random_uuid();
  end if;
  return new;
end;
$$;

drop trigger if exists guard_staff_chat on public.chats;
create trigger guard_staff_chat
  before insert on public.chats
  for each row execute function public.guard_staff_chat();

create or replace function public.support_thread(thread uuid)
returns table (
  id uuid,
  name text,
  message text,
  from_staff boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select chats.id, chats.name, chats.message, chats.from_staff, chats.created_at
  from public.chats
  where chats.thread_id = thread
  order by chats.created_at;
$$;

create or replace function public.my_support_thread()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select chats.thread_id
  from public.chats
  where auth.uid() is not null
    and (
      chats.user_id = auth.uid()
      or lower(chats.email) = (select lower(email) from public.profiles where id = auth.uid())
    )
  order by chats.created_at desc
  limit 1;
$$;

revoke all on function public.support_thread(uuid) from public;
revoke all on function public.my_support_thread() from public;
grant execute on function public.support_thread(uuid) to anon, authenticated;
grant execute on function public.my_support_thread() to authenticated;

drop policy if exists "read programs" on public.programs;
create policy "read programs" on public.programs
  for select to anon, authenticated
  using (true);

drop policy if exists "add programs" on public.programs;
create policy "add programs" on public.programs
  for insert to authenticated
  with check (public.is_reviewer());

drop policy if exists "remove programs" on public.programs;
create policy "remove programs" on public.programs
  for delete to authenticated
  using (public.is_reviewer());

grant execute on function public.claim_my_submissions() to authenticated;

grant usage on schema public to anon, authenticated;
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  pay text not null check (pay in ('weekly', 'biweekly')),
  starts_on date,
  pay_cents integer not null default 0,
  message text not null default '',
  link text not null default '',
  program text not null default '',
  created_at timestamptz not null default now()
);

alter table public.jobs add column if not exists starts_on date;
alter table public.jobs add column if not exists pay_cents integer not null default 0;
alter table public.jobs add column if not exists message text not null default '';
alter table public.jobs add column if not exists link text not null default '';
alter table public.jobs add column if not exists program text not null default '';

alter table public.jobs drop constraint if exists jobs_pay_cents_check;
alter table public.jobs add constraint jobs_pay_cents_check check (pay_cents >= 0);
alter table public.jobs drop constraint if exists jobs_program_check;
alter table public.jobs add constraint jobs_program_check check (program in ('', 'safety', 'energy', 'media', 'software', 'insurance'));

create table if not exists public.job_selections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  status text not null default 'processing' check (status in ('processing', 'review', 'done', 'incomplete')),
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create table if not exists public.job_timers (
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  started_at timestamptz,
  paused boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

alter table public.job_timers add column if not exists paused boolean not null default false;

alter table public.job_selections
  add column if not exists status text not null default 'processing';

alter table public.job_selections
  add column if not exists credited boolean not null default false;

alter table public.job_selections drop constraint if exists job_selections_status_check;
alter table public.job_selections
  add constraint job_selections_status_check
  check (status in ('processing', 'review', 'done', 'incomplete'));

alter table public.jobs enable row level security;
alter table public.job_selections enable row level security;
alter table public.job_timers enable row level security;

drop policy if exists "read jobs" on public.jobs;
create policy "read jobs" on public.jobs
  for select to authenticated
  using (true);

drop policy if exists "add jobs" on public.jobs;
create policy "add jobs" on public.jobs
  for insert to authenticated
  with check (public.is_reviewer());

drop policy if exists "remove jobs" on public.jobs;
create policy "remove jobs" on public.jobs
  for delete to authenticated
  using (public.is_reviewer());

drop policy if exists "read selections" on public.job_selections;
create policy "read selections" on public.job_selections
  for select to authenticated
  using (user_id = auth.uid() or public.is_reviewer());

drop policy if exists "choose job" on public.job_selections;
create policy "choose job" on public.job_selections
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "drop selection" on public.job_selections;
create policy "drop selection" on public.job_selections
  for delete to authenticated
  using (user_id = auth.uid() and credited = false and status = 'processing');

drop policy if exists "update selection" on public.job_selections;

drop policy if exists "read job timers" on public.job_timers;
create policy "read job timers" on public.job_timers
  for select to authenticated
  using (user_id = auth.uid() or public.is_reviewer());

drop policy if exists "insert job timers" on public.job_timers;
create policy "insert job timers" on public.job_timers
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "update job timers" on public.job_timers;
create policy "update job timers" on public.job_timers
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "delete job timers" on public.job_timers;
create policy "delete job timers" on public.job_timers
  for delete to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on
  public.profiles,
  public.applications,
  public.messages,
  public.chats,
  public.programs,
  public.jobs,
  public.job_selections,
  public.job_timers
to anon, authenticated;

revoke update on public.job_selections from anon, authenticated;

create table if not exists public.wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance_cents integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.job_payouts (
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

alter table public.job_payouts enable row level security;

drop policy if exists "read own job payouts" on public.job_payouts;
create policy "read own job payouts" on public.job_payouts
  for select to authenticated
  using (user_id = auth.uid() or public.is_reviewer());

grant select on public.job_payouts to authenticated;

create table if not exists public.wallet_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_transfers (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references auth.users (id) on delete cascade,
  to_user uuid not null references auth.users (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  process text not null default '' check (process in ('', 'pending', 'payment')),
  portal text not null default '' check (portal in ('', 'wire', 'ach', 'zelle', 'venmo', 'cashapp', 'paypal', 'crypto', 'deposit')),
  created_at timestamptz not null default now(),
  check (from_user <> to_user)
);

create index if not exists wallet_transfers_from_idx on public.wallet_transfers (from_user, created_at desc);
create index if not exists wallet_transfers_to_idx on public.wallet_transfers (to_user, created_at desc);

alter table public.wallets drop constraint if exists wallets_balance_cents_check;

alter table public.wallets enable row level security;
alter table public.wallet_credits enable row level security;
alter table public.wallet_transfers enable row level security;

drop policy if exists "read own wallet" on public.wallets;
create policy "read own wallet" on public.wallets
  for select to authenticated
  using (user_id = auth.uid() or public.is_reviewer());

drop policy if exists "read own credits" on public.wallet_credits;
create policy "read own credits" on public.wallet_credits
  for select to authenticated
  using (user_id = auth.uid() or public.is_reviewer());

drop policy if exists "read own transfers" on public.wallet_transfers;
create policy "read own transfers" on public.wallet_transfers
  for select to authenticated
  using (from_user = auth.uid() or to_user = auth.uid() or public.is_reviewer());

create or replace function public.wallet_balance()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  cents integer;
begin
  if auth.uid() is null then
    return 0;
  end if;
  insert into public.wallets (user_id) values (auth.uid())
  on conflict (user_id) do nothing;
  select balance_cents into cents from public.wallets where user_id = auth.uid();
  return coalesce(cents, 0);
end;
$$;

create or replace function public.transfer_recipients()
returns table (id uuid, name text, role text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.role
  from public.profiles p
  where p.status = 'approved'
    and p.id <> auth.uid()
  order by p.name;
$$;

create table if not exists public.job_penalties (
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

alter table public.job_penalties enable row level security;

drop policy if exists "read own job penalties" on public.job_penalties;
create policy "read own job penalties" on public.job_penalties
  for select to authenticated
  using (user_id = auth.uid() or public.is_reviewer());

grant select on public.job_penalties to authenticated;

drop function if exists public.wallet_history();

create function public.wallet_history()
returns table (
  id uuid,
  kind text,
  amount_cents integer,
  other_name text,
  created_at timestamptz,
  process text,
  portal text
)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, 'credit'::text, c.amount_cents, ''::text, c.created_at, ''::text, ''::text
  from public.wallet_credits c
  where c.user_id = auth.uid()
  union all
  select p.job_id, 'out'::text, p.amount_cents, 'Cancellation penalty'::text, p.created_at, ''::text, ''::text
  from public.job_penalties p
  where p.user_id = auth.uid()
  union all
  select t.id, 'out'::text, t.amount_cents, coalesce(p.name, ''), t.created_at, t.process, t.portal
  from public.wallet_transfers t
  left join public.profiles p on p.id = t.to_user
  where t.from_user = auth.uid()
  union all
  select t.id, 'in'::text, t.amount_cents, coalesce(p.name, ''), t.created_at, t.process, t.portal
  from public.wallet_transfers t
  left join public.profiles p on p.id = t.from_user
  where t.to_user = auth.uid()
  order by created_at desc;
$$;

create or replace function public.credit_wallet(cents integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_reviewer() then
    raise exception 'not allowed';
  end if;
  if cents is null or cents <= 0 or cents > 100000000 then
    raise exception 'enter an amount';
  end if;
  insert into public.wallets (user_id) values (auth.uid())
  on conflict (user_id) do nothing;
  update public.wallets
  set balance_cents = balance_cents + cents, updated_at = now()
  where user_id = auth.uid();
  insert into public.wallet_credits (user_id, amount_cents) values (auth.uid(), cents);
end;
$$;

drop function if exists public.transfer_funds(uuid, integer);

create or replace function public.transfer_funds(recipient uuid, cents integer, pay_process text, pay_portal text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sender uuid := auth.uid();
  sender_balance integer;
begin
  if sender is null then
    raise exception 'not signed in';
  end if;
  if recipient is null or recipient = sender then
    raise exception 'choose a recipient';
  end if;
  if cents is null or cents <= 0 or cents > 100000000 then
    raise exception 'enter an amount';
  end if;
  if pay_process is null or pay_process not in ('pending', 'payment') then
    raise exception 'choose a process';
  end if;
  if pay_portal is null or pay_portal not in ('wire', 'ach', 'zelle', 'venmo', 'cashapp', 'paypal', 'crypto', 'deposit') then
    raise exception 'choose a portal';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = recipient and status = 'approved'
  ) then
    raise exception 'choose a recipient';
  end if;

  insert into public.wallets (user_id)
  values (sender), (recipient)
  on conflict (user_id) do nothing;

  perform 1
  from public.wallets
  where user_id in (sender, recipient)
  order by user_id
  for update;

  select balance_cents into sender_balance
  from public.wallets
  where user_id = sender;

  if sender_balance < cents then
    raise exception 'insufficient balance';
  end if;

  update public.wallets
  set balance_cents = balance_cents - cents, updated_at = now()
  where user_id = sender;

  update public.wallets
  set balance_cents = balance_cents + cents, updated_at = now()
  where user_id = recipient;

  insert into public.wallet_transfers (from_user, to_user, amount_cents, process, portal)
  values (sender, recipient, cents, pay_process, pay_portal);
end;
$$;

revoke all on function public.wallet_balance() from public, anon;
revoke all on function public.transfer_recipients() from public, anon;
revoke all on function public.wallet_history() from public, anon;
revoke all on function public.credit_wallet(integer) from public, anon;
revoke all on function public.transfer_funds(uuid, integer, text, text) from public, anon;
grant execute on function public.wallet_balance() to authenticated;
grant execute on function public.transfer_recipients() to authenticated;
grant execute on function public.wallet_history() to authenticated;
grant execute on function public.credit_wallet(integer) to authenticated;
grant execute on function public.transfer_funds(uuid, integer, text, text) to authenticated;

grant select on public.wallets, public.wallet_credits, public.wallet_transfers to authenticated;

create or replace function public.settle_job_progress(target_job uuid, next_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  current_status text;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  if next_status <> 'review' then
    raise exception 'choose a job status';
  end if;

  select status
  into current_status
  from public.job_selections
  where user_id = uid and job_id = target_job
  for update;

  if current_status is distinct from 'processing' then
    raise exception 'that job status could not be saved';
  end if;

  update public.job_selections
  set status = 'review'
  where user_id = uid and job_id = target_job;

  update public.job_timers
  set elapsed_seconds = elapsed_seconds + case
        when started_at is not null then greatest(0, floor(extract(epoch from (now() - started_at)))::integer)
        else 0
      end,
      started_at = null,
      updated_at = now()
  where user_id = uid and job_id = target_job;
end;
$$;

revoke all on function public.settle_job_progress(uuid, text) from public, anon;
grant execute on function public.settle_job_progress(uuid, text) to authenticated;

create or replace function public.verify_job_progress(target_user uuid, target_job uuid, next_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status text;
  pay integer;
begin
  if not public.is_reviewer() then
    raise exception 'not allowed';
  end if;
  if next_status not in ('done', 'incomplete') then
    raise exception 'choose a job status';
  end if;

  select status
  into current_status
  from public.job_selections
  where user_id = target_user and job_id = target_job
  for update;

  if current_status is distinct from 'review' then
    raise exception 'that job status could not be saved';
  end if;

  update public.job_selections
  set status = next_status
  where user_id = target_user and job_id = target_job;

  select pay_cents into pay from public.jobs where id = target_job;

  if next_status = 'done' then
    if pay is not null and pay > 0 then
      insert into public.job_payouts (user_id, job_id, amount_cents)
      values (target_user, target_job, pay)
      on conflict (user_id, job_id) do nothing;
      if found then
        insert into public.wallets (user_id) values (target_user)
        on conflict (user_id) do nothing;
        update public.wallets
        set balance_cents = balance_cents + pay, updated_at = now()
        where user_id = target_user;
        insert into public.wallet_credits (user_id, amount_cents) values (target_user, pay);
      end if;
    end if;
    update public.job_selections
    set credited = true
    where user_id = target_user and job_id = target_job;
  elsif pay is not null and pay > 0 then
    insert into public.job_penalties (user_id, job_id, amount_cents)
    values (target_user, target_job, pay)
    on conflict (user_id, job_id) do nothing;
    if found then
      insert into public.wallets (user_id) values (target_user)
      on conflict (user_id) do nothing;
      update public.wallets
      set balance_cents = balance_cents - pay, updated_at = now()
      where user_id = target_user;
    end if;
  end if;
end;
$$;

revoke all on function public.verify_job_progress(uuid, uuid, text) from public, anon;
grant execute on function public.verify_job_progress(uuid, uuid, text) to authenticated;

create or replace function public.leaderboard()
returns table (
  id uuid,
  name text,
  role text,
  status text,
  completed_jobs integer,
  active_jobs integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.name,
    p.role,
    p.status,
    coalesce(c.completed, 0)::integer,
    coalesce(c.active, 0)::integer
  from public.profiles p
  left join (
    select
      user_id,
      count(*) filter (where status = 'done') as completed,
      count(*) filter (where status = 'processing') as active
    from public.job_selections
    group by user_id
  ) c on c.user_id = p.id
  where p.status <> 'denied';
$$;

revoke all on function public.leaderboard() from public, anon;
grant execute on function public.leaderboard() to authenticated;

create table if not exists public.payout_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_account_id text not null default '',
  bank_ready boolean not null default false
);

create table if not exists public.wallet_payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  method text not null check (method in ('ach', 'crypto')),
  amount_cents integer not null check (amount_cents > 0),
  status text not null check (status in ('pending', 'sent', 'failed')),
  provider text not null default '',
  provider_id text not null default '',
  destination_hint text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists wallet_payouts_user_idx on public.wallet_payouts (user_id, created_at desc);

alter table public.payout_accounts enable row level security;
alter table public.wallet_payouts enable row level security;

drop policy if exists "read own payout account" on public.payout_accounts;
create policy "read own payout account"
  on public.payout_accounts for select to authenticated
  using (user_id = auth.uid() or public.is_reviewer());

drop policy if exists "read own payouts" on public.wallet_payouts;
create policy "read own payouts"
  on public.wallet_payouts for select to authenticated
  using (user_id = auth.uid() or public.is_reviewer());

revoke all on public.payout_accounts from anon, authenticated;
revoke all on public.wallet_payouts from anon, authenticated;
grant select on public.payout_accounts, public.wallet_payouts to authenticated;

create or replace function public.save_payout_account(stripe_id text, ready boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_reviewer() then
    raise exception 'not allowed';
  end if;
  if stripe_id is null or stripe_id !~ '^acct_[A-Za-z0-9]+$' then
    raise exception 'not allowed';
  end if;
  insert into public.payout_accounts (user_id, stripe_account_id, bank_ready)
  values (auth.uid(), stripe_id, coalesce(ready, false))
  on conflict (user_id) do update
  set stripe_account_id = excluded.stripe_account_id,
      bank_ready = excluded.bank_ready;
end;
$$;

create or replace function public.reserve_payout(payout_method text, cents integer, destination text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  current_balance integer;
  payout_id uuid;
begin
  if uid is null or public.is_reviewer() then
    raise exception 'not allowed';
  end if;
  if payout_method not in ('ach', 'crypto') then
    raise exception 'not allowed';
  end if;
  if cents is null or cents <= 0 or cents > 100000000 then
    raise exception 'enter an amount';
  end if;

  insert into public.wallets (user_id) values (uid)
  on conflict (user_id) do nothing;

  select balance_cents into current_balance
  from public.wallets
  where user_id = uid
  for update;

  if current_balance < cents then
    raise exception 'insufficient balance';
  end if;

  update public.wallets
  set balance_cents = balance_cents - cents, updated_at = now()
  where user_id = uid;

  insert into public.wallet_payouts (user_id, method, amount_cents, status, destination_hint)
  values (uid, payout_method, cents, 'pending', left(coalesce(destination, ''), 80))
  returning id into payout_id;

  return payout_id;
end;
$$;

create or replace function public.settle_payout(payout_id uuid, payout_provider text, payout_provider_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_reviewer() then
    raise exception 'not allowed';
  end if;
  if payout_provider_id is null or length(btrim(payout_provider_id)) = 0 then
    raise exception 'not allowed';
  end if;
  update public.wallet_payouts
  set status = 'sent',
      provider = left(coalesce(payout_provider, ''), 40),
      provider_id = left(payout_provider_id, 120)
  where id = payout_id
    and user_id = auth.uid()
    and status = 'pending'
    and provider_id = '';
  if not found then
    raise exception 'not allowed';
  end if;
end;
$$;

create or replace function public.release_payout(payout_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cents integer;
begin
  if uid is null or public.is_reviewer() then
    raise exception 'not allowed';
  end if;

  select amount_cents into cents
  from public.wallet_payouts
  where id = payout_id
    and user_id = uid
    and status = 'pending'
    and provider_id = ''
  for update;

  if cents is null then
    return;
  end if;

  update public.wallet_payouts
  set status = 'failed'
  where id = payout_id;

  update public.wallets
  set balance_cents = balance_cents + cents, updated_at = now()
  where user_id = uid;
end;
$$;

revoke all on function public.save_payout_account(text, boolean) from public, anon;
revoke all on function public.reserve_payout(text, integer, text) from public, anon;
revoke all on function public.settle_payout(uuid, text, text) from public, anon;
revoke all on function public.release_payout(uuid) from public, anon;
grant execute on function public.save_payout_account(text, boolean) to authenticated;
grant execute on function public.reserve_payout(text, integer, text) to authenticated;
grant execute on function public.settle_payout(uuid, text, text) to authenticated;
grant execute on function public.release_payout(uuid) to authenticated;

create table if not exists public.crypto_wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  address text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.crypto_wallets enable row level security;

drop policy if exists "read own crypto wallet" on public.crypto_wallets;
create policy "read own crypto wallet"
  on public.crypto_wallets for select to authenticated
  using (user_id = auth.uid() or public.is_reviewer());

revoke all on public.crypto_wallets from anon, authenticated;
grant select on public.crypto_wallets to authenticated;

create or replace function public.save_crypto_wallet(wallet_address text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned text := btrim(coalesce(wallet_address, ''));
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if cleaned <> '' and cleaned !~ '^[A-Za-z0-9]{20,128}$' then
    raise exception 'invalid address';
  end if;
  insert into public.crypto_wallets (user_id, address)
  values (auth.uid(), cleaned)
  on conflict (user_id) do update
  set address = excluded.address,
      updated_at = now();
end;
$$;

revoke all on function public.save_crypto_wallet(text) from public, anon;
grant execute on function public.save_crypto_wallet(text) to authenticated;

create table if not exists public.nav_seen (
  user_id uuid not null references auth.users (id) on delete cascade,
  section text not null check (section in ('messages', 'wallet')),
  seen_at timestamptz not null default now(),
  primary key (user_id, section)
);

alter table public.nav_seen enable row level security;

drop policy if exists "read own nav seen" on public.nav_seen;
create policy "read own nav seen" on public.nav_seen
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "insert own nav seen" on public.nav_seen;
create policy "insert own nav seen" on public.nav_seen
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "update own nav seen" on public.nav_seen;
create policy "update own nav seen" on public.nav_seen
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.nav_seen to authenticated;

alter table public.profiles add column if not exists avatar_path text not null default '';

create or replace function public.set_avatar(path text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if path is null then
    path := '';
  end if;
  if path <> '' and path !~ ('^' || auth.uid()::text || '/[0-9]+\.(jpg|png|webp)$') then
    raise exception 'choose an image';
  end if;
  update public.profiles
  set avatar_path = path
  where id = auth.uid();
end;
$$;

revoke all on function public.set_avatar(text) from public, anon;
grant execute on function public.set_avatar(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read avatars" on storage.objects;
create policy "public read avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');

drop policy if exists "insert own avatar" on storage.objects;
create policy "insert own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "update own avatar" on storage.objects;
create policy "update own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "delete own avatar" on storage.objects;
create policy "delete own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

alter table public.profiles
  add column if not exists birth_date date,
  add column if not exists state text not null default '';

create or replace function public.set_profile_details(birth text, region text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  birth_value date;
  region_value text := upper(btrim(coalesce(region, '')));
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if birth is null or btrim(birth) = '' then
    birth_value := null;
  else
    begin
      birth_value := btrim(birth)::date;
    exception when others then
      raise exception 'choose a date of birth';
    end;
    if birth_value > current_date or birth_value < date '1900-01-01' then
      raise exception 'choose a date of birth';
    end if;
  end if;
  if region_value <> '' and region_value not in (
    'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD',
    'TN','TX','UT','VT','VA','WA','WV','WI','WY'
  ) then
    raise exception 'choose a state';
  end if;
  update public.profiles
  set birth_date = birth_value, state = region_value
  where id = auth.uid();
end;
$$;

revoke all on function public.set_profile_details(text, text) from public, anon;
grant execute on function public.set_profile_details(text, text) to authenticated;

create or replace function public.set_account_profile(
  account_name text,
  account_email text,
  account_phone text,
  birth text,
  region text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  name_value text := btrim(coalesce(account_name, ''));
  email_value text := lower(btrim(coalesce(account_email, '')));
  phone_digits text := regexp_replace(coalesce(account_phone, ''), '\D', '', 'g');
  phone_value text := '';
  birth_value date;
  region_value text := upper(btrim(coalesce(region, '')));
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if char_length(name_value) < 2 then
    raise exception 'enter a name';
  end if;
  if email_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'enter a valid email';
  end if;
  if phone_digits ~ '^1[0-9]{10}$' then
    phone_digits := substring(phone_digits from 2);
  end if;
  if phone_digits <> '' and phone_digits !~ '^[0-9]{10}$' then
    raise exception 'enter a phone';
  end if;
  if phone_digits <> '' then
    phone_value := '(' || substring(phone_digits from 1 for 3) || ') ' || substring(phone_digits from 4 for 3) || '-' || substring(phone_digits from 7 for 4);
  end if;
  if birth is null or btrim(birth) = '' then
    birth_value := null;
  else
    begin
      birth_value := btrim(birth)::date;
    exception when others then
      raise exception 'choose a date of birth';
    end;
    if birth_value > current_date or birth_value < date '1900-01-01' then
      raise exception 'choose a date of birth';
    end if;
  end if;
  if region_value <> '' and region_value not in (
    'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD',
    'TN','TX','UT','VT','VA','WA','WV','WI','WY'
  ) then
    raise exception 'choose a state';
  end if;
  if exists (
    select 1 from auth.users
    where lower(email) = email_value and id <> auth.uid()
  ) then
    raise exception 'email already exists';
  end if;

  update auth.users
  set email = email_value,
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('name', name_value, 'phone', phone_value)
  where id = auth.uid();

  update public.profiles
  set name = name_value,
      email = email_value,
      phone = phone_value,
      birth_date = birth_value,
      state = region_value
  where id = auth.uid();
end;
$$;

revoke all on function public.set_account_profile(text, text, text, text, text) from public, anon;
grant execute on function public.set_account_profile(text, text, text, text, text) to authenticated;

create table if not exists public.site_status (
  id text primary key,
  maintenance boolean not null default false,
  support_online boolean not null default false
);

alter table public.site_status
  add column if not exists support_online boolean not null default false;

insert into public.site_status (id, maintenance)
values ('site', false)
on conflict (id) do nothing;

alter table public.site_status enable row level security;

drop policy if exists "read site status" on public.site_status;
create policy "read site status"
on public.site_status for select
to anon, authenticated
using (true);

revoke all on public.site_status from anon, authenticated;
grant select on public.site_status to anon, authenticated;

create or replace function public.set_maintenance(enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_reviewer() then
    raise exception 'not allowed';
  end if;
  insert into public.site_status (id, maintenance)
  values ('site', coalesce(enabled, false))
  on conflict (id) do update set maintenance = excluded.maintenance;
end;
$$;

revoke all on function public.set_maintenance(boolean) from public, anon;
grant execute on function public.set_maintenance(boolean) to authenticated;

create or replace function public.set_support_online(enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_support() then
    raise exception 'not allowed';
  end if;
  insert into public.site_status (id, support_online)
  values ('site', coalesce(enabled, false))
  on conflict (id) do update set support_online = excluded.support_online;
end;
$$;

revoke all on function public.set_support_online(boolean) from public, anon;
grant execute on function public.set_support_online(boolean) to authenticated;

create or replace function public.clear_support_box(box text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_support() then
    raise exception 'not allowed';
  end if;
  if box = 'emails' then
    insert into public.mailbox_hidden (message_id)
    select message_id from public.mailbox_messages
    where message_id is not null
    on conflict (message_id) do nothing;
    delete from public.mailbox_messages where id is not null;
    delete from public.mailbox_drafts where id is not null;
    delete from public.messages where id is not null;
  elsif box = 'forms' then
    delete from public.applications where id is not null;
  elsif box = 'chats' then
    delete from public.chats where id is not null;
  else
    raise exception 'not allowed';
  end if;
end;
$$;

revoke all on function public.clear_support_box(text) from public, anon;
grant execute on function public.clear_support_box(text) to authenticated;

create table if not exists public.mailbox_messages (
  id uuid primary key default gen_random_uuid(),
  message_id text,
  direction text not null check (direction in ('in', 'out')),
  from_name text not null default '',
  from_email text not null,
  to_email text not null,
  subject text not null default '',
  body text not null default '',
  created_at timestamptz not null default now()
);

create unique index if not exists mailbox_message_id_idx
  on public.mailbox_messages (message_id)
  where message_id is not null;

create table if not exists public.mailbox_hidden (
  message_id text primary key
);

create table if not exists public.mailbox_state (
  id text primary key,
  synced_at timestamptz not null default now()
);

alter table public.mailbox_messages enable row level security;
alter table public.mailbox_hidden enable row level security;
alter table public.mailbox_state enable row level security;

drop policy if exists "read mailbox" on public.mailbox_messages;
create policy "read mailbox"
  on public.mailbox_messages for select to authenticated
  using (public.is_support());

revoke all on public.mailbox_messages from anon, authenticated;
revoke all on public.mailbox_hidden from anon, authenticated;
revoke all on public.mailbox_state from anon, authenticated;
grant select on public.mailbox_messages to authenticated;

create or replace function public.claim_mailbox_sync()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  last_sync timestamptz;
begin
  if not public.is_support() then
    return false;
  end if;
  select synced_at into last_sync from public.mailbox_state where id = 'inbox';
  if last_sync is not null and last_sync > now() - interval '60 seconds' then
    return false;
  end if;
  insert into public.mailbox_state (id, synced_at)
  values ('inbox', now())
  on conflict (id) do update set synced_at = now();
  return true;
end;
$$;

create or replace function public.save_mailbox_message(
  mail_key text,
  mail_direction text,
  sender_name text,
  sender_email text,
  recipient_email text,
  mail_subject text,
  mail_body text,
  mail_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_support() then
    raise exception 'not allowed';
  end if;
  if mail_direction not in ('in', 'out') then
    raise exception 'not allowed';
  end if;
  if mail_key is not null and exists (select 1 from public.mailbox_hidden where message_id = mail_key) then
    return;
  end if;
  insert into public.mailbox_messages (
    message_id, direction, from_name, from_email, to_email, subject, body, created_at
  )
  values (
    nullif(mail_key, ''),
    mail_direction,
    left(coalesce(sender_name, ''), 200),
    lower(sender_email),
    lower(recipient_email),
    left(coalesce(mail_subject, ''), 300),
    left(coalesce(mail_body, ''), 8000),
    coalesce(mail_at, now())
  )
  on conflict (message_id) where message_id is not null do update
  set body = excluded.body,
      subject = excluded.subject,
      from_name = excluded.from_name,
      direction = excluded.direction;
end;
$$;

revoke all on function public.claim_mailbox_sync() from public, anon;
revoke all on function public.save_mailbox_message(text, text, text, text, text, text, text, timestamptz) from public, anon;
grant execute on function public.claim_mailbox_sync() to authenticated;
grant execute on function public.save_mailbox_message(text, text, text, text, text, text, text, timestamptz) to authenticated;

create table if not exists public.mailbox_drafts (
  id uuid primary key default gen_random_uuid(),
  to_email text not null default '',
  subject text not null default '',
  body text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.mailbox_drafts enable row level security;

drop policy if exists "read drafts" on public.mailbox_drafts;
create policy "read drafts"
  on public.mailbox_drafts for select to authenticated
  using (public.is_support());

revoke all on public.mailbox_drafts from anon, authenticated;
grant select on public.mailbox_drafts to authenticated;

create or replace function public.save_mailbox_draft(
  draft_id uuid,
  recipient_email text,
  mail_subject text,
  mail_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  saved uuid;
begin
  if not public.is_support() then
    raise exception 'not allowed';
  end if;
  if draft_id is null then
    insert into public.mailbox_drafts (to_email, subject, body)
    values (
      lower(left(coalesce(recipient_email, ''), 254)),
      left(coalesce(mail_subject, ''), 300),
      left(coalesce(mail_body, ''), 8000)
    )
    returning id into saved;
  else
    update public.mailbox_drafts
    set to_email = lower(left(coalesce(recipient_email, ''), 254)),
        subject = left(coalesce(mail_subject, ''), 300),
        body = left(coalesce(mail_body, ''), 8000),
        updated_at = now()
    where id = draft_id
    returning id into saved;
    if saved is null then
      raise exception 'not allowed';
    end if;
  end if;
  return saved;
end;
$$;

create or replace function public.delete_mailbox_note(note_kind text, row_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_support() then
    raise exception 'not allowed';
  end if;
  if note_kind = 'mailbox' then
    insert into public.mailbox_hidden (message_id)
    select message_id from public.mailbox_messages
    where id = row_id and message_id is not null
    on conflict (message_id) do nothing;
    delete from public.mailbox_messages where id = row_id;
  elsif note_kind = 'contact' then
    delete from public.messages where id = row_id;
  elsif note_kind = 'draft' then
    delete from public.mailbox_drafts where id = row_id;
  else
    raise exception 'not allowed';
  end if;
end;
$$;

revoke all on function public.save_mailbox_draft(uuid, text, text, text) from public, anon;
revoke all on function public.delete_mailbox_note(text, uuid) from public, anon;
grant execute on function public.save_mailbox_draft(uuid, text, text, text) to authenticated;
grant execute on function public.delete_mailbox_note(text, uuid) to authenticated;

create or replace function public.format_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;

  if public.is_reviewer() then
    insert into public.mailbox_hidden (message_id)
    select message_id from public.mailbox_messages
    where message_id is not null
    on conflict (message_id) do nothing;

    delete from public.messages where id is not null;
    delete from public.chats where id is not null;
    delete from public.applications where id is not null;
    delete from public.mailbox_messages where id is not null;
    delete from public.mailbox_drafts where id is not null;
    delete from public.job_penalties where user_id is not null;
    delete from public.job_payouts where user_id is not null;
    delete from public.job_selections where id is not null;
    delete from public.job_timers where user_id is not null;
    delete from public.jobs where id is not null;
    delete from public.programs where id is not null;
    delete from public.wallet_transfers where id is not null;
    delete from public.wallet_credits where id is not null;
    delete from public.wallet_payouts where id is not null;
    delete from public.payout_accounts where user_id is not null;
    delete from public.crypto_wallets where user_id is not null;
    update public.wallets set balance_cents = 0, updated_at = now() where user_id is not null;
    delete from public.nav_seen where user_id is not null;
  else
    delete from public.job_penalties where user_id = uid;
    delete from public.job_selections where user_id = uid;
    delete from public.job_timers where user_id = uid;
    delete from public.applications where user_id = uid;
    delete from public.chats where user_id = uid;
    delete from public.nav_seen where user_id = uid;
    delete from public.wallet_payouts where user_id = uid;
    delete from public.payout_accounts where user_id = uid;
    delete from public.crypto_wallets where user_id = uid;
  end if;

  update public.profiles
  set phone = '',
      birth_date = null,
      state = '',
      avatar_path = ''
  where id = uid;
end;
$$;

revoke all on function public.format_account() from public, anon;
grant execute on function public.format_account() to authenticated;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;

  if exists (
    select 1 from public.profiles
    where id = uid and role = 'admin' and status = 'approved'
  ) and (
    select count(*) from public.profiles
    where role = 'admin' and status = 'approved'
  ) <= 1 then
    raise exception 'last admin';
  end if;

  if exists (
    select 1 from public.wallet_transfers
    where from_user = uid or to_user = uid
  ) then
    raise exception 'has transfers';
  end if;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

create or replace function public.delete_denied_account(target uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null or target is null or target = uid or not public.is_reviewer() then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = target and status = 'denied'
  ) then
    raise exception 'not denied';
  end if;

  if exists (
    select 1 from public.wallet_transfers
    where from_user = target or to_user = target
  ) then
    raise exception 'has transfers';
  end if;

  begin
    delete from storage.objects
    where bucket_id = 'avatars'
      and split_part(name, '/', 1) = target::text;
  exception
    when others then
      null;
  end;

  delete from auth.users where id = target;
end;
$$;

revoke all on function public.delete_denied_account(uuid) from public, anon;
grant execute on function public.delete_denied_account(uuid) to authenticated;
