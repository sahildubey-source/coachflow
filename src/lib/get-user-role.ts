import { createClient } from '@/lib/supabase/server'

/**
 * Returns the current user's coaching role and coaching_id.
 * Returns null if unauthenticated or not a member of any coaching.
 */
export async function getUserCoachingRole(): Promise<{
  role: string
  coachingId: string
  userId: string
} | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('coaching_members')
    .select('role, coaching_id')
    .eq('profile_id', user.id)
    .eq('is_active', true)
    .single()

  if (!member) return null

  return {
    role: member.role,
    coachingId: member.coaching_id,
    userId: user.id,
  }
}

export function isOwner(role: string) {
  return role === 'coaching_owner'
}

export function isTeacher(role: string) {
  return role === 'teacher'
}
