import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { IndianRupee } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Fees | CoachFlow' }
export const dynamic = 'force-dynamic'

export default async function StudentFeesPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: studentRecord } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  const { data: transactions } = await supabase
    .from('fee_transactions')
    .select('amount, final_amount, status, created_at, notes, fee_structure:fee_structures(name)')
    .eq('student_id', studentRecord?.id ?? '')
    .order('created_at', { ascending: false })

  const paid = transactions?.filter(t => t.status === 'paid').reduce((s, t) => s + Number(t.final_amount), 0) ?? 0
  const pending = transactions?.filter(t => t.status === 'pending').reduce((s, t) => s + Number(t.final_amount), 0) ?? 0
  const overdue = transactions?.filter(t => t.status === 'overdue').reduce((s, t) => s + Number(t.final_amount), 0) ?? 0

  const statusColor: Record<string, string> = {
    paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    overdue: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    waived: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-primary" /> My Fees
        </h1>
        <p className="text-muted-foreground mt-1">View your complete fee payment history and dues.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/40">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-emerald-600">₹{paid.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Paid</p>
          </CardContent>
        </Card>
        <Card className="border border-border/40">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-amber-500">₹{pending.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card className="border border-border/40">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-rose-500">₹{overdue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue warning */}
      {overdue > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
          <IndianRupee className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-600">You have overdue dues of ₹{overdue.toLocaleString()}</p>
            <p className="text-xs text-rose-500 mt-0.5">Please contact the institute office to clear your dues.</p>
          </div>
        </div>
      )}

      {/* Transaction history */}
      <Card className="border border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{(t.fee_structure as any)?.name ?? 'Fee Payment'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {t.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{t.notes}</p>}
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-bold text-sm">₹{Number(t.final_amount).toLocaleString()}</p>
                    <Badge className={statusColor[t.status] ?? ''}>{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No fee records found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
