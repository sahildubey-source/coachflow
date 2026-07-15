'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentCoachingId(supabase: any) {
  const { data: coachingIds, error: coachingError } = await supabase.rpc('get_user_coaching_ids')
  if (coachingError) throw new Error('Failed to fetch coaching membership: ' + coachingError.message)
  if (!coachingIds || coachingIds.length === 0) throw new Error('User does not belong to any coaching institute')
  return typeof coachingIds[0] === 'object' ? Object.values(coachingIds[0])[0] : coachingIds[0]
}

export type FeeStructureFormData = {
  name: string
  amount: string
  frequency: string
  description?: string
}

export async function createFeeStructure(data: FeeStructureFormData) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { error } = await supabase
      .from('fee_structures')
      .insert({
        coaching_id: coachingId,
        name: data.name,
        amount: parseFloat(data.amount),
        frequency: data.frequency,
        description: data.description || null,
        is_active: true
      })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/fees/structures')
    return { success: true }
  } catch (err: any) {
    console.error('Create fee structure exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function updateFeeStructure(id: string, data: FeeStructureFormData) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { error } = await supabase
      .from('fee_structures')
      .update({
        name: data.name,
        amount: parseFloat(data.amount),
        frequency: data.frequency,
        description: data.description || null,
      })
      .eq('id', id)
      .eq('coaching_id', coachingId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/fees/structures')
    return { success: true }
  } catch (err: any) {
    console.error('Update fee structure exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function getFeeStructures() {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { data, error } = await supabase
      .from('fee_structures')
      .select('*')
      .eq('coaching_id', coachingId)
      .order('created_at', { ascending: false })

    if (error) return { success: false, error: error.message, data: [] }
    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get fee structures exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}
