import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import StudentSidebar from '@/components/student/StudentSidebar'
import StudentTopBar from '@/components/student/StudentTopBar'

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Only students can access this layout
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'student') {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <StudentSidebar studentName={profile.full_name} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <StudentTopBar studentName={profile.full_name} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
