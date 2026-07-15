'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createFeeStructure, updateFeeStructure, type FeeStructureFormData } from '@/app/dashboard/fees/structures/actions'

const feeStructureSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  amount: z.string().min(1, 'Amount is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  description: z.string().optional(),
})

interface FeeStructureFormProps {
  initialData?: any 
  onSuccess?: () => void
}

export function FeeStructureForm({ initialData, onSuccess }: FeeStructureFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  const form = useForm<z.infer<typeof feeStructureSchema>>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
      name: initialData?.name || '',
      amount: initialData?.amount?.toString() || '',
      frequency: initialData?.frequency || 'monthly',
      description: initialData?.description || '',
    },
  })

  async function onSubmit(values: z.infer<typeof feeStructureSchema>) {
    setIsSubmitting(true)
    setError(null)

    try {
      const data: FeeStructureFormData = {
        ...values,
      }

      let result
      if (isEditing) {
        result = await updateFeeStructure(initialData.id, data)
      } else {
        result = await createFeeStructure(data)
      }

      if (!result.success) {
        setError(result.error || 'Failed to save fee structure')
        return
      }

      form.reset()
      onSuccess?.()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Structure Name *</FormLabel>
                <FormControl>
                  <Input placeholder="E.g. Class 10 Tuition" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹) *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Additional notes about this fee" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Structure' : 'Create Structure'}
        </Button>
      </form>
    </Form>
  )
}
