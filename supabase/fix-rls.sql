-- Fix infinite recursion in coaching_members policies

-- 1. Drop the existing recursive policy
DROP POLICY IF EXISTS "Coaching owner can manage members" ON public.coaching_members;

-- 2. Create a security definer function to check if current user is owner
CREATE OR REPLACE FUNCTION public.is_coaching_owner(c_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coaching_members
    WHERE coaching_id = c_id 
      AND profile_id = auth.uid() 
      AND role = 'coaching_owner' 
      AND is_active = true
  );
$$;

-- 3. Create a security definer function to check if current user is teacher or owner
CREATE OR REPLACE FUNCTION public.is_coaching_teacher_or_owner(c_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coaching_members
    WHERE coaching_id = c_id 
      AND profile_id = auth.uid() 
      AND role IN ('coaching_owner', 'teacher') 
      AND is_active = true
  );
$$;

-- 4. Recreate the policy using the security definer function to prevent recursion
CREATE POLICY "Coaching owner can manage members" ON public.coaching_members
  FOR ALL USING (
    public.is_super_admin() OR public.is_coaching_owner(coaching_id)
  );

-- 5. Update other policies that query coaching_members to use the new function for better performance
DROP POLICY IF EXISTS "Owner/teacher can manage students" ON public.students;
CREATE POLICY "Owner/teacher can manage students" ON public.students
  FOR ALL USING (
    public.is_super_admin() OR public.is_coaching_teacher_or_owner(coaching_id)
  );

DROP POLICY IF EXISTS "Teacher/owner can manage attendance" ON public.attendance;
CREATE POLICY "Teacher/owner can manage attendance" ON public.attendance
  FOR ALL USING (
    public.is_super_admin() OR public.is_coaching_teacher_or_owner(coaching_id)
  );

DROP POLICY IF EXISTS "Owner can manage fee structures" ON public.fee_structures;
CREATE POLICY "Owner can manage fee structures" ON public.fee_structures
  FOR ALL USING (
    public.is_super_admin() OR public.is_coaching_owner(coaching_id)
  );

DROP POLICY IF EXISTS "Owner can manage fee transactions" ON public.fee_transactions;
CREATE POLICY "Owner can manage fee transactions" ON public.fee_transactions
  FOR ALL USING (
    public.is_super_admin() OR public.is_coaching_teacher_or_owner(coaching_id)
  );

DROP POLICY IF EXISTS "Teacher/owner can manage tests" ON public.tests;
CREATE POLICY "Teacher/owner can manage tests" ON public.tests
  FOR ALL USING (
    public.is_super_admin() OR public.is_coaching_teacher_or_owner(coaching_id)
  );

DROP POLICY IF EXISTS "Teacher/owner can manage test results" ON public.test_results;
CREATE POLICY "Teacher/owner can manage test results" ON public.test_results
  FOR ALL USING (
    public.is_super_admin() OR public.is_coaching_teacher_or_owner(coaching_id)
  );

DROP POLICY IF EXISTS "Owner can manage leads" ON public.leads;
CREATE POLICY "Owner can manage leads" ON public.leads
  FOR ALL USING (
    public.is_super_admin() OR public.is_coaching_teacher_or_owner(coaching_id)
  );

DROP POLICY IF EXISTS "Coaching owner can manage batches" ON public.batches;
CREATE POLICY "Coaching owner can manage batches" ON public.batches
  FOR ALL USING (
    public.is_super_admin() OR public.is_coaching_owner(coaching_id)
  );
