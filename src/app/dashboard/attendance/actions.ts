'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentCoachingId(supabase: any) {
  const { data: coachingIds, error: coachingError } = await supabase.rpc('get_user_coaching_ids')
  if (coachingError) throw new Error('Failed to fetch coaching membership: ' + coachingError.message)
  if (!coachingIds || coachingIds.length === 0) throw new Error('User does not belong to any coaching institute')
  return typeof coachingIds[0] === 'object' ? Object.values(coachingIds[0])[0] : coachingIds[0]
}

export async function getAttendance(batchId: string, date: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    // First get all enrolled students for this batch
    const { data: enrollments, error: enrollError } = await supabase
      .from('student_batches')
      .select('student_id, student:student_id(full_name, enrollment_no)')
      .eq('batch_id', batchId)
      .eq('coaching_id', coachingId)
      .eq('status', 'active')

    if (enrollError) return { success: false, error: enrollError.message, data: [] }

    // Then get attendance records for this date
    const { data: attendance, error: attError } = await supabase
      .from('attendance')
      .select('student_id, status, notes')
      .eq('batch_id', batchId)
      .eq('date', date)
      .eq('coaching_id', coachingId)

    if (attError) return { success: false, error: attError.message, data: [] }

    // Merge them
    const records = enrollments?.map(enroll => {
      const record = attendance?.find(a => a.student_id === enroll.student_id)
      return {
        studentId: enroll.student_id,
        studentName: enroll.student.full_name,
        enrollmentNo: enroll.student.enrollment_no,
        status: record ? record.status : 'unmarked',
        notes: record ? record.notes : ''
      }
    }) || []

    return { success: true, data: records }
  } catch (err: any) {
    console.error('Get attendance exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}

export type AttendanceRecord = {
  studentId: string
  status: 'present' | 'absent' | 'late' | 'excused' | 'unmarked'
  notes?: string
}

export async function markAttendance(batchId: string, date: string, records: AttendanceRecord[]) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)
    
    const { data: user } = await supabase.auth.getUser()
    const markerId = user?.user?.id

    // We only want to save marked records
    const recordsToSave = records.filter(r => r.status !== 'unmarked')

    // Since Supabase `upsert` needs to match the unique constraint, 
    // and we have `unique(batch_id, student_id, date)`, we can bulk upsert!
    const payload = recordsToSave.map(r => ({
      coaching_id: coachingId,
      batch_id: batchId,
      student_id: r.studentId,
      date: date,
      status: r.status,
      notes: r.notes || null,
      marked_by: markerId
    }))

    if (payload.length > 0) {
      const { error } = await supabase
        .from('attendance')
        .upsert(payload, { 
          onConflict: 'batch_id, student_id, date',
          ignoreDuplicates: false
        })

      if (error) return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/attendance')
    return { success: true }
  } catch (err: any) {
    console.error('Mark attendance exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
