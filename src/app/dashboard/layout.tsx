import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Show setup banner if Supabase is not configured
  if (!supabase) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar coachingName="CoachFlow Demo" />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Setup warning banner */}
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-3 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>Setup required:</strong> Add your Supabase credentials to{' '}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code>{' '}
              to enable authentication and data.{' '}
              <Link href="https://supabase.com/dashboard" target="_blank"
                className="underline font-medium hover:text-amber-900">
                Open Supabase Dashboard →
              </Link>
            </span>
          </div>
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch coaching name and role for sidebar
  const { data: member } = await supabase
    .from('coaching_members')
    .select('role, coaching:coachings(name)')
    .eq('profile_id', user.id)
    .eq('is_active', true)
    .single()

  const coachingName = (member?.coaching as { name?: string } | null)?.name
  const userRole = member?.role || 'student'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar coachingName={coachingName} userRole={userRole} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
