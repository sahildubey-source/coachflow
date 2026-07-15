import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Mail, Phone, Calendar, User, MapPin, Edit, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getEnrolledBatches } from '@/app/dashboard/students/enrollment-actions'
import { getStudentFees } from '@/app/dashboard/fees/transactions/actions'
import { getStudentTestScores } from '@/app/dashboard/tests/actions'

export const dynamic = 'force-dynamic'

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch the student
  const { data: student, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !student) {
    notFound()
  }

  // Fetch enrolled batches
  const { data: enrolledBatches, success: batchesSuccess } = await getEnrolledBatches(student.id)

  // Fetch student fees
  const { data: fees } = await getStudentFees(student.id)

  // Fetch test scores
  const { data: testScores } = await getStudentTestScores(student.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="h-8 w-8 shrink-0">
            <Link href="/dashboard/students">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{student.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="font-mono text-xs">
                {student.enrollment_no || 'No Enrollment ID'}
              </Badge>
              {student.is_active ? (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Gender</p>
                  <p className="text-sm text-muted-foreground capitalize">{student.gender || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Date of Birth</p>
                  <p className="text-sm text-muted-foreground">
                    {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{student.phone || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground break-all">{student.email || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary mt-1">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{student.address || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parent/Guardian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{student.parent_name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{student.parent_phone || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{student.parent_email || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Academic & Financial */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enrolled Batches</CardTitle>
              <CardDescription>Batches this student is currently attending.</CardDescription>
            </CardHeader>
            <CardContent>
              {enrolledBatches && enrolledBatches.length > 0 ? (
                <div className="space-y-3">
                  {enrolledBatches.map((enrollment: any) => (
                    <div key={enrollment.id} className="p-4 border rounded-lg bg-muted/20 flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          <Link href={`/dashboard/batches/${enrollment.batch.id}`} className="hover:underline">
                            {enrollment.batch.name}
                          </Link>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {enrollment.batch.subject || 'No Subject'} • 
                          {enrollment.batch.start_time ? ` ${enrollment.batch.start_time.slice(0, 5)}` : ' No timing'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">{enrollment.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                  <p>Not enrolled in any batches yet.</p>
                  <Link href="/dashboard/batches">
                    <Button variant="link" className="mt-2 text-primary">Go to Batches to Assign</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Recent Test Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testScores && testScores.length > 0 ? (
                  <div className="space-y-3">
                    {testScores.slice(0, 3).map((score: any) => (
                      <div key={score.id} className="p-3 border rounded-lg bg-muted/20 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            <Link href={`/dashboard/tests/${score.test_id}`} className="hover:underline">
                              {score.test?.name}
                            </Link>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {score.test?.subject || 'General'}
                          </p>
                        </div>
                        <div className="text-right">
                          {score.is_absent ? (
                            <Badge variant="secondary" className="text-rose-500 bg-rose-500/10">Absent</Badge>
                          ) : (
                            <p className="font-semibold text-primary">
                              {score.marks_obtained} <span className="text-xs text-muted-foreground font-normal">/ {score.test?.total_marks}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {testScores.length > 3 && (
                      <div className="text-center pt-2">
                        <span className="text-xs text-muted-foreground">More tests available</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-md bg-muted/10">
                    No test scores recorded yet.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Fee Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fees && fees.length > 0 ? (
                  <div className="space-y-3">
                    {fees.slice(0, 3).map((fee: any) => (
                      <div key={fee.id} className="flex justify-between items-center p-3 rounded-lg border bg-card text-sm">
                        <div>
                          <p className="font-medium">{fee.fee_structure?.name || 'Custom Fee'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(fee.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">₹{Number(fee.final_amount).toLocaleString()}</p>
                          <Badge 
                            className={`mt-1 capitalize text-[10px] h-4 ${
                              fee.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 
                              fee.status === 'pending' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 
                              'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                            }`}
                          >
                            {fee.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {fees.length > 3 && (
                      <div className="text-center pt-2">
                        <Link href="/dashboard/fees" className="text-xs text-primary hover:underline">
                          View all in Fees Ledger
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-md bg-muted/10">
                    No fee records found for this student.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
