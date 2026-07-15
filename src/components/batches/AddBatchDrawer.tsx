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
import { BatchForm } from './BatchForm'

export function AddBatchDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Batch
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Create New Batch</SheetTitle>
          <SheetDescription>
            Set up a new class or batch and assign a teacher to it.
          </SheetDescription>
        </SheetHeader>
        
        <BatchForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
