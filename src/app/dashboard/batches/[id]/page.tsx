import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Users, Clock, BookOpen, User, Calendar, Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnrollStudentModal } from '@/components/batches/EnrollStudentModal'
import { getBatchStudents } from '@/app/dashboard/students/enrollment-actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

async function getBatchDetails(id: string) {
  const supabase = await createClient()
  
  const { data: batch, error } = await supabase
    .from('batches')
    .select('*, teacher:teacher_id(*)')
    .eq('id', id)
    .single()

  if (error || !batch) return null
  return batch
}

export default async function BatchProfilePage({ params }: { params: { id: string } }) {
  const batch = await getBatchDetails(params.id)

  if (!batch) {
    notFound()
  }

  const { data: enrollments, success } = await getBatchStudents(params.id)
  const existingStudentIds = enrollments?.map((e: any) => e.student.id) || []

  return (
    <div className="space-y-6 pb-10">
      {/* Header Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/batches">
          <Button variant="outline" size="icon" className="w-8 h-8 rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Link href="/dashboard/batches" className="hover:text-primary transition-colors">Batches</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{batch.name}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Batch Details */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-background z-0" />
            
            <div className="relative z-10 flex flex-col items-center text-center mt-6">
              <div className="w-24 h-24 rounded-2xl bg-background border-4 border-card flex items-center justify-center text-4xl font-bold text-primary shadow-sm mb-4">
                {batch.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold">{batch.name}</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-1 justify-center">
                <BookOpen className="w-4 h-4" /> {batch.subject || 'No specific subject'}
              </p>
              
              <div className="mt-4 flex gap-2 justify-center">
                {batch.is_active ? (
                  <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Active Class</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <Users className="w-3 h-3" /> {enrollments?.length || 0} Students
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4">Schedule & Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Timings</p>
                  <p className="text-sm text-muted-foreground">
                    {batch.start_time?.slice(0, 5) || '--'} to {batch.end_time?.slice(0, 5) || '--'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Days</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {batch.days_of_week && batch.days_of_week.length > 0 
                      ? batch.days_of_week.join(', ') 
                      : 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Teacher</p>
                  <p className="text-sm text-muted-foreground">
                    {batch.teacher?.full_name || 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Enrolled Students */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Enrolled Students</h3>
                <p className="text-sm text-muted-foreground">Manage students in this batch.</p>
              </div>
              <div className="flex items-center gap-2">
                <EnrollStudentModal batchId={batch.id} existingStudentIds={existingStudentIds} />
                <Button variant="outline">
                  Take Attendance
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              {enrollments && enrollments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Student</TableHead>
                      <TableHead>Enrollment No</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment: any) => (
                      <TableRow key={enrollment.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                              {enrollment.student.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm leading-none">{enrollment.student.full_name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {enrollment.student.enrollment_no || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize bg-muted/50">
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
                    <Users className="w-8 h-8 opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No students enrolled</h3>
                  <p className="text-muted-foreground max-w-sm mb-6 text-sm">
                    This batch is currently empty. Start by enrolling active students.
                  </p>
                  <EnrollStudentModal batchId={batch.id} existingStudentIds={existingStudentIds} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
