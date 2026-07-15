'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTransaction } from '@/app/dashboard/fees/transactions/actions'
import { getStudents } from '@/app/dashboard/students/actions'
import { getFeeStructures } from '@/app/dashboard/fees/structures/actions'

export function RecordPaymentModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [students, setStudents] = useState<any[]>([])
  const [structures, setStructures] = useState<any[]>([])
  
  const [studentId, setStudentId] = useState('')
  const [structureId, setStructureId] = useState('custom')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<'pending' | 'paid'>('paid')

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  async function fetchData() {
    const [stuRes, structRes] = await Promise.all([
      getStudents('', 'active'),
      getFeeStructures()
    ])
    if (stuRes.success) setStudents(stuRes.data || [])
    if (structRes.success) setStructures(structRes.data || [])
  }

  // Auto-fill amount when structure changes
  useEffect(() => {
    if (structureId !== 'custom') {
      const st = structures.find(s => s.id === structureId)
      if (st) setAmount(st.amount.toString())
    } else {
      setAmount('')
    }
  }, [structureId, structures])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId || !amount) return

    setLoading(true)
    const result = await createTransaction({
      studentId,
      feeStructureId: structureId === 'custom' ? undefined : structureId,
      amount,
      status
    })
    
    setLoading(false)
    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment / Invoice</DialogTitle>
          <DialogDescription>
            Create a new fee record for a student.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Student *</label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.enrollment_no})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fee Structure</label>
            <Select value={structureId} onValueChange={setStructureId}>
              <SelectTrigger>
                <SelectValue placeholder="Select fee type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom / One-time Fee</SelectItem>
                {structures.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹) *</label>
              <Input 
                type="number" 
                required 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status *</label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid (Collected)</SelectItem>
                  <SelectItem value="pending">Pending (Invoice)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading || !studentId || !amount}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {status === 'paid' ? 'Record Payment' : 'Create Invoice'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
