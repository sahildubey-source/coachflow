'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Save } from 'lucide-react'
import { saveTestResults } from '@/app/dashboard/tests/actions'

interface TestResultsEntryProps {
  test: any
  initialResults: any[]
}

export function TestResultsEntry({ test, initialResults }: TestResultsEntryProps) {
  const [results, setResults] = useState(initialResults)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleMarkChange = (studentId: string, value: string) => {
    setResults(prev => prev.map(r => 
      r.studentId === studentId ? { ...r, marksObtained: value, isAbsent: false } : r
    ))
  }

  const handleAbsentChange = (studentId: string, checked: boolean) => {
    setResults(prev => prev.map(r => 
      r.studentId === studentId ? { ...r, isAbsent: checked, marksObtained: checked ? '' : r.marksObtained } : r
    ))
  }

  const handleRemarksChange = (studentId: string, value: string) => {
    setResults(prev => prev.map(r => 
      r.studentId === studentId ? { ...r, remarks: value } : r
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await saveTestResults(test.id, results)
    setSaving(false)
    if (result.success) {
      router.refresh()
      // Toast would go here
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/30 text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Student</th>
              <th className="px-6 py-4 font-medium w-32">Absent</th>
              <th className="px-6 py-4 font-medium w-48">Marks Obtained</th>
              <th className="px-6 py-4 font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {results.length > 0 ? (
              results.map(record => (
                <tr key={record.studentId} className={`hover:bg-muted/10 transition-colors ${record.isAbsent ? 'opacity-60 bg-muted/20' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{record.studentName}</p>
                    <p className="text-xs text-muted-foreground">{record.enrollmentNo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={record.isAbsent}
                        onCheckedChange={(c) => handleAbsentChange(record.studentId, c as boolean)}
                      />
                      <span className="text-xs font-medium">Absent</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={record.marksObtained}
                      onChange={(e) => handleMarkChange(record.studentId, e.target.value)}
                      disabled={record.isAbsent}
                      className="w-full h-9"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Input 
                      placeholder="Optional notes..." 
                      value={record.remarks}
                      onChange={(e) => handleRemarksChange(record.studentId, e.target.value)}
                      className="w-full h-9"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  No students found in this test's batch.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {results.length > 0 && (
        <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Results
          </Button>
        </div>
      )}
    </div>
  )
}
