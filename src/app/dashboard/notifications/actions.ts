'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentCoachingId(supabase: any) {
  const { data: coachingIds, error: coachingError } = await supabase.rpc('get_user_coaching_ids')
  if (coachingError) throw new Error('Failed to fetch coaching membership: ' + coachingError.message)
  if (!coachingIds || coachingIds.length === 0) throw new Error('User does not belong to any coaching institute')
  return typeof coachingIds[0] === 'object' ? Object.values(coachingIds[0])[0] : coachingIds[0]
}

export async function getNotifications(unreadOnly = false) {
  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()

    if (!user?.user) return { success: false, error: 'Not authenticated', data: [] }

    let dbQuery = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.user.id)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      dbQuery = dbQuery.eq('is_read', false)
    }

    const { data, error } = await dbQuery

    if (error) return { success: false, error: error.message, data: [] }
    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get notifications exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}

export async function markNotificationRead(id: string) {
  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('recipient_id', user?.user?.id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/notifications')
    return { success: true }
  } catch (err: any) {
    console.error('Mark read exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function markAllNotificationsRead() {
  try {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', user?.user?.id)
      .eq('is_read', false)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/notifications')
    return { success: true }
  } catch (err: any) {
    console.error('Mark all read exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
