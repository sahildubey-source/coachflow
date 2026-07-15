'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentCoachingId(supabase: any) {
  const { data: coachingIds, error: coachingError } = await supabase.rpc('get_user_coaching_ids')
  if (coachingError) throw new Error('Failed to fetch coaching membership: ' + coachingError.message)
  if (!coachingIds || coachingIds.length === 0) throw new Error('User does not belong to any coaching institute')
  return typeof coachingIds[0] === 'object' ? Object.values(coachingIds[0])[0] : coachingIds[0]
}

export async function createTest(data: {
  name: string
  subject?: string
  batchId?: string
  testDate?: string
  totalMarks: number
  passingMarks?: number
  description?: string
}) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)
    const { data: user } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('tests')
      .insert({
        coaching_id: coachingId,
        name: data.name,
        subject: data.subject || null,
        batch_id: data.batchId || null,
        test_date: data.testDate || null,
        total_marks: data.totalMarks,
        passing_marks: data.passingMarks || null,
        description: data.description || null,
        created_by: user?.user?.id
      })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/tests')
    return { success: true }
  } catch (err: any) {
    console.error('Create test exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function getTests() {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { data, error } = await supabase
      .from('tests')
      .select('*, batch:batch_id(name)')
      .eq('coaching_id', coachingId)
      .order('test_date', { ascending: false })

    if (error) return { success: false, error: error.message, data: [] }
    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get tests exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}

export async function getTestDetails(id: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    // Get test details
    const { data: test, error } = await supabase
      .from('tests')
      .select('*, batch:batch_id(name)')
      .eq('id', id)
      .eq('coaching_id', coachingId)
      .single()

    if (error) return { success: false, error: error.message, test: null, results: [] }

    // If test is linked to a batch, get all students in that batch
    let students: any[] = []
    if (test.batch_id) {
      const { data: enrollments } = await supabase
        .from('student_batches')
        .select('student_id, student:student_id(full_name, enrollment_no)')
        .eq('batch_id', test.batch_id)
        .eq('status', 'active')
        .eq('coaching_id', coachingId)
      
      students = enrollments || []
    }

    // Get existing results
    const { data: existingResults } = await supabase
      .from('test_results')
      .select('*')
      .eq('test_id', id)
      .eq('coaching_id', coachingId)

    // Merge students with results (if any)
    const mergedResults = students.map(enroll => {
      const existing = existingResults?.find(r => r.student_id === enroll.student_id)
      return {
        studentId: enroll.student_id,
        studentName: enroll.student.full_name,
        enrollmentNo: enroll.student.enrollment_no,
        marksObtained: existing?.marks_obtained ?? '',
        isAbsent: existing?.is_absent ?? false,
        remarks: existing?.remarks ?? ''
      }
    })

    return { success: true, test, results: mergedResults }
  } catch (err: any) {
    console.error('Get test details exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', test: null, results: [] }
  }
}

export async function saveTestResults(testId: string, results: any[]) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)
    const { data: user } = await supabase.auth.getUser()

    // Filter out rows where marks are empty and not marked absent
    const validResults = results.filter(r => r.marksObtained !== '' || r.isAbsent)

    const payload = validResults.map(r => ({
      coaching_id: coachingId,
      test_id: testId,
      student_id: r.studentId,
      marks_obtained: r.isAbsent ? null : (r.marksObtained ? parseFloat(r.marksObtained) : 0),
      is_absent: r.isAbsent,
      remarks: r.remarks || null,
      entered_by: user?.user?.id
    }))

    if (payload.length > 0) {
      const { error } = await supabase
        .from('test_results')
        .upsert(payload, { 
          onConflict: 'test_id, student_id',
          ignoreDuplicates: false
        })

      if (error) return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/tests/${testId}`)
    return { success: true }
  } catch (err: any) {
    console.error('Save test results exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function getStudentTestScores(studentId: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { data, error } = await supabase
      .from('test_results')
      .select('*, test:test_id(name, test_date, total_marks, subject)')
      .eq('student_id', studentId)
      .eq('coaching_id', coachingId)
      .order('created_at', { ascending: false })

    if (error) return { success: false, error: error.message, data: [] }
    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get student tests exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}
