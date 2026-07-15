'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkSuperAdmin() {
  const supabase = await createClient()
  if (!supabase) return { isSuperAdmin: false }
  
  const { data: user } = await supabase.auth.getUser()
  
  if (!user?.user) return { isSuperAdmin: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.user.id)
    .single()

  return { 
    isSuperAdmin: profile?.role === 'super_admin',
    user: user.user 
  }
}

export async function getGlobalStats() {
  try {
    const supabase = await createClient()
    if (!supabase) return { success: false, error: 'Supabase client not initialized' }
    
    // We use service role to bypass RLS for aggregate super_admin stats 
    // OR we can just rely on the super_admin RLS bypass if configured correctly.
    // Our DB function public.is_super_admin() bypasses most RLS, but to be safe and fast:
    
    const [coachingsRes, usersRes, studentsRes] = await Promise.all([
      supabase.from('coachings').select('id, is_active, plan', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('students').select('id', { count: 'exact', head: true })
    ])

    return {
      success: true,
      stats: {
        totalCoachings: coachingsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalStudents: studentsRes.count || 0,
      }
    }
  } catch (err: any) {
    console.error('Get global stats error:', err)
    return { success: false, error: err.message }
  }
}

export async function getAllCoachings() {
  try {
    const supabase = await createClient()
    if (!supabase) return { success: true, data: [] }
    
    const { data, error } = await supabase
      .from('coachings')
      .select(`
        *,
        owner:owner_id(full_name, email),
        members:coaching_members(count),
        students:students(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('Get all coachings error:', err)
    return { success: false, error: err.message, data: [] }
  }
}

export async function toggleCoachingStatus(coachingId: string, currentStatus: boolean) {
  try {
    const supabase = await createClient()
    if (!supabase) return { success: false, error: 'Supabase client not initialized' }
    
    const { error } = await supabase
      .from('coachings')
      .update({ is_active: !currentStatus })
      .eq('id', coachingId)

    if (error) throw error

    revalidatePath('/admin/coachings')
    return { success: true }
  } catch (err: any) {
    console.error('Toggle coaching status error:', err)
    return { success: false, error: err.message }
  }
}
