'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// We define a base type for student data to be passed from the client
export interface StudentFormData {
  fullName: string
  enrollmentNo?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  notes?: string
  batchIds?: string[]
}

/**
 * Helper to fetch the current user's active coaching_id.
 * Assumes the user is logged in and belongs to at least one coaching.
 */
async function getCurrentCoachingId(supabase: any) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    throw new Error('Not authenticated')
  }

  // Use the rpc function from our schema to get coaching ids
  const { data: coachingIds, error: coachingError } = await supabase.rpc('get_user_coaching_ids')
  
  if (coachingError) {
    throw new Error('Failed to fetch coaching membership: ' + coachingError.message)
  }

  console.log('coachingIds from RPC:', coachingIds)

  if (!coachingIds || coachingIds.length === 0) {
    throw new Error('User does not belong to any coaching institute')
  }

  // Handle case where Postgres returns array of objects [{ get_user_coaching_ids: 'uuid' }]
  const coachingId = typeof coachingIds[0] === 'object' ? Object.values(coachingIds[0])[0] : coachingIds[0]
  console.log('resolved coachingId:', coachingId)
  
  return coachingId
}

export async function createStudent(data: StudentFormData) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    // Auto-generate enrollment number if not provided
    let enrollmentNo = data.enrollmentNo
    if (!enrollmentNo) {
      enrollmentNo = `STU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }

    const { data: student, error } = await supabase
      .from('students')
      .insert({
        coaching_id: coachingId,
        full_name: data.fullName,
        enrollment_no: enrollmentNo,
        email: data.email || null,
        phone: data.phone || null,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender || null,
        address: data.address || null,
        parent_name: data.parentName || null,
        parent_phone: data.parentPhone || null,
        parent_email: data.parentEmail || null,
        notes: data.notes || null,
        batch_ids: data.batchIds || [],
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating student:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/students')
    return { success: true, student }
  } catch (err: any) {
    console.error('Create student exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function updateStudent(id: string, data: Partial<StudentFormData>) {
  try {
    const supabase = await createClient()
    
    // RLS ensures they can only update students belonging to their coaching
    const { data: student, error } = await supabase
      .from('students')
      .update({
        full_name: data.fullName,
        enrollment_no: data.enrollmentNo,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        parent_name: data.parentName,
        parent_phone: data.parentPhone,
        parent_email: data.parentEmail,
        notes: data.notes,
        batch_ids: data.batchIds,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating student:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/students')
    revalidatePath(`/dashboard/students/${id}`)
    return { success: true, student }
  } catch (err: any) {
    console.error('Update student exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function deleteStudent(id: string) {
  try {
    const supabase = await createClient()
    
    // Using soft delete as best practice
    const { error } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting student:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/students')
    return { success: true }
  } catch (err: any) {
    console.error('Delete student exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function getStudents(query?: string, status?: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    let dbQuery = supabase
      .from('students')
      .select('*')
      .eq('coaching_id', coachingId)
      .order('created_at', { ascending: false })

    if (query) {
      dbQuery = dbQuery.or(`full_name.ilike.%${query}%,enrollment_no.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    }

    if (status && status !== 'all') {
      dbQuery = dbQuery.eq('is_active', status === 'active')
    }

    const { data, error } = await dbQuery

    if (error) {
      console.error('Error fetching students:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get students exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}
