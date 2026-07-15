import { getTeachers } from './actions'
import { getUserCoachingRole, isOwner } from '@/lib/get-user-role'
import { AddTeacherModal } from '@/components/teachers/AddTeacherModal'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Phone, ShieldX } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export default async function TeachersDashboardPage() {
  const memberRole = await getUserCoachingRole()

  if (!isOwner(memberRole?.role ?? '')) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center">
        <ShieldX className="w-16 h-16 text-destructive mb-4 opacity-70" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground max-w-sm">
          Only the institute owner can manage staff members.
        </p>
      </div>
    )
  }

  const { data: teachers, error } = await getTeachers()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Staff & Teachers
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your teaching staff and their platform access.
          </p>
        </div>
        <AddTeacherModal />
      </div>

      {error ? (
        <div className="p-8 text-center bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
          <p>Failed to load teachers: {error}</p>
        </div>
      ) : teachers && teachers.length > 0 ? (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Teacher Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((member: any) => (
                <TableRow key={member.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="font-medium text-foreground">{member.profile?.full_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> {member.profile?.email}
                      </div>
                      {member.profile?.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> {member.profile?.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {member.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-card rounded-xl border border-border/50 border-dashed">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">No teachers found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            You haven't added any staff members to your institute yet.
          </p>
          <AddTeacherModal />
        </div>
      )}
    </div>
  )
}
