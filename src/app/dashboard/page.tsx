import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserCoachingRole, isOwner } from '@/lib/get-user-role'
import { Users, BookOpen, GraduationCap, DollarSign, TrendingUp, CalendarCheck, UserPlus, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

// ── Demo mode dashboard (no Supabase configured) ──────────────────────────────
function DemoDashboard() {
  const demoStats = [
    { label: 'Total Students', value: '—', icon: Users, cardClass: 'stat-card-1', iconColor: 'oklch(0.46 0.27 268)', change: 'Connect Supabase', positive: false },
    { label: 'Active Teachers', value: '—', icon: BookOpen, cardClass: 'stat-card-2', iconColor: 'oklch(0.50 0.20 160)', change: 'Connect Supabase', positive: false },
    { label: 'Batches Running', value: '—', icon: GraduationCap, cardClass: 'stat-card-3', iconColor: 'oklch(0.60 0.17 75)', change: 'Connect Supabase', positive: false },
    { label: 'Pending Fees', value: '—', icon: DollarSign, cardClass: 'stat-card-4', iconColor: 'oklch(0.57 0.20 30)', change: 'Connect Supabase', positive: false },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome to CoachFlow 👋</h1>
          <p className="text-muted-foreground mt-0.5">Complete setup to start managing your coaching institute.</p>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs px-3 py-1.5"
          style={{ borderColor: 'oklch(0.77 0.19 75 / 0.5)', color: 'oklch(0.55 0.17 70)', background: 'oklch(0.77 0.19 75 / 0.08)' }}>
          🎯 Demo Mode
        </Badge>
      </div>

      {/* Setup Steps */}
      <Card className="border border-amber-200/60" style={{ background: 'oklch(0.98 0.02 80)' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Setup Required — 3 steps to go live
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Create a Supabase project',
                description: 'Go to supabase.com and create a free project.',
                href: 'https://supabase.com/dashboard',
                cta: 'Open Supabase →',
              },
              {
                step: '2',
                title: 'Run the schema SQL',
                description: 'In Supabase SQL Editor, run the contents of supabase/schema.sql from your project folder.',
                href: null,
                cta: 'supabase/schema.sql',
              },
              {
                step: '3',
                title: 'Add credentials to .env.local',
                description: 'Copy .env.local.example → .env.local and fill in your Supabase URL and anon key, then restart the server.',
                href: null,
                cta: '.env.local.example',
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, oklch(0.46 0.27 268), oklch(0.63 0.22 274))' }}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-primary hover:underline">
                      {item.cta} <ArrowRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <code className="inline-block mt-1.5 text-xs bg-muted px-2 py-0.5 rounded font-mono">{item.cta}</code>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {demoStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className={`border border-border/40 opacity-60 ${stat.cardClass}`}>
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${stat.iconColor}20` }}>
                  <Icon className="w-5 h-5" style={{ color: stat.iconColor }} />
                </div>
                <div className="text-2xl font-bold text-muted-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
                <div className="text-xs mt-2 text-amber-600 font-medium">{stat.change}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ── Live data fetch ────────────────────────────────────────────────────────────
async function getDashboardData(coachingId: string) {
  const supabase = await createClient()
  if (!supabase) return null

  const today = new Date().toISOString().split('T')[0]

  const [students, teachers, batches, pendingFees, leads, todayAttendance] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact' }).eq('coaching_id', coachingId).eq('is_active', true),
    supabase.from('coaching_members').select('id', { count: 'exact' }).eq('coaching_id', coachingId).eq('role', 'teacher').eq('is_active', true),
    supabase.from('batches').select('id', { count: 'exact' }).eq('coaching_id', coachingId).eq('is_active', true),
    supabase.from('fee_transactions').select('final_amount').eq('coaching_id', coachingId).eq('status', 'pending'),
    supabase.from('leads').select('id', { count: 'exact' }).eq('coaching_id', coachingId).in('status', ['new', 'contacted', 'follow_up']),
    supabase.from('attendance').select('id', { count: 'exact' }).eq('coaching_id', coachingId).eq('date', today).eq('status', 'present'),
  ])

  return {
    studentCount: students.count ?? 0,
    teacherCount: teachers.count ?? 0,
    batchCount: batches.count ?? 0,
    pendingFeesTotal: pendingFees.data?.reduce((sum, t) => sum + (t.final_amount || 0), 0) ?? 0,
    activeLeads: leads.count ?? 0,
    todayPresent: todayAttendance.count ?? 0,
  }
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = await createClient()

  if (!supabase) return <DemoDashboard />

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: member } = await supabase
    .from('coaching_members')
    .select('coaching_id, coaching:coachings(name, plan, trial_ends_at, subscription_status)')
    .eq('profile_id', user.id)
    .eq('is_active', true)
    .single()

  if (!member) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No coaching found</h2>
          <p className="text-muted-foreground text-sm mb-4">You are not associated with any coaching institute.</p>
          <Link href="/auth/login" className="text-sm text-primary hover:underline">Sign in again</Link>
        </div>
      </div>
    )
  }

  const coaching = member.coaching as { name: string; plan: string; trial_ends_at: string; subscription_status: string } | null
  const data = await getDashboardData(member.coaching_id)
  if (!data) return <DemoDashboard />

  // Get role for conditional rendering
  const memberRole = await getUserCoachingRole()
  const ownerView = isOwner(memberRole?.role ?? '')

  // Stats visible to owner
  const ownerStats = [
    { label: 'Total Students', value: data.studentCount, icon: Users, cardClass: 'stat-card-1', iconColor: 'oklch(0.46 0.27 268)', change: 'Active enrolments', positive: true },
    { label: 'Active Teachers', value: data.teacherCount, icon: BookOpen, cardClass: 'stat-card-2', iconColor: 'oklch(0.50 0.20 160)', change: 'All assigned', positive: true },
    { label: 'Batches Running', value: data.batchCount, icon: GraduationCap, cardClass: 'stat-card-3', iconColor: 'oklch(0.60 0.17 75)', change: 'Across subjects', positive: true },
    { label: 'Pending Fees', value: `₹${(data.pendingFeesTotal / 1000).toFixed(1)}k`, icon: DollarSign, cardClass: 'stat-card-4', iconColor: 'oklch(0.57 0.20 30)', change: 'Send reminders', positive: false },
  ]

  // Stats visible to teacher
  const teacherStats = [
    { label: 'Total Students', value: data.studentCount, icon: Users, cardClass: 'stat-card-1', iconColor: 'oklch(0.46 0.27 268)', change: 'Active enrolments', positive: true },
    { label: 'Batches Running', value: data.batchCount, icon: GraduationCap, cardClass: 'stat-card-3', iconColor: 'oklch(0.60 0.17 75)', change: 'Across subjects', positive: true },
    { label: "Today's Attendance", value: data.todayPresent, icon: CalendarCheck, cardClass: 'stat-card-2', iconColor: 'oklch(0.50 0.20 160)', change: 'Present today', positive: true },
  ]

  const stats = ownerView ? ownerStats : teacherStats

  const ownerQuickStats = [
    { label: "Today's Attendance", value: data.todayPresent, icon: CalendarCheck, color: 'oklch(0.50 0.20 160)' },
    { label: 'Active Leads (CRM)', value: data.activeLeads, icon: UserPlus, color: 'oklch(0.46 0.27 268)' },
    { label: 'Collection Rate', value: '78%', icon: TrendingUp, color: 'oklch(0.60 0.17 75)' },
  ]

  const teacherQuickStats = [
    { label: 'Tests Scheduled', value: '—', icon: TrendingUp, color: 'oklch(0.60 0.17 75)' },
  ]

  const quickStats = ownerView ? ownerQuickStats : teacherQuickStats

  const trialDays = coaching?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(coaching.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Good {greeting} 👋</h1>
          <p className="text-muted-foreground mt-0.5">
            {"Here's what's happening at "}
            <span className="font-medium text-foreground">{coaching?.name}</span>
            {' today.'}
          </p>
        </div>
        {trialDays !== null && trialDays <= 14 && (
          <Badge variant="outline" className="shrink-0 text-xs px-3 py-1.5"
            style={{ borderColor: 'oklch(0.77 0.19 75 / 0.5)', color: 'oklch(0.55 0.17 70)', background: 'oklch(0.77 0.19 75 / 0.08)' }}>
            🎯 {trialDays} days left in trial
          </Badge>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className={`card-hover border border-border/40 ${stat.cardClass}`}>
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${stat.iconColor}20` }}>
                  <Icon className="w-5 h-5" style={{ color: stat.iconColor }} />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
                <div className={`text-xs mt-2 font-medium ${stat.positive ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card card-hover">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${s.color}15` }}>
                <Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[
                { text: 'Manage Students', sub: 'Add, edit, search students', href: '/dashboard/students' },
                { text: 'Mark Attendance', sub: "Record today's attendance", href: '/dashboard/attendance' },
                ...(ownerView ? [
                  { text: 'Collect Fees', sub: 'Track and record payments', href: '/dashboard/fees' },
                  { text: 'CRM & Leads', sub: 'Manage admission pipeline', href: '/dashboard/crm' },
                ] : [
                  { text: 'Record Test Scores', sub: 'Enter marks for students', href: '/dashboard/tests' },
                  { text: 'View Fee Records', sub: 'Check payment history', href: '/dashboard/fees' },
                ]),
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Setup Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Supabase connected', done: true },
                { label: 'Add your first teacher', done: data.teacherCount > 0 },
                { label: 'Create a batch', done: data.batchCount > 0 },
                { label: 'Enrol students', done: data.studentCount > 0 },
                { label: 'Set up fee structure', done: false },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-border'}`}>
                    {item.done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
