import { redirect } from 'next/navigation'
import Link from 'next/link'
import { checkSuperAdmin } from './actions'
import { LayoutDashboard, Building2, Users, Settings, LogOut, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSuperAdmin, user } = await checkSuperAdmin()

  if (!user) {
    redirect('/auth')
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold tracking-tight mb-2">Access Denied</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          You do not have permission to view this page. This area is restricted to platform administrators only.
        </p>
        <Link href="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-300 hidden md:flex flex-col h-full flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-rose-500 flex items-center justify-center">
              <span className="text-xs text-white">S</span>
            </div>
            SuperAdmin
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            <Link href="/admin">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-sm font-medium">
                <LayoutDashboard className="w-4 h-4" />
                Global Dashboard
              </div>
            </Link>
            <Link href="/admin/coachings">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-sm font-medium mt-1">
                <Building2 className="w-4 h-4" />
                Coachings / Tenants
              </div>
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium text-slate-400">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0 bg-background border-l">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
