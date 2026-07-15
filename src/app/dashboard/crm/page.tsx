import type { Metadata } from 'next'
import { getUserCoachingRole, isOwner } from '@/lib/get-user-role'
import { ShieldX } from 'lucide-react'

export const metadata: Metadata = { title: 'CRM / Leads' }
export const dynamic = 'force-dynamic'

export default async function Page() {
  const memberRole = await getUserCoachingRole()

  if (!isOwner(memberRole?.role ?? '')) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center">
        <ShieldX className="w-16 h-16 text-destructive mb-4 opacity-70" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground max-w-sm">
          Only the institute owner can access CRM & lead management.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">CRM / Leads</h1>
      <p className="text-muted-foreground">Lead management & admission pipeline — coming up next.</p>
    </div>
  )
}
