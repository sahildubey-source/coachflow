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
import { createTest } from '@/app/dashboard/tests/actions'
import { getBatches } from '@/app/dashboard/batches/actions'

export function CreateTestModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [batches, setBatches] = useState<any[]>([])
  
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [batchId, setBatchId] = useState('none')
  const [testDate, setTestDate] = useState('')
  const [totalMarks, setTotalMarks] = useState('')
  const [passingMarks, setPassingMarks] = useState('')

  useEffect(() => {
    if (open) {
      fetchBatches()
    }
  }, [open])

  async function fetchBatches() {
    const { data, success } = await getBatches()
    if (success) setBatches(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !totalMarks) return

    setLoading(true)
    const result = await createTest({
      name,
      subject,
      batchId: batchId === 'none' ? undefined : batchId,
      testDate,
      totalMarks: parseFloat(totalMarks),
      passingMarks: passingMarks ? parseFloat(passingMarks) : undefined
    })
    
    setLoading(false)
    if (result.success) {
      setOpen(false)
      // Reset form
      setName('')
      setSubject('')
      setBatchId('none')
      setTestDate('')
      setTotalMarks('')
      setPassingMarks('')
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
            <Plus className="h-4 w-4" /> Schedule Test
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule New Test</DialogTitle>
          <DialogDescription>
            Create an exam or test for a specific batch.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Name *</label>
            <Input 
              required 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Mid-Term Exam"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input 
                value={subject} 
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input 
                type="date"
                value={testDate} 
                onChange={e => setTestDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to Batch</label>
            <Select value={batchId} onValueChange={setBatchId}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General / No specific batch</SelectItem>
                {batches.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Marks *</label>
              <Input 
                type="number" 
                required 
                value={totalMarks} 
                onChange={e => setTotalMarks(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Passing Marks</label>
              <Input 
                type="number" 
                value={passingMarks} 
                onChange={e => setPassingMarks(e.target.value)}
                placeholder="33"
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading || !name || !totalMarks}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Schedule Test
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
