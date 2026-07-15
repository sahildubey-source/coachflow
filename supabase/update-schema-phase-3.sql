-- ============================================================
-- CoachFlow - Phase 3 Schema Updates
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create a dedicated teachers table (for dummy data / unauthenticated staff)
CREATE TABLE IF NOT EXISTS public.teachers (
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

-- 2. Enable RLS on teachers
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for teachers
DROP POLICY IF EXISTS "Coaching members can view teachers" ON public.teachers;
CREATE POLICY "Coaching members can view teachers" ON public.teachers
  FOR SELECT USING (coaching_id IN (SELECT public.get_user_coaching_ids()));

DROP POLICY IF EXISTS "Coaching owner can manage teachers" ON public.teachers;
CREATE POLICY "Coaching owner can manage teachers" ON public.teachers
  FOR ALL USING (
    public.is_super_admin() OR public.is_coaching_owner(coaching_id)
  );

-- 4. Update the batches table to reference the new teachers table
-- We have to drop the foreign key and column first if it exists, then add the new one.
ALTER TABLE public.batches 
  DROP CONSTRAINT IF EXISTS batches_teacher_id_fkey;

-- We assume teacher_id was pointing to profiles, we will just alter it to point to teachers instead.
-- Wait, if it exists as UUID, we just change the constraint:
ALTER TABLE public.batches 
  ADD CONSTRAINT batches_teacher_id_fkey 
  FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;
