'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentCoachingId(supabase: any) {
  const { data: coachingIds, error: coachingError } = await supabase.rpc('get_user_coaching_ids')
  if (coachingError) throw new Error('Failed to fetch coaching membership: ' + coachingError.message)
  if (!coachingIds || coachingIds.length === 0) throw new Error('User does not belong to any coaching institute')
  return typeof coachingIds[0] === 'object' ? Object.values(coachingIds[0])[0] : coachingIds[0]
}

export type TransactionFormData = {
  studentId: string
  feeStructureId?: string
  amount: string
  discount?: string
  status: 'pending' | 'paid' | 'overdue' | 'waived'
  dueDate?: string
  paidDate?: string
  paymentMethod?: string
  notes?: string
}

export async function createTransaction(data: TransactionFormData) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const amount = parseFloat(data.amount)
    const discount = data.discount ? parseFloat(data.discount) : 0
    const finalAmount = amount - discount

    const { data: user } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('fee_transactions')
      .insert({
        coaching_id: coachingId,
        student_id: data.studentId,
        fee_structure_id: data.feeStructureId || null,
        amount: amount,
        discount: discount,
        final_amount: finalAmount,
        status: data.status,
        due_date: data.dueDate || null,
        paid_date: data.paidDate || (data.status === 'paid' ? new Date().toISOString() : null),
        payment_method: data.paymentMethod || null,
        collected_by: user?.user?.id,
        notes: data.notes || null,
      })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/fees')
    revalidatePath(`/dashboard/students/${data.studentId}`)
    return { success: true }
  } catch (err: any) {
    console.error('Create transaction exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function getTransactions(query?: string, status?: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    let dbQuery = supabase
      .from('fee_transactions')
      .select(`
        *,
        student:student_id(full_name, enrollment_no),
        fee_structure:fee_structure_id(name)
      `)
      .eq('coaching_id', coachingId)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      dbQuery = dbQuery.eq('status', status)
    }

    const { data, error } = await dbQuery

    if (error) return { success: false, error: error.message, data: [] }
    
    // Manual filtering for search query if needed since we are joining
    let filteredData = data || []
    if (query) {
      const q = query.toLowerCase()
      filteredData = filteredData.filter((t: any) => 
        t.student?.full_name.toLowerCase().includes(q) || 
        t.fee_structure?.name.toLowerCase().includes(q)
      )
    }

    return { success: true, data: filteredData }
  } catch (err: any) {
    console.error('Get transactions exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}

export async function markTransactionPaid(id: string, paymentMethod: string = 'cash') {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)
    const { data: user } = await supabase.auth.getUser()

    // First get the transaction to know which student's page to revalidate
    const { data: tx, error: fetchError } = await supabase
      .from('fee_transactions')
      .select('student_id')
      .eq('id', id)
      .eq('coaching_id', coachingId)
      .single()

    if (fetchError || !tx) return { success: false, error: 'Transaction not found' }

    const { error } = await supabase
      .from('fee_transactions')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        payment_method: paymentMethod,
        collected_by: user?.user?.id
      })
      .eq('id', id)
      .eq('coaching_id', coachingId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/fees')
    revalidatePath(`/dashboard/students/${tx.student_id}`)
    return { success: true }
  } catch (err: any) {
    console.error('Mark paid exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function getRevenueData() {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    // A simple aggregation for the chart. 
    // Grouping by month.
    const { data, error } = await supabase
      .from('fee_transactions')
      .select('final_amount, paid_date')
      .eq('coaching_id', coachingId)
      .eq('status', 'paid')

    if (error) return { success: false, error: error.message, data: [] }

    // Process data to group by month
    const monthlyData: Record<string, number> = {}
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const monthStr = d.toLocaleString('default', { month: 'short' })
      monthlyData[monthStr] = 0
    }

    if (data) {
      data.forEach(tx => {
        if (tx.paid_date) {
          const d = new Date(tx.paid_date)
          const monthStr = d.toLocaleString('default', { month: 'short' })
          if (monthlyData[monthStr] !== undefined) {
            monthlyData[monthStr] += Number(tx.final_amount)
          }
        }
      })
    }

    const chartData = Object.keys(monthlyData).map(month => ({
      name: month,
      total: monthlyData[month]
    }))

    return { success: true, data: chartData }
  } catch (err: any) {
    console.error('Get revenue data exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}

export async function getStudentFees(studentId: string) {
  try {
    const supabase = await createClient()
    const coachingId = await getCurrentCoachingId(supabase)

    const { data, error } = await supabase
      .from('fee_transactions')
      .select('*, fee_structure:fee_structure_id(name)')
      .eq('student_id', studentId)
      .eq('coaching_id', coachingId)
      .order('created_at', { ascending: false })

    if (error) return { success: false, error: error.message, data: [] }
    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get student fees exception:', err)
    return { success: false, error: err.message || 'An unexpected error occurred', data: [] }
  }
}
