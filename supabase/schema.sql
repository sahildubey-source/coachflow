-- ============================================================
-- CoachFlow - Multi-Tenant Schema with RLS
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type public.user_role as enum ('super_admin', 'coaching_owner', 'teacher', 'parent', 'student');
create type public.plan_type as enum ('free', 'starter', 'growth', 'enterprise');
create type public.subscription_status as enum ('active', 'past_due', 'canceled', 'trialing');
create type public.fee_status as enum ('pending', 'paid', 'overdue', 'waived');
create type public.lead_status as enum ('new', 'contacted', 'follow_up', 'converted', 'lost');
create type public.attendance_status as enum ('present', 'absent', 'late', 'excused');
create type public.notification_type as enum ('fee_reminder', 'attendance_alert', 'test_result', 'announcement', 'general');

-- ============================================================
-- PROFILES (extends auth.users, no coaching_id - global)
-- ============================================================

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  avatar_url text,
  phone text,
  role public.user_role not null default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Super admin can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- ============================================================
-- COACHINGS (tenant root table)
-- ============================================================

create table public.coachings (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  address text,
  city text,
  state text,
  pincode text,
  phone text,
  email text,
  website text,
  owner_id uuid references public.profiles(id),
  plan public.plan_type not null default 'free',
  subscription_status public.subscription_status not null default 'trialing',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  razorpay_customer_id text,
  razorpay_subscription_id text,
  max_students integer not null default 50,
  max_teachers integer not null default 5,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coachings enable row level security;

-- Coaching members table (links profiles to coachings with roles)
create table public.coaching_members (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null,
  is_active boolean not null default true,
  joined_at timestamptz not null default now(),
  unique(coaching_id, profile_id)
);

alter table public.coaching_members enable row level security;

-- Helper function to get current user's coaching_id(s)
create or replace function public.get_user_coaching_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select coaching_id from public.coaching_members
  where profile_id = auth.uid() and is_active = true;
$$;

-- Helper function to check if user is super_admin
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- Helper function to check if user is coaching owner
create or replace function public.is_coaching_owner(c_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.coaching_members
    where coaching_id = c_id and profile_id = auth.uid() and role = 'coaching_owner' and is_active = true
  );
$$;

-- Helper function to check if user is coaching teacher or owner
create or replace function public.is_coaching_teacher_or_owner(c_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.coaching_members
    where coaching_id = c_id and profile_id = auth.uid() and role in ('coaching_owner', 'teacher') and is_active = true
  );
$$;

-- RLS for coachings
create policy "Coaching members can view their coaching" on public.coachings
  for select using (
    public.is_super_admin() or id in (select public.get_user_coaching_ids())
  );

create policy "Coaching owner can update their coaching" on public.coachings
  for update using (owner_id = auth.uid());

-- RLS for coaching_members
create policy "Coaching members can view own coaching members" on public.coaching_members
  for select using (
    public.is_super_admin() or coaching_id in (select public.get_user_coaching_ids())
  );

create policy "Coaching owner can manage members" on public.coaching_members
  for all using (
    public.is_super_admin() or public.is_coaching_owner(coaching_id)
  );

-- ============================================================
-- TEACHERS (Dummy Data / Staff)
-- ============================================================

create table public.teachers (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  subject text,
  salary_fee numeric(10,2), -- manual fee entry per teacher
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teachers enable row level security;

create policy "Coaching members can view teachers" on public.teachers
  for select using (coaching_id in (select public.get_user_coaching_ids()));

create policy "Coaching owner can manage teachers" on public.teachers
  for all using (
    public.is_super_admin() or public.is_coaching_owner(coaching_id)
  );

-- ============================================================
-- BATCHES
-- ============================================================

create table public.batches (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  name text not null,
  subject text,
  description text,
  teacher_id uuid references public.teachers(id) on delete set null,
  start_time time,
  end_time time,
  days_of_week text[], -- ['mon','wed','fri']
  start_date date,
  end_date date,
  max_students integer,
  fee_amount numeric(10,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.batches enable row level security;

create policy "Coaching members can view batches" on public.batches
  for select using (coaching_id in (select public.get_user_coaching_ids()));

create policy "Coaching owner can manage batches" on public.batches
  for all using (
    public.is_super_admin() or public.is_coaching_owner(coaching_id)
  );

-- ============================================================
-- STUDENT BATCH ENROLLMENTS
-- ============================================================

create table public.student_batches (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  status text not null default 'active', -- 'active', 'dropped', 'completed'
  unique(student_id, batch_id)
);

alter table public.student_batches enable row level security;

create policy "Coaching members can view enrollments" on public.student_batches
  for select using (coaching_id in (select public.get_user_coaching_ids()));

create policy "Teacher/owner can manage enrollments" on public.student_batches
  for all using (
    public.is_super_admin() or public.is_coaching_teacher_or_owner(coaching_id)
  );

-- ============================================================
-- STUDENTS
-- ============================================================

create table public.students (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  profile_id uuid references public.profiles(id),
  enrollment_no text,
  full_name text not null,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  parent_name text,
  parent_phone text,
  parent_email text,
  batch_ids uuid[],
  admission_date date default current_date,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(coaching_id, enrollment_no)
);

alter table public.students enable row level security;

create policy "Coaching members can view students" on public.students
  for select using (coaching_id in (select public.get_user_coaching_ids()));

create policy "Owner/teacher can manage students" on public.students
  for all using (
    public.is_super_admin() or public.is_coaching_teacher_or_owner(coaching_id)
  );

-- ============================================================
-- ATTENDANCE
-- ============================================================

create table public.attendance (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null default current_date,
  status public.attendance_status not null default 'present',
  marked_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  unique(batch_id, student_id, date)
);

alter table public.attendance enable row level security;

create policy "Coaching members can view attendance" on public.attendance
  for select using (coaching_id in (select public.get_user_coaching_ids()));

create policy "Teacher/owner can manage attendance" on public.attendance
  for all using (
    public.is_super_admin() or public.is_coaching_teacher_or_owner(coaching_id)
  );

-- ============================================================
-- FEES
-- ============================================================

create table public.fee_structures (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  name text not null,
  amount numeric(10,2) not null,
  frequency text not null default 'monthly', -- monthly, quarterly, yearly, one-time
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.fee_structures enable row level security;

create policy "Coaching members can view fee structures" on public.fee_structures
  for select using (coaching_id in (select public.get_user_coaching_ids()));

create policy "Owner can manage fee structures" on public.fee_structures
  for all using (
    public.is_super_admin() or public.is_coaching_owner(coaching_id)
  );

create table public.fee_transactions (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  fee_structure_id uuid references public.fee_structures(id),
  amount numeric(10,2) not null,
  discount numeric(10,2) default 0,
  final_amount numeric(10,2) not null,
  status public.fee_status not null default 'pending',
  due_date date,
  paid_date date,
  payment_method text,
  transaction_ref text,
  razorpay_payment_id text,
  razorpay_order_id text,
  receipt_url text,
  collected_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fee_transactions enable row level security;

create policy "Coaching members can view fee transactions" on public.fee_transactions
  for select using (coaching_id in (select public.get_user_coaching_ids()));

create policy "Owner can manage fee transactions" on public.fee_transactions
  for all using (
    public.is_super_admin() or public.is_coaching_teacher_or_owner(coaching_id)
  );

-- ============================================================
-- TESTS & REPORT CARDS
-- ============================================================

create table public.tests (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  batch_id uuid references public.batches(id),
  name text not null,
  subject text,
  test_date date,
  total_marks numeric(6,2) not null,
  passing_marks numeric(6,2),
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.tests enable row level security;

create policy "Coaching members can view tests" on public.tests
  for select using (coaching_id in (select public.get_user_coaching_ids()));

create policy "Teacher/owner can manage tests" on public.tests
  for all using (
    public.is_super_admin() or public.is_coaching_teacher_or_owner(coaching_id)
  );

create table public.test_results (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  test_id uuid not null references public.tests(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  marks_obtained numeric(6,2),
  grade text,
  remarks text,
  is_absent boolean default false,
  entered_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(test_id, student_id)
);

alter table public.test_results enable row level security;

create policy "Coaching members can view test results" on public.test_results
  for select using (coaching_id in (select public.get_user_coaching_ids()));

create policy "Teacher/owner can manage test results" on public.test_results
  for all using (
    public.is_super_admin() or public.is_coaching_teacher_or_owner(coaching_id)
  );

-- ============================================================
-- CRM - LEADS
-- ============================================================

create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  source text, -- walk-in, website, referral, social
  interested_in text,
  status public.lead_status not null default 'new',
  assigned_to uuid references public.profiles(id),
  follow_up_date date,
  notes text,
  converted_student_id uuid references public.students(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Coaching members can view leads" on public.leads
  for select using (coaching_id in (select public.get_user_coaching_ids()));

create policy "Owner can manage leads" on public.leads
  for all using (
    public.is_super_admin() or public.is_coaching_teacher_or_owner(coaching_id)
  );

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id),
  type public.notification_type not null default 'general',
  title text not null,
  message text not null,
  is_read boolean not null default false,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications" on public.notifications
  for select using (recipient_id = auth.uid());

create policy "Users can mark notifications read" on public.notifications
  for update using (recipient_id = auth.uid());

-- ============================================================
-- TRIGGERS - updated_at auto-update
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.coachings
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.batches
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.students
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.fee_transactions
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.leads
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- TRIGGER - Auto-create profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'coaching_owner')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- INDEXES for performance
-- ============================================================

create index idx_coaching_members_profile on public.coaching_members(profile_id);
create index idx_coaching_members_coaching on public.coaching_members(coaching_id);
create index idx_students_coaching on public.students(coaching_id);
create index idx_attendance_batch_date on public.attendance(batch_id, date);
create index idx_attendance_student on public.attendance(student_id);
create index idx_fee_transactions_student on public.fee_transactions(student_id);
create index idx_fee_transactions_status on public.fee_transactions(coaching_id, status);
create index idx_leads_coaching_status on public.leads(coaching_id, status);
create index idx_notifications_recipient on public.notifications(recipient_id, is_read);
