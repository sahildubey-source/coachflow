import { getTests } from './actions'
import { CreateTestModal } from '@/components/tests/CreateTestModal'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, Users, Target } from 'lucide-react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export default async function TestsDashboardPage() {
  const { data: tests, error } = await getTests()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Tests & Results
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage upcoming exams and enter student marks.
          </p>
        </div>
        <CreateTestModal />
      </div>

      {error ? (
        <div className="p-8 text-center bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
          <p>Failed to load tests: {error}</p>
        </div>
      ) : tests && tests.length > 0 ? (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Test Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test: any) => (
                <TableRow key={test.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="font-medium text-primary">
                      <Link href={`/dashboard/tests/${test.id}`} className="hover:underline">
                        {test.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{test.subject || '-'}</TableCell>
                  <TableCell>
                    {test.test_date ? new Date(test.test_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {test.batch?.name ? (
                      <span className="flex items-center gap-1 text-sm bg-muted/50 px-2 py-1 rounded-md w-max">
                        <Users className="w-3 h-3 text-muted-foreground" /> {test.batch.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-sm">General</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Total: {test.total_marks}</span>
                      {test.passing_marks && (
                        <span className="text-xs text-muted-foreground">Passing: {test.passing_marks}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/tests/${test.id}`}>
                      <Button variant="secondary" size="sm">Enter Marks</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-card rounded-xl border border-border/50 border-dashed">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">No tests scheduled</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create a new test to track your students' academic progress.
          </p>
          <CreateTestModal />
        </div>
      )}
    </div>
  )
}
