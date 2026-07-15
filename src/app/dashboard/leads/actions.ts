'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentCoachingId(supabase: any) {
  const { data: coachingIds, error: coachingError } = await supabase.rpc('get_user_coaching_ids')
  if (coachingError) throw new Error('Failed to fetch coaching membership: ' + coachingError.message)
  if (!coachingIds || coachingIds.length === 0) throw new Error('User does not belong to any coaching institute')
  return typeof coachingIds[0] === 'object' ? Object.values(coachingIds[0])[0] : coachingIds[0]
}

export type LeadFormData = {
  fullName: string
  phone?: string
  email?: string
  source?: string
  interestedIn?: string
  status?: 'new' | 'contacted' | 'follow_up' | 'converted' | 'lost'
  followUpDate?: string
  notes?: string
}

export async function createLead(data: LeadFormData) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { error } = await supabase
      .from('leads')
      .insert({
        coaching_id: coachingId,
        full_name: data.fullName,
        phone: data.phone || null,
        email: data.email || null,
        source: data.source || null,
        interested_in: data.interestedIn || null,
        status: data.status || 'new',
        follow_up_date: data.followUpDate || null,
        notes: data.notes || null,
      })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/leads')
    return { success: true }
  } catch (err: any) {
    console.error('Create lead exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function getLeads(statusFilter?: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    let dbQuery = supabase
      .from('leads')
      .select('*')
      .eq('coaching_id', coachingId)
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      dbQuery = dbQuery.eq('status', statusFilter)
    }

    const { data, error } = await dbQuery

    if (error) return { success: false, error: error.message, data: [] }
    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get leads exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}

export async function updateLeadStatus(id: string, newStatus: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', id)
      .eq('coaching_id', coachingId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/leads')
    return { success: true }
  } catch (err: any) {
    console.error('Update lead status exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
