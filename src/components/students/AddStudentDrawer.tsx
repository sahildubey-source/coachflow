'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { StudentForm } from './StudentForm'

export function AddStudentDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add New Student</SheetTitle>
          <SheetDescription>
            Fill in the details to enroll a new student. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        
        <StudentForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
