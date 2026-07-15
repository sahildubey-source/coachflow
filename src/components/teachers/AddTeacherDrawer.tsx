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
import { TeacherForm } from './TeacherForm'

export function AddTeacherDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Teacher
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Add New Teacher</SheetTitle>
          <SheetDescription>
            Fill in the details to add a new teacher to your institute. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        
        <TeacherForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
