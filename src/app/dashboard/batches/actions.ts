'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentCoachingId(supabase: any) {
  const { data: coachingIds, error: coachingError } = await supabase.rpc('get_user_coaching_ids')
  
  if (coachingError) {
    throw new Error('Failed to fetch coaching membership: ' + coachingError.message)
  }

  if (!coachingIds || coachingIds.length === 0) {
    throw new Error('User does not belong to any coaching institute')
  }

  const coachingId = typeof coachingIds[0] === 'object' ? Object.values(coachingIds[0])[0] : coachingIds[0]
  return coachingId
}

export type BatchFormData = {
  name: string
  subject?: string
  description?: string
  teacherId?: string
  startTime?: string
  endTime?: string
  daysOfWeek?: string[]
  startDate?: string
  endDate?: string
  maxStudents?: number
  feeAmount?: string
}

export async function createBatch(data: BatchFormData) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { error } = await supabase
      .from('batches')
      .insert({
        coaching_id: coachingId,
        name: data.name,
        subject: data.subject || null,
        description: data.description || null,
        teacher_id: data.teacherId || null,
        start_time: data.startTime || null,
        end_time: data.endTime || null,
        days_of_week: data.daysOfWeek || [],
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        max_students: data.maxStudents || null,
        fee_amount: data.feeAmount ? parseFloat(data.feeAmount) : null,
        is_active: true
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/batches')
    return { success: true }
  } catch (err: any) {
    console.error('Create batch exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function updateBatch(id: string, data: BatchFormData) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { error } = await supabase
      .from('batches')
      .update({
        name: data.name,
        subject: data.subject || null,
        description: data.description || null,
        teacher_id: data.teacherId || null,
        start_time: data.startTime || null,
        end_time: data.endTime || null,
        days_of_week: data.daysOfWeek || [],
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        max_students: data.maxStudents || null,
        fee_amount: data.feeAmount ? parseFloat(data.feeAmount) : null,
      })
      .eq('id', id)
      .eq('coaching_id', coachingId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/batches')
    return { success: true }
  } catch (err: any) {
    console.error('Update batch exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function getBatches(query?: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    let dbQuery = supabase
      .from('batches')
      .select('*, teacher:teacher_id(full_name)')
      .eq('coaching_id', coachingId)
      .order('created_at', { ascending: false })

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,subject.ilike.%${query}%`)
    }

    const { data, error } = await dbQuery

    if (error) {
      console.error('Error fetching batches:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get batches exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}
