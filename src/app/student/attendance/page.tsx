import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Attendance | CoachFlow' }
export const dynamic = 'force-dynamic'

export default async function StudentAttendancePage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: studentRecord } = await supabase
    .from('students')
    .select('id, full_name')
    .eq('profile_id', user.id)
    .single()

  const { data: records } = await supabase
    .from('attendance')
    .select('date, status, notes')
    .eq('student_id', studentRecord?.id ?? '')
    .order('date', { ascending: false })

  const total = records?.length ?? 0
  const present = records?.filter(r => r.status === 'present').length ?? 0
  const absent = records?.filter(r => r.status === 'absent').length ?? 0
  const pct = total > 0 ? Math.round((present / total) * 100) : 0

  const statusColor: Record<string, string> = {
    present: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    absent: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    late: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    excused: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-primary" /> My Attendance
        </h1>
        <p className="text-muted-foreground mt-1">Full attendance record for your enrolled batch.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Classes', value: total, color: 'text-foreground' },
          { label: 'Present', value: present, color: 'text-emerald-600' },
          { label: 'Absent', value: absent, color: 'text-rose-500' },
        ].map(stat => (
          <Card key={stat.label} className="border border-border/40">
            <CardContent className="pt-6 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bar */}
      <Card className="border border-border/40">
        <CardContent className="pt-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Attendance Rate</span>
            <span className={`text-sm font-bold ${pct >= 75 ? 'text-emerald-600' : 'text-rose-500'}`}>{pct}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Minimum required: 75%</p>
        </CardContent>
      </Card>

      {/* Attendance records */}
      <Card className="border border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {records && records.length > 0 ? (
            <div className="space-y-2">
              {records.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <p className="text-sm">{new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <div className="flex items-center gap-2">
                    {r.notes && <span className="text-xs text-muted-foreground">{r.notes}</span>}
                    <Badge className={statusColor[r.status] ?? ''}>{r.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No attendance records found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
