'use client'

import { useState, useEffect } from 'react'
import { getCoachingSettings, updateCoachingSettings } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Loader2, Save, ShieldX } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: ''
  })

  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    const { data, success, error } = await getCoachingSettings()
    if (error === 'ACCESS_DENIED') {
      setAccessDenied(true)
      setLoading(false)
      return
    }
    if (success && data) {
      setFormData({
        name: data.name || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || ''
      })
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { success, error } = await updateCoachingSettings(formData)
    setSaving(false)
    if (success) {
      alert('Settings updated successfully!')
    } else {
      alert(error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center">
        <ShieldX className="w-16 h-16 text-destructive mb-4 opacity-70" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground max-w-sm">
          Only the institute owner can modify settings. Please contact your admin.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Institute Settings
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your coaching institute's profile and contact information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            These details will be used on receipts, reports, and public pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Institute Name *</label>
              <Input 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Phone</label>
                <Input 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Website URL</label>
              <Input 
                type="url"
                value={formData.website} 
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-sm font-semibold">Address Details</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Street Address</label>
                <Input 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    value={formData.city} 
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input 
                    value={formData.state} 
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">PIN Code</label>
                  <Input 
                    value={formData.pincode} 
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={saving || !formData.name} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
