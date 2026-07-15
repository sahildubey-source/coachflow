import { getTransactions, getRevenueData } from './transactions/actions'
import { getUserCoachingRole, isOwner } from '@/lib/get-user-role'
import { RecordPaymentModal } from '@/components/fees/RecordPaymentModal'
import { RevenueChart } from '@/components/fees/RevenueChart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IndianRupee, Settings } from 'lucide-react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export default async function FeesDashboardPage() {
  const memberRole = await getUserCoachingRole()
  const ownerView = isOwner(memberRole?.role ?? '')

  const [txRes, revRes] = await Promise.all([
    getTransactions(),
    getRevenueData()
  ])

  const transactions = txRes.data || []
  const chartData = revRes.data || []

  // Calculate quick stats
  const totalCollected = transactions
    .filter((t: any) => t.status === 'paid')
    .reduce((sum: number, t: any) => sum + Number(t.final_amount), 0)
    
  const pendingAmount = transactions
    .filter((t: any) => t.status === 'pending' || t.status === 'overdue')
    .reduce((sum: number, t: any) => sum + Number(t.final_amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-primary" />
            Fees & Financials
          </h2>
          <p className="text-muted-foreground mt-1">
            Track student payments, invoices, and revenue.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {ownerView && (
            <Link href="/dashboard/fees/structures">
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" /> Manage Structures
              </Button>
            </Link>
          )}
          <RecordPaymentModal />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Collected (All Time)</h3>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-primary">₹{totalCollected.toLocaleString()}</div>
        </div>
        
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pending Dues</h3>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-amber-500">₹{pendingAmount.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={chartData} />
      </div>

      {/* Transactions Ledger */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden mt-6">
        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/10">
          <h3 className="font-semibold text-lg">Recent Transactions</h3>
        </div>
        
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Fee Detail</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx: any) => (
                <TableRow key={tx.id} className="hover:bg-muted/20">
                  <TableCell className="text-sm">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/students/${tx.student_id}`} className="font-medium hover:underline hover:text-primary">
                      {tx.student?.full_name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{tx.student?.enrollment_no}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {tx.fee_structure?.name || 'Custom Fee'}
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{Number(tx.final_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        tx.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20' : 
                        tx.status === 'pending' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20' : 
                        'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20'
                      }
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No transactions found. Record a payment to get started.
          </div>
        )}
      </div>
    </div>
  )
}
