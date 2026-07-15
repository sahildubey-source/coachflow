'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState, useEffect } from 'react'
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
import { createBatch, updateBatch, type BatchFormData } from '@/app/dashboard/batches/actions'
import { getTeachers } from '@/app/dashboard/teachers/actions'

const batchSchema = z.object({
  name: z.string().min(2, 'Batch name must be at least 2 characters'),
  subject: z.string().optional(),
  description: z.string().optional(),
  teacherId: z.string().optional().or(z.literal('none')),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  feeAmount: z.string().optional(),
})

interface BatchFormProps {
  initialData?: any 
  onSuccess?: () => void
}

export function BatchForm({ initialData, onSuccess }: BatchFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teachers, setTeachers] = useState<any[]>([])

  const isEditing = !!initialData

  useEffect(() => {
    async function fetchTeachers() {
      const { data, success } = await getTeachers()
      if (success && data) {
        setTeachers(data)
      }
    }
    fetchTeachers()
  }, [])

  const form = useForm<z.infer<typeof batchSchema>>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: initialData?.name || '',
      subject: initialData?.subject || '',
      description: initialData?.description || '',
      teacherId: initialData?.teacher_id || 'none',
      startTime: initialData?.start_time || '',
      endTime: initialData?.end_time || '',
      feeAmount: initialData?.fee_amount?.toString() || '',
    },
  })

  async function onSubmit(values: z.infer<typeof batchSchema>) {
    setIsSubmitting(true)
    setError(null)

    try {
      const data: BatchFormData = {
        ...values,
        teacherId: values.teacherId === 'none' ? undefined : values.teacherId
      }

      let result
      if (isEditing) {
        result = await updateBatch(initialData.id, data)
      } else {
        result = await createBatch(data)
      }

      if (!result.success) {
        setError(result.error || 'Failed to save batch')
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Class 10 - Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Teacher</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Teacher Assigned</SelectItem>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feeAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Fee (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Batch' : 'Create Batch'}
        </Button>
      </form>
    </Form>
  )
}
