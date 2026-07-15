'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentCoachingId(supabase: any) {
  const { data: coachingIds, error: coachingError } = await supabase.rpc('get_user_coaching_ids')
  if (coachingError) throw new Error('Failed to fetch coaching membership: ' + coachingError.message)
  if (!coachingIds || coachingIds.length === 0) throw new Error('User does not belong to any coaching institute')
  return typeof coachingIds[0] === 'object' ? Object.values(coachingIds[0])[0] : coachingIds[0]
}

export async function enrollStudent(studentId: string, batchId: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    // Check if already enrolled
    const { data: existing, error: checkError } = await supabase
      .from('student_batches')
      .select('id')
      .eq('student_id', studentId)
      .eq('batch_id', batchId)
      .maybeSingle()

    if (checkError) return { success: false, error: checkError.message }
    if (existing) return { success: false, error: 'Student is already enrolled in this batch.' }

    const { error } = await supabase
      .from('student_batches')
      .insert({
        coaching_id: coachingId,
        student_id: studentId,
        batch_id: batchId,
        status: 'active'
      })

    if (error) return { success: false, error: error.message }

    revalidatePath(`/dashboard/batches/${batchId}`)
    revalidatePath(`/dashboard/students/${studentId}`)
    return { success: true }
  } catch (err: any) {
    console.error('Enroll student exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function unenrollStudent(studentId: string, batchId: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { error } = await supabase
      .from('student_batches')
      .delete()
      .eq('student_id', studentId)
      .eq('batch_id', batchId)
      .eq('coaching_id', coachingId)

    if (error) return { success: false, error: error.message }

    revalidatePath(`/dashboard/batches/${batchId}`)
    revalidatePath(`/dashboard/students/${studentId}`)
    return { success: true }
  } catch (err: any) {
    console.error('Unenroll student exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function getEnrolledBatches(studentId: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { data, error } = await supabase
      .from('student_batches')
      .select(`
        id,
        status,
        enrolled_at,
        batch:batch_id (*)
      `)
      .eq('student_id', studentId)
      .eq('coaching_id', coachingId)

    if (error) return { success: false, error: error.message, data: [] }
    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get enrolled batches exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}

export async function getBatchStudents(batchId: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { data, error } = await supabase
      .from('student_batches')
      .select(`
        id,
        status,
        enrolled_at,
        student:student_id (*)
      `)
      .eq('batch_id', batchId)
      .eq('coaching_id', coachingId)

    if (error) return { success: false, error: error.message, data: [] }
    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get batch students exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}
