import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarCheck, ClipboardList, IndianRupee, GraduationCap, TrendingUp, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Dashboard | CoachFlow' }
export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get student record
  const { data: studentRecord } = await supabase
    .from('students')
    .select(`
      id, full_name, enrollment_no, is_active,
      batch:batches(name, subject, schedule_days, schedule_time)
    `)
    .eq('profile_id', user.id)
    .eq('is_active', true)
    .single()

  // Get attendance stats
  const { data: attendanceData } = await supabase
    .from('attendance')
    .select('status')
    .eq('student_id', studentRecord?.id ?? '')

  const totalClasses = attendanceData?.length ?? 0
  const presentCount = attendanceData?.filter(a => a.status === 'present').length ?? 0
  const attendancePct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0

  // Get recent test results
  const { data: testResults } = await supabase
    .from('test_results')
    .select('marks_obtained, max_marks, test:tests(name, test_date)')
    .eq('student_id', studentRecord?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get fee status
  const { data: fees } = await supabase
    .from('fee_transactions')
    .select('amount, final_amount, status')
    .eq('student_id', studentRecord?.id ?? '')

  const pendingFees = fees?.filter(f => f.status === 'pending' || f.status === 'overdue')
    .reduce((sum, f) => sum + Number(f.final_amount), 0) ?? 0

  const paidFees = fees?.filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + Number(f.final_amount), 0) ?? 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Good {greeting}, {studentRecord?.full_name?.split(' ')[0] ?? 'Student'} 👋</h1>
        <p className="text-muted-foreground mt-0.5">Here's your academic summary.</p>
      </div>

      {/* Enrolment Info */}
      {studentRecord && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.46 0.27 268 / 0.12)' }}>
            <GraduationCap className="w-5 h-5" style={{ color: 'oklch(0.46 0.27 268)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold">{(studentRecord.batch as any)?.name ?? 'No batch assigned'}</p>
            <p className="text-xs text-muted-foreground">
              {(studentRecord.batch as any)?.subject} · Enrollment: {studentRecord.enrollment_no}
            </p>
          </div>
          <Badge className="ml-auto bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Active
          </Badge>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/40 stat-card-1">
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'oklch(0.50 0.20 160 / 0.15)' }}>
              <CalendarCheck className="w-5 h-5" style={{ color: 'oklch(0.50 0.20 160)' }} />
            </div>
            <div className="text-2xl font-bold">{attendancePct}%</div>
            <div className="text-sm text-muted-foreground mt-0.5">Attendance</div>
            <div className={`text-xs mt-2 font-medium ${attendancePct >= 75 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {presentCount}/{totalClasses} classes attended
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 stat-card-3">
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'oklch(0.57 0.20 30 / 0.15)' }}>
              <IndianRupee className="w-5 h-5" style={{ color: 'oklch(0.57 0.20 30)' }} />
            </div>
            <div className="text-2xl font-bold text-amber-500">₹{pendingFees.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-0.5">Pending Fees</div>
            <div className="text-xs mt-2 font-medium text-muted-foreground">
              ₹{paidFees.toLocaleString()} paid so far
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 stat-card-2">
          <CardContent className="pt-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'oklch(0.60 0.17 75 / 0.15)' }}>
              <ClipboardList className="w-5 h-5" style={{ color: 'oklch(0.60 0.17 75)' }} />
            </div>
            <div className="text-2xl font-bold">{testResults?.length ?? 0}</div>
            <div className="text-sm text-muted-foreground mt-0.5">Tests Taken</div>
            <div className="text-xs mt-2 font-medium text-muted-foreground">
              View all results below
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Test Results */}
      <Card className="border border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Recent Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResults && testResults.length > 0 ? (
            <div className="space-y-3">
              {testResults.map((result: any, i: number) => {
                const pct = result.max_marks > 0 ? Math.round((result.marks_obtained / result.max_marks) * 100) : 0
                const color = pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-rose-500'
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{result.test?.name ?? 'Test'}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.test?.test_date ? new Date(result.test.test_date).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${color}`}>{result.marks_obtained}/{result.max_marks}</p>
                      <p className={`text-xs ${color}`}>{pct}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No test results yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Attendance trend */}
      <Card className="border border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Attendance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{presentCount} Present / {totalClasses - presentCount} Absent</span>
            <span className={`text-sm font-bold ${attendancePct >= 75 ? 'text-emerald-600' : 'text-rose-500'}`}>{attendancePct}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${attendancePct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${attendancePct}%` }}
            />
          </div>
          {attendancePct < 75 && (
            <p className="text-xs text-rose-500 mt-2 font-medium">
              ⚠️ Your attendance is below the required 75%. Please attend classes regularly.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
