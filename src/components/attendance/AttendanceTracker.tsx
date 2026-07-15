'use client'

import { useState, useEffect } from 'react'
import { getBatches } from '@/app/dashboard/batches/actions'
import { getAttendance, markAttendance, type AttendanceRecord } from '@/app/dashboard/attendance/actions'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { Loader2, Check, X, Clock, Calendar as CalendarIcon, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AttendanceTracker() {
  const [batches, setBatches] = useState<any[]>([])
  const [selectedBatch, setSelectedBatch] = useState<string>('')
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loadingBatches, setLoadingBatches] = useState(true)
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch batches on mount
  useEffect(() => {
    async function fetchBatches() {
      const { data, success } = await getBatches()
      if (success) {
        setBatches(data || [])
        if (data && data.length > 0) {
          setSelectedBatch(data[0].id)
        }
      }
      setLoadingBatches(false)
    }
    fetchBatches()
  }, [])

  // Fetch attendance when batch or date changes
  useEffect(() => {
    if (!selectedBatch || !date) return

    async function fetchAttendance() {
      setLoadingRecords(true)
      const { data, success } = await getAttendance(selectedBatch, date)
      if (success) {
        setRecords(data || [])
      }
      setLoadingRecords(false)
    }
    fetchAttendance()
  }, [selectedBatch, date])

  const handleMark = (studentId: string, status: AttendanceRecord['status']) => {
    setRecords(prev => prev.map(r => 
      r.studentId === studentId ? { ...r, status } : r
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await markAttendance(selectedBatch, date, records)
    setSaving(false)
    if (result.success) {
      // Show success toast (omitted for brevity)
    } else {
      // Show error toast
      alert(result.error)
    }
  }

  const markAll = (status: AttendanceRecord['status']) => {
    setRecords(prev => prev.map(r => ({ ...r, status })))
  }

  if (loadingBatches) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (batches.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border/50">
        <p className="text-muted-foreground">No batches found. Create a batch and enroll students first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-card p-4 rounded-xl border border-border/50 flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Select Batch</label>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger>
              <SelectValue placeholder="Select a batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input 
              type="date" 
              className="pl-9" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/10">
          <h3 className="font-semibold">
            Attendance for {date ? format(new Date(date), 'MMM do, yyyy') : ''}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => markAll('present')} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => markAll('absent')} className="text-rose-600 border-rose-200 hover:bg-rose-50">
              Mark All Absent
            </Button>
          </div>
        </div>

        {loadingRecords ? (
          <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No students enrolled in this batch yet.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {records.map(record => (
              <div key={record.studentId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-medium">{(record as any).studentName}</p>
                  <p className="text-xs text-muted-foreground">{(record as any).enrollmentNo}</p>
                </div>
                
                <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg border border-border/50">
                  <button
                    onClick={() => handleMark(record.studentId, 'present')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5
                      ${record.status === 'present' 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : 'text-muted-foreground hover:bg-background'}`}
                  >
                    <Check className="w-3.5 h-3.5" /> Present
                  </button>
                  <button
                    onClick={() => handleMark(record.studentId, 'absent')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5
                      ${record.status === 'absent' 
                        ? 'bg-rose-500 text-white shadow-sm' 
                        : 'text-muted-foreground hover:bg-background'}`}
                  >
                    <X className="w-3.5 h-3.5" /> Absent
                  </button>
                  <button
                    onClick={() => handleMark(record.studentId, 'late')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5
                      ${record.status === 'late' 
                        ? 'bg-amber-500 text-white shadow-sm' 
                        : 'text-muted-foreground hover:bg-background'}`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Late
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {records.length > 0 && (
          <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Attendance
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
