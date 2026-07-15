-- Allow teachers to read batches and fee_structures

-- 1. Teachers can read batches
DROP POLICY IF EXISTS "Teacher can view batches" ON public.batches;
CREATE POLICY "Teacher can view batches" ON public.batches
  FOR SELECT USING (
    public.is_coaching_teacher_or_owner(coaching_id)
  );

-- 2. Teachers can read fee structures (needed if they are allowed to record fees)
DROP POLICY IF EXISTS "Teacher can view fee structures" ON public.fee_structures;
CREATE POLICY "Teacher can view fee structures" ON public.fee_structures
  FOR SELECT USING (
    public.is_coaching_teacher_or_owner(coaching_id)
  );

-- Note: We already added SELECT for coaching_members in fix-coaching-members-rls.sql
