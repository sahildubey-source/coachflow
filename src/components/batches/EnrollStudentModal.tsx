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
import { Plus, Check, Loader2 } from 'lucide-react'
import { getStudents } from '@/app/dashboard/students/actions'
import { enrollStudent } from '@/app/dashboard/students/enrollment-actions'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface EnrollStudentModalProps {
  batchId: string
  existingStudentIds: string[]
}

export function EnrollStudentModal({ batchId, existingStudentIds }: EnrollStudentModalProps) {
  const [open, setOpen] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchStudents()
    }
  }, [open, search])

  async function fetchStudents() {
    setLoading(true)
    const { data, success } = await getStudents(search, 'active')
    if (success) {
      setStudents(data || [])
    }
    setLoading(false)
  }

  async function handleEnroll(studentId: string) {
    setEnrolling(studentId)
    const result = await enrollStudent(studentId, batchId)
    setEnrolling(null)
    
    if (result.success) {
      // Could show a toast here
      router.refresh()
    }
  }

  const availableStudents = students.filter(s => !existingStudentIds.includes(s.id))
  const alreadyEnrolled = students.filter(s => existingStudentIds.includes(s.id))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Enroll Student
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll Students</DialogTitle>
          <DialogDescription>
            Search and add active students to this batch.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Input 
            placeholder="Search by name or enrollment no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : availableStudents.length > 0 ? (
              availableStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 hover:bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">{student.full_name}</p>
                    <p className="text-xs text-muted-foreground">{student.enrollment_no || student.email}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    disabled={enrolling === student.id}
                    onClick={() => handleEnroll(student.id)}
                  >
                    {enrolling === student.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Enroll'}
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No available students found.
              </div>
            )}
            
            {alreadyEnrolled.map(student => (
              <div key={student.id} className="flex items-center justify-between p-3 opacity-60 bg-muted/20">
                <div>
                  <p className="font-medium text-sm">{student.full_name}</p>
                  <p className="text-xs text-muted-foreground">{student.enrollment_no}</p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Check className="h-3 w-3" /> Enrolled
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
