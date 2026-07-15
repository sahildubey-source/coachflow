'use client'

import { useState, useEffect } from 'react'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from './actions'
import { Button } from '@/components/ui/button'
import { Bell, Check, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    setLoading(true)
    const { data, success } = await getNotifications()
    if (success) {
      setNotifications(data || [])
    }
    setLoading(false)
  }

  async function handleMarkRead(id: string) {
    const { success } = await markNotificationRead(id)
    if (success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }
  }

  async function handleMarkAllRead() {
    const { success } = await markAllNotificationsRead()
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications
          </h2>
          <p className="text-muted-foreground mt-1">
            Stay updated with alerts and system messages.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead} className="gap-2">
            <Check className="w-4 h-4" /> Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notif: any) => (
            <Card key={notif.id} className={`transition-colors ${notif.is_read ? 'opacity-70 bg-muted/20' : 'bg-card border-primary/20 shadow-sm'}`}>
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary" />}
                    <h3 className="font-semibold">{notif.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                {!notif.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkRead(notif.id)}>
                    Mark Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-card rounded-xl border border-border/50 border-dashed">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">You're all caught up!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            No new notifications at the moment.
          </p>
        </div>
      )}
    </div>
  )
}
