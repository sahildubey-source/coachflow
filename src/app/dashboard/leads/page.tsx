import { getLeads } from './actions'
import { CreateLeadModal } from '@/components/leads/CreateLeadModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PhoneCall, Users, CheckCircle, XCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export default async function LeadsDashboardPage() {
  const { data: leads, error } = await getLeads()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Leads & Inquiries
          </h2>
          <p className="text-muted-foreground mt-1">
            Track prospective students from initial inquiry to enrollment.
          </p>
        </div>
        <CreateLeadModal />
      </div>

      {error ? (
        <div className="p-8 text-center bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
          <p>Failed to load leads: {error}</p>
        </div>
      ) : leads && leads.length > 0 ? (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Interested In</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead: any) => (
                <TableRow key={lead.id} className="hover:bg-muted/20">
                  <TableCell className="text-sm">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{lead.full_name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{lead.source}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {lead.phone || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {lead.interested_in || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`capitalize ${
                        lead.status === 'new' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : 
                        lead.status === 'converted' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 
                        lead.status === 'lost' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                      }`}
                    >
                      {lead.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Update Status</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-card rounded-xl border border-border/50 border-dashed">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <PhoneCall className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">No leads yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Log your first inquiry to start tracking potential students.
          </p>
          <CreateLeadModal />
        </div>
      )}
    </div>
  )
}
