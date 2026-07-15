import { getBatches } from './actions'
import { AddBatchDrawer } from '@/components/batches/AddBatchDrawer'
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
import { Search, Filter, MoreHorizontal, Users, Clock, BookOpen, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const dynamic = 'force-dynamic'

export default async function BatchesPage({
  searchParams,
}: {
  searchParams: { query?: string }
}) {
  const query = searchParams?.query || ''

  const { data: batches, error } = await getBatches(query)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Batches</h2>
          <p className="text-muted-foreground">
            Manage classes, subjects, timings, and assign teachers.
          </p>
        </div>
        <AddBatchDrawer />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/50">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search batches by name or subject..."
            className="pl-9"
            defaultValue={query}
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
          <p>Failed to load batches: {error}</p>
        </div>
      ) : batches && batches.length > 0 ? (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Batch</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Timings</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch: any) => (
                <TableRow key={batch.id} className="group hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {batch.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium leading-none">{batch.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                          <BookOpen className="w-3 h-3" /> {batch.subject || 'No Subject'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {batch.teacher ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                          {batch.teacher.full_name.charAt(0)}
                        </div>
                        <span className="text-sm">{batch.teacher.full_name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {batch.start_time || batch.end_time ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 
                          {batch.start_time?.slice(0, 5) || '--'} to {batch.end_time?.slice(0, 5) || '--'}
                        </div>
                      ) : (
                        <span className="italic">Timing not set</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm">
                      {batch.fee_amount ? `₹${Number(batch.fee_amount).toLocaleString()}` : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {batch.is_active ? (
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
                            <div className="flex items-center gap-2 cursor-pointer w-full">
                              <Users className="h-4 w-4" /> Manage Students
                            </div>
                          }
                        />
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
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">No batches found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create your first batch to start assigning teachers and enrolling students.
          </p>
          <AddBatchDrawer />
        </div>
      )}
    </div>
  )
}
