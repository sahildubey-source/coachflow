import { getTestDetails } from '../actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, FileText, Target, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TestResultsEntry } from '@/components/tests/TestResultsEntry'

export const dynamic = 'force-dynamic'

export default async function TestProfilePage({ params }: { params: { id: string } }) {
  const { test, results, success } = await getTestDetails(params.id)

  if (!success || !test) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tests">
          <Button variant="outline" size="icon" className="w-8 h-8 rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Link href="/dashboard/tests" className="hover:text-primary transition-colors">Tests</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{test.name}</span>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{test.name}</h1>
            <p className="text-muted-foreground mt-1 text-lg">{test.subject || 'No Subject Specified'}</p>
            {test.description && <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{test.description}</p>}
          </div>
          
          <div className="flex gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Marks</p>
              <p className="text-2xl font-bold text-primary mt-1">{test.total_marks}</p>
            </div>
            <div className="w-px bg-border/50" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Passing</p>
              <p className="text-2xl font-bold mt-1">{test.passing_marks || '--'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-6 relative z-10">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Date:</span>
            <span>{test.test_date ? new Date(test.test_date).toLocaleDateString() : 'Not scheduled'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Batch:</span>
            <span>{test.batch?.name || 'General (No Batch)'}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Results Entry</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter marks for the students. Mark a student as absent to skip them.
        </p>

        {test.batch_id ? (
          <TestResultsEntry test={test} initialResults={results} />
        ) : (
          <div className="mt-6 p-8 text-center bg-card border border-border/50 rounded-xl">
            <p className="text-muted-foreground">This test is not associated with a specific batch, so there are no students to grade.</p>
          </div>
        )}
      </div>
    </div>
  )
}
