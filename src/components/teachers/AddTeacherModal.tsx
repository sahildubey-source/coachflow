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
import { Plus, Loader2, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { inviteTeacher } from '@/app/dashboard/teachers/actions'

export function AddTeacherModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName || !email) return

    setLoading(true)
    const result = await inviteTeacher(email, fullName)
    setLoading(false)
    
    if (result.success) {
      alert(result.message)
      setOpen(false)
      setFullName('')
      setEmail('')
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
            <Plus className="h-4 w-4" /> Invite Teacher
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a Teacher</DialogTitle>
          <DialogDescription>
            Send an email invitation to a new staff member to join your institute.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input 
              required 
              value={fullName} 
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input 
              required 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading || !fullName || !email}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send Invitation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
