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
import { FeeStructureForm } from './FeeStructureForm'

export function AddFeeStructureDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Fee Structure
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>New Fee Structure</SheetTitle>
          <SheetDescription>
            Define a new type of fee to apply to your students (e.g. Monthly Tuition, Annual Registration).
          </SheetDescription>
        </SheetHeader>
        
        <FeeStructureForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
