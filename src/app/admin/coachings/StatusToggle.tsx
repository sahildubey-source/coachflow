'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { toggleCoachingStatus } from '../actions'

interface StatusToggleProps {
  coachingId: string
  initialStatus: boolean
}

export function StatusToggle({ coachingId, initialStatus }: StatusToggleProps) {
  const [isActive, setIsActive] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const { success, error } = await toggleCoachingStatus(coachingId, isActive)
    if (success) {
      setIsActive(!isActive)
    } else {
      alert(error)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Switch 
        checked={isActive} 
        onCheckedChange={handleToggle} 
        disabled={loading}
      />
      <span className={`text-xs font-medium ${isActive ? 'text-emerald-500' : 'text-muted-foreground'}`}>
        {isActive ? 'Active' : 'Suspended'}
      </span>
    </div>
  )
}
