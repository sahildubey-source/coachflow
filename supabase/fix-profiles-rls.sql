-- Fix infinite recursion in profiles table policies

-- 1. Drop the problematic recursive policy
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;

-- 2. Create a secure function to check super admin status that definitely avoids recursion
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- 3. Recreate the super admin policy using the secure function
CREATE POLICY "Super admin can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.is_super_admin()
  );

-- 4. Add a policy so coaching members can view the profiles of other members in their coaching institute
-- We use the get_user_coaching_ids() function we already created
DROP POLICY IF EXISTS "Coaching members can view other members profiles" ON public.profiles;
CREATE POLICY "Coaching members can view other members profiles" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT profile_id FROM public.coaching_members
      WHERE coaching_id IN (SELECT public.get_user_coaching_ids())
    )
  );
