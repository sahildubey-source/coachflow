import { getAllCoachings } from '../actions'
import { StatusToggle } from './StatusToggle'
import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export default async function AdminCoachingsPage() {
  const { data: coachings, error } = await getAllCoachings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="w-8 h-8 text-primary" />
          Coaching Tenants
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage all registered coaching institutes and their subscriptions.
        </p>
      </div>

      {error ? (
        <div className="p-8 text-center bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
          <p>Failed to load coachings: {error}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Institute</TableHead>
                <TableHead>Owner / Contact</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coachings.map((coaching: any) => (
                <TableRow key={coaching.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="font-medium">{coaching.name}</div>
                    <div className="text-xs text-muted-foreground">slug: {coaching.slug}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{coaching.owner?.full_name || '-'}</div>
                    <div className="text-xs text-muted-foreground">{coaching.owner?.email || '-'}</div>
                    {coaching.phone && <div className="text-xs text-muted-foreground">{coaching.phone}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Members:</span> <span className="font-medium">{coaching.members[0]?.count || 0}</span>
                    </div>
                    <div className="text-xs mt-0.5">
                      <span className="text-muted-foreground">Students:</span> <span className="font-medium">{coaching.students[0]?.count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {coaching.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusToggle coachingId={coaching.id} initialStatus={coaching.is_active} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
