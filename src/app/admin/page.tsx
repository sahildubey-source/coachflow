import { getGlobalStats } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, UserCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const { stats, error, success } = await getGlobalStats()

  if (!success) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading global stats: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide statistics and metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Coachings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalCoachings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered institutes on the platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Profiles including staff and owners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active students across all tenants
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
