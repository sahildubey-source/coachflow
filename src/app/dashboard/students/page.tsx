import { getStudents } from './actions'
import { AddStudentDrawer } from '@/components/students/AddStudentDrawer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Filter, MoreHorizontal, User } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const dynamic = 'force-dynamic'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { query?: string; status?: string }
}) {
  const query = searchParams?.query || ''
  const status = searchParams?.status || 'all'

  const { data: students, error } = await getStudents(query, status)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage your student enrollments, profiles, and assignments.
          </p>
        </div>
        <AddStudentDrawer />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/50">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name, email, or enrollment no..."
            className="pl-9"
            defaultValue={query}
            // In a real app, this would use a client component with useTransition for search
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-8 text-center bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
          <p>Failed to load students: {error}</p>
        </div>
      ) : students && students.length > 0 ? (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Student</TableHead>
                <TableHead>Enrollment No.</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => (
                <TableRow key={student.id} className="group hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {student.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium leading-none">{student.full_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {student.gender || 'Unknown'} • {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'DOB N/A'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {student.enrollment_no || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{student.email || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{student.phone || 'N/A'}</p>
                  </TableCell>
                  <TableCell>
                    {student.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={
                            <Link href={`/dashboard/students/${student.id}`} className="flex items-center gap-2 cursor-pointer">
                              <User className="h-4 w-4" /> View Profile
                            </Link>
                          }
                        />
                        {/* More actions like Edit, Deactivate can be added here */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-card rounded-xl border border-border/50 border-dashed">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">No students found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Get started by adding your first student. You can manage their profile, attendance, and fees from here.
          </p>
          <AddStudentDrawer />
        </div>
      )}
    </div>
  )
}
