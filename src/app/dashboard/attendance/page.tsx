import { AttendanceTracker } from '@/components/attendance/AttendanceTracker'
import { CalendarCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AttendancePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-primary" />
            Attendance
          </h2>
          <p className="text-muted-foreground mt-1">
            Track daily attendance for your batches.
          </p>
        </div>
      </div>

      <AttendanceTracker />
    </div>
  )
}
