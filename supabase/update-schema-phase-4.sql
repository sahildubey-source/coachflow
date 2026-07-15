-- ============================================================
-- CoachFlow - Phase 4 Schema Updates
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create student_batches junction table for Many-to-Many enrollments
CREATE TABLE IF NOT EXISTS public.student_batches (
  id uuid primary key default uuid_generate_v4(),
  coaching_id uuid not null references public.coachings(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  status text not null default 'active', -- 'active', 'dropped', 'completed'
  unique(student_id, batch_id)
);

-- 2. Enable RLS on student_batches
ALTER TABLE public.student_batches ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for student_batches
DROP POLICY IF EXISTS "Coaching members can view enrollments" ON public.student_batches;
CREATE POLICY "Coaching members can view enrollments" ON public.student_batches
  FOR SELECT USING (coaching_id IN (SELECT public.get_user_coaching_ids()));

DROP POLICY IF EXISTS "Teacher/owner can manage enrollments" ON public.student_batches;
CREATE POLICY "Teacher/owner can manage enrollments" ON public.student_batches
  FOR ALL USING (
    public.is_super_admin() OR public.is_coaching_teacher_or_owner(coaching_id)
  );

-- 4. Re-create attendance table just in case it's not well suited for batch-level tracking,
-- Actually, the existing attendance table in schema.sql is already good. We just need to make sure 
-- it supports recording by batch_id and student_id. Let's verify it or alter it if needed.
-- Wait, schema.sql already has:
-- create table public.attendance (
--   id uuid primary key default uuid_generate_v4(),
--   coaching_id uuid not null references public.coachings(id) on delete cascade,
--   batch_id uuid not null references public.batches(id) on delete cascade,
--   student_id uuid not null references public.students(id) on delete cascade,
--   date date not null,
--   status public.attendance_status not null,
--   ...
-- );
-- This is perfect for batch per day attendance tracking!
-- We just need to ensure there is a unique constraint so a student isn't marked twice in a batch on the same day.

-- (Attendance table is already correctly structured with the unique constraint in the original schema)
