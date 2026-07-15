'use client'

import { useState } from 'react'
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
import { createLead } from '@/app/dashboard/leads/actions'

export function CreateLeadModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState('walk-in')
  const [interestedIn, setInterestedIn] = useState('')
  const [status, setStatus] = useState<'new' | 'contacted' | 'follow_up'>('new')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName) return

    setLoading(true)
    const result = await createLead({
      fullName,
      phone,
      source,
      interestedIn,
      status
    })
    
    setLoading(false)
    if (result.success) {
      setOpen(false)
      // Reset form
      setFullName('')
      setPhone('')
      setSource('walk-in')
      setInterestedIn('')
      setStatus('new')
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
            <Plus className="h-4 w-4" /> Add Lead
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Record a new inquiry from a prospective student.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name *</label>
            <Input 
              required 
              value={fullName} 
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Interested In</label>
              <Input 
                value={interestedIn} 
                onChange={e => setInterestedIn(e.target.value)}
                placeholder="e.g. Class 10 Math"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">Walk-in</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Status</label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading || !fullName}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Lead
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
