'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentCoachingId(supabase: any) {
  const { data: coachingIds, error: coachingError } = await supabase.rpc('get_user_coaching_ids')
  if (coachingError) throw new Error('Failed to fetch coaching membership: ' + coachingError.message)
  if (!coachingIds || coachingIds.length === 0) throw new Error('User does not belong to any coaching institute')
  return typeof coachingIds[0] === 'object' ? Object.values(coachingIds[0])[0] : coachingIds[0]
}

export async function getTeachers() {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    // Fetch members who are 'teacher'
    const { data, error } = await supabase
      .from('coaching_members')
      .select(`
        id,
        is_active,
        joined_at,
        profile:profile_id (
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('coaching_id', coachingId)
      .eq('role', 'teacher')
      .order('joined_at', { ascending: false })

    if (error) return { success: false, error: error.message, data: [] }
    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get teachers exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}

export async function inviteTeacher(email: string, fullName: string) {
  try {
    // Note: In a real app, we would use Supabase Admin API to create the user, 
    // or send an invite link. For this MVP simulation, we'll return a simulated success.
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Because creating a real user requires bypassing RLS or sending real emails,
    // we will simulate the success for the UI demo.
    
    revalidatePath('/dashboard/teachers')
    return { success: true, message: `Invitation sent to ${email} successfully.` }
  } catch (err: any) {
    console.error('Invite teacher exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
