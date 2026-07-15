'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentCoachingId(supabase: any) {
  const { data: coachingIds, error: coachingError } = await supabase.rpc('get_user_coaching_ids')
  if (coachingError) throw new Error('Failed to fetch coaching membership: ' + coachingError.message)
  if (!coachingIds || coachingIds.length === 0) throw new Error('User does not belong to any coaching institute')
  return typeof coachingIds[0] === 'object' ? Object.values(coachingIds[0])[0] : coachingIds[0]
}

export async function getCoachingSettings() {
  try {
    const supabase = await createClient()
    if (!supabase) return { success: false, error: 'Not configured', data: null }

    // Check role — only owner can access settings
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated', data: null }

    const { data: memberData } = await supabase
      .from('coaching_members')
      .select('role, coaching_id')
      .eq('profile_id', user.id)
      .eq('is_active', true)
      .single()

    if (!memberData) return { success: false, error: 'ACCESS_DENIED', data: null }
    if (memberData.role !== 'coaching_owner') return { success: false, error: 'ACCESS_DENIED', data: null }

    const { data, error } = await supabase
      .from('coachings')
      .select('*')
      .eq('id', memberData.coaching_id)
      .single()

    if (error) return { success: false, error: error.message, data: null }
    return { success: true, data, error: null }
  } catch (err: any) {
    console.error('Get settings exception:', err)
    return { success: false, error: err.message, data: null }
  }
}

export type CoachingSettingsData = {
  name: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  email?: string
  website?: string
}

export async function updateCoachingSettings(data: CoachingSettingsData) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { error } = await supabase
      .from('coachings')
      .update({
        name: data.name,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
      })
      .eq('id', coachingId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (err: any) {
    console.error('Update settings exception:', err)
    return { success: false, error: err.message }
  }
}
