-- Fix teacher RLS access to coaching_members

-- The previous policy only allowed coaching_owner to do anything (including SELECT).
-- We need to allow teachers to SELECT from coaching_members so they can log in and see their own institute.
-- We use our existing SECURITY DEFINER function to prevent infinite recursion.

DROP POLICY IF EXISTS "Members can view coaching members" ON public.coaching_members;
CREATE POLICY "Members can view coaching members" ON public.coaching_members
  FOR SELECT USING (
    public.is_super_admin() OR public.is_coaching_teacher_or_owner(coaching_id)
  );

-- Also ensure that users can ALWAYS at least view their own row, just in case
DROP POLICY IF EXISTS "Users can view own coaching membership" ON public.coaching_members;
CREATE POLICY "Users can view own coaching membership" ON public.coaching_members
  FOR SELECT USING (
    profile_id = auth.uid()
  );
