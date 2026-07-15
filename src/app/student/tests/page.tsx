import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Test Results | CoachFlow' }
export const dynamic = 'force-dynamic'

export default async function StudentTestsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: studentRecord } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  const { data: results } = await supabase
    .from('test_results')
    .select('marks_obtained, max_marks, remarks, test:tests(name, test_date, subject)')
    .eq('student_id', studentRecord?.id ?? '')
    .order('created_at', { ascending: false })

  const avgPct = results && results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.max_marks > 0 ? (r.marks_obtained / r.max_marks) * 100 : 0), 0) / results.length)
    : 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" /> My Test Results
        </h1>
        <p className="text-muted-foreground mt-1">Track your performance across all tests and assessments.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border border-border/40">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{results?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Tests Taken</p>
          </CardContent>
        </Card>
        <Card className="border border-border/40">
          <CardContent className="pt-6 text-center">
            <p className={`text-3xl font-bold ${avgPct >= 60 ? 'text-emerald-600' : 'text-rose-500'}`}>{avgPct}%</p>
            <p className="text-sm text-muted-foreground mt-1">Average Score</p>
          </CardContent>
        </Card>
      </div>

      {/* All results */}
      <Card className="border border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results && results.length > 0 ? (
            <div className="space-y-3">
              {results.map((r: any, i: number) => {
                const pct = r.max_marks > 0 ? Math.round((r.marks_obtained / r.max_marks) * 100) : 0
                const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'F'
                const badgeColor = pct >= 80 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : pct >= 60 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{r.test?.name ?? 'Test'}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.test?.subject && <span className="mr-2">{r.test.subject}</span>}
                        {r.test?.test_date && new Date(r.test.test_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {r.remarks && <p className="text-xs text-muted-foreground italic mt-0.5">"{r.remarks}"</p>}
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-sm font-bold">{r.marks_obtained}<span className="text-muted-foreground font-normal">/{r.max_marks}</span></p>
                        <p className="text-xs text-muted-foreground">{pct}%</p>
                      </div>
                      <Badge className={badgeColor}>{grade}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No test results found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
